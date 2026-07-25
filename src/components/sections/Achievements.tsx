"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { stats, achievements } from "@/data/achievements";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const DUR = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / DUR, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Achievements() {
  return (
    <Section id="achievements" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
          <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="05 — Proof" />
        </p>
        <SplitReveal
          as="h2"
          text="Competitive edge, measured."
          className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-5xl"
        />

        {/* Stage for the voxel stat towers (drawn by the fixed morph canvas) */}
        <div className="relative mt-10 h-[280px] sm:h-[360px]" aria-hidden />


        {/* Stat readouts */}
        <div className="-mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur-sm"
            >
              <p
                className={`font-display text-4xl font-light sm:text-5xl ${
                  s.accent === "coral" ? "text-coral" : s.accent === "cobalt" ? "text-cobalt" : "text-ink"
                }`}
              >
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-ink">{s.label}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievement cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="group flex gap-4 rounded-2xl border border-line bg-surface/60 p-5 transition-colors hover:border-cobalt/40"
            >
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  a.accent === "coral" ? "bg-coral" : a.accent === "cobalt" ? "bg-cobalt" : "bg-ink"
                }`}
              />
              <div>
                <h3 className="font-display text-lg font-medium text-ink">{a.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-ink">{a.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
