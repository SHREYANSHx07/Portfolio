"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
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

  // game-feel: the dot stretches along its velocity vector and relaxes
  // back to a circle when the pointer rests (velocity decays to zero)
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  const speed = useTransform<number, number>([vx, vy], ([a, b]) => Math.hypot(a, b));
  const stretch = useSpring(useTransform(speed, [0, 4000], [1, 1.9]), {
    stiffness: 400,
    damping: 40,
  });
  const angle = useTransform<number, number>(
    [vx, vy],
    ([a, b]) => (Math.atan2(b, a) * 180) / Math.PI,
  );

  // click ripples radiating from the cursor
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: PointerEvent) => {
      const id = ++rippleId.current;
      setRipples((r) => [...r.slice(-4), { id, x: e.clientX, y: e.clientY }]);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, [enabled]);

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
    <div className="pointer-events-none fixed inset-0 z-[95]">
      {/* Precise dot — velocity-stretched like a game pointer */}
      <motion.div
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-ink"
        style={{ x, y, translateX: "-50%", translateY: "-50%", rotate: angle, scaleX: stretch }}
      />

      {/* click ripples */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0.25, opacity: 0.5 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onAnimationComplete={() =>
              setRipples((cur) => cur.filter((it) => it.id !== r.id))
            }
            className="fixed h-10 w-10 rounded-full border border-cobalt/50"
            style={{ left: r.x - 20, top: r.y - 20 }}
          />
        ))}
      </AnimatePresence>
      {/* Lagging ring — colors come from theme tokens so dark mode adapts */}
      <motion.div
        className={`fixed left-0 top-0 flex items-center justify-center rounded-full border transition-colors ${
          hovering ? "border-cobalt/60 bg-cobalt/10" : "border-ink/35 bg-transparent"
        }`}
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 56 : 30,
          height: hovering ? 56 : 30,
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
