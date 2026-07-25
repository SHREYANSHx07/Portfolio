"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { accentHex } from "@/lib/theme";
import { useScrollStore } from "@/hooks/useScrollStore";
import { useThemeStore } from "@/hooks/useTheme";
import { useGameStore } from "@/hooks/useGameStore";
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
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const frameMat = useRef<THREE.MeshStandardMaterial>(null);
  const texture = useTexture(project.image!);
  const theme = useThemeStore((s) => s.theme);

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
    const targetOpacity = (matches ? 1 : 0.3) * (1 - Math.min(dist * 0.09, 0.32));
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
            color={accentHex(project.accent, theme)}
            roughness={0.4}
            metalness={0.2}
            emissive={theme === "dark" ? accentHex(project.accent, theme) : "#000000"}
            emissiveIntensity={theme === "dark" ? 0.35 : 0}
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
          {/* unlit, like a real screen — screenshots stay at full brightness
              regardless of scene lighting or theme */}
          <meshBasicMaterial ref={mat} map={texture} transparent toneMapped={false} />
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
  const dark = useThemeStore((s) => s.theme === "dark");
  const playMode = useGameStore((s) => s.playMode);

  // only render while actually on screen — an offscreen gallery canvas
  // otherwise burns GPU for nothing on every single frame
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: "25%",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={holder} className="h-full w-full">
    <Canvas
      dpr={[1, 1.8]}
      camera={cam}
      frameloop={visible && !playMode ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      {/* lights mirror the main scene's rig per theme so the gallery
          sits in the same world (no hardcoded ground plane — a wide
          translucent slab read as a glitch band over the page) */}
      {dark ? (
        <>
          <hemisphereLight args={["#46538f", "#07080d", 0.8]} />
          <directionalLight position={[3, 4, 5]} intensity={1.1} color="#c9d4ff" />
          <directionalLight position={[-4, 1, 2]} intensity={0.35} color="#ff8a6a" />
        </>
      ) : (
        <>
          <hemisphereLight args={["#fff7ec", "#d8d2c6", 1.05]} />
          <directionalLight position={[3, 4, 5]} intensity={1.5} color="#fff3e2" />
          <directionalLight position={[-4, 1, 2]} intensity={0.4} color="#d9e2ff" />
        </>
      )}
      <Suspense fallback={null}>
        <Rig progress={progress} onOpen={onOpen} />
      </Suspense>
    </Canvas>
    </div>
  );
}
