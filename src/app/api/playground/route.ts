import { NextResponse } from "next/server";
import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import { DEMO_KB } from "@/data/playgroundKb";

/**
 * Sandboxed support-agent demo: retrieval over a SYNTHETIC knowledge base
 * (fictional "DemoRemit" product — zero real ScopeX content), answered by
 * Claude Haiku with per-response citations. The stream is prefixed with one
 * line of JSON naming the retrieved sources:  {"sources":[...]}\n---\n
 */

export const runtime = "nodejs";

const MODEL = "global.anthropic.claude-haiku-4-5-20251001-v1:0";
const MAX_CHARS = 300;
const WINDOW_MS = 5 * 60 * 1000;
const PER_IP_LIMIT = 8;

const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= PER_IP_LIMIT) return true;
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear();
  return false;
}

function score(query: string, text: string): number {
  const terms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const hay = text.toLowerCase();
  return terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.BEDROCK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Demo not configured." }, { status: 503 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Demo limit reached — give it a few minutes." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as { question?: unknown };
    const question =
      typeof body.question === "string" ? body.question.trim().slice(0, MAX_CHARS) : "";
    if (!question) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const retrieved = DEMO_KB.map((a) => ({ a, s: score(question, `${a.title} ${a.body}`) }))
      .sort((x, y) => y.s - x.s)
      .slice(0, 2)
      .filter((r) => r.s > 0)
      .map((r) => r.a);

    const system = `You are the demo of a fintech customer-support agent, running inside Shreyansh Gupta's portfolio. You answer as the support agent of "DemoRemit", a FICTIONAL EU→India remittance product with a synthetic knowledge base.

Rules:
- Answer ONLY from the knowledge-base articles below. Cite them inline like [1] or [2] matching their order.
- If the articles don't cover the question, say the demo KB doesn't cover it and that the production version would escalate to a human agent.
- 1-3 sentences. Friendly, precise support tone. Never invent policies, numbers or timelines.

Knowledge base:
${retrieved.map((a, i) => `[${i + 1}] ${a.title}\n${a.body}`).join("\n\n") || "(no matching articles)"}`;

    const client = new AnthropicBedrock({
      apiKey,
      awsRegion: process.env.BEDROCK_REGION || "us-east-1",
    });

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 300,
      system,
      messages: [{ role: "user", content: question }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        // sources header first, then the answer
        controller.enqueue(
          encoder.encode(JSON.stringify({ sources: retrieved.map((a) => a.title) }) + "\n---\n"),
        );
        stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => {
          console.error("Playground stream error:", err);
          controller.enqueue(encoder.encode("\n[Demo hiccup — try again.]"));
          controller.close();
        });
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Playground route error:", err);
    return NextResponse.json({ error: "Demo unavailable right now." }, { status: 502 });
  }
}
