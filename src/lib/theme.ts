// Palette shared between CSS and the 3D layer (three.js wants hex, not tokens).
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

export type AccentKey = "cobalt" | "coral" | "ink";

export function accentHex(key: AccentKey): string {
  if (key === "cobalt") return COLORS.cobalt;
  if (key === "coral") return COLORS.coral;
  return COLORS.ink;
}
