"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCapabilityTier } from "@/hooks/useCapabilityTier";
import { useScrollStore } from "@/hooks/useScrollStore";
import { projects, type Project } from "@/data/projects";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ProjectsGalleryCanvas = dynamic(
  () =>
    import("@/components/three/scenes/ProjectsGalleryCanvas").then(
      (m) => m.ProjectsGalleryCanvas,
    ),
  { ssr: false },
);

function matchesFilter(p: Project, filter: string | null) {
  if (!filter) return true;
  return p.stack.some((s) => s.toLowerCase().includes(filter.toLowerCase()));
}

/* ------------------------------------------------------------------ */
/* Fallback tilt card (mobile / low tier)                              */
/* ------------------------------------------------------------------ */
function TiltCard({
  project,
  onOpen,
  index,
  filter,
}: {
  project: Project;
  onOpen: () => void;
  index: number;
  filter: string | null;
}) {
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
  const matched = matchesFilter(project, filter);

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
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-surface text-left transition-all duration-500 [transform-style:preserve-3d]",
        matched
          ? filter
            ? "border-cobalt shadow-[0_0_0_3px_rgba(43,76,240,0.15),0_20px_60px_-30px_rgba(43,76,240,0.4)]"
            : "border-line"
          : "border-line opacity-35 saturate-50",
      )}
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

/* ------------------------------------------------------------------ */
/* Detail modal                                                        */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* WebGL gallery (desktop / high & mid tier): sticky scroll-scrub       */
/* ------------------------------------------------------------------ */
function Gallery({ onOpen }: { onOpen: (p: Project) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const [idx, setIdx] = useState(0);
  const skillFilter = useScrollStore((s) => s.skillFilter);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(projects.length - 1, Math.max(0, Math.round(v * (projects.length - 1))));
    setIdx((prev) => (prev === next ? prev : next));
  });

  const active = projects[idx];
  const matched = matchesFilter(active, skillFilter);

  return (
    <div ref={wrap} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center">
        <div className="relative h-[62vh]">
          <ProjectsGalleryCanvas progress={scrollYProgress} onOpen={onOpen} />
        </div>

        {/* Active project readout */}
        <div className="mx-auto mt-2 flex w-full max-w-3xl flex-col items-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <h3 className="font-display text-2xl font-medium text-ink sm:text-3xl">
                {active.title}
                {skillFilter && (
                  <span
                    className={cn(
                      "ml-3 align-middle font-mono text-[10px] uppercase tracking-widest",
                      matched ? "text-cobalt" : "text-muted-ink/60",
                    )}
                  >
                    {matched ? `uses ${skillFilter}` : `no ${skillFilter}`}
                  </span>
                )}
              </h3>
              <p className="mt-1 text-sm text-muted-ink">{active.tagline}</p>
              <button
                onClick={() => onOpen(active)}
                data-cursor="Open"
                className="mt-3 rounded-full border border-ink/20 px-5 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-surface"
              >
                View case study
              </button>
            </motion.div>
          </AnimatePresence>

          {/* progress dots */}
          <div className="mt-5 flex items-center gap-2">
            {projects.map((p, i) => (
              <span
                key={p.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-400",
                  i === idx ? "w-8 bg-cobalt" : "w-1.5 bg-ink/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const tier = useCapabilityTier();
  const reduced = useReducedMotion();
  const skillFilter = useScrollStore((s) => s.skillFilter);
  const useGallery = tier !== "low" && !reduced;

  return (
    <Section id="projects" className="px-5 py-28 sm:px-10 sm:pb-24 sm:pt-40">
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
            {useGallery
              ? "Scroll to travel the gallery — click a panel for the case study."
              : "Production backends with real constraints — auth, scale, latency and clean APIs."}
          </p>
        </div>
      </div>

      {useGallery ? (
        <Gallery onOpen={setActive} />
      ) : (
        <div className="mx-auto mt-14 grid w-full max-w-6xl gap-6 sm:grid-cols-2">
          {projects.map((p, i) => (
            <TiltCard
              key={p.id}
              project={p}
              index={i}
              filter={skillFilter}
              onOpen={() => setActive(p)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && <Modal project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </Section>
  );
}
