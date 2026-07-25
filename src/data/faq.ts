/**
 * Recruiter FAQ fed to the "Ask my AI" assistant. Edit freely — every entry
 * becomes a retrievable chunk. Keep answers short and factual; the model
 * quotes them nearly verbatim.
 */
export type FAQ = { q: string; a: string };

export const faq: FAQ[] = [
  {
    q: "Is Shreyansh open to new roles? What is he looking for?",
    a: "Yes — open to SDE, Backend Engineer and AI Engineer roles. Strongest interest: backend systems (Go/Python), AI/LLM applications (RAG, agents) and fintech-scale infrastructure.",
  },
  {
    q: "Where is he located? Remote or onsite?",
    a: "Based in Gurugram, Haryana, India. Currently working remotely for ScopeX (Berlin). Open to remote, hybrid or onsite roles; open to relocation for the right opportunity.",
  },
  {
    q: "When does he graduate / what is his availability?",
    a: "B.Tech in Computer Science, class of 2026 (Dr. APJ Abdul Kalam Technical University). Already working professionally at ScopeX; notice period and start dates are best discussed directly over email.",
  },
  {
    q: "What about salary expectations?",
    a: "Compensation is best discussed directly — reach out at shreyansh1418@gmail.com.",
  },
  {
    q: "Does he need visa sponsorship?",
    a: "Indian citizen. For roles outside India, sponsorship needs depend on the country — best discussed directly.",
  },
  {
    q: "How can I contact him?",
    a: "Email shreyansh1418@gmail.com, or the contact form on this site. LinkedIn: linkedin.com/in/shreyansh-tech. GitHub: github.com/SHREYANSHx07.",
  },
];

/** Topics the assistant must politely refuse. */
export const refusals: string[] = [
  "Current or past salary figures",
  "ScopeX internal, confidential or non-public information (real customer data, internal URLs, credentials, unreleased plans)",
  "Personal details beyond what this site publishes (home address, phone beyond the public one, family)",
  "Anything unrelated to Shreyansh's professional profile (general coding help, world facts, other people)",
];
