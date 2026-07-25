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
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { flagship, type Flagship as FlagshipProduct } from "@/data/flagship";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Flagship: the two ScopeX products owned end-to-end. Each gets an editorial
 * case row — a floating 3D-tilt screenshot with orbiting fact badges beside
 * the story — and a deep case-study modal (architecture, challenges →
 * resolutions, and the production war story). The morph canvas forms twin
 * voxel halos (cobalt + coral) behind this section.
 */

const BADGES: Record<string, string[]> = {
  "scopex-admin": ["WebAuthn / FIDO2", "master↔replica router", "Twilio dialer"],
  "ai-support-agent": ["RAG + tool-calling", "SSE streaming", "Claude on Bedrock"],
};

function TiltVisual({ product, flip }: { product: FlagshipProduct; flip: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 180, damping: 20 });

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

  const accentBg = product.accent === "coral" ? "bg-coral" : "bg-cobalt";
  const badges = BADGES[product.id] ?? [];

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      className="relative [transform-style:preserve-3d]"
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-[0_40px_90px_-45px_rgba(26,26,26,0.45)]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 92vw, 45vw"
          className="object-cover"
        />
      </div>

      {/* floating fact badges at depth */}
      {badges.map((b, i) => (
        <motion.span
          key={b}
          animate={reduced ? undefined : { y: [0, i % 2 ? 7 : -7, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(46px)" }}
          className={cn(
            "absolute rounded-full border border-line bg-surface/95 px-3 py-1.5 font-mono text-[11px] text-ink shadow-md backdrop-blur",
            i === 0 && (flip ? "-right-3 top-5" : "-left-3 top-5"),
            i === 1 && (flip ? "-left-4 top-1/2" : "-right-4 top-1/2"),
            i === 2 && "bottom-6 left-1/3",
          )}
        >
          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", accentBg)} />
          {b}
        </motion.span>
      ))}
    </motion.div>
  );
}

function CaseModal({ product, onClose }: { product: FlagshipProduct; onClose: () => void }) {
  useModalScrollLock();
  const [open, setOpen] = useState<number | null>(0);
  const accentText = product.accent === "coral" ? "text-coral" : "text-cobalt";
  const accentBg = product.accent === "coral" ? "bg-coral" : "bg-cobalt";

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.93, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative z-10 flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
      >
        {/* header */}
        <div className="relative shrink-0">
          <div className="relative aspect-[21/8]">
            <Image src={product.image} alt={product.title} fill sizes="896px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
          </div>
          <button
            onClick={onClose}
            data-cursor="Close"
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink backdrop-blur transition-colors hover:bg-ink hover:text-surface"
          >
            ✕
          </button>
          <div className="absolute bottom-3 left-6 sm:left-8">
            <p className={cn("font-mono text-[11px] uppercase tracking-[0.3em]", accentText)}>
              ScopeX · owned end-to-end
            </p>
            <h3 className="font-display text-3xl font-medium text-ink sm:text-4xl">{product.title}</h3>
          </div>
        </div>

        <div data-lenis-prevent className="overflow-y-auto overscroll-contain px-6 pb-8 pt-5 sm:px-8">
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-ink">{product.description}</p>

          {/* metrics */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {product.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-line bg-paper p-4">
                <p className={cn("font-display text-2xl", accentText)}>{m.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-ink">
                  {m.label}
                </p>
              </div>
            ))}
          </div>

          {/* architecture */}
          <h4 className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-muted-ink">
            Architecture
          </h4>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-ink">
            {product.architecture.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", accentBg)} />
                {a}
              </li>
            ))}
          </ul>

          {/* challenges accordion */}
          {product.challenges.length > 0 && (
            <>
              <h4 className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-muted-ink">
                Challenges → how I solved them
              </h4>
              <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-paper">
                {product.challenges.map((c, i) => (
                  <div key={c.title}>
                    <button
                      onClick={() => setOpen(open === i ? null : i)}
                      data-cursor="hover"
                      className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left"
                    >
                      <span className="text-sm font-medium text-ink">{c.title}</span>
                      <motion.span
                        animate={{ rotate: open === i ? 45 : 0 }}
                        className={cn("shrink-0 text-lg leading-none", accentText)}
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 px-5 pb-4 text-sm leading-relaxed">
                            <p className="text-muted-ink">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-coral">
                                Problem —{" "}
                              </span>
                              {c.problem}
                            </p>
                            <p className="text-muted-ink">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-cobalt">
                                Fix —{" "}
                              </span>
                              {c.fix}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* incident war story */}
          {product.incident && (
            <div className="mt-8 rounded-2xl border border-coral/30 bg-coral/[0.05] p-5 sm:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-coral">
                {product.incident.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-ink">{product.incident.intro}</p>
              <ol className="mt-4 space-y-4">
                {product.incident.causes.map((c, i) => (
                  <li key={c.title} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral font-mono text-xs text-surface">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{c.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-ink">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 border-t border-coral/20 pt-4 text-sm leading-relaxed text-ink">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cobalt">
                  Net result —{" "}
                </span>
                {product.incident.result}
              </p>
            </div>
          )}

          {/* stack */}
          <div className="mt-8 flex flex-wrap gap-2">
            {product.stack.map((t) => (
              <span key={t} className="rounded-lg bg-secondary px-3 py-1 font-mono text-xs text-ink">
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Flagship() {
  const [active, setActive] = useState<FlagshipProduct | null>(null);

  return (
    <Section id="flagship" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
          <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="04 — At ScopeX" />
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SplitReveal
            as="h2"
            text="Products I own end-to-end."
            className="font-display text-3xl font-light leading-[1.1] text-ink sm:text-5xl"
          />
          <p className="max-w-xs text-sm text-muted-ink">
            Two production systems at a cross-border remittance fintech — designed, built,
            shipped and kept alive by me.
          </p>
        </div>

        <div className="mt-16 space-y-24 sm:space-y-32">
          {flagship.map((product, i) => {
            const flip = i % 2 === 1;
            const accentText = product.accent === "coral" ? "text-coral" : "text-cobalt";
            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.85, ease: EASE }}
                className={cn(
                  "grid items-center gap-10 md:grid-cols-2 md:gap-14",
                  flip && "md:[&>*:first-child]:order-2",
                )}
              >
                <TiltVisual product={product} flip={flip} />

                <div>
                  <p className={cn("font-mono text-xs uppercase tracking-[0.3em]", accentText)}>
                    {product.index} · production
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-medium leading-tight text-ink sm:text-4xl">
                    {product.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-ink sm:text-base">{product.subtitle}</p>
                  <p className="mt-5 text-[15px] leading-relaxed text-muted-ink">
                    {product.description}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
                    {product.metrics.slice(0, 4).map((m) => (
                      <div key={m.label}>
                        <p className={cn("font-display text-2xl sm:text-3xl", accentText)}>{m.value}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-ink">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {product.stack.slice(0, 6).map((t) => (
                      <span key={t} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-ink">
                        {t}
                      </span>
                    ))}
                    <span className="px-1 font-mono text-[11px] text-muted-ink">
                      +{Math.max(product.stack.length - 6, 0)} more
                    </span>
                  </div>

                  <MagneticButton strength={0.35} className="mt-7">
                    <button
                      onClick={() => setActive(product)}
                      data-cursor="Open"
                      className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-colors hover:bg-cobalt"
                    >
                      Open case study
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </MagneticButton>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {active && <CaseModal product={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </Section>
  );
}
