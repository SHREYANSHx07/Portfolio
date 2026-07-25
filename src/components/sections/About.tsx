"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { profile } from "@/data/profile";
import { education } from "@/data/achievements";
import { EASE } from "@/lib/motion";

// Flip to true once public/portrait.jpg exists.
const HAS_PHOTO = true;

const FACTS = [
  { k: "Experience", v: "1+ yr production" },
  { k: "Focus", v: "Backend · AI/LLM" },
  { k: "Degree", v: "B.Tech CS · 2026" },
  { k: "Status", v: "Open to roles" },
];

export function About() {
  return (
    <Section id="about" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        {/* Left: text */}
        <div>
          <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
            <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="01 — About" />
          </p>

          <SplitReveal
            as="h2"
            text="I turn complex requirements into systems that scale."
            className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-5xl"
          />

          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-ink sm:text-lg">
            {profile.bio.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
              >
                {para}
              </motion.p>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {FACTS.map((f, i) => (
              <motion.div
                key={f.k}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-ink">
                  {f.k}
                </p>
                <p className="mt-1 text-sm font-medium text-ink">{f.v}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: photo frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease: EASE }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-[0_30px_80px_-40px_rgba(26,26,26,0.4)]">
            {HAS_PHOTO ? (
              <Image
                src="/portrait.jpg"
                alt={profile.name}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              /* Placeholder until a photo is added — set HAS_PHOTO=true after
                 dropping public/portrait.jpg */
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cobalt/20 via-surface to-coral/20">
                <span className="font-display text-[7rem] font-light text-ink/25">SG</span>
                <span className="absolute bottom-20 font-mono text-[11px] uppercase tracking-widest text-muted-ink">
                  photo coming soon
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
              <span className="rounded-full bg-ink/80 px-3 py-1 font-mono text-[11px] text-surface backdrop-blur">
                {education.school.split(" ").slice(0, 3).join(" ")}
              </span>
              <span className="rounded-full bg-surface/90 px-3 py-1 font-mono text-[11px] text-ink backdrop-blur">
                {education.period}
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full border border-coral/40" />
          <div className="pointer-events-none absolute -bottom-3 -left-3 h-10 w-10 rounded-full bg-cobalt/20 blur-lg" />
        </motion.div>
      </div>
    </Section>
  );
}
