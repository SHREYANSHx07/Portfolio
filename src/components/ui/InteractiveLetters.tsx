"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Liquid-feel display text: each letter repels horizontally, tilts and gains
 * weight as the cursor approaches — spring physics per letter, no re-renders.
 * Horizontal-only displacement so the entrance line-mask never clips it.
 */

function Letter({
  ch,
  register,
}: {
  ch: string;
  register: (el: HTMLSpanElement | null, x: MotionValue<number>, r: MotionValue<number>, w: MotionValue<number>) => void;
}) {
  const x = useSpring(0, { stiffness: 250, damping: 22, mass: 0.5 });
  const rotate = useSpring(0, { stiffness: 250, damping: 22, mass: 0.5 });
  const wght = useSpring(0, { stiffness: 200, damping: 26 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    register(ref.current, x, rotate, wght);
  }, [register, x, rotate, wght]);

  return (
    <motion.span
      ref={ref}
      className="inline-block will-change-transform"
      style={{
        x,
        rotate,
        fontVariationSettings: useSpringToVariation(wght),
      }}
    >
      {ch === " " ? " " : ch}
    </motion.span>
  );
}

// map a 0..1 spring to a Fraunces variation string via a transformed MotionValue
function useSpringToVariation(v: MotionValue<number>) {
  return useTransform(v, (n) => `"opsz" 144, "wght" ${Math.round(340 + n * 260)}`);
}

export function InteractiveLetters({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLSpanElement>(null);
  const letters = useRef<
    { el: HTMLSpanElement; x: MotionValue<number>; r: MotionValue<number>; w: MotionValue<number> }[]
  >([]);
  const raf = useRef(0);

  const register = (
    el: HTMLSpanElement | null,
    x: MotionValue<number>,
    r: MotionValue<number>,
    w: MotionValue<number>,
  ) => {
    if (el) letters.current.push({ el, x, r, w });
  };

  useEffect(() => {
    if (reduced) return;
    const node = wrap.current;
    if (!node) return;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        for (const L of letters.current) {
          const rect = L.el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = cx - e.clientX;
          const dy = cy - e.clientY;
          const d = Math.hypot(dx, dy);
          const R = 170;
          if (d < R) {
            const f = 1 - d / R;
            L.x.set(Math.sign(dx || 1) * f * 16);
            L.r.set(Math.sign(dx || 1) * f * -5);
            L.w.set(f);
          } else {
            L.x.set(0);
            L.r.set(0);
            L.w.set(0);
          }
        }
      });
    };
    const onLeave = () => {
      for (const L of letters.current) {
        L.x.set(0);
        L.r.set(0);
        L.w.set(0);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [reduced]);

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span ref={wrap} className={cn("inline-block", className)}>
      {text.split("").map((ch, i) => (
        <Letter key={i} ch={ch} register={register} />
      ))}
    </span>
  );
}
