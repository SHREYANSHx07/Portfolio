"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "mid" | "low";

/**
 * Cheap device-capability heuristic used to gate heavy 3D.
 *  - high: desktop w/ fine pointer + decent cores → full scene + postprocessing
 *  - mid : capable but constrained → scene, no postprocessing
 *  - low : coarse pointer / low cores / low memory → 2D fallbacks
 */
export function useCapabilityTier(): Tier {
  const [tier, setTier] = useState<Tier>("high");

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 820px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    // deviceMemory is non-standard but widely available on Chromium.
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

    let next: Tier = "high";
    if (coarse || narrow || cores <= 4 || mem <= 4) next = "low";
    else if (cores <= 6 || mem <= 6) next = "mid";

    setTier(next);
  }, []);

  return tier;
}
