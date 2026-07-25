"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { LightRig } from "./LightRig";
import { Avatar } from "./Avatar";
import { Effects } from "./Effects";
import { MorphInstances } from "./MorphInstances";
import { DustField } from "./DustField";
import { useScrollStore, type SectionId } from "@/hooks/useScrollStore";
import { useCapabilityTier } from "@/hooks/useCapabilityTier";

/**
 * The ONE persistent scene. Always mounted so the voxel morph journey is
 * continuous across the whole page. Composition per layer:
 *  - HeroSculpture: the signature presence; scales away after the hero
 *  - MorphInstances: the section-driven voxel narrative
 *  - DustField: cursor-parting ambient particles
 * Camera: cinematic intro dolly-out on preloader exit, then slow damped
 * swoops between per-section stations (+ pointer parallax).
 */

type Vec3 = [number, number, number];
const CAM: Record<SectionId, { pos: Vec3; look: Vec3 }> = {
  hero: { pos: [0, 0.2, 6.2], look: [0, 0, 0] },
  about: { pos: [0.4, 0.1, 6.7], look: [0, 0, 0] },
  skills: { pos: [-0.3, 0.2, 6.8], look: [-0.5, 0, 0] },
  experience: { pos: [0, 0.4, 7.3], look: [0, 0, 0] },
  flagship: { pos: [0, 0.1, 7.2], look: [0, 0, 0] },
  projects: { pos: [0, 0.2, 7], look: [0, 0, 0] },
  achievements: { pos: [0, 0.9, 7.5], look: [0, 0.3, 0] },
  contact: { pos: [0.5, 0.3, 6.5], look: [0.5, 0.3, 0] },
};

const SECTION_ORDER: SectionId[] = [
  "hero",
  "about",
  "skills",
  "experience",
  "flagship",
  "projects",
  "achievements",
  "contact",
];

const INTRO_FROM: Vec3 = [1.4, -0.3, 1.6]; // just in front of the sculpture core

/**
 * One continuous dolly move for the whole page: the old per-section stations
 * become control points on a Catmull-Rom spline, and a damped parameter
 * travels along it — so moving between sections swings THROUGH the
 * intermediate viewpoints instead of cutting station-to-station.
 */
const POS_CURVE = new THREE.CatmullRomCurve3(
  SECTION_ORDER.map((id) => new THREE.Vector3(...CAM[id].pos)),
  false,
  "centripetal",
  0.5,
);
const LOOK_CURVE = new THREE.CatmullRomCurve3(
  SECTION_ORDER.map((id) => new THREE.Vector3(...CAM[id].look)),
  false,
  "centripetal",
  0.5,
);

function CameraRig() {
  const intro = useRef(0);
  const u = useRef(0); // damped position along the spline, 0..1
  const posV = useRef(new THREE.Vector3());
  const lookV = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const { section, pointer, ready } = useScrollStore.getState();

    // cinematic fly-in once the preloader lifts (~2s ease-out)
    if (ready && intro.current < 1) {
      intro.current = Math.min(intro.current + dt * 0.55, 1);
    }
    const e = 1 - Math.pow(1 - intro.current, 3);

    // travel along the spline toward the active section's parameter
    const idx = Math.max(SECTION_ORDER.indexOf(section), 0);
    const targetU = idx / (SECTION_ORDER.length - 1);
    u.current += (targetU - u.current) * (1 - Math.exp(-1.6 * dt));

    POS_CURVE.getPointAt(THREE.MathUtils.clamp(u.current, 0, 1), posV.current);
    LOOK_CURVE.getPointAt(THREE.MathUtils.clamp(u.current, 0, 1), lookV.current);

    const tx = THREE.MathUtils.lerp(INTRO_FROM[0], posV.current.x + pointer.x * 0.25, e);
    const ty = THREE.MathUtils.lerp(INTRO_FROM[1], posV.current.y - pointer.y * 0.2, e);
    const tz = THREE.MathUtils.lerp(INTRO_FROM[2], posV.current.z, e);

    easing.damp3(state.camera.position, [tx, ty, tz], 0.5, dt);
    state.camera.lookAt(lookV.current);
  });
  return null;
}

function HeroSculpture() {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();

  useFrame((_, dt) => {
    if (!group.current) return;
    const { section } = useScrollStore.getState();
    const aspect = size.width / size.height;
    const xf = THREE.MathUtils.clamp(aspect / 1.5, 0.4, 1);
    const visible = section === "hero";
    const s = visible ? 1 : 0.001;
    easing.damp3(group.current.scale, [s, s, s], 0.4, dt);
    easing.damp3(group.current.position, [2.3 * xf, -0.1, 0], 0.4, dt);
    group.current.visible = group.current.scale.x > 0.01;
  });

  return (
    <group ref={group} position={[2.3, -0.1, 0]}>
      <Suspense fallback={null}>
        <Avatar />
      </Suspense>
    </group>
  );
}

export default function R3FCanvas() {
  const [dpr, setDpr] = useState(1.5);
  const tier = useCapabilityTier();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        shadows
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: INTRO_FROM, fov: 38 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        <LightRig />
        <CameraRig />
        <HeroSculpture />
        <MorphInstances />
        {tier !== "low" && <DustField />}
        {tier === "high" && <Effects intensity={1} />}
      </Canvas>
    </div>
  );
}
