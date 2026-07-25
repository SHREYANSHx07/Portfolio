"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { experience, involvement } from "@/data/experience";
import { EASE } from "@/lib/motion";

export function Experience() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start 65%", "end 60%"],
  });
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section id="experience" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
          <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="03 — Experience" />
        </p>
        <SplitReveal
          as="h2"
          text="Where I've shipped."
          className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-5xl"
        />

        <div ref={wrap} className="relative mt-14 pl-8 sm:pl-0">
          {/* Spine */}
          <div className="absolute bottom-0 left-2 top-2 w-px bg-line sm:left-1/2 sm:-translate-x-1/2">
            <motion.div style={{ height }} className="w-full bg-cobalt" />
          </div>

          <div className="space-y-14">
            {experience.map((job, i) => (
              <motion.div
                key={job.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.7, ease: EASE }}
                className={`relative sm:grid sm:grid-cols-2 sm:gap-10 ${
                  i % 2 === 0 ? "" : "sm:[&>*:first-child]:col-start-2"
                }`}
              >
                {/* node */}
                <span className="absolute -left-[26px] top-1.5 flex h-3.5 w-3.5 items-center justify-center sm:left-1/2 sm:-translate-x-1/2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-cobalt bg-paper" />
                  {job.current && (
                    <span className="absolute h-3.5 w-3.5 animate-ping rounded-full bg-cobalt/50" />
                  )}
                </span>

                <div className={i % 2 === 0 ? "sm:pr-10 sm:text-right" : "sm:col-start-2 sm:pl-10"}>
                  <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-shadow hover:shadow-[0_20px_60px_-30px_rgba(43,76,240,0.35)]">
                    <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${i % 2 === 0 ? "sm:justify-end" : ""}`}>
                      <h3 className="font-display text-xl font-medium text-ink">{job.company}</h3>
                      {job.current && (
                        <span className="rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-coral">
                          Now
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-cobalt">{job.role}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                      {job.period} · {job.location}
                    </p>
                    <ul className={`mt-4 space-y-2.5 text-sm leading-relaxed text-muted-ink ${i % 2 === 0 ? "sm:text-right" : ""}`}>
                      {job.highlights.map((h, hi) => (
                        <li key={hi}>{h}</li>
                      ))}
                    </ul>
                    <div className={`mt-4 flex flex-wrap gap-1.5 ${i % 2 === 0 ? "sm:justify-end" : ""}`}>
                      {job.stack.map((t) => (
                        <span key={t} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-ink">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leadership & community */}
        <div className="mt-20">
          <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-ink">
            <span className="h-px w-8 bg-ink/20" /> Leadership &amp; community
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {involvement.map((it, i) => (
              <motion.div
                key={it.org}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-sm transition-colors hover:border-cobalt/40"
              >
                <span
                  className={`mb-3 flex h-2.5 w-2.5 rounded-full ${
                    it.accent === "coral" ? "bg-coral" : it.accent === "cobalt" ? "bg-cobalt" : "bg-ink"
                  }`}
                />
                <h3 className="font-display text-lg font-medium leading-snug text-ink">{it.role}</h3>
                <p className="text-sm text-cobalt">{it.org}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                  {it.period}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-ink">{it.blurb}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
