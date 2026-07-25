"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { InteractiveLetters } from "@/components/ui/InteractiveLetters";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useScrollStore } from "@/hooks/useScrollStore";
import { profile } from "@/data/profile";
import { EASE } from "@/lib/motion";

const rise = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 1, ease: EASE, delay: 0.15 + i * 0.09 },
  }),
};

export function Hero() {
  const ready = useScrollStore((s) => s.ready);
  const anim = ready ? "show" : "hidden";

  return (
    <Section id="hero" className="flex min-h-[100svh] flex-col justify-center px-5 pt-28 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-ink"
        >
          <span className="h-px w-10 bg-ink/30" />
          {profile.location}
        </motion.p>

        <h1 className="display-fluid font-display font-light text-ink">
          <span className="block overflow-hidden">
            <motion.span variants={rise} custom={0} initial="hidden" animate={anim} className="inline-block">
              <InteractiveLetters text="Shreyansh" />
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span variants={rise} custom={1} initial="hidden" animate={anim} className="inline-block">
              <span className="display-serif-italic pr-2 text-cobalt">
                <InteractiveLetters text="Gupta" />
              </span>
            </motion.span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
            className="max-w-md text-balance text-lg leading-relaxed text-muted-ink"
          >
            Backend &amp; AI engineer building scalable microservices and LLM-powered
            systems. <span className="text-ink">I ship production code that holds up.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
            className="flex items-center gap-3"
          >
            <MagneticButton strength={0.4}>
              <a
                href="#projects"
                data-cursor="View"
                className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-surface transition-colors hover:bg-cobalt"
              >
                View work
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </MagneticButton>
            <MagneticButton strength={0.4}>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="PDF"
                className="rounded-full border border-ink/20 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-surface"
              >
                Résumé
              </a>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-ink"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-ink/50 to-transparent"
        />
      </motion.div>
    </Section>
  );
}
