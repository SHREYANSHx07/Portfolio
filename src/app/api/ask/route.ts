import { NextResponse } from "next/server";
import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import { retrieve } from "@/lib/ai/retrieval";
import { refusals } from "@/data/faq";
import { profile } from "@/data/profile";

// Bedrock SDK needs Node APIs — not Edge.
export const runtime = "nodejs";

// Cheapest current Claude on Bedrock; `global.` profile = no regional premium.
const MODEL = "global.anthropic.claude-haiku-4-5-20251001-v1:0";
const MAX_TURNS = 12; // messages per conversation
const MAX_CHARS = 600; // per message
const MAX_OUTPUT_TOKENS = 512;

/* ------------------------------------------------------------------ */
/* Rate limiting — in-memory per serverless instance. Two layers:      */
/* per-IP (abuse) and a global daily cap (hard spend ceiling).         */
/* ------------------------------------------------------------------ */
const WINDOW_MS = 5 * 60 * 1000;
const PER_IP_LIMIT = 10; // requests / 5 min / IP
const DAILY_LIMIT = 400; // requests / day / instance

const ipHits = new Map<string, number[]>();
let dayKey = "";
let dayCount = 0;

function rateLimit(ip: string): string | null {
  const now = Date.now();

  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) {
    dayKey = today;
    dayCount = 0;
  }
  if (++dayCount > DAILY_LIMIT) {
    return "The assistant has hit its daily budget. Email " + profile.email + " instead.";
  }

  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= PER_IP_LIMIT) {
    return "You're sending messages too quickly — give it a few minutes, or email " + profile.email + ".";
  }
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear(); // bound memory on long-lived instances
  return null;
}

/* ------------------------------------------------------------------ */

type Turn = { role: "user" | "assistant"; content: string };

function isTurn(t: unknown): t is Turn {
  if (typeof t !== "object" || t === null) return false;
  const m = t as Record<string, unknown>;
  return (
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    m.content.length > 0 &&
    m.content.length <= MAX_CHARS
  );
}

function systemPrompt(context: string): string {
  return `You are the AI assistant embedded in ${profile.name}'s portfolio site. You answer questions from recruiters, engineers and visitors about Shreyansh — his work, skills, projects and availability. You are yourself a demonstration of his AI engineering (a RAG assistant he built).

Rules:
- Answer ONLY from the context below. If the context doesn't cover something, say so and point to ${profile.email}.
- Never invent projects, employers, dates or numbers.
- Politely refuse these topics: ${refusals.join("; ")}.
- If asked about unrelated things (general coding help, other people, world facts), decline in one sentence and steer back to Shreyansh.
- Keep answers short: 1-4 sentences, or a compact list. Plain text only, no markdown headers.
- Match a professional, friendly tone. Refer to Shreyansh in third person.

Context about Shreyansh:
${context}`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.BEDROCK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "The assistant isn't configured yet. Email " + profile.email + "." },
        { status: 503 },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const limited = rateLimit(ip);
    if (limited) return NextResponse.json({ error: limited }, { status: 429 });

    const body = (await req.json()) as { messages?: unknown };
    const raw = Array.isArray(body.messages) ? body.messages : null;
    if (!raw || raw.length === 0 || !raw.every(isTurn)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const turns = raw.slice(-MAX_TURNS);
    if (turns[turns.length - 1].role !== "user") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Retrieve against the latest user message plus the one before it,
    // so follow-ups ("what stack did that use?") keep their subject.
    const userTurns = turns.filter((t) => t.role === "user");
    const query = userTurns.slice(-2).map((t) => t.content).join(" ");
    const context = retrieve(query, 4)
      .map((c) => `## ${c.title}\n${c.text}`)
      .join("\n\n");

    const client = new AnthropicBedrock({
      apiKey,
      awsRegion: process.env.BEDROCK_REGION || "us-east-1",
    });

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemPrompt(context),
      messages: turns,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => {
          console.error("Ask stream error:", err);
          controller.enqueue(
            encoder.encode("\n[Something went wrong — try again, or email " + profile.email + ".]"),
          );
          controller.close();
        });
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof AnthropicBedrock.APIError) {
      console.error("Bedrock API error:", err.status, err.message);
      const msg =
        err instanceof AnthropicBedrock.RateLimitError
          ? "The model is rate-limited right now — try again shortly."
          : "The assistant is unavailable right now. Email " + profile.email + ".";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    console.error("Ask route error:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
