"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>*#";

/**
 * Decode/scramble reveal: text resolves character-by-character from random
 * glyphs on scroll-into-view. Great for the mono eyebrow labels. Preserves
 * spaces and non-letters. Renders final text instantly under reduced-motion.
 */
export function ScrambleText({
  text,
  className,
  speed = 28,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  speed?: number;
  as?: "span" | "p" | "div";
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced || !inView) return;
    let frame = 0;
    let raf = 0;
    const total = text.length;
    const run = () => {
      const revealed = Math.floor(frame / 2);
      let out = "";
      for (let i = 0; i < total; i++) {
        const ch = text[i];
        if (ch === " ") out += " ";
        else if (i < revealed) out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
      frame++;
      if (revealed <= total) raf = setTimeout(run, 1000 / speed) as unknown as number;
      else setDisplay(text);
    };
    run();
    return () => clearTimeout(raf);
  }, [inView, reduced, text, speed]);

  const Comp = Tag as "span";
  return (
    <Comp ref={ref} className={cn("tabular-nums", className)}>
      {display || " "}
    </Comp>
  );
}
