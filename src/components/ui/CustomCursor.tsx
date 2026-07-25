"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Bespoke cursor: a small ink dot that tracks precisely, and a lagging ring
 * that swells over interactive elements ([data-cursor="hover"] or a/button).
 * Only mounts on fine-pointer, non-reduced-motion devices.
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const raf = useRef(0);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || reduced) {
      setEnabled(false);
      document.documentElement.classList.remove("has-custom-cursor");
      return;
    }
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        x.set(e.clientX);
        y.set(e.clientY);
        const el = (e.target as HTMLElement)?.closest<HTMLElement>(
          "a, button, [data-cursor]",
        );
        setHovering(!!el);
        setLabel(el?.dataset.cursor && el.dataset.cursor !== "hover" ? el.dataset.cursor : null);
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf.current);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* Precise dot */}
      <motion.div
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-ink"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Lagging ring */}
      <motion.div
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border border-ink/40"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 56 : 30,
          height: hovering ? 56 : 30,
          borderColor: hovering ? "rgba(43,76,240,0.6)" : "rgba(26,26,26,0.35)",
          backgroundColor: hovering ? "rgba(43,76,240,0.06)" : "rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-cobalt">
            {label}
          </span>
        )}
      </motion.div>
    </div>
  );
}
