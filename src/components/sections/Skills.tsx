"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { useScrollStore } from "@/hooks/useScrollStore";
import { useGameStore } from "@/hooks/useGameStore";
import { skills, skillCategories } from "@/data/skills";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The 3D constellation itself is rendered by the persistent morph canvas —
 * the voxels assemble into it as this section scrolls into view. The left
 * column reserves its stage; the right chips are the controls: hover lifts a
 * node, click filters the projects section.
 */
export function Skills() {
  const setHoverSkill = useScrollStore((s) => s.setHoverSkill);
  const setSkillFilter = useScrollStore((s) => s.setSkillFilter);
  const skillFilter = useScrollStore((s) => s.skillFilter);

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
          {/* Stage for the morphing constellation (drawn by the fixed canvas behind) */}
          <div className="relative order-2 hidden h-[420px] md:order-1 md:block md:h-[520px]">
            <p className="pointer-events-none absolute bottom-0 left-0 font-mono text-[11px] text-muted-ink">
              hover a skill — click to filter projects
            </p>
          </div>

          {/* Category list = the constellation's controls */}
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
                    .map((s, si) => {
                      const active = skillFilter === s.name;
                      return (
                        <motion.button
                          key={s.name}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-10% 0px" }}
                          transition={{
                            duration: 0.4,
                            delay: ci * 0.08 + si * 0.035,
                            ease: EASE,
                          }}
                          data-cursor="hover"
                          onMouseEnter={() => setHoverSkill(s.name)}
                          onMouseLeave={() => setHoverSkill(null)}
                          onClick={() => {
                            setSkillFilter(s.name);
                            useGameStore.getState().unlock("curator");
                          }}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-sm transition-colors",
                            active
                              ? "bg-cobalt text-surface"
                              : "bg-secondary text-ink hover:bg-cobalt hover:text-surface",
                          )}
                        >
                          {s.name}
                        </motion.button>
                      );
                    })}
                </div>
              </motion.div>
            ))}

            <div className="flex min-h-6 items-center gap-3">
              {skillFilter && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 font-mono text-xs text-cobalt"
                >
                  filtering projects by “{skillFilter}”
                  <button
                    onClick={() => setSkillFilter(skillFilter)}
                    data-cursor="hover"
                    className="rounded-full border border-cobalt/40 px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors hover:bg-cobalt hover:text-surface"
                  >
                    clear
                  </button>
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
