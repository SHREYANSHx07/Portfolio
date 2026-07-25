"use client";

import { Bloom, EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import { useThemeStore } from "@/hooks/useTheme";

/**
 * Restrained postprocessing, per theme. Gate off on low tiers.
 *
 * LIGHT — N8AO only: soft ambient occlusion grounds objects on the bright
 * paper (no bloom, which hazes a bright scene), plus SMAA for clean edges.
 *
 * DARK — the same grounding AO plus a gentle mip-blurred Bloom so the
 * cobalt/coral accents and rim highlights bleed light into the night,
 * without washing the voxels out.
 */
export function Effects({ intensity = 1.1 }: { intensity?: number }) {
  const theme = useThemeStore((s) => s.theme);

  if (theme === "dark") {
    return (
      <EffectComposer multisampling={0} enableNormalPass>
        <N8AO
          aoRadius={0.6}
          intensity={intensity * 0.8}
          distanceFalloff={1}
          quality="performance"
          color="#000000"
        />
        <Bloom
          mipmapBlur
          intensity={0.5}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.3}
        />
        <SMAA />
      </EffectComposer>
    );
  }

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
