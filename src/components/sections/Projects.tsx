"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { projects, type Project } from "@/data/projects";
import { EASE } from "@/lib/motion";

function TiltCard({ project, onOpen, index }: { project: Project; onOpen: () => void; index: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const accent = project.accent === "coral" ? "text-coral" : "text-cobalt";

  return (
    <motion.button
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onClick={onOpen}
      data-cursor="Open"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface text-left [transform-style:preserve-3d]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={project.image!}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 90vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-center justify-between">
          <span className={`font-mono text-[11px] uppercase tracking-widest ${accent}`}>
            0{index + 1}
          </span>
          <span className="text-muted-ink transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </div>
        <h3 className="mt-3 font-display text-xl font-medium leading-snug text-ink">
          {project.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-ink">{project.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-ink">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

function Modal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative z-10 grid max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
      >
        <div className="relative aspect-[16/9]">
          <Image src={project.image!} alt={project.title} fill sizes="768px" className="object-cover" />
          <button
            onClick={onClose}
            data-cursor="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink backdrop-blur transition-colors hover:bg-ink hover:text-surface"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-7">
          <h3 className="font-display text-2xl font-medium text-ink">{project.title}</h3>
          <p className="mt-1 text-sm text-cobalt">{project.tagline}</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-ink">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-coral" />
                {h}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((t) => (
              <span key={t} className="rounded-lg bg-secondary px-3 py-1 font-mono text-xs text-ink">
                {t}
              </span>
            ))}
          </div>
          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-cobalt"
            >
              View on GitHub
              <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <Section id="projects" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
              <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="04 — Selected work" />
            </p>
            <SplitReveal
              as="h2"
              text="Things I've built."
              className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-5xl"
            />
          </div>
          <p className="max-w-xs text-sm text-muted-ink">
            Production backends with real constraints — auth, scale, latency and clean APIs.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((p, i) => (
            <TiltCard key={p.id} project={p} index={i} onOpen={() => setActive(p)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && <Modal project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </Section>
  );
}
