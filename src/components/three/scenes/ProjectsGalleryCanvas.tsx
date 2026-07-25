"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { COLORS, accentHex } from "@/lib/theme";
import { useScrollStore } from "@/hooks/useScrollStore";
import { projects, type Project } from "@/data/projects";

/**
 * True WebGL project gallery: framed, textured panels arranged along X.
 * A sticky wrapper scrubs `progress` 0..1 → the group slides horizontally;
 * the panel nearest center rotates flat to face the camera while neighbors
 * angle away, recede and dim. Clicking a panel opens the detail modal.
 */

const SPACING = 3.6;

function Panel({
  project,
  index,
  groupX,
  onOpen,
}: {
  project: Project;
  index: number;
  groupX: React.MutableRefObject<number>;
  onOpen: (p: Project) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const frameMat = useRef<THREE.MeshStandardMaterial>(null);
  const texture = useTexture(project.image!);

  useFrame((state, dt) => {
    if (!group.current) return;
    const worldX = index * SPACING + groupX.current;
    const dist = Math.abs(worldX);

    // center panel faces camera; neighbors angle away and recede
    const targetRot = THREE.MathUtils.clamp(-worldX * 0.32, -0.85, 0.85);
    const targetScale = 1 - Math.min(dist * 0.11, 0.34);
    const targetZ = -Math.min(dist * 0.55, 1.6);
    const targetY = Math.sin(state.clock.elapsedTime * 0.8 + index * 1.4) * 0.05;

    const k = 1 - Math.exp(-6 * dt);
    group.current.rotation.y += (targetRot - group.current.rotation.y) * k;
    group.current.position.z += (targetZ - group.current.position.z) * k;
    group.current.position.y += (targetY - group.current.position.y) * k;
    group.current.scale.setScalar(
      group.current.scale.x + (targetScale - group.current.scale.x) * k,
    );

    // dim non-matching panels when a skill filter is active
    const { skillFilter } = useScrollStore.getState();
    const matches =
      !skillFilter ||
      project.stack.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()));
    const targetOpacity = (matches ? 1 : 0.25) * (1 - Math.min(dist * 0.16, 0.55));
    if (mat.current) mat.current.opacity += (targetOpacity - mat.current.opacity) * k;
    if (frameMat.current)
      frameMat.current.opacity += (targetOpacity - frameMat.current.opacity) * k;
  });

  return (
    <group position={[index * SPACING, 0, 0]}>
      <group ref={group}>
        {/* accent frame */}
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[2.94, 1.9]} />
          <meshStandardMaterial
            ref={frameMat}
            color={accentHex(project.accent)}
            roughness={0.4}
            metalness={0.2}
            transparent
          />
        </mesh>
        {/* screenshot */}
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onOpen(project);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <planeGeometry args={[2.8, 1.76]} />
          <meshStandardMaterial ref={mat} map={texture} roughness={0.55} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Rig({ progress, onOpen }: { progress: MotionValue<number>; onOpen: (p: Project) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const groupX = useRef(0);

  useFrame((_, dt) => {
    const p = progress.get();
    const target = -p * SPACING * (projects.length - 1);
    const k = 1 - Math.exp(-5 * dt);
    groupX.current += (target - groupX.current) * k;
    if (groupRef.current) groupRef.current.position.x = groupX.current;
  });

  return (
    <group ref={groupRef}>
      {projects.map((p, i) => (
        <Panel key={p.id} project={p} index={i} groupX={groupX} onOpen={onOpen} />
      ))}
    </group>
  );
}

export function ProjectsGalleryCanvas({
  progress,
  onOpen,
}: {
  progress: MotionValue<number>;
  onOpen: (p: Project) => void;
}) {
  const cam = useMemo(() => ({ position: [0, 0.1, 4.3] as [number, number, number], fov: 42 }), []);

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={cam}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <hemisphereLight args={["#fff7ec", "#d8d2c6", 1.05]} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} color="#fff3e2" />
      <directionalLight position={[-4, 1, 2]} intensity={0.4} color="#d9e2ff" />
      <Suspense fallback={null}>
        <Rig progress={progress} onOpen={onOpen} />
      </Suspense>
      {/* soft ground hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color={COLORS.paper} transparent opacity={0.35} />
      </mesh>
    </Canvas>
  );
}
