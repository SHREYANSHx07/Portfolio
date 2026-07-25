"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/hooks/useScrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Single source of truth for scroll + time.
 *  - One RAF, driven by gsap.ticker, feeds Lenis (no competing rAF loops).
 *  - Lenis 'scroll' → ScrollTrigger.update so pinned/scrubbed triggers stay synced.
 *  - Global progress written to the zustand store for the 3D layer.
 *  - Pointer tracked here once and shared with the 3D layer (no per-component listeners).
 * Under reduced-motion we skip Lenis entirely and use native scroll.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const setProgress = useScrollStore.getState().setProgress;

    let lenis: Lenis | null = null;
    const onTick = (time: number) => {
      lenis?.raf(time * 1000);
    };

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => 1 - Math.pow(1 - t, 3.2),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      });

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(onTick);
    }

    // Global progress (works with or without Lenis).
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    // Refresh triggers after fonts/layout settle to avoid pin miscalculation.
    const refresh = () => ScrollTrigger.refresh();
    const rafRefresh = requestAnimationFrame(() => setTimeout(refresh, 250));
    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(rafRefresh);
      window.removeEventListener("load", refresh);
      window.removeEventListener("scroll", updateProgress);
      if (lenis) {
        gsap.ticker.remove(onTick);
        lenis.destroy();
      }
    };
  }, [reduced]);

  // Pointer tracking — normalized -1..1, shared via store.
  useEffect(() => {
    const setPointer = useScrollStore.getState().setPointer;
    const onMove = (e: PointerEvent) => {
      setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <>{children}</>;
}
