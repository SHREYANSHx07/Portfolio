// Palette shared between CSS and the 3D layer (three.js wants hex, not tokens).
// Keep both objects in sync with the token blocks in globals.css.
export const COLORS = {
  paper: "#f4f1ec",
  surface: "#fbfaf7",
  ink: "#1a1a1a",
  inkSoft: "#2a2a2a",
  mutedInk: "#6b675f",
  line: "#e4dfd6",
  cobalt: "#2b4cf0",
  cobaltSoft: "#6a82f5",
  coral: "#ff5a3c",
  coralSoft: "#ff8a72",
} as const;

// Midnight editorial — mirrors the `.dark` block in globals.css.
export const DARK_COLORS: Palette = {
  paper: "#0b0c11",
  surface: "#13151d",
  ink: "#ecebf2",
  inkSoft: "#d8d6e4",
  mutedInk: "#a09db0",
  line: "#262a38",
  cobalt: "#5d7bff",
  cobaltSoft: "#92a5ff",
  coral: "#ff6d4d",
  coralSoft: "#ff9d86",
};

export type Palette = { [K in keyof typeof COLORS]: string };
export type ThemeName = "light" | "dark";

export function palette(theme: ThemeName): Palette {
  return theme === "dark" ? DARK_COLORS : COLORS;
}

export type AccentKey = "cobalt" | "coral" | "ink";

export function accentHex(key: AccentKey, theme: ThemeName = "light"): string {
  const p = palette(theme);
  if (key === "cobalt") return p.cobalt;
  if (key === "coral") return p.coral;
  return p.ink;
}
