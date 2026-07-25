"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { LightRig } from "./LightRig";
import { Avatar } from "./Avatar";
import { Effects } from "./Effects";
import { useScrollStore } from "@/hooks/useScrollStore";
import { COLORS } from "@/lib/theme";

/**
 * Persistent full-screen canvas that sits BEHIND the DOM (-z-10, pointer-events
 * none) and carries the avatar/presence through the whole page. The camera and
 * avatar respond to global scroll progress read imperatively from the store, so
 * the 3D "travels" as you scroll without ever re-rendering React.
 */

// Per-section camera + avatar "stations" keyed by scroll progress 0..1.
type Vec3 = [number, number, number];
type Station = { at: number; cam: Vec3; pos: Vec3; scale: number };

const STATIONS: Station[] = [
  { at: 0.0, cam: [0, 0.2, 6.2], pos: [2.4, -0.1, 0], scale: 1 }, // hero — right
  { at: 0.16, cam: [0, 0.2, 6.4], pos: [-2.2, 0.1, 0.4], scale: 0.9 }, // about — left
  { at: 0.34, cam: [0, 0.4, 7.2], pos: [0, 1.6, -1], scale: 0.7 }, // skills — up/back
  { at: 0.52, cam: [0, 0.1, 6.8], pos: [2.6, -0.2, 0], scale: 0.8 }, // experience
  { at: 0.7, cam: [0, 0.2, 6.6], pos: [-2.4, 0, 0.2], scale: 0.85 }, // projects
  { at: 0.85, cam: [0, 0.3, 7], pos: [2.2, 0.2, -0.4], scale: 0.8 }, // achievements
  { at: 1.0, cam: [0, 0, 6], pos: [0, -0.2, 0.6], scale: 1.05 }, // contact — center
];

function lerpStations(p: number) {
  let a = STATIONS[0];
  let b = STATIONS[STATIONS.length - 1];
  for (let i = 0; i < STATIONS.length - 1; i++) {
    if (p >= STATIONS[i].at && p <= STATIONS[i + 1].at) {
      a = STATIONS[i];
      b = STATIONS[i + 1];
      break;
    }
  }
  const span = b.at - a.at || 1;
  const t = THREE.MathUtils.clamp((p - a.at) / span, 0, 1);
  const e = t * t * (3 - 2 * t); // smoothstep
  const mix = (x: number, y: number) => x + (y - x) * e;
  return {
    cam: [mix(a.cam[0], b.cam[0]), mix(a.cam[1], b.cam[1]), mix(a.cam[2], b.cam[2])] as [number, number, number],
    pos: [mix(a.pos[0], b.pos[0]), mix(a.pos[1], b.pos[1]), mix(a.pos[2], b.pos[2])] as [number, number, number],
    scale: mix(a.scale, b.scale),
  };
}

function Rig() {
  const avatarRef = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const { progress, pointer } = useScrollStore.getState();
    const target = lerpStations(progress);

    // Camera glides through stations + subtle parallax from pointer.
    easing.damp3(
      state.camera.position,
      [target.cam[0] + pointer.x * 0.25, target.cam[1] - pointer.y * 0.2, target.cam[2]],
      0.5,
      dt,
    );
    state.camera.lookAt(0, target.pos[1] * 0.4, 0);

    if (avatarRef.current) {
      easing.damp3(avatarRef.current.position, target.pos, 0.5, dt);
      easing.damp3(
        avatarRef.current.scale,
        [target.scale, target.scale, target.scale],
        0.5,
        dt,
      );
    }
  });

  return (
    <group>
      <group ref={avatarRef} position={[2.4, -0.1, 0]}>
        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
      </group>
      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.28}
        scale={14}
        blur={2.8}
        far={5}
        color={COLORS.ink}
      />
    </group>
  );
}

export default function R3FCanvas() {
  const [dpr, setDpr] = useState(1.5);
  const wrap = useRef<HTMLDivElement>(null);

  // The persistent avatar is a HERO element. Over content sections it would
  // overlap text + each section's own 3D, so fade it out after the hero and
  // bring it back for the contact/footer where there's room again.
  useEffect(() => {
    const unsub = useScrollStore.subscribe((s) => {
      const p = s.progress;
      // Prominent through the hero, gone by the time content begins.
      let o = 1;
      if (p <= 0.08) o = 1;
      else if (p < 0.16) o = 1 - (p - 0.08) / 0.08;
      else o = 0;
      if (wrap.current) wrap.current.style.opacity = o.toFixed(3);
    });
    return unsub;
  }, []);

  return (
    <div
      ref={wrap}
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-300"
      style={{ opacity: 1 }}
    >
      <Canvas
        shadows
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.2, 6.2], fov: 38 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(1.5)}
        />
        <LightRig />
        <Rig />
        <Effects intensity={1} />
      </Canvas>
    </div>
  );
}
