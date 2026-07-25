"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useThemeStore } from "@/hooks/useTheme";

/**
 * Two rigs, one per theme.
 *
 * LIGHT — tuned for the bright editorial paper (#F4F1EC): warm key + soft
 * fill + crisp rim, with a local Lightformer environment (no CDN HDRI) for
 * believable matte reflections.
 *
 * DARK — a moonlit stage for the midnight paper (#0B0C11): cool blue moon
 * key at low intensity, cobalt rim to draw silhouettes out of the black,
 * a faint coral ember for warmth, and dim cobalt/violet Lightformers so
 * reflections read as night sky instead of studio softboxes.
 */
export function LightRig() {
  const theme = useThemeStore((s) => s.theme);

  if (theme === "dark") {
    return (
      <>
        <hemisphereLight args={["#46538f", "#07080d", 0.55]} />
        {/* Cool moon key */}
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.35}
          color="#c9d4ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        >
          <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.1, 30]} />
        </directionalLight>
        {/* Coral ember fill from the opposite side */}
        <directionalLight position={[-5, 2, -3]} intensity={0.3} color="#ff8a6a" />
        {/* Cobalt rim to pull silhouettes off the black */}
        <spotLight
          position={[0, 5, -6]}
          angle={0.6}
          penumbra={1}
          intensity={2.4}
          color="#7d95ff"
        />

        {/* key forces a re-bake: frames={1} renders the env map once */}
        <Environment key="dark" resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={1.4}
            position={[3, 4, 4]}
            scale={[6, 6, 1]}
            color="#3a4aa8"
          />
          <Lightformer
            form="rect"
            intensity={0.8}
            position={[-4, 2, 2]}
            scale={[5, 5, 1]}
            color="#54418f"
          />
          <Lightformer
            form="ring"
            intensity={0.7}
            position={[0, -3, -4]}
            scale={[4, 4, 1]}
            color="#ff7a5c"
          />
        </Environment>
      </>
    );
  }

  return (
    <>
      <hemisphereLight args={["#fff7ec", "#d8d2c6", 0.9]} />
      {/* Warm key */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.1}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.1, 30]} />
      </directionalLight>
      {/* Cool soft fill from the opposite side */}
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#d9e2ff" />
      {/* Rim to pop silhouettes off the paper */}
      <spotLight
        position={[0, 5, -6]}
        angle={0.6}
        penumbra={1}
        intensity={1.2}
        color="#ffffff"
      />

      <Environment key="light" resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2}
          position={[3, 4, 4]}
          scale={[6, 6, 1]}
          color="#fff4e6"
        />
        <Lightformer
          form="rect"
          intensity={1}
          position={[-4, 2, 2]}
          scale={[5, 5, 1]}
          color="#e7ecff"
        />
        <Lightformer
          form="ring"
          intensity={0.8}
          position={[0, -3, -4]}
          scale={[4, 4, 1]}
          color="#ffd9cf"
        />
      </Environment>
    </>
  );
}
