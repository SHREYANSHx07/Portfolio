"use client";

import { create } from "zustand";

/**
 * The game layer: discoveries (achievements), voxel pops, the konami storm,
 * play mode and the sound preference. Persisted to localStorage so a
 * returning visitor keeps their progress.
 *
 * 3D code reads it imperatively via getState() inside useFrame; UI
 * components subscribe normally.
 */

export type AchievementId =
  | "first-contact"
  | "grand-tour"
  | "inquisitive"
  | "curator"
  | "night-shift"
  | "gallery-end"
  | "konami"
  | "popper"
  | "boss-slayer";

export const ACHIEVEMENTS: Record<AchievementId, { title: string; hint: string }> = {
  "first-contact": { title: "First Contact", hint: "Click into the void" },
  "grand-tour": { title: "Grand Tour", hint: "Visit every section" },
  inquisitive: { title: "Inquisitive", hint: "Ask the AI a question" },
  curator: { title: "Curator", hint: "Filter projects by a skill" },
  "night-shift": { title: "Night Shift", hint: "Find the other world" },
  "gallery-end": { title: "Completionist", hint: "Reach the end of the gallery" },
  konami: { title: "Cheat Code", hint: "↑↑↓↓←→←→BA" },
  popper: { title: "Voxel Popper", hint: "Pop 10 voxels" },
  "boss-slayer": { title: "Boss Slayer", hint: "Win PLAY mode" },
};

export const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS) as AchievementId[];

const LS_KEY = "game-progress";

type Saved = { unlocked: AchievementId[]; pops: number; sound: boolean };

function load(): Saved {
  if (typeof window === "undefined") return { unlocked: [], pops: 0, sound: false };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { unlocked: [], pops: 0, sound: false };
    const parsed = JSON.parse(raw) as Partial<Saved>;
    return {
      unlocked: (parsed.unlocked ?? []).filter((id): id is AchievementId => id in ACHIEVEMENTS),
      pops: typeof parsed.pops === "number" ? parsed.pops : 0,
      sound: parsed.sound === true,
    };
  } catch {
    return { unlocked: [], pops: 0, sound: false };
  }
}

function save(s: { unlocked: AchievementId[]; pops: number; sound: boolean }) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — progress just doesn't persist */
  }
}

type GameState = {
  unlocked: AchievementId[];
  pops: number;
  /** epoch-ms until which the konami voxel storm rages */
  stormUntil: number;
  playMode: boolean;
  sound: boolean;
  /** most recent unlock, for the toast */
  lastUnlock: { id: AchievementId; at: number } | null;

  /** load saved progress AFTER hydration — SSR and first client render must match */
  hydrate: () => void;
  unlock: (id: AchievementId) => void;
  pop: () => void;
  startStorm: () => void;
  setPlayMode: (v: boolean) => void;
  toggleSound: () => void;
};

let hydrated = false;

export const useGameStore = create<GameState>((set, get) => ({
  // always start empty (matches the server-rendered HTML); real progress
  // arrives via hydrate() in a post-mount effect
  unlocked: [],
  pops: 0,
  stormUntil: 0,
  playMode: false,
  sound: false,
  lastUnlock: null,

  hydrate: () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    const saved = load();
    set((s) => ({
      unlocked: Array.from(new Set([...saved.unlocked, ...s.unlocked])),
      pops: Math.max(saved.pops, s.pops),
      sound: saved.sound || s.sound,
    }));
  },

  unlock: (id) => {
    get().hydrate(); // never clobber saved progress with a pre-hydration write
    const { unlocked, pops, sound } = get();
    if (unlocked.includes(id)) return;
    const next = [...unlocked, id];
    save({ unlocked: next, pops, sound });
    set({ unlocked: next, lastUnlock: { id, at: Date.now() } });
  },

  pop: () => {
    get().hydrate();
    const { pops, unlocked, sound, unlock } = get();
    const next = pops + 1;
    save({ unlocked, pops: next, sound });
    set({ pops: next });
    if (next >= 10) unlock("popper");
  },

  startStorm: () => {
    set({ stormUntil: Date.now() + 5000 });
    get().unlock("konami");
  },

  setPlayMode: (playMode) => set({ playMode }),

  toggleSound: () => {
    get().hydrate();
    const { unlocked, pops, sound } = get();
    save({ unlocked, pops, sound: !sound });
    set({ sound: !sound });
  },
}));
