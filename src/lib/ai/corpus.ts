import { profile } from "@/data/profile";
import { experience, involvement } from "@/data/experience";
import { skills, skillCategories } from "@/data/skills";
import { stats, achievements, education } from "@/data/achievements";
import { flagship } from "@/data/flagship";
import { projects } from "@/data/projects";
import { faq } from "@/data/faq";

/**
 * The retrieval corpus for the "Ask my AI" assistant, rendered from the same
 * data files that drive the site — so the bot can never drift from the page.
 * Server-side only (imported by the API route).
 */

export type Chunk = { id: string; title: string; text: string };

function chunk(id: string, title: string, lines: (string | undefined | null)[]): Chunk {
  return { id, title, text: lines.filter(Boolean).join("\n") };
}

export const CORPUS: Chunk[] = [
  chunk("about", "About Shreyansh", [
    `${profile.name} — ${profile.title}. ${profile.tagline}`,
    ...profile.bio,
    `Location: ${profile.location}. Email: ${profile.email}.`,
    `Availability: ${profile.availability}.`,
    `Education: ${education.degree}, ${education.school}, ${education.period}.`,
  ]),

  ...experience.map((e) =>
    chunk(`exp-${e.company.toLowerCase()}`, `Experience — ${e.role} at ${e.company}`, [
      `${e.role} at ${e.company} (${e.location}, ${e.period})${e.current ? " — current role" : ""}.`,
      ...e.highlights,
      `Stack: ${e.stack.join(", ")}.`,
    ]),
  ),

  ...flagship.map((f) =>
    chunk(`flagship-${f.id}`, `ScopeX flagship — ${f.title}`, [
      `${f.title}: ${f.subtitle}. ${f.description}`,
      `Key metrics: ${f.metrics.map((m) => `${m.value} ${m.label}`).join("; ")}.`,
      "Architecture:",
      ...f.architecture,
      ...f.challenges.map((c) => `Challenge — ${c.title}: ${c.problem} Fix: ${c.fix}`),
      f.incident
        ? `Production incident (${f.incident.title}): ${f.incident.intro} ${f.incident.causes
            .map((c) => `${c.title}: ${c.detail}`)
            .join(" ")} Result: ${f.incident.result}`
        : null,
      `Stack: ${f.stack.join(", ")}.`,
    ]),
  ),

  ...projects.map((p) =>
    chunk(`project-${p.id}`, `Project — ${p.title}`, [
      `${p.title}: ${p.tagline}`,
      ...p.highlights,
      `Stack: ${p.stack.join(", ")}.`,
      p.href ? `Code: ${p.href}` : null,
    ]),
  ),

  chunk("skills", "Skills", [
    ...skillCategories.map(
      (cat) =>
        `${cat}: ${skills
          .filter((s) => s.category === cat)
          .map((s) => s.name)
          .join(", ")}.`,
    ),
  ]),

  chunk("achievements", "Achievements & competitive programming", [
    ...stats.map((s) => `${s.label}: ${s.display}${s.suffix ?? ""} (${s.sub}).`),
    ...achievements.map((a) => `${a.title} — ${a.detail}`),
    ...involvement.map((i) => `${i.role}, ${i.org} (${i.period}): ${i.blurb}`),
  ]),

  chunk("links", "Links & profiles", [
    `GitHub: ${profile.socials.github}`,
    `LinkedIn: ${profile.socials.linkedin}`,
    `LeetCode: ${profile.socials.leetcode}`,
    `Codeforces: ${profile.socials.codeforces}`,
    `CodeChef: ${profile.socials.codechef}`,
    `Resume: ${profile.resumeUrl} (on this site)`,
  ]),

  ...faq.map((f, i) => chunk(`faq-${i}`, `FAQ — ${f.q}`, [f.q, f.a])),
];
