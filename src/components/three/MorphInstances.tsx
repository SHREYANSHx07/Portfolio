"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, accentHex } from "@/lib/theme";
import { useScrollStore, type SectionId } from "@/hooks/useScrollStore";
import { skills } from "@/data/skills";
import { stats } from "@/data/achievements";

/**
 * The continuous 3D narrative: one InstancedMesh of N ink/cobalt/coral voxels
 * that MORPHS between a formation per section as you scroll —
 *   hero: hidden inside the sculpture's core
 *   about: shattered outward into ambient debris
 *   skills: assembled into the interactive skill constellation (left column)
 *   experience: a faint helix receding in depth behind the timeline
 *   projects: framing dust at the edges of the gallery
 *   achievements: the competitive-programming stat towers
 *   contact: folded into a paper-plane wedge beside the form
 * Targets are section-driven and exponentially damped, so every section change
 * is an organic morph — no scrub keyframes to break when layout changes.
 */

const N = 72;
const SKILL_COUNT = Math.min(skills.length, 24);

// deterministic pseudo-random per instance
const fract = (x: number) => x - Math.floor(x);
const rnd = (i: number, salt: number) => fract(Math.sin(i * 127.1 + salt * 311.7) * 43758.5453);

type Formation = {
  pos: Float32Array; // N*3
  scale: Float32Array; // N
  color: Float32Array; // N*3
  opacity: number;
  tumble: number; // 0..1 rotation liveliness
};

function makeFormation(): Formation {
  return {
    pos: new Float32Array(N * 3),
    scale: new Float32Array(N),
    color: new Float32Array(N * 3),
    opacity: 1,
    tumble: 0,
  };
}

function setColor(f: Formation, i: number, hex: string) {
  const c = new THREE.Color(hex);
  f.color[i * 3] = c.r;
  f.color[i * 3 + 1] = c.g;
  f.color[i * 3 + 2] = c.b;
}

const PALETTE = [COLORS.ink, COLORS.cobalt, COLORS.coral];

