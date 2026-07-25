"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/hooks/useGameStore";

/**
 * "Ask my AI" — a floating RAG assistant dock. The bot answers questions
 * about Shreyansh from the site's own data (see src/lib/ai), streamed from
 * Claude Haiku on Bedrock via /api/ask. The dock itself is a live demo of
 * the AI work the portfolio describes.
 */

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What has he built with RAG?",
  "Is he open to backend roles?",
  "What's his strongest stack?",
];

const MAX_CHARS = 600;

export function AskDock() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // stable handle for the palette event listener (send closes over state)
  const sendRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    // keep the newest message in view as tokens stream in
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // the ⌘K palette hands un-matched queries to the assistant via this event
  useEffect(() => {
    const onAsk = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      if (typeof q === "string" && q.trim()) {
        setOpen(true);
        sendRef.current(q);
      }
    };
    window.addEventListener("ask-ai", onAsk);
    return () => window.removeEventListener("ask-ai", onAsk);
  }, []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    useGameStore.getState().unlock("inquisitive");

    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const append = (delta: string) =>
      setMessages((cur) => {
        const next = [...cur];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: last.content + delta };
        return next;
      });

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => null);
        append(json?.error ?? "Something went wrong — try again in a moment.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        append(decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        append("Connection dropped — try again.");
      }
    } finally {
      setBusy(false);
    }
  }
  sendRef.current = send;

  return (
    <div className="fixed bottom-5 right-5 z-[68] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{ transformOrigin: "bottom right" }}
            className="flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line/80 bg-surface/90 shadow-2xl backdrop-blur-xl"
          >
            {/* header */}
            <div className="flex items-center gap-2.5 border-b border-line/70 px-4 py-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cobalt opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cobalt" />
              </span>
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink">
                  Ask my AI
                </p>
                <p className="text-[11px] text-muted-ink">
                  RAG over this portfolio · Claude Haiku
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                data-cursor="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-ink transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* transcript */}
            <div ref={scroller} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-ink">
                    I&apos;m an AI assistant Shreyansh built into his portfolio — retrieval over
                    the site&apos;s content, streamed from Claude. Ask about his work.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        data-cursor="Ask"
                        className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "ml-auto rounded-br-md bg-ink text-surface"
                      : "rounded-bl-md bg-paper/80 text-ink",
                  )}
                >
                  {m.content ||
                    (busy && i === messages.length - 1 ? (
                      <span className="inline-flex gap-1 align-middle" aria-label="Thinking">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-ink [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-ink [animation-delay:200ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-ink [animation-delay:400ms]" />
                      </span>
                    ) : null)}
                </div>
              ))}
            </div>

            {/* composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-line/70 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Ask about Shreyansh…"
                aria-label="Ask the assistant"
                className="min-w-0 flex-1 rounded-xl border border-line/70 bg-paper/50 px-3.5 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted-ink/60 focus:border-cobalt"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                data-cursor="Send"
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-surface transition-colors hover:bg-cobalt disabled:opacity-40"
              >
                ↑
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        data-cursor={open ? "Close" : "Ask AI"}
        className={cn(
          "group flex h-12 items-center gap-2 rounded-full border px-4 shadow-lg backdrop-blur-md transition-colors",
          open
            ? "border-line bg-surface/90 text-muted-ink"
            : "border-cobalt/40 bg-ink text-surface hover:bg-cobalt",
        )}
      >
        <span className="font-mono text-xs uppercase tracking-widest">
          {open ? "Close" : "Ask my AI"}
        </span>
        {!open && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-coral" />
          </span>
        )}
      </button>
    </div>
  );
}
