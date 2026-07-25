"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/hooks/useGameStore";
import { useScrollStore } from "@/hooks/useScrollStore";
import { useCapabilityTier } from "@/hooks/useCapabilityTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sfxWhoosh } from "@/lib/sfx";
import { EASE } from "@/lib/motion";

const PlayMode = dynamic(() => import("@/components/three/PlayMode"), { ssr: false });

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

/**
 * The game entry points: a compact PLAY chip in the corner, and a louder
 * animated invitation once the visitor reaches the end of the page.
 * (The konami voxel storm stays as a hidden easter egg.)
 */
export function GameHUD() {
  const playMode = useGameStore((s) => s.playMode);
  const section = useScrollStore((s) => s.section);
  const tier = useCapabilityTier();
  const reduced = useReducedMotion();

  useEffect(() => {
    useGameStore.getState().hydrate();
    // warm the PLAY-mode chunk so pressing Play starts instantly
    void import("@/components/three/PlayMode");
  }, []);

  // konami code → voxel storm (hidden easter egg)
  const seq = useRef(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      seq.current = key === KONAMI[seq.current] ? seq.current + 1 : key === KONAMI[0] ? 1 : 0;
      if (seq.current === KONAMI.length) {
        seq.current = 0;
        useGameStore.getState().startStorm();
        sfxWhoosh();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (tier === "low") return null;

  return (
    <>
      {/* corner play chip */}
      <div className="fixed bottom-16 left-5 z-[66] sm:left-6">
        <button
          onClick={() => useGameStore.getState().setPlayMode(true)}
          aria-label="Play the voxel game"
          data-cursor="Play"
          className="group flex items-center gap-2 rounded-full border border-coral/40 bg-surface/85 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink shadow-md backdrop-blur transition-colors hover:border-coral hover:text-coral"
        >
          <span className="relative flex h-2 w-2">
            {!reduced && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
          </span>
          ▶ play
        </button>
      </div>

      {/* end-of-page invitation — appears when the visitor reaches Contact */}
      <AnimatePresence>
        {section === "contact" && !playMode && (
          <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[66] flex justify-center px-24">
            <motion.button
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={
                reduced
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 1, y: [0, -6, 0], scale: 1 }
              }
              exit={{ opacity: 0, y: 16 }}
              transition={
                reduced
                  ? { duration: 0.4, ease: EASE }
                  : {
                      opacity: { duration: 0.5, ease: EASE },
                      scale: { duration: 0.5, ease: EASE },
                      y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                    }
              }
              onClick={() => useGameStore.getState().setPlayMode(true)}
              data-cursor="Play"
              className="pointer-events-auto flex items-center gap-3 rounded-full border border-coral/50 bg-ink px-6 py-3 text-surface shadow-[0_18px_50px_-12px_rgba(255,90,60,0.55)] transition-colors hover:bg-coral"
            >
              <span className="relative flex h-2.5 w-2.5">
                {!reduced && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-70" />
                )}
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral" />
              </span>
              <span className="font-mono text-xs uppercase tracking-widest">
                You made it to the end — now beat the boss ▶
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {playMode && <PlayMode />}
    </>
  );
}