function buildFormations() {
  const F: Record<string, Formation> = {};

  // — hero: everything hidden inside the sculpture core (right side)
  const hero = makeFormation();
  for (let i = 0; i < N; i++) {
    hero.pos.set([2.2, -0.1, 0], i * 3);
    hero.scale[i] = 0.01;
    setColor(hero, i, COLORS.ink);
  }
  hero.opacity = 0;
  F.hero = hero;

  // — about: shattered ambient debris across the page depth
  const about = makeFormation();
  for (let i = 0; i < N; i++) {
    about.pos.set(
      [(rnd(i, 1) - 0.5) * 7.5, (rnd(i, 2) - 0.5) * 4.2, -1.2 - rnd(i, 3) * 2],
      i * 3,
    );
    about.scale[i] = 0.05 + rnd(i, 4) * 0.09;
    setColor(about, i, PALETTE[i % 3]);
  }
  about.opacity = 0.5;
  about.tumble = 1;
  F.about = about;

  // — skills: fibonacci-sphere constellation in the section's left column
  const sk = makeFormation();
  const golden = Math.PI * (3 - Math.sqrt(5));
  const R = 1.45;
  for (let i = 0; i < N; i++) {
    if (i < SKILL_COUNT) {
      const y = 1 - (i / (SKILL_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      sk.pos.set([-1.8 + Math.cos(th) * r * R, -0.1 + y * R, Math.sin(th) * r * R], i * 3);
      sk.scale[i] = 0.12 + skills[i].weight * 0.13;
      setColor(sk, i, accentHex(skills[i].accent));
    } else {
      // faint dust ring around the constellation
      const a = (i / (N - SKILL_COUNT)) * Math.PI * 2;
      sk.pos.set([-1.8 + Math.cos(a) * 2.0, -0.1 + Math.sin(a * 1.7) * 1.3, -0.8], i * 3);
      sk.scale[i] = 0.03;
      setColor(sk, i, COLORS.mutedInk);
    }
  }
  sk.opacity = 0.95;
  sk.tumble = 0.15;
  F.skills = sk;

  // — experience: quiet helix receding behind the timeline
  const ex = makeFormation();
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const a = t * Math.PI * 6;
    ex.pos.set([Math.cos(a) * 0.9, -2 + t * 4.4, -2.6 + Math.sin(a) * 0.9], i * 3);
    ex.scale[i] = 0.055;
    setColor(ex, i, i % 5 === 0 ? COLORS.cobalt : COLORS.mutedInk);
  }
  ex.opacity = 0.35;
  ex.tumble = 0.3;
  F.experience = ex;

  // — flagship: twin product systems — cobalt cluster (admin panel) and
  //   coral cluster (AI agent), each a slow orbital halo behind its card
  const fl = makeFormation();
  for (let i = 0; i < N; i++) {
    const left = i % 2 === 0;
    const cx = left ? -2.4 : 2.4;
    const base = left ? COLORS.cobalt : COLORS.coral;
    const j = Math.floor(i / 2);
    const a = (j / (N / 2)) * Math.PI * 2;
    const rr = 1.1 + rnd(i, 9) * 0.5;
    fl.pos.set(
      [cx + Math.cos(a) * rr, Math.sin(a * 1.3) * 1.2, -1.4 - rnd(i, 10) * 0.8],
      i * 3,
    );
    fl.scale[i] = j % 6 === 0 ? 0.13 : 0.05 + rnd(i, 11) * 0.05;
    setColor(fl, i, j % 4 === 0 ? COLORS.ink : base);
  }
  fl.opacity = 0.5;
  fl.tumble = 0.5;
  F.flagship = fl;

  // — projects: vertical dust bands framing the gallery
  const pr = makeFormation();
  for (let i = 0; i < N; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    pr.pos.set(
      [side * (3 + rnd(i, 5) * 0.7), (rnd(i, 6) - 0.5) * 4, -1 - rnd(i, 7)],
      i * 3,
    );
    pr.scale[i] = 0.04 + rnd(i, 8) * 0.05;
    setColor(pr, i, PALETTE[i % 3]);
  }
  pr.opacity = 0.4;
  pr.tumble = 0.8;
  F.projects = pr;

  // — achievements: 4 voxel stat towers (height ∝ rating)
  const ach = makeFormation();
  const LEVELS = 12;
  for (let i = 0; i < N; i++) {
    if (i < 4 * LEVELS) {
      const col = Math.floor(i / LEVELS);
      const lvl = i % LEVELS;
      const visible = lvl < Math.ceil(stats[col].height * LEVELS);
      ach.pos.set([(col - 1.5) * 1.35, -1.15 + lvl * 0.29, 0], i * 3);
      ach.scale[i] = visible ? 0.27 : 0.001;
      setColor(ach, i, accentHex(stats[col].accent));
    } else {
      // orbiting sparks for "1000+ problems"
      const a = ((i - 4 * LEVELS) / (N - 4 * LEVELS)) * Math.PI * 2;
      ach.pos.set([Math.cos(a) * 3, 0.4 + Math.sin(a * 2) * 0.5, -0.6], i * 3);
      ach.scale[i] = 0.045;
      setColor(ach, i, COLORS.coral);
    }
  }
  ach.opacity = 1;
  F.achievements = ach;

  // — contact: paper-plane wedge + drifting trail
  const co = makeFormation();
  let k = 0;
  const ROWS = 6;
  for (let r = 0; r < ROWS; r++) {
    const cols = ROWS - r;
    for (let c = 0; c < cols && k < 28; c++, k++) {
      co.pos.set([1.7 + r * 0.26, 0.75 + (c - cols / 2) * 0.24, -0.2], k * 3);
      co.scale[k] = 0.11;
      setColor(co, k, r === 0 ? COLORS.coral : k % 3 === 0 ? COLORS.cobalt : COLORS.ink);
    }
  }
  for (let i = k; i < N; i++) {
    const t = (i - k) / (N - k);
    co.pos.set(
      [1.7 - t * 4.5, 0.75 - Math.sin(t * Math.PI * 1.5) * 0.9, -0.4 - t],
      i * 3,
    );
    co.scale[i] = 0.035;
    setColor(co, i, COLORS.mutedInk);
  }
  co.opacity = 0.9;
  co.tumble = 0.1;
  F.contact = co;

  return F;
}

// pairs of constellation nodes in the same category, for connective lines
function buildLinePairs() {
  const pairs: [number, number][] = [];
  for (let i = 0; i < SKILL_COUNT; i++) {
    for (let j = i + 1; j < SKILL_COUNT; j++) {
      if (skills[i].category === skills[j].category) pairs.push([i, j]);
    }
  }
  return pairs.filter((_, idx) => idx % 2 === 0).slice(0, 26);
}

export function MorphInstances() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const { size } = useThree();

  const formations = useMemo(buildFormations, []);
  const linePairs = useMemo(buildLinePairs, []);

  // current state buffers, damped toward targets
  const cur = useMemo(
    () => ({
      pos: new Float32Array(formations.about.pos), // start scattered (behind preloader)
      scale: new Float32Array(N).fill(0.01),
      color: new Float32Array(formations.about.color),
      opacity: 0,
    }),
    [formations],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  // line geometry built from the skills formation (static endpoints)
  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(linePairs.length * 6);
    linePairs.forEach(([a, b], idx) => {
      arr.set(formations.skills.pos.slice(a * 3, a * 3 + 3), idx * 6);
      arr.set(formations.skills.pos.slice(b * 3, b * 3 + 3), idx * 6 + 3);
    });
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [formations, linePairs]);

  useFrame((state, dt) => {
    if (!mesh.current) return;
    const { section, hoverSkill, skillFilter } = useScrollStore.getState();
    const f = formations[section as SectionId] ?? formations.hero;
    const t = state.clock.elapsedTime;

    // narrow viewports: squeeze formation x toward center so nothing exits frame
    const aspect = size.width / size.height;
    const xf = THREE.MathUtils.clamp(aspect / 1.5, 0.4, 1);

    const k = 1 - Math.exp(-3.2 * dt); // damping factor
    cur.opacity += (f.opacity - cur.opacity) * k;

    const highlightName = hoverSkill ?? skillFilter;
    const inSkills = section === "skills";

    for (let i = 0; i < N; i++) {
      // wobble keeps formations alive
      const wob = 0.05 + f.tumble * 0.1;
      let tx = f.pos[i * 3] * xf + Math.sin(t * 0.7 + i * 1.7) * wob;
      let ty = f.pos[i * 3 + 1] + Math.cos(t * 0.6 + i * 2.3) * wob;
      const tz = f.pos[i * 3 + 2];
      let ts = f.scale[i];

      // skills interactivity: lift the hovered/filtered node, dim the rest
      if (inSkills && i < SKILL_COUNT && highlightName) {
        if (skills[i].name === highlightName) {
          ts *= 1.6;
          ty += 0.15;
        } else {
          ts *= 0.55;
        }
      }

      cur.pos[i * 3] += (tx - cur.pos[i * 3]) * k;
      cur.pos[i * 3 + 1] += (ty - cur.pos[i * 3 + 1]) * k;
      cur.pos[i * 3 + 2] += (tz - cur.pos[i * 3 + 2]) * k;
      cur.scale[i] += (ts - cur.scale[i]) * k;
      cur.color[i * 3] += (f.color[i * 3] - cur.color[i * 3]) * k;
      cur.color[i * 3 + 1] += (f.color[i * 3 + 1] - cur.color[i * 3 + 1]) * k;
      cur.color[i * 3 + 2] += (f.color[i * 3 + 2] - cur.color[i * 3 + 2]) * k;

      dummy.position.set(cur.pos[i * 3], cur.pos[i * 3 + 1], cur.pos[i * 3 + 2]);
      const tum = f.tumble;
      dummy.rotation.set(
        t * 0.4 * tum + i,
        t * (0.3 + 0.2 * tum) + i * 0.7,
        t * 0.2 * tum,
      );
      dummy.scale.setScalar(Math.max(cur.scale[i], 0.0001));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      tmpColor.setRGB(cur.color[i * 3], cur.color[i * 3 + 1], cur.color[i * 3 + 2]);
      mesh.current.setColorAt(i, tmpColor);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    (mesh.current.material as THREE.MeshStandardMaterial).opacity = cur.opacity;
    mesh.current.visible = cur.opacity > 0.02;

    // connective lines only in skills
    if (lines.current) {
      const lm = lines.current.material as THREE.LineBasicMaterial;
      const target = inSkills ? 0.22 : 0;
      lm.opacity += (target - lm.opacity) * k;
      lines.current.visible = lm.opacity > 0.01;
      lines.current.scale.setScalar(xf); // match the x squeeze approximately
    }
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.32}
          metalness={0.18}
          transparent
          opacity={0}
          envMapIntensity={0.8}
        />
      </instancedMesh>
      <lineSegments ref={lines} geometry={lineGeom} visible={false}>
        <lineBasicMaterial color={COLORS.cobalt} transparent opacity={0} />
      </lineSegments>
    </group>
  );
}
