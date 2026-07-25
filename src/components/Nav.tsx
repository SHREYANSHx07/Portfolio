"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useScrollStore, type SectionId } from "@/hooks/useScrollStore";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

const LINKS: { id: SectionId; label: string }[] = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Awards" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const ready = useScrollStore((s) => s.ready);
  const section = useScrollStore((s) => s.section);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-[65] flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 transition-colors duration-500 sm:px-6",
          scrolled
            ? "border-line/80 bg-surface/70 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <a href="#hero" className="group flex items-center gap-2" data-cursor="hover">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral" />
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-ink">
            {profile.firstName}
            <span className="text-cobalt">.</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                data-cursor="hover"
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  section === l.id ? "text-ink" : "text-muted-ink hover:text-ink",
                )}
              >
                {section === l.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-cobalt/10"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <MagneticButton strength={0.5}>
          <a
            href={profile.socials.email}
            data-cursor="Say hi"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-cobalt"
          >
            Let&apos;s talk
          </a>
        </MagneticButton>
      </nav>
    </motion.header>
  );
}
