"use client";

import { useEffect } from "react";
import { lenisInstance } from "@/components/providers/SmoothScrollProvider";

/**
 * Call inside any modal: pauses Lenis (which otherwise keeps steering wheel
 * events into the page behind the overlay) and locks body scroll for the
 * modal's lifetime. Pair with `data-lenis-prevent` on the modal's scrollable
 * element so its own content scrolls natively.
 */
export function useModalScrollLock() {
  useEffect(() => {
    lenisInstance.current?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      lenisInstance.current?.start();
    };
  }, []);
}
