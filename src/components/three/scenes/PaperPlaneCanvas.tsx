"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "@/lib/theme";
import { useThemeStore } from "@/hooks/useTheme";

/**
 * A low-poly paper plane that loops a gentle launch arc — shown in the contact
 * success card. Built from folded triangles so it reads as origami, not a blob.
 */
function PlaneMesh() {
  const group = useRef<THREE.Group>(null);
  const theme = useThemeStore((s) => s.theme);
  const C = palette(theme);

  // Two wings + belly fold, as a small custom geometry.
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    // nose at +z, tail at -z; left/right wings splay in x, belly dips in -y
    const v = new Float32Array([
      // left wing (top)
      0, 0, 1, -0.9, 0, -1, 0, 0.05, -0.7,
      // right wing (top)
      0, 0, 1, 0, 0.05, -0.7, 0.9, 0, -1,
      // left belly
      0, 0, 1, 0, -0.18, -0.75, -0.9, 0, -1,
      // right belly
      0, 0, 1, 0.9, 0, -1, 0, -0.18, -0.75,
    ]);
    g.setAttribute("position", new THREE.BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    // looping launch arc
    const cycle = (t * 0.5) % 1;
    group.current.position.x = (cycle - 0.5) * 3.4;
    group.current.position.y = Math.sin(cycle * Math.PI) * 1.1 - 0.2;
    group.current.rotation.z = -0.3 + Math.cos(cycle * Math.PI) * 0.4;
    group.current.rotation.y = 0.5 + Math.sin(t * 0.8) * 0.15;
    group.current.rotation.x = -0.2;
  });

  return (
    <group ref={group}>
      <mesh geometry={geom} castShadow>
        <meshStandardMaterial
          color={theme === "dark" ? "#e6e4f0" : C.surface}
          side={THREE.DoubleSide}
          roughness={0.5}
          metalness={0}
          flatShading
        />
      </mesh>
      {/* crease line */}
      <mesh geometry={geom}>
        <meshBasicMaterial color={C.cobalt} wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export function PaperPlaneCanvas() {
  const dark = useThemeStore((s) => s.theme === "dark");
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.3, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      {dark ? (
        <>
          <hemisphereLight args={["#46538f", "#07080d", 0.8]} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} color="#c9d4ff" />
        </>
      ) : (
        <>
          <hemisphereLight args={["#fff7ec", "#d8d2c6", 1.1]} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} color="#fff3e2" />
        </>
      )}
      <PlaneMesh />
    </Canvas>
  );
}
