"use client";

import dynamic from "next/dynamic";

// three/R3F must never render on the server. Legal only inside a Client
// Component — so the page stays a Server Component.
// Always mounted: the voxel morph journey is continuous across the page,
// and consolidating skills/towers into this ONE canvas keeps us at a single
// persistent WebGL context.
const R3FCanvas = dynamic(() => import("./R3FCanvas"), { ssr: false });

export function CanvasClient() {
  return <R3FCanvas />;
}
