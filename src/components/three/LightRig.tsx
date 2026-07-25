"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Lighting tuned for a BRIGHT editorial background (#F4F1EC).
 * The trick that makes light-bg 3D read as premium: warm key + soft fill +
 * a crisp rim to separate ink materials from the paper, plus a local
 * Lightformer environment (no CDN HDRI) for believable matte reflections.
 */
export function LightRig() {
  return (
    <>
      <hemisphereLight args={["#fff7ec", "#d8d2c6", 0.9]} />
      {/* Warm key */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.1}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
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

      <Environment resolution={256} frames={1}>
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
