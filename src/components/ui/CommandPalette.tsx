"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { useThemeStore } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * ⌘K command palette. Opens and closes INSTANTLY — command palettes are
 * high-frequency keyboard UI, so they get no entrance animation (the
 * Raycast rule). Fuzzy-matches commands; anything that isn't a command
 * falls through to the "Ask my AI" assistant as a natural-language query.
 */

type Command = { id: string; label: string; hint: string; run: () => void };

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// crude-but-effective subsequence fuzzy score
function fuzzy(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return 1;
  if (t.includes(q)) return 100 - t.indexOf(q);
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 10 : 0;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const commands = useMemo<Command[]>(
    () => [
      { id: "about", label: "Go to About", hint: "section", run: () => scrollToSection("about") },
      { id: "skills", label: "Go to Skills", hint: "section", run: () => scrollToSection("skills") },
      { id: "experience", label: "Go to Work Experience", hint: "section", run: () => scrollToSection("experience") },
      { id: "flagship", label: "Go to ScopeX Products", hint: "section", run: () => scrollToSection("flagship") },
      { id: "projects", label: "Go to Projects", hint: "section", run: () => scrollToSection("projects") },
      { id: "achievements", label: "Go to Awards", hint: "section", run: () => scrollToSection("achievements") },
      { id: "contact", label: "Go to Contact", hint: "section", run: () => scrollToSection("contact") },
      { id: "theme", label: "Toggle dark / light theme", hint: "action", run: toggleTheme },
      { id: "resume", label: "Open resume", hint: "link", run: () => window.open(profile.resumeUrl, "_blank") },
      { id: "github", label: "Open GitHub", hint: "link", run: () => window.open(profile.socials.github, "_blank") },
      { id: "linkedin", label: "Open LinkedIn", hint: "link", run: () => window.open(profile.socials.linkedin, "_blank") },
      { id: "email", label: "Email Shreyansh", hint: "link", run: () => (window.location.href = profile.socials.email) },
    ],
    [toggleTheme],
  );

  const results = useMemo(() => {
    const scored = commands
      .map((c) => ({ c, score: fuzzy(query, c.label) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map((r) => r.c);
  }, [commands, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // ⌘K / Ctrl+K toggle + external open requests (nav button)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit() {
    const cmd = results[active];
    if (cmd) {
      cmd.run();
      close();
      return;
    }
    // no command matched — hand the query to the AI assistant
    const q = query.trim();
    if (q) {
      window.dispatchEvent(new CustomEvent("ask-ai", { detail: q }));
      close();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/30 px-4 pt-[18vh] backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line/70 px-4">
          <span className="font-mono text-xs text-muted-ink">›</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0); // reset selection whenever the query changes
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Jump to a section, or ask anything…"
            aria-label="Command or question"
            className="w-full bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-muted-ink/60"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted-ink">
            esc
          </kbd>
        </div>

        <ul className="max-h-72 overflow-y-auto p-2" data-lenis-prevent>
          {results.map((c, i) => (
            <li key={c.id}>
              <button
                onClick={() => {
                  c.run();
                  close();
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm",
                  i === active ? "bg-cobalt/10 text-ink" : "text-muted-ink",
                )}
              >
                {c.label}
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-ink/60">
                  {c.hint}
                </span>
              </button>
            </li>
          ))}
          {query.trim() && (
            <li>
              <button
                onClick={submit}
                onMouseEnter={() => setActive(results.length)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm",
                  active >= results.length ? "bg-cobalt/10 text-ink" : "text-muted-ink",
                )}
              >
                <span>
                  Ask my AI: <span className="text-cobalt">&ldquo;{query.trim()}&rdquo;</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-ink/60">
                  ai
                </span>
              </button>
            </li>
          )}
          {results.length === 0 && !query.trim() && (
            <li className="px-3 py-2.5 text-sm text-muted-ink">Type to search…</li>
          )}
        </ul>
      </div>
    </div>
  );
}
