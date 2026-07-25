"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF, useAnimations, Float } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import { COLORS, DARK_COLORS } from "@/lib/theme";
import { useScrollStore } from "@/hooks/useScrollStore";
import { useThemeStore } from "@/hooks/useTheme";
import { profile } from "@/data/profile";

type GroupProps = ThreeElements["group"];

// deterministic pseudo-random (stable across renders, lint-pure)
const fract = (x: number) => x - Math.floor(x);
const rnd = (i: number, s: number) => fract(Math.sin(i * 12.9898 + s * 78.233) * 43758.5453);

/**
 * The 3D "you". If a Ready Player Me .glb URL is set in profile.avatarUrl,
 * we load + animate it (idle clip, head mouse-look). Otherwise the hero
 * presence is theme-specific:
 *  - LIGHT: the editorial ink sculpture (unchanged) — faceted core, blueprint
 *    shell, two orbit rings, shard satellites.
 *  - DARK: a techy "reactor core" — pulsing emissive heart, counter-rotating
 *    wireframe shells, three gyroscope rings, orbiting data packets, rising
 *    data streams and a looping scan pulse. Built for the bloom pass.
 */
export function Avatar(props: GroupProps) {
  const dark = useThemeStore((s) => s.theme === "dark");
  if (profile.avatarUrl) return <AvatarModel url={profile.avatarUrl} {...props} />;
  return dark ? <ReactorCore {...props} /> : <AvatarPlaceholder {...props} />;
}

function AvatarModel({ url, ...props }: { url: string } & GroupProps) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const head = useRef<THREE.Object3D | null>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
      if (/head/i.test(o.name) && !head.current) head.current = o;
    });
    const first = names[0];
    if (first && actions[first]) actions[first]?.reset().fadeIn(0.4).play();
    return () => {
      if (first) actions[first]?.fadeOut(0.2);
    };
  }, [scene, actions, names]);

  useFrame((state, dt) => {
    const { pointer } = useScrollStore.getState();
    if (head.current) {
      easing.dampE(head.current.rotation, [pointer.y * 0.35, pointer.x * 0.6, 0], 0.25, dt);
    }
    if (inner.current) {
      inner.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.03;
    }
  });

  return (
    <group ref={group} {...props}>
      <group ref={inner}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* LIGHT hero — editorial ink sculpture (original, unchanged look)     */
/* ------------------------------------------------------------------ */
function AvatarPlaceholder(props: GroupProps) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const shards = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Points>(null);

  // Particle field in a spherical shell around the core.
  const dustPositions = useMemo(() => {
    const N = 140;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 2.4 + rnd(i, 1) * 1.8;
      const theta = rnd(i, 2) * Math.PI * 2;
      const phi = Math.acos(2 * rnd(i, 3) - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const shardData = useMemo(() => {
    const palette = [COLORS.cobalt, COLORS.ink, COLORS.coral];
    return Array.from({ length: 9 }, (_, i) => ({
      angle: (i / 9) * Math.PI * 2,
      radius: 1.7 + (i % 3) * 0.4,
      y: Math.sin(i * 2.2) * 1,
      size: 0.11 + (i % 4) * 0.05,
      speed: 0.14 + (i % 3) * 0.08,
      color: palette[i % 3],
    }));
  }, []);

  useFrame((state, dt) => {
    const { pointer } = useScrollStore.getState();
    const t = state.clock.elapsedTime;

    if (group.current) {
      easing.dampE(group.current.rotation, [pointer.y * 0.25, pointer.x * 0.5, 0], 0.4, dt);
    }
    if (core.current) {
      core.current.rotation.y = t * 0.18;
      core.current.rotation.x = Math.sin(t * 0.4) * 0.12;
      core.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.015);
    }
    if (shell.current) {
      shell.current.rotation.y = -t * 0.12;
      shell.current.rotation.z = t * 0.06;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.25;
      ring.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.5) * 0.1;
    }
    if (ring2.current) {
      ring2.current.rotation.y = t * 0.3;
      ring2.current.rotation.x = Math.PI / 3.4 + Math.cos(t * 0.4) * 0.12;
    }
    if (dust.current) {
      dust.current.rotation.y = t * 0.04;
    }
    if (shards.current) {
      shards.current.children.forEach((child, i) => {
        const d = shardData[i];
        const a = d.angle + t * d.speed;
        child.position.set(
          Math.cos(a) * d.radius,
          d.y + Math.sin(t * 0.6 + i) * 0.15,
          Math.sin(a) * d.radius,
        );
        child.rotation.x = t * 0.5 + i;
        child.rotation.y = t * 0.3 + i;
      });
    }
  });

  return (
    <group ref={group} {...props}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
        {/* Faceted ink core */}
        <mesh ref={core} castShadow receiveShadow>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial
            color={COLORS.ink}
            flatShading
            roughness={0.32}
            metalness={0.2}
            envMapIntensity={0.9}
          />
        </mesh>

        {/* Cobalt blueprint wireframe shell */}
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.55, 1]} />
          <meshStandardMaterial color={COLORS.cobalt} wireframe transparent opacity={0.28} />
        </mesh>

        {/* Coral orbit ring */}
        <mesh ref={ring}>
          <torusGeometry args={[1.9, 0.03, 16, 120]} />
          <meshStandardMaterial
            color={COLORS.coral}
            roughness={0.4}
            metalness={0.1}
            emissive={COLORS.coral}
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Cobalt orbit ring, crossing angle */}
        <mesh ref={ring2}>
          <torusGeometry args={[2.15, 0.02, 16, 120]} />
          <meshStandardMaterial color={COLORS.cobalt} roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Shard satellites */}
        <group ref={shards}>
          {shardData.map((d, i) => (
            <mesh key={i} castShadow>
              <octahedronGeometry args={[d.size, 0]} />
              <meshStandardMaterial color={d.color} flatShading roughness={0.3} metalness={0.2} />
            </mesh>
          ))}
        </group>

        {/* Soft particle field */}
        <points ref={dust}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[dustPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.035} color={COLORS.mutedInk} transparent opacity={0.6} sizeAttenuation />
        </points>
      </Float>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* DARK hero — the reactor core. A different machine entirely: pulsing */
