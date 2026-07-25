"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Ambient aurora wash — living color behind the flat paper. Implemented as a
 * pure-CSS animated gradient (no WebGL context) so it never competes with the
 * 3D canvases for GPU contexts, and stays cheap on every device. Static under
 * reduced-motion.
 */
export function AuroraBackdrop() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden>
      <div
        className={reduced ? "" : "aurora-drift"}
        style={{
          position: "absolute",
          inset: "-25%",
          filter: "blur(70px) saturate(1.1)",
          opacity: 0.5,
          background: `
            radial-gradient(38% 44% at 78% 22%, rgba(43,76,240,0.28), transparent 70%),
            radial-gradient(34% 40% at 22% 32%, rgba(255,90,60,0.22), transparent 70%),
            radial-gradient(46% 50% at 60% 82%, rgba(106,130,245,0.20), transparent 72%),
            radial-gradient(30% 36% at 15% 78%, rgba(255,138,114,0.16), transparent 72%)
          `,
        }}
      />
    </div>
  );
}
