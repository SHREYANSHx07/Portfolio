"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useScrollStore, type SectionId } from "@/hooks/useScrollStore";

const ORDER: SectionId[] = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "achievements",
  "contact",
];
const LABELS: Record<SectionId, string> = {
  hero: "Intro",
  about: "About",
  skills: "Skills",
  experience: "Work",
  projects: "Projects",
  achievements: "Awards",
  contact: "Contact",
};

/**
 * Scroll HUD: a thin cobalt progress bar pinned to the top of the viewport,
 * plus a fixed corner index ("02 / 07 · Skills"). Reads the store imperatively
 * so it never re-renders on every scroll frame — only when the section changes.
 */
export function ScrollHUD() {
  const bar = useRef<HTMLDivElement>(null);
  const ready = useScrollStore((s) => s.ready);
  const section = useScrollStore((s) => s.section);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = useScrollStore.subscribe((s) => {
      if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
      setVisible(s.progress > 0.02);
    });
    return unsub;
  }, []);

  const idx = ORDER.indexOf(section);

  return (
    <>
      {/* top progress bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[66] h-[2px] bg-transparent">
        <div
          ref={bar}
          className="h-full origin-left bg-cobalt"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* corner index */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={ready && visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none fixed bottom-6 left-6 z-[66] hidden items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-ink sm:flex"
      >
        <span className="text-ink">{String(idx + 1).padStart(2, "0")}</span>
        <span className="text-muted-ink/50">/ 07</span>
        <span className="h-px w-6 bg-ink/20" />
        <motion.span key={section} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cobalt">
          {LABELS[section]}
        </motion.span>
      </motion.div>
    </>
  );
}
