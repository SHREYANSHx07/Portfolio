"use client";

import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

/**
 * Word-by-word mask reveal on scroll-into-view. Each word rides up from behind
 * a clipping line. Under reduced-motion it renders instantly.
 */
export function SplitReveal({
  text,
  className,
  as: Tag = "div",
  delay = 0,
  stagger = 0.045,
  once = true,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
  // blur softens the mask edge as each word rides up — a one-shot reveal,
  // so the filter cost is a single paint per word, not a running cost
  const word: Variants = {
    hidden: { y: "110%", opacity: 0, filter: "blur(8px)" },
    show: {
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: EASE },
    },
  };

  const MotionTag = motion[Tag] as typeof motion.div;

  return (
    <MotionTag
      className={cn("inline-block", className)}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span variants={word} className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
