"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Ambient aurora wash — living color behind the flat paper. Implemented as a
 * pure-CSS animated gradient (no WebGL context) so it never competes with the
 * 3D canvases for GPU contexts, and stays cheap on every device. Static under
 * reduced-motion.
 *
 * Two layers, cross-faded by the `.dark` class: a warm editorial wash for
 * light mode, and a deeper aurora-borealis field (cobalt / teal / violet with
 * a coral ember) for dark mode.
 */
export function AuroraBackdrop() {
  const reduced = useReducedMotion();
  const drift = reduced ? "" : "aurora-drift";

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden>
      {/* light: warm editorial wash */}
      <div
        className={`${drift} absolute -inset-[25%] opacity-50 transition-opacity duration-700 dark:opacity-0`}
        style={{
          filter: "blur(70px) saturate(1.1)",
          background: `
            radial-gradient(38% 44% at 78% 22%, rgba(43,76,240,0.28), transparent 70%),
            radial-gradient(34% 40% at 22% 32%, rgba(255,90,60,0.22), transparent 70%),
            radial-gradient(46% 50% at 60% 82%, rgba(106,130,245,0.20), transparent 72%),
            radial-gradient(30% 36% at 15% 78%, rgba(255,138,114,0.16), transparent 72%)
          `,
        }}
      />
      {/* dark: aurora borealis over midnight paper */}
      <div
        className={`${drift} absolute -inset-[25%] opacity-0 transition-opacity duration-700 dark:opacity-60`}
        style={{
          filter: "blur(70px) saturate(1.25)",
          animationDelay: "-9s",
          background: `
            radial-gradient(42% 48% at 74% 18%, rgba(93,123,255,0.34), transparent 70%),
            radial-gradient(36% 42% at 22% 28%, rgba(45,212,191,0.20), transparent 70%),
            radial-gradient(48% 54% at 62% 84%, rgba(139,92,246,0.26), transparent 72%),
            radial-gradient(28% 34% at 12% 76%, rgba(255,109,77,0.15), transparent 72%)
          `,
        }}
      />
    </div>
  );
}
