"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF, useAnimations, Float } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";
import { useScrollStore } from "@/hooks/useScrollStore";
import { profile } from "@/data/profile";

type GroupProps = ThreeElements["group"];

/**
 * The 3D "you". If a Ready Player Me .glb URL is set in profile.avatarUrl,
 * we load + animate it (idle clip, head mouse-look). Otherwise we render a
 * refined sculptural placeholder so framing/camera work is correct now and
 * the real avatar swaps in with a one-line data change.
 */
export function Avatar(props: GroupProps) {
  return profile.avatarUrl ? (
    <AvatarModel url={profile.avatarUrl} {...props} />
  ) : (
    <AvatarPlaceholder {...props} />
  );
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

/**
 * Signature hero "presence" — a faceted ink core inside a cobalt blueprint
 * wireframe shell, wrapped by two orbit rings (coral + cobalt), floating shards
 * and a soft particle field. Breathes, drifts and tilts toward the cursor.
 * Editorial, technical, and unique — no external model required.
 */
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
      const r = 2.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
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

if (profile.avatarUrl) useGLTF.preload(profile.avatarUrl);
