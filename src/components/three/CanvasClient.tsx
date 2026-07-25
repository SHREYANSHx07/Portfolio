"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useScrollStore } from "@/hooks/useScrollStore";

// three/R3F must never render on the server. Legal only inside a Client
// Component — so the page stays a Server Component.
const R3FCanvas = dynamic(() => import("./R3FCanvas"), { ssr: false });

/**
 * The hero canvas is only visible during the hero. Mounting it the whole time
 * would keep a WebGL context alive while section canvases (skills, towers) also
 * want one — risking context exhaustion on weaker devices. So we unmount it once
 * scrolled past the hero (freeing its context) and remount near the top.
 */
export function CanvasClient() {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const unsub = useScrollStore.subscribe((s) => {
      const shouldMount = s.progress < 0.24;
      setMounted((prev) => (prev === shouldMount ? prev : shouldMount));
    });
    return unsub;
  }, []);

  return mounted ? <R3FCanvas /> : null;
}
