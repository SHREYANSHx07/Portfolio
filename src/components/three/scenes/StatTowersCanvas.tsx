"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { stats } from "@/data/achievements";
import { accentHex, COLORS } from "@/lib/theme";
import { useScrollStore } from "@/hooks/useScrollStore";

/**
 * 3D "stat towers": one column per competitive-programming metric. Bars grow
 * from their base as the section enters view and the platform rotates slowly.
 * Growth is driven by an internal progress ref that eases to 1 once mounted.
 */

const GAP = 1.5;
const MAX_H = 3.2;

function Tower({
  index,
  height,
  color,
  grow,
}: {
  index: number;
  height: number;
  color: string;
  grow: React.MutableRefObject<number>;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const x = (index - (stats.length - 1) / 2) * GAP;
  const target = height * MAX_H;

  useFrame((state) => {
    if (!mesh.current) return;
    const g = grow.current;
    // stagger: later towers start a touch later
    const local = THREE.MathUtils.clamp((g - index * 0.06) / (1 - index * 0.06), 0, 1);
    const eased = local * local * (3 - 2 * local);
    const h = Math.max(0.001, target * eased);
    mesh.current.scale.y = h;
    mesh.current.position.y = h / 2;
    // subtle idle shimmer
    mesh.current.position.x = x + Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.015;
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={mesh} castShadow receiveShadow>
        <boxGeometry args={[0.72, 1, 0.72]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} envMapIntensity={0.7} />
      </mesh>
    </group>
  );
}

function Scene() {
  const platform = useRef<THREE.Group>(null);
  const grow = useRef(0);

  useFrame((state, dt) => {
    grow.current = THREE.MathUtils.damp(grow.current, 1, 1.6, dt);
    const { pointer } = useScrollStore.getState();
    if (platform.current) {
      platform.current.rotation.y =
        state.clock.elapsedTime * 0.12 + pointer.x * 0.4;
    }
  });

  return (
    <>
      <hemisphereLight args={["#fff7ec", "#d8d2c6", 1]} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.8}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#d9e2ff" />

      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.2}>
        <group ref={platform} position={[0, -1.4, 0]}>
          {stats.map((s, i) => (
            <Tower
              key={s.label}
              index={i}
              height={s.height}
              color={accentHex(s.accent)}
              grow={grow}
            />
          ))}
          {/* base disc */}
          <mesh position={[0, -0.08, 0]} receiveShadow>
            <cylinderGeometry args={[4.2, 4.2, 0.16, 64]} />
            <meshStandardMaterial color={COLORS.surface} roughness={0.6} metalness={0} />
          </mesh>
        </group>
      </Float>
    </>
  );
}

export function StatTowersCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 2.2, 8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Scene />
    </Canvas>
  );
}
