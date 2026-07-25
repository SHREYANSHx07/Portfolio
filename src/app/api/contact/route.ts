import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resend needs Node APIs — not Edge.
export const runtime = "nodejs";

const TO = process.env.CONTACT_TO_EMAIL || "shreyansh1418@gmail.com";
// Use your verified Resend domain here; onboarding@resend.dev works for testing.
const FROM = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  try {
    const { name, email, message, company } = await req.json();

    // Honeypot — bots fill hidden fields.
    if (company) return NextResponse.json({ ok: true });

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message should be at least 10 characters." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Form is built but email isn't configured yet.
      return NextResponse.json(
        { error: "Email isn't configured yet. Reach me directly at " + TO + "." },
        { status: 503 },
      );
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      return NextResponse.json({ error: "Could not send. Try again later." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
