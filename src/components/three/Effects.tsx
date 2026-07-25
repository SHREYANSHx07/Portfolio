"use client";

import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";

/**
 * Restrained postprocessing for a LIGHT background: N8AO adds soft ambient
 * occlusion so objects feel grounded and "expensive" (no washy bloom, which
 * hazes a bright scene), plus SMAA for clean edges. Gate off on low tiers.
 */
export function Effects({ intensity = 1.1 }: { intensity?: number }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={0.6}
        intensity={intensity}
        distanceFalloff={1}
        quality="performance"
        color="#1a1a1a"
      />
      <SMAA />
    </EffectComposer>
  );
}
