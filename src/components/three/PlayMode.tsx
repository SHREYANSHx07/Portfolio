"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useGameStore } from "@/hooks/useGameStore";
import { useThemeStore } from "@/hooks/useTheme";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { palette } from "@/lib/theme";
import { sfxBlip, sfxWhoosh, sfxChime, sfxClick } from "@/lib/sfx";
import { cn } from "@/lib/utils";

/**
 * PLAY mode — the voxel hunt. Two acts:
 *
 *  1. TARGETS: boxes drop from the sky one at a time; click one and it
 *     blasts into shards. Blast 12 to summon the boss.
 *  2. BOSS: the hero sculpture materialises and wanders the screen —
 *     land 20 hits in 10 seconds to destroy it (secret achievement),
 *     or watch it escape.
 *
 * Rapier only drives the falling boxes; shards and the boss are cheap
 * hand-animated meshes. Loaded lazily, page scroll locked while open.
 */

const TARGET_TOTAL = 15; // boxes that will fall, in total
const TARGET_GOAL = 10; // kills needed to summon the boss
const BOSS_GOAL = 20;
const BOSS_TIME_MS = 10_000;

const fract = (x: number) => x - Math.floor(x);
const rnd = (i: number, s: number) => fract(Math.sin(i * 12.9898 + s * 78.233) * 43758.5453);

type Phase = "intro" | "targets" | "bossIntro" | "boss" | "won" | "lost" | "out";