/* emissive heart, counter-rotating wireframe shells, 3 gyroscope      */
/* rings, orbiting data packets, rising data streams, scan pulse.      */
/* Emissive values are tuned to feed the dark-mode bloom pass.         */
/* ------------------------------------------------------------------ */

const STREAM_COUNT = 90;
const STREAM_RADIUS = 2.65;
const STREAM_BOTTOM = -1.6;
const STREAM_SPAN = 3.8;

function ReactorCore(props: GroupProps) {
  const C = DARK_COLORS;
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const shellA = useRef<THREE.Mesh>(null);
  const shellB = useRef<THREE.Mesh>(null);
  const gyro1 = useRef<THREE.Mesh>(null);
  const gyro2 = useRef<THREE.Mesh>(null);
  const gyro3 = useRef<THREE.Mesh>(null);
  const packets = useRef<THREE.Group>(null);
  const streams = useRef<THREE.Points>(null);
  const scan = useRef<THREE.Mesh>(null);
  const scanMat = useRef<THREE.MeshBasicMaterial>(null);

  // Orbiting "data packet" cubes on inclined orbits.
  const packetData = useMemo(() => {
    const palette = [C.cobalt, C.coral, C.cobaltSoft];
    return Array.from({ length: 14 }, (_, i) => ({
      angle: (i / 14) * Math.PI * 2,
      radius: 2.2 + (i % 4) * 0.3,
      incline: (i / 14) * Math.PI,
      speed: 0.45 + rnd(i, 4) * 0.5,
      size: 0.06 + (i % 3) * 0.03,
      color: palette[i % 3],
    }));
  }, [C]);

  // Rising data-stream particles on a cylinder around the core.
  const streamSeed = useMemo(() => {
    const arr = new Float32Array(STREAM_COUNT * 3);
    for (let i = 0; i < STREAM_COUNT; i++) {
      const a = rnd(i, 7) * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * (STREAM_RADIUS + rnd(i, 8) * 0.5);
      arr[i * 3 + 1] = STREAM_BOTTOM + rnd(i, 9) * STREAM_SPAN;
      arr[i * 3 + 2] = Math.sin(a) * (STREAM_RADIUS + rnd(i, 8) * 0.5);
    }
    return arr;
  }, []);
  const streamPositions = useMemo(() => new Float32Array(streamSeed), [streamSeed]);

  useFrame((state, dt) => {
    const { pointer } = useScrollStore.getState();
    const t = state.clock.elapsedTime;

    if (group.current) {
      easing.dampE(group.current.rotation, [pointer.y * 0.3, pointer.x * 0.6, 0], 0.35, dt);
    }
    // heart: fast spin + emissive pulse, like a contained star
    if (core.current) {
      core.current.rotation.y = t * 0.6;
      core.current.rotation.x = Math.sin(t * 0.8) * 0.2;
      core.current.scale.setScalar(1 + Math.sin(t * 1.8) * 0.05);
    }
    if (coreMat.current) {
      coreMat.current.emissiveIntensity = 0.6 + Math.sin(t * 2.3) * 0.25;
    }
    // counter-rotating cage shells
    if (shellA.current) {
      shellA.current.rotation.y = -t * 0.28;
      shellA.current.rotation.z = t * 0.12;
    }
    if (shellB.current) {
      shellB.current.rotation.y = t * 0.18;
      shellB.current.rotation.x = -t * 0.1;
    }
    // gyroscope rings on three axes, precessing
    if (gyro1.current) {
      gyro1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.6) * 0.35;
      gyro1.current.rotation.z = t * 0.9;
    }
    if (gyro2.current) {
      gyro2.current.rotation.y = t * 0.7;
      gyro2.current.rotation.x = Math.PI / 3 + Math.cos(t * 0.5) * 0.25;
    }
    if (gyro3.current) {
      gyro3.current.rotation.z = -t * 0.5;
      gyro3.current.rotation.y = Math.PI / 4 + Math.sin(t * 0.4) * 0.3;
    }
    // data packets on inclined orbits, tumbling
    if (packets.current) {
      packets.current.children.forEach((child, i) => {
        const d = packetData[i];
        const a = d.angle + t * d.speed;
        child.position.set(
          Math.cos(a) * d.radius,
          Math.sin(a) * d.radius * Math.sin(d.incline) * 0.55,
          Math.sin(a) * d.radius * Math.cos(d.incline),
        );
        child.rotation.x = t * 1.2 + i;
        child.rotation.y = t * 0.8 + i * 0.7;
      });
    }
    // streams rise and wrap
    if (streams.current) {
      const attr = streams.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < STREAM_COUNT; i++) {
        const speed = 0.35 + rnd(i, 11) * 0.55;
        const y0 = streamSeed[i * 3 + 1] - STREAM_BOTTOM;
        attr.array[i * 3 + 1] =
          STREAM_BOTTOM + ((y0 + t * speed) % STREAM_SPAN);
      }
      attr.needsUpdate = true;
      streams.current.rotation.y = t * 0.05;
    }
    // scan pulse: expanding ring that fades and loops
    if (scan.current && scanMat.current) {
      const s = fract(t * 0.4);
      const scale = 1.1 + s * 2.4;
      scan.current.scale.set(scale, scale, scale);
      scanMat.current.opacity = (1 - s) * 0.3;
    }
  });

  return (
    <group ref={group} {...props}>
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Pulsing emissive heart */}
        <mesh ref={core} castShadow>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial
            ref={coreMat}
            color="#141726"
            flatShading
            roughness={0.3}
            metalness={0.45}
            emissive={C.cobalt}
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Counter-rotating wireframe cages */}
        <mesh ref={shellA}>
          <icosahedronGeometry args={[1.45, 1]} />
          <meshStandardMaterial color={C.cobaltSoft} wireframe transparent opacity={0.38} />
        </mesh>
        <mesh ref={shellB}>
          <octahedronGeometry args={[1.85, 0]} />
          <meshStandardMaterial color={C.coral} wireframe transparent opacity={0.14} />
        </mesh>

        {/* Gyroscope rings — cobalt / coral / soft-cobalt, all emissive */}
        <mesh ref={gyro1}>
          <torusGeometry args={[1.75, 0.025, 16, 120]} />
          <meshStandardMaterial
            color={C.cobalt}
            roughness={0.35}
            metalness={0.2}
            emissive={C.cobalt}
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh ref={gyro2}>
          <torusGeometry args={[2.05, 0.02, 16, 120]} />
          <meshStandardMaterial
            color={C.coral}
            roughness={0.35}
            metalness={0.2}
            emissive={C.coral}
            emissiveIntensity={0.7}
          />
        </mesh>
        <mesh ref={gyro3}>
          <torusGeometry args={[2.35, 0.016, 16, 120]} />
          <meshStandardMaterial
            color={C.cobaltSoft}
            roughness={0.4}
            metalness={0.2}
            emissive={C.cobaltSoft}
            emissiveIntensity={0.55}
          />
        </mesh>

        {/* Orbiting data packets */}
        <group ref={packets}>
          {packetData.map((d, i) => (
            <mesh key={i} scale={d.size}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={d.color}
                emissive={d.color}
                emissiveIntensity={0.9}
                roughness={0.3}
                metalness={0.3}
              />
            </mesh>
          ))}
        </group>

        {/* Rising data streams */}
        <points ref={streams}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[streamPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color={C.cobaltSoft}
            transparent
            opacity={0.5}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* Looping scan pulse */}
        <mesh ref={scan} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.008, 8, 100]} />
          <meshBasicMaterial ref={scanMat} color={C.coral} transparent opacity={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

if (profile.avatarUrl) useGLTF.preload(profile.avatarUrl);
