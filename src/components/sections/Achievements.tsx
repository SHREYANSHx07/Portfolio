"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { stats, achievements } from "@/data/achievements";
import { EASE } from "@/lib/motion";

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

type LiveStats = {
  codeforces: { rating: number; rank: string } | null;
  leetcode: number | null;
  codechef: { rating: number; stars: number } | null;
};

/** Merge live API numbers over the static baseline; null keeps the baseline. */
function liveValue(label: string, live: LiveStats | null): { value: number; sub: string } | null {
  if (!live) return null;
  if (label === "Codeforces" && live.codeforces) {
    return { value: live.codeforces.rating, sub: live.codeforces.rank };
  }
  if (label === "CodeChef" && live.codechef) {
    return { value: live.codechef.rating, sub: `${live.codechef.stars}★ Rating` };
  }
  if (label === "LeetCode" && live.leetcode) {
    return { value: live.leetcode, sub: "Contest rating" };
  }
  return null;
}

export function Achievements() {
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setLive(d))
      .catch(() => {}); // static numbers remain the fallback
  }, []);

  return (
    <Section id="achievements" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
          <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="06 — Proof" />
        </p>
        <SplitReveal
          as="h2"
          text="Competitive edge, measured."
          className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-5xl"
        />

        {/* Stage for the voxel stat towers (drawn by the fixed morph canvas) */}
        <div className="relative mt-10 h-[280px] sm:h-[360px]" aria-hidden />


        {/* Stat readouts — ratings refresh daily from the judges' APIs */}
        <div className="-mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s, i) => {
            const fresh = liveValue(s.label, live);
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="relative rounded-2xl border border-line bg-surface p-5 shadow-sm"
              >
                {fresh && (
                  <span
                    className="absolute right-4 top-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-cobalt"
                    title="Fetched from the judge's API today"
                  >
                    <span className="h-1 w-1 animate-pulse rounded-full bg-cobalt" />
                    live
                  </span>
                )}
                <p
                  className={`font-display text-4xl font-light sm:text-5xl ${
                    s.accent === "coral" ? "text-coral" : s.accent === "cobalt" ? "text-cobalt" : "text-ink"
                  }`}
                >
                  <CountUp to={fresh?.value ?? s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{s.label}</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-ink">
                  {fresh?.sub ?? s.sub}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Achievement cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
              className="group flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-colors hover:border-cobalt/40"
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
