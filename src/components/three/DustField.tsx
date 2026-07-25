"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, DARK_COLORS } from "@/lib/theme";
import { useScrollStore } from "@/hooks/useScrollStore";
import { useThemeStore } from "@/hooks/useTheme";

/**
 * Full-page ambient particle field that PARTS around the cursor — a quiet
 * repulsion, like dust in light. Home positions are fixed; each frame every
 * particle is pushed away from the pointer's world position and eased home.
 *
 * In dark mode the same field reads as fireflies: cobalt-tinted, slightly
 * larger, additively blended so each point glows against the night.
 */

const COUNT = 160;
const fract = (x: number) => x - Math.floor(x);
const rnd = (i: number, s: number) => fract(Math.sin(i * 12.9898 + s * 78.233) * 43758.5453);

export function DustField() {
  const points = useRef<THREE.Points>(null);
  const { size } = useThree();
  const dark = useThemeStore((s) => s.theme === "dark");

  const home = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (rnd(i, 1) - 0.5) * 9;
      arr[i * 3 + 1] = (rnd(i, 2) - 0.5) * 5.2;
      arr[i * 3 + 2] = -1.6 - rnd(i, 3) * 1.6;
    }
    return arr;
  }, []);

  const positions = useMemo(() => new Float32Array(home), [home]);

  useFrame((state, dt) => {
    if (!points.current) return;
    const { pointer } = useScrollStore.getState();
    const t = state.clock.elapsedTime;

    // pointer NDC → approximate world coords at z≈0 plane
    const aspect = size.width / size.height;
    const halfH = Math.tan(THREE.MathUtils.degToRad(19)) * 6.6;
    const px = pointer.x * halfH * aspect;
    const py = -pointer.y * halfH;

    const geo = points.current.geometry;
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const k = 1 - Math.exp(-3 * dt);

    for (let i = 0; i < COUNT; i++) {
      const hx = home[i * 3] + Math.sin(t * 0.25 + i * 1.3) * 0.18;
      const hy = home[i * 3 + 1] + Math.cos(t * 0.2 + i * 2.1) * 0.14;

      const dx = hx - px;
      const dy = hy - py;
      const d2 = dx * dx + dy * dy;
      const R = 2.2;
      let tx = hx;
      let ty = hy;
      if (d2 < R * R) {
        const d = Math.max(Math.sqrt(d2), 0.15);
        const force = (1 - d / R) * 1.1;
        tx = hx + (dx / d) * force;
        ty = hy + (dy / d) * force;
      }
      attr.array[i * 3] += (tx - attr.array[i * 3]) * k;
      attr.array[i * 3 + 1] += (ty - attr.array[i * 3 + 1]) * k;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={dark ? 0.05 : 0.035}
        color={dark ? DARK_COLORS.cobaltSoft : COLORS.mutedInk}
        transparent
        opacity={dark ? 0.55 : 0.3}
        sizeAttenuation
        depthWrite={false}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}
