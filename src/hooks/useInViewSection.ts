"use client";

import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver gate: returns true once the element is within
 * `rootMargin` of the viewport, so heavy 3D can mount lazily and stay mounted.
 */
export function useInViewSection<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "40% 0px 40% 0px",
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
