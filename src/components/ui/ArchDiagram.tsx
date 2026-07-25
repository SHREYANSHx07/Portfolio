"use client";

import { motion } from "framer-motion";
import { diagrams, type DiagramNode } from "@/data/diagrams";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE } from "@/lib/motion";

/**
 * Draw-on architecture diagram: edges trace themselves in, then nodes
 * stagger up — the case study's system map, animated like a whiteboard
 * sketch. Renders statically under reduced motion.
 */

const NODE_W = 130;
const NODE_H = 36;

function center(n: DiagramNode): [number, number] {
  return [n.x + NODE_W / 2, n.y + NODE_H / 2];
}

export function ArchDiagram({ productId }: { productId: string }) {
  const reduced = useReducedMotion();
  const diagram = diagrams[productId];
  if (!diagram) return null;

  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper p-2 sm:p-4">
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label="System architecture diagram"
        className="h-auto w-full"
      >
        {/* edges first, drawn on scroll-into-view */}
        {diagram.edges.map(([from, to], i) => {
          const a = byId.get(from);
          const b = byId.get(to);
          if (!a || !b) return null;
          const [x1, y1] = center(a);
          const [x2, y2] = center(b);
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-muted-ink/40"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: EASE }}
            />
          );
        })}

        {/* nodes */}
        {diagram.nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
          >
            <rect
              x={n.x}
              y={n.y}
              width={NODE_W}
              height={NODE_H}
              rx="9"
              className={
                n.accent === "cobalt"
                  ? "fill-surface stroke-cobalt"
                  : n.accent === "coral"
                    ? "fill-surface stroke-coral"
                    : "fill-surface stroke-line"
              }
              strokeWidth="1.5"
            />
            <text
              x={n.x + NODE_W / 2}
              y={n.y + (n.sub ? 16 : 22)}
              textAnchor="middle"
              className="fill-ink text-[11px] font-medium"
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                x={n.x + NODE_W / 2}
                y={n.y + 28}
                textAnchor="middle"
                className="fill-muted-ink text-[8.5px] uppercase tracking-wider"
              >
                {n.sub}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
