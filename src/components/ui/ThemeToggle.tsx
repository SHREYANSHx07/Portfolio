"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/hooks/useTheme";
import { useGameStore } from "@/hooks/useGameStore";
import { sfxClick } from "@/lib/sfx";

/**
 * Sun ⇄ moon theme toggle. The icon swap is pure CSS keyed off `.dark` on
 * <html> — server and client render identical markup, so no hydration
 * dance — and animates with transform only (rotate + scale cross-morph).
 */
export function ThemeToggle() {
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={() => {
        toggle();
        useGameStore.getState().unlock("night-shift");
        sfxClick();
      }}
      aria-label="Toggle dark mode"
      data-cursor="Theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line/80 bg-surface/70 text-ink backdrop-blur transition-colors hover:border-cobalt/60 hover:text-cobalt"
    >
      <Sun
        className="h-4 w-4 [transition:transform_500ms_var(--ease-editorial)] dark:-rotate-90 dark:scale-0"
        aria-hidden
      />
      <Moon
        className="absolute h-4 w-4 rotate-90 scale-0 [transition:transform_500ms_var(--ease-editorial)] dark:rotate-0 dark:scale-100"
        aria-hidden
      />
    </button>
  );
}
