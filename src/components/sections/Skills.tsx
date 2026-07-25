"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { useInViewSection } from "@/hooks/useInViewSection";
import { useCapabilityTier } from "@/hooks/useCapabilityTier";
import { skills, skillCategories } from "@/data/skills";
import { EASE } from "@/lib/motion";

const SkillsCanvas = dynamic(
  () => import("@/components/three/scenes/SkillsCanvas").then((m) => m.SkillsCanvas),
  { ssr: false },
);

export function Skills() {
  const { ref, inView } = useInViewSection<HTMLDivElement>();
  const tier = useCapabilityTier();
  const show3D = inView && tier !== "low";

  return (
    <Section id="skills" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
          <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="02 — Toolkit" />
        </p>
        <SplitReveal
          as="h2"
          text="The stack I reach for."
          className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-5xl"
        />

        <div className="mt-12 grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          {/* 3D constellation */}
          <div ref={ref} className="relative order-2 h-[380px] md:order-1 md:h-[520px]">
            {show3D ? (
              <SkillsCanvas />
            ) : (
              <div className="flex h-full flex-wrap content-center items-center justify-center gap-2">
                {skills.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-sm text-ink"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}
            <p className="pointer-events-none absolute bottom-0 left-0 font-mono text-[11px] text-muted-ink">
              {show3D ? "drag-free · hover a node" : ""}
            </p>
          </div>

          {/* Category list */}
          <div className="order-1 space-y-7 md:order-2">
            {skillCategories.map((cat, ci) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.6, delay: ci * 0.08, ease: EASE }}
                className="border-b border-line pb-6"
              >
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-ink">
                  {cat}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <span
                        key={s.name}
                        data-cursor="hover"
                        className="rounded-lg bg-secondary px-3 py-1.5 text-sm text-ink transition-colors hover:bg-cobalt hover:text-surface"
                      >
                        {s.name}
                      </span>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