/* ------------------------------------------------------------------ */
/* Shard burst — 14 hand-animated fragments, then gone                 */
/* ------------------------------------------------------------------ */
function Burst({
  seed,
  x,
  y,
  color,
  big = false,
}: {
  seed: number;
  x: number;
  y: number;
  color: string;
  big?: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const start = useRef(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = big ? 26 : 14;
  const life = big ? 1.5 : 1;

  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        vx: (rnd(i, seed) - 0.5) * (big ? 14 : 9),
        vy: rnd(i, seed + 1) * (big ? 11 : 7) + 1.5,
        vz: (rnd(i, seed + 2) - 0.5) * 4,
        spin: rnd(i, seed + 3) * 6,
        size: (big ? 0.16 : 0.11) * (0.6 + rnd(i, seed + 4)),
      })),
    [count, seed, big],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    if (start.current < 0) start.current = t;
    const age = t - start.current;
    const p = Math.min(age / life, 1);
    for (let i = 0; i < count; i++) {
      const s = shards[i];
      dummy.position.set(
        x + s.vx * age,
        y + s.vy * age - 9.81 * age * age * 0.5,
        s.vz * age,
      );
      dummy.rotation.set(t * s.spin, t * s.spin * 0.7, 0);
      dummy.scale.setScalar(Math.max(s.size * (1 - p), 0.0001));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.visible = p < 1;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Falling target box — hand-animated gravity (no physics engine:      */
/* instant load, near-zero CPU)                                        */
/* ------------------------------------------------------------------ */
function TargetBox({
  seed,
  color,
  onHit,
  onMiss,
}: {
  seed: number;
  color: string;
  onHit: (x: number, y: number) => void;
  onMiss: (x: number, y: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const size = 0.55 + rnd(seed, 7) * 0.25;
  const x = (rnd(seed, 8) - 0.5) * viewport.width * 0.75;
  const floorY = -viewport.height / 2 + size / 2 + 0.02;
  const sim = useRef({ y: viewport.height / 2 + 1.2, vy: 0, done: false });

  useFrame((_, dt) => {
    const s = sim.current;
    if (s.done) return;
    s.vy -= 2.4 * dt; // gentle gravity — catch it before it lands
    s.y += s.vy * dt;
    if (s.y <= floorY) {
      // touched the ground: no point, it self-destructs
      s.done = true;
      onMiss(x, floorY);
      return;
    }
    if (group.current) {
      group.current.position.set(x, s.y, 0);
      group.current.rotation.x += dt * 1.3;
      group.current.rotation.y += dt * 0.9;
    }
  });

  return (
    <group ref={group} position={[x, viewport.height / 2 + 1.2, 0]}>
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          if (sim.current.done) return;
          sim.current.done = true;
          const p = group.current?.position;
          onHit(p?.x ?? e.point.x, p?.y ?? e.point.y);
        }}
        onPointerOver={() => (document.body.style.cursor = "crosshair")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.25} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The boss — a wandering mini version of the hero presence            */
/* ------------------------------------------------------------------ */
function Boss({
  dark,
  onHit,
  dying,
}: {
  dark: boolean;
  onHit: (x: number, y: number) => void;
  dying: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const flash = useRef(0);
  const C = palette(dark ? "dark" : "light");
  const { viewport } = useThree();

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    if (dying) {
      // collapse on death
      group.current.scale.multiplyScalar(Math.exp(-6 * dt));
      group.current.rotation.y += dt * 14;
      return;
    }

    // Lissajous wander across the screen — fast enough to be a real fight
    const wx = Math.sin(t * 1.15) * viewport.width * 0.28;
    const wy = Math.cos(t * 1.55) * viewport.height * 0.22;
    group.current.position.x += (wx - group.current.position.x) * (1 - Math.exp(-3.5 * dt));
    group.current.position.y += (wy - group.current.position.y) * (1 - Math.exp(-3.5 * dt));

    group.current.rotation.y = t * 1.4;
    group.current.rotation.x = Math.sin(t * 0.9) * 0.35;

    // hit flash decays
    flash.current = Math.max(flash.current - dt * 5, 0);
    if (coreMat.current) {
      coreMat.current.emissiveIntensity = 0.5 + flash.current * 2.2;
    }
    const punch = 1 + flash.current * 0.18;
    group.current.scale.setScalar(punch);
  });

  const hit = (e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    e.stopPropagation();
    flash.current = 1;
    onHit(group.current?.position.x ?? e.point.x, group.current?.position.y ?? e.point.y);
  };

  return (
    <group ref={group}>
      <mesh onPointerDown={hit}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          ref={coreMat}
          color={dark ? "#141726" : C.ink}
          flatShading
          roughness={0.3}
          metalness={0.4}
          emissive={C.coral}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh onPointerDown={hit}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshStandardMaterial color={C.cobalt} wireframe transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.6, 0.03, 12, 80]} />
        <meshStandardMaterial
          color={C.coral}
          emissive={C.coral}
          emissiveIntensity={0.7}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Boss timer bar (rAF-driven, no re-renders)                          */
/* ------------------------------------------------------------------ */
function TimerBar({ deadline, onExpire }: { deadline: number; onExpire: () => void }) {
  const bar = useRef<HTMLDivElement>(null);
  const expired = useRef(false);
  useEffect(() => {
    expired.current = false;
    let raf = 0;
    const tick = () => {
      const left = deadline - performance.now();
      if (bar.current) {
        bar.current.style.width = `${Math.max((left / BOSS_TIME_MS) * 100, 0)}%`;
      }
      if (left <= 0) {
        if (!expired.current) {
          expired.current = true;
          onExpire();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [deadline, onExpire]);

  return (
    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-ink/15">
      <div ref={bar} className="h-full rounded-full bg-coral" style={{ width: "100%" }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function PlayMode() {
  const setPlayMode = useGameStore((s) => s.setPlayMode);
  const sound = useGameStore((s) => s.sound);
  const dark = useThemeStore((s) => s.theme === "dark");
  useModalScrollLock();

  const C = palette(dark ? "dark" : "light");
  const colors = useMemo(() => [C.cobalt, C.coral, C.ink, C.cobaltSoft], [C]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [bossHits, setBossHits] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [count, setCount] = useState(5);
  const [box, setBox] = useState<{ id: number; seed: number } | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; color: string; big?: boolean }[]>([]);
  const nextId = useRef(2);
  // counters live in refs so all side effects (store unlocks, sfx, spawns)
  // run in the event handler — never inside a setState updater (that runs
  // during render and corrupts other components' updates)
  const scoreRef = useRef(0);
  const bossHitsRef = useRef(0);
  const droppedRef = useRef(0);
  const [dropped, setDropped] = useState(0);

  const start = () => {
    scoreRef.current = 0;
    droppedRef.current = 1;
    setScore(0);
    setDropped(1);
    setPhase("targets");
    setBox({ id: nextId.current++, seed: nextId.current * 11 });
    sfxClick();
  };

  const addBurst = useCallback((x: number, y: number, color: string, big = false) => {
    const id = nextId.current++;
    setBursts((b) => [...b.slice(-6), { id, x, y, color, big }]);
  }, []);

  // after every box resolves (hit or ground): boss briefing, defeat, or next drop
  const advance = useCallback(() => {
    if (scoreRef.current >= TARGET_GOAL) {
      setTimeout(() => {
        setCount(5);
        setPhase("bossIntro");
      }, 700);
      return;
    }
    if (droppedRef.current >= TARGET_TOTAL) {
      setTimeout(() => setPhase("out"), 700);
      return;
    }
    setTimeout(() => {
      droppedRef.current += 1;
      setDropped(droppedRef.current);
      setBox({ id: nextId.current++, seed: nextId.current * 13 });
    }, 450);
  }, []);

  // act 1: box blasted — point!
  const onBoxHit = useCallback(
    (x: number, y: number) => {
      setBox(null);
      sfxBlip();
      scoreRef.current += 1;
      setScore(scoreRef.current);
      addBurst(x, y, colors[scoreRef.current % colors.length]);
      advance();
    },
    [addBurst, colors, advance],
  );

  // act 1: box reached the ground — no point, it self-destructs
  const onBoxMiss = useCallback(
    (x: number, y: number) => {
      setBox(null);
      sfxClick();
      addBurst(x, y, C.mutedInk);
      advance();
    },
    [addBurst, C, advance],
  );

  // act 2: boss hit
  const onBossHit = useCallback(
    (x: number, y: number) => {
      if (phase !== "boss") return;
      sfxBlip();
      addBurst(x, y, C.coral);
      bossHitsRef.current += 1;
      const next = bossHitsRef.current;
      setBossHits(next);
      if (next >= BOSS_GOAL) {
        setPhase("won");
        addBurst(x, y, C.coral, true);
        addBurst(x, y, C.cobalt, true);
        sfxChime();
        useGameStore.getState().unlock("boss-slayer");
      }
    },
    [phase, addBurst, C],
  );

  const onExpire = useCallback(() => {
    setPhase((p) => (p === "boss" ? "lost" : p));
  }, []);

  const retry = () => {
    bossHitsRef.current = 0;
    setBossHits(0);
    setBursts([]);
    if (phase === "lost") {
      // back into the boss fight, with the briefing + countdown
      setCount(5);
      setPhase("bossIntro");
    } else {
      // full run from act 1
      scoreRef.current = 0;
      droppedRef.current = 1;
      setScore(0);
      setDropped(1);
      setPhase("targets");
      setBox({ id: nextId.current++, seed: nextId.current * 7 });
    }
  };

  const hireHim = () => {
    setPlayMode(false);
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // boss countdown: 5 → 1, then the fight (and its timer) begins
  useEffect(() => {
    if (phase !== "bossIntro") return;
    let c = 5;
    const iv = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(iv);
        setPhase("boss");
        setDeadline(performance.now() + BOSS_TIME_MS);
        sfxWhoosh();
      } else {
        setCount(c);
        sfxClick();
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlayMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
    };
  }, [setPlayMode]);

  return (
    // flat scrim, no backdrop-filter — a full-screen blur costs real GPU
    // time that the physics canvas needs
    <div className="fixed inset-0 z-[69] bg-black/35">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        dpr={[1, 1.25]}
      >
        {dark ? (
          <>
            <hemisphereLight args={["#46538f", "#07080d", 0.7]} />
            <directionalLight position={[4, 6, 6]} intensity={1.3} color="#c9d4ff" />
          </>
        ) : (
          <>
            <hemisphereLight args={["#fff7ec", "#d8d2c6", 0.9]} />
            <directionalLight position={[4, 6, 6]} intensity={1.8} color="#fff3e2" />
          </>
        )}
        {phase === "targets" && box && (
          <TargetBox
            key={box.id}
            seed={box.seed}
            color={colors[score % colors.length]}
            onHit={onBoxHit}
            onMiss={onBoxMiss}
          />
        )}
        {(phase === "boss" || phase === "won") && (
          <Boss dark={dark} onHit={onBossHit} dying={phase === "won"} />
        )}
        {bursts.map((b) => (
          <Burst key={b.id} seed={b.id * 17} x={b.x} y={b.y} color={b.color} big={b.big} />
        ))}
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-6 flex flex-col items-center gap-2">
        {phase === "targets" && (
          <p className="rounded-full border border-line/60 bg-surface/85 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink backdrop-blur">
            catch them mid-air · <span className="text-cobalt">{score}/{TARGET_GOAL}</span>
            <span className="mx-2 text-muted-ink">·</span>
            <span className="text-muted-ink">{TARGET_TOTAL - dropped} boxes left</span>
          </p>
        )}
        {phase === "boss" && (
          <>
            <p className="rounded-full border border-coral/50 bg-surface/85 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-coral backdrop-blur">
              ⚠ boss — hit it {BOSS_GOAL} times · <span className="text-ink">{bossHits}/{BOSS_GOAL}</span>
            </p>
            <TimerBar deadline={deadline} onExpire={onExpire} />
          </>
        )}
      </div>

      {/* mission briefing — the rules, before anything falls */}
      {phase === "intro" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div className="pointer-events-auto max-w-md rounded-3xl border border-cobalt/50 bg-surface/95 p-7 text-center shadow-2xl backdrop-blur">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt">
              ◆ mission briefing
            </p>
            <h3 className="mt-3 font-display text-2xl font-medium text-ink">
              Boxes are falling. Don&apos;t let them land.
            </h3>
            <ul className="mt-4 space-y-2 text-left text-sm leading-relaxed text-muted-ink">
              <li>
                <span className="font-mono text-cobalt">01 —</span> Voxel crates drop from the
                sky, one at a time. <span className="text-ink">Click them mid-air</span> to
                blast them.
              </li>
              <li>
                <span className="font-mono text-cobalt">02 —</span> If a crate touches the
                ground, it self-destructs — <span className="text-ink">no point</span>.
              </li>
              <li>
                <span className="font-mono text-cobalt">03 —</span> Catch{" "}
                <span className="text-ink">{TARGET_GOAL} of {TARGET_TOTAL}</span> to reach
                level 2: <span className="text-coral">the boss</span>.
              </li>
              <li>
                <span className="font-mono text-cobalt">04 —</span> The boss takes{" "}
                <span className="text-ink">{BOSS_GOAL} hits in {BOSS_TIME_MS / 1000} seconds</span>.
                Good luck.
              </li>
            </ul>
            <button
              onClick={start}
              data-cursor="Start"
              className="mt-6 w-full rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-surface transition-colors hover:bg-cobalt"
            >
              ▶ start mission
            </button>
          </div>
        </div>
      )}

      {/* boss briefing — level 2 rules + countdown */}
      {phase === "bossIntro" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-md rounded-3xl border border-coral/60 bg-surface/95 p-7 text-center shadow-2xl backdrop-blur">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-coral">
              ◆ level 2 unlocked
            </p>
            <h3 className="mt-3 font-display text-2xl font-medium text-ink">
              The boss is coming.
            </h3>
            <ul className="mt-4 space-y-2 text-left text-sm leading-relaxed text-muted-ink">
              <li>
                <span className="font-mono text-coral">01 —</span> It never stops moving —{" "}
                <span className="text-ink">lead your shots</span>.
              </li>
              <li>
                <span className="font-mono text-coral">02 —</span> Land{" "}
                <span className="text-ink">{BOSS_GOAL} hits in {BOSS_TIME_MS / 1000} seconds</span>{" "}
                to destroy it.
              </li>
              <li>
                <span className="font-mono text-coral">03 —</span> The timer starts the moment
                it appears. <span className="text-ink">Click fast.</span>
              </li>
            </ul>
            <div className="mt-5 flex items-center justify-center">
              <motion.span
                key={count}
                initial={{ scale: 1.6, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="font-display text-6xl font-light text-coral"
              >
                {count}
              </motion.span>
            </div>
          </div>
        </div>
      )}

      {/* ending card — win or lose, the recruiter pitch always lands */}
      {(phase === "won" || phase === "lost" || phase === "out") && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div className="pointer-events-auto max-w-md rounded-3xl border border-coral/50 bg-surface/95 p-7 text-center shadow-2xl backdrop-blur">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-coral">
              {phase === "won" && "◆ boss defeated"}
              {phase === "lost" && `◆ it escaped — ${bossHits}/${BOSS_GOAL} hits`}
              {phase === "out" && `◆ out of boxes — ${score}/${TARGET_GOAL} caught`}
            </p>
            <h3 className="mt-3 font-display text-2xl font-medium text-ink">
              {phase === "won" && "Nice aim. Now for the real quest:"}
              {phase === "lost" && "The boss got away. I wouldn't have."}
              {phase === "out" && "Tough round. Here's an easier win:"}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-ink">
              {phase === "won" ? (
                <>
                  Everything you just played — the boss, the 3D world, the AI in the corner —
                  was built by me, <span className="font-medium text-ink">Shreyansh Gupta</span>.
                  I ship backends, AI agents and apparently video games. Hiring me is the
                  only achievement left. <span className="text-ink">+100 team DPS.</span>
                </>
              ) : (
                <>
                  This whole thing — the game that just beat you, the 3D world, the AI in the
                  corner — was built by me,{" "}
                  <span className="font-medium text-ink">Shreyansh Gupta</span>. You don&apos;t
                  have to win the game to make the smartest move of the day:{" "}
                  <span className="text-ink">hiring me.</span>
                </>
              )}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={hireHim}
                data-cursor="Hire"
                className="rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-surface transition-colors hover:bg-coral"
              >
                hire me →
              </button>
              <button
                onClick={retry}
                data-cursor="Retry"
                className="rounded-full border border-line px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-surface"
              >
                {phase === "lost" ? "↻ rematch" : phase === "out" ? "↻ try again" : "↻ play again"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute right-6 top-6 flex gap-2">
        <button
          onClick={() => useGameStore.getState().toggleSound()}
          data-cursor="hover"
          aria-pressed={sound}
          aria-label="Toggle game sound"
          className={cn(
            "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-widest backdrop-blur transition-colors",
            sound
              ? "border-cobalt/60 bg-surface/90 text-cobalt"
              : "border-line bg-surface/90 text-muted-ink hover:text-ink",
          )}
        >
          {sound ? "♪ on" : "♪ off"}
        </button>
        <button
          onClick={() => setPlayMode(false)}
          data-cursor="Exit"
          aria-label="Exit play mode"
          className="rounded-full border border-line bg-surface/90 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink backdrop-blur transition-colors hover:bg-ink hover:text-surface"
        >
          esc · exit
        </button>
      </div>
    </div>
  );
}
