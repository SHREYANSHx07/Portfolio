"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const SHARDS = [
  { x: "12%", y: "18%", size: 26, color: "#2b4cf0", delay: 0, dur: 7 },
  { x: "82%", y: "22%", size: 18, color: "#ff5a3c", delay: 0.8, dur: 9 },
  { x: "70%", y: "72%", size: 34, color: "#1a1a1a", delay: 0.3, dur: 8 },
  { x: "18%", y: "70%", size: 14, color: "#6a82f5", delay: 1.2, dur: 6 },
  { x: "48%", y: "12%", size: 12, color: "#ff8a72", delay: 0.5, dur: 10 },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-paper px-6 text-center">
      {/* drifting voxel shards */}
      {SHARDS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-md"
          style={{ left: s.x, top: s.y, width: s.size, height: s.size, background: s.color }}
          animate={{
            y: [0, -22, 8, 0],
            rotate: [0, 45, -30, 0],
            opacity: [0.7, 1, 0.6, 0.7],
          }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-muted-ink"
      >
        Error — page not found
      </motion.p>

      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="font-display text-[7rem] font-light leading-none text-ink sm:text-[11rem]"
        >
          4<span className="display-serif-italic text-cobalt">0</span>4
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
        className="mt-4 max-w-sm text-balance text-muted-ink"
      >
        This route fell out of the constellation. Let&apos;s get you back to the work.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7, ease: EASE }}
        className="mt-8"
      >
        <Link
          href="/"
          className="rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-surface transition-colors hover:bg-cobalt"
        >
          ← Back home
        </Link>
      </motion.div>
    </main>
  );
}
