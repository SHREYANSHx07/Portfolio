"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollStore } from "@/hooks/useScrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { profile } from "@/data/profile";
import { EASE, EASE_INOUT } from "@/lib/motion";

/**
 * Cinematic preloader: an animated 0→100 counter and name reveal that masks the
 * WebGL hydration + asset load, then lifts away as two panels. Sets store.ready
 * so sections can trigger their intros only once the site is revealed.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const setReady = useScrollStore((s) => s.setReady);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      setCount(100);
      setDone(true);
      setReady(true);
      return;
    }
    const start = performance.now();
    const DURATION = 1900;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 2.2);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 350);
        setTimeout(() => setReady(true), 900);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, setReady]);

  useEffect(() => {
    if (!done) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-paper"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE_INOUT }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <motion.span
              className="font-mono text-xs uppercase tracking-[0.35em] text-muted-ink"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {profile.name}
            </motion.span>
            <div className="overflow-hidden">
              <motion.h2
                className="font-display text-6xl font-light text-ink sm:text-7xl"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              >
                {profile.title}
              </motion.h2>
            </div>
          </motion.div>

          {/* Counter */}
          <div className="absolute bottom-8 right-8 z-20 flex items-baseline gap-2 font-mono text-ink">
            <span className="text-5xl tabular-nums sm:text-7xl">{count}</span>
            <span className="text-sm text-muted-ink">/ 100</span>
          </div>

          {/* Progress line */}
          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-line">
            <motion.div
              className="h-full bg-cobalt"
              style={{ width: `${count}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
