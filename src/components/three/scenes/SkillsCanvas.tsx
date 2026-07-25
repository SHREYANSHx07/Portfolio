"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { skills } from "@/data/skills";
import { COLORS, accentHex } from "@/lib/theme";
import { useScrollStore } from "@/hooks/useScrollStore";

/**
 * A slowly rotating constellation of skill nodes on a fibonacci sphere. Nodes
 * drift with a float, tilt toward the cursor, and lift + label on hover.
 * Self-contained canvas, mounted lazily by the Skills section when in view.
 */

type NodeDatum = {
  name: string;
  color: string;
  size: number;
  pos: [number, number, number];
};

function useNodes(): NodeDatum[] {
  return useMemo(() => {
    const n = skills.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const R = 3.1;
    return skills.map((s, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return {
        name: s.name,
        color: accentHex(s.accent),
        size: 0.16 + s.weight * 0.14,
        pos: [Math.cos(theta) * r * R, y * R, Math.sin(theta) * r * R],
      };
    });
  }, []);
}

function Node({ data }: { data: NodeDatum }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = hovered ? 1.35 : 1;
    easing.damp3(ref.current.scale, [target, target, target], 0.2, dt);
  });

  return (
    <group position={data.pos}>
      <mesh
        ref={ref}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[data.size, 1]} />
        <meshStandardMaterial
          color={data.color}
          flatShading
          roughness={0.35}
          metalness={0.15}
          emissive={data.color}
          emissiveIntensity={hovered ? 0.4 : 0.05}
        />
      </mesh>
    </group>
  );
}

function Constellation() {
  const group = useRef<THREE.Group>(null);
  const nodes = useNodes();

  useFrame((state, dt) => {
    const { pointer } = useScrollStore.getState();
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.08;
    easing.dampE(
      group.current.rotation,
      [pointer.y * 0.3, group.current.rotation.y, 0],
      0.5,
      dt,
    );
  });

  return (
    <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.25}>
      <group ref={group}>
        {nodes.map((n) => (
          <Node key={n.name} data={n} />
        ))}
        {/* faint connective core */}
        <mesh>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={COLORS.ink} wireframe transparent opacity={0.12} />
        </mesh>
      </group>
    </Float>
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#fff7ec", "#d8d2c6", 1]} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff3e2" />
      <directionalLight position={[-5, 2, -3]} intensity={0.4} color="#d9e2ff" />
    </>
  );
}

export function SkillsCanvas() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 8.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Lights />
      <Constellation />
    </Canvas>
  );
}
