"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Live sandbox of the support-agent case study: ask a question, watch
 * retrieval pick sources from a SYNTHETIC knowledge base, and see the
 * cited answer stream in — the same loop the production system runs,
 * demonstrated on fictional "DemoRemit" data.
 */

const SUGGESTIONS = [
  "How long does a transfer take?",
  "Why did my pay-in fail?",
  "Can I cancel a transfer?",
];

const MAX_TURNS = 5;

export function AgentPlayground() {
  const [question, setQuestion] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy || turns >= MAX_TURNS) return;

    setBusy(true);
    setTurns((t) => t + 1);
    setSources([]);
    setAnswer("");
    setQuestion(text);

    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => null);
        setAnswer(json?.error ?? "Demo unavailable — try again shortly.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let headerParsed = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        if (!headerParsed) {
          const sep = buffer.indexOf("\n---\n");
          if (sep === -1) continue; // header not complete yet
          try {
            const head = JSON.parse(buffer.slice(0, sep)) as { sources?: string[] };
            setSources(head.sources ?? []);
          } catch {
            /* malformed header — show answer anyway */
          }
          buffer = buffer.slice(sep + 5);
          headerParsed = true;
        }
        setAnswer(buffer);
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setAnswer("Connection dropped — try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-cobalt/25 bg-cobalt/[0.04] p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cobalt">
          Try it — live agent sandbox
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-ink">
          synthetic KB · no real data · {MAX_TURNS - turns} asks left
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-ink">
        The same retrieval → citation → streaming loop as production, running on a fictional
        remittance knowledge base. Ask a support question:
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            disabled={busy || turns >= MAX_TURNS}
            data-cursor="Ask"
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink transition-colors hover:border-cobalt hover:text-cobalt disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
          placeholder="…or type your own"
          aria-label="Ask the demo support agent"
          disabled={turns >= MAX_TURNS}
          className="min-w-0 flex-1 rounded-xl border border-line/70 bg-surface px-3.5 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted-ink/60 focus:border-cobalt disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !question.trim() || turns >= MAX_TURNS}
          data-cursor="Send"
          className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-cobalt disabled:opacity-40"
        >
          Ask
        </button>
      </form>

      {(sources.length > 0 || answer) && (
        <div className="mt-4 space-y-2.5">
          {sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-ink">
                retrieved:
              </span>
              {sources.map((s, i) => (
                <span
                  key={s}
                  className="rounded-md border border-cobalt/30 bg-surface px-2 py-0.5 font-mono text-[11px] text-cobalt"
                >
                  [{i + 1}] {s}
                </span>
              ))}
            </div>
          )}
          <p
            className={cn(
              "rounded-xl border border-line bg-surface p-3.5 text-sm leading-relaxed text-ink",
              busy && "animate-pulse",
            )}
          >
            {answer || "Retrieving…"}
          </p>
        </div>
      )}

      {turns >= MAX_TURNS && (
        <p className="mt-3 font-mono text-[11px] text-muted-ink">
          Demo cap reached — the production system, of course, keeps going.
        </p>
      )}
    </div>
  );
}
