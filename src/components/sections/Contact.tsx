"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { ScrambleText } from "@/components/ui/ScrambleText";

const PaperPlaneCanvas = dynamic(
  () => import("@/components/three/scenes/PaperPlaneCanvas").then((m) => m.PaperPlaneCanvas),
  { ssr: false },
);
import { SplitReveal } from "@/components/ui/SplitReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { profile } from "@/data/profile";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data.company) return; // honeypot tripped — silently drop

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }

  return (
    <Section id="contact" className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cobalt">
            <span className="h-px w-8 bg-cobalt/50" /> <ScrambleText text="07 — Contact" />
          </p>
          <SplitReveal
            as="h2"
            text="Let's build something."
            className="font-display text-4xl font-light leading-[1.05] text-ink sm:text-6xl"
          />
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-ink">
            {profile.availability}. Whether it&apos;s backend architecture, an AI system,
            or just a good problem — my inbox is open.
          </p>
          <a
            href={profile.socials.email}
            data-cursor="Copy"
            className="mt-8 inline-block font-display text-xl text-ink underline decoration-cobalt/40 decoration-2 underline-offset-4 transition-colors hover:decoration-cobalt sm:text-2xl"
          >
            {profile.email}
          </a>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {status === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-line/70 bg-surface/55 p-10 text-center shadow-sm backdrop-blur-md"
              >
                <div className="h-32 w-full">
                  <PaperPlaneCanvas />
                </div>
                <h3 className="mt-2 font-display text-2xl text-ink">Message sent</h3>
                <p className="mt-2 text-sm text-muted-ink">
                  Thanks for reaching out — I&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  data-cursor="hover"
                  className="mt-6 rounded-full border border-ink/20 px-5 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-surface"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="space-y-5 rounded-3xl border border-line/70 bg-surface/55 p-7 shadow-sm backdrop-blur-md sm:p-8"
              >
                {/* honeypot */}
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                <Field label="Name" name="name" placeholder="Ada Lovelace" required />
                <Field label="Email" name="email" type="email" placeholder="you@company.com" required />
                <div>
                  <label htmlFor="message" className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-ink">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="What are you building?"
                    className="w-full resize-none rounded-xl border border-line/70 bg-paper/50 px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted-ink/60 focus:border-cobalt"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-coral">{error}</p>
                )}

                <MagneticButton strength={0.25} className="w-full">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    data-cursor="Send"
                    className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-surface transition-colors hover:bg-cobalt disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Send message"}
                  </button>
                </MagneticButton>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line/70 bg-paper/50 px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted-ink/60 focus:border-cobalt"
      />
    </div>
  );
}
