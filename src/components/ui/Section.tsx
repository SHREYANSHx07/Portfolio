"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useScrollStore, type SectionId } from "@/hooks/useScrollStore";
import { cn } from "@/lib/utils";

/**
 * Section shell: anchors an id for nav, sets the active section in the store
 * when centered in the viewport, and applies consistent editorial padding.
 */
export function Section({
  id,
  children,
  className,
  as: Tag = "section",
}: {
  id: SectionId;
  children: ReactNode;
  className?: string;
  as?: "section" | "footer";
}) {
  const ref = useRef<HTMLElement>(null);
  const setSection = useScrollStore((s) => s.setSection);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSection(id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, setSection]);

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={cn("relative w-full", className)}
    >
      {children}
    </Tag>
  );
}
