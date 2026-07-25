"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { profile } from "@/data/profile";
import { EASE } from "@/lib/motion";

const SOCIALS: { label: string; href: string; cursor: string }[] = [
  { label: "GitHub", href: profile.socials.github, cursor: "↗" },
  { label: "LinkedIn", href: profile.socials.linkedin, cursor: "↗" },
  { label: "LeetCode", href: profile.socials.leetcode, cursor: "↗" },
  { label: "Codeforces", href: profile.socials.codeforces, cursor: "↗" },
  { label: "CodeChef", href: profile.socials.codechef, cursor: "↗" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line px-5 pb-10 pt-20 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-12">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-ink">
                Available for work
              </p>
              <a
                href={profile.socials.email}
                data-cursor="Email"
                className="mt-3 block font-display text-4xl font-light leading-none text-ink transition-colors hover:text-cobalt sm:text-6xl"
              >
                Say hello
                <span className="text-coral">.</span>
              </a>
            </div>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="PDF"
              className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-surface"
            >
              Download résumé ↓
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <MagneticButton key={s.label} strength={0.35}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-cobalt hover:bg-cobalt hover:text-surface"
                >
                  {s.label}
                  <span className="text-xs opacity-60">{s.cursor}</span>
                </a>
              </MagneticButton>
            ))}
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            className="h-px origin-left bg-line"
          />

          <div className="flex flex-col justify-between gap-3 text-sm text-muted-ink sm:flex-row">
            <p>
              © {new Date().getFullYear()} {profile.name}. Built with Next.js, R3F &amp; GSAP.
            </p>
            <p className="font-mono text-xs">{profile.location}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
