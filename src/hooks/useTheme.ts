"use client";

import { create } from "zustand";
import type { ThemeName } from "@/lib/theme";

/**
 * Theme state. The no-flash script in layout.tsx sets `.dark` on <html>
 * before paint; this store initializes from that class so React and the
 * 3D layer agree with the DOM from the first client render.
 *
 * 3D code reads it imperatively via getState() inside useFrame (never
 * subscribe per-frame); UI components subscribe normally.
 */

function domTheme(): ThemeName {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

let switchTimer: ReturnType<typeof setTimeout> | undefined;

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  // brief global color cross-fade (rule lives in globals.css)
  root.classList.add("theme-switching");
  clearTimeout(switchTimer);
  switchTimer = setTimeout(() => root.classList.remove("theme-switching"), 550);
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode etc. — theme still applies for the session */
  }
}

type ThemeState = {
  theme: ThemeName;
  toggle: () => void;
  setTheme: (t: ThemeName) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: domTheme(),
  toggle: () =>
    set((s) => {
      const theme: ThemeName = s.theme === "dark" ? "light" : "dark";
      applyTheme(theme);
      return { theme };
    }),
  setTheme: (theme) =>
    set(() => {
      applyTheme(theme);
      return { theme };
    }),
}));
