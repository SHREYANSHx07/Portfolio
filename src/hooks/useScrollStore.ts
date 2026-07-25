"use client";

import { create } from "zustand";

export type SectionId =
  | "hero"
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "achievements"
  | "contact";

type ScrollState = {
  /** Global scroll progress 0..1 across the whole page. */
  progress: number;
  /** The section currently dominating the viewport. */
  section: SectionId;
  /** Normalized pointer, -1..1 on each axis, origin at viewport center. */
  pointer: { x: number; y: number };
  /** Whether the preloader has finished and the site is revealed. */
  ready: boolean;
  /** Skill chip currently hovered — lifts its constellation node. */
  hoverSkill: string | null;
  /** Active skill filter — matching projects glow, constellation reorganizes. */
  skillFilter: string | null;

  setProgress: (p: number) => void;
  setSection: (s: SectionId) => void;
  setPointer: (x: number, y: number) => void;
  setReady: (r: boolean) => void;
  setHoverSkill: (s: string | null) => void;
  setSkillFilter: (s: string | null) => void;
};

// NOTE: 3D code reads pointer/progress imperatively via getState() inside
// useFrame — it must NOT subscribe (that would re-render every frame).
export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  section: "hero",
  pointer: { x: 0, y: 0 },
  ready: false,
  hoverSkill: null,
  skillFilter: null,

  setProgress: (progress) => set({ progress }),
  setSection: (section) =>
    set((s) => (s.section === section ? s : { section })),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setReady: (ready) => set({ ready }),
  setHoverSkill: (hoverSkill) => set({ hoverSkill }),
  setSkillFilter: (skillFilter) =>
    set((s) => ({ skillFilter: s.skillFilter === skillFilter ? null : skillFilter })),
}));
