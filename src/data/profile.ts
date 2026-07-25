export const profile = {
  name: "Shreyansh Gupta",
  firstName: "Shreyansh",
  lastName: "Gupta",
  roles: ["Backend Engineer", "AI Engineer", "Problem Solver"],
  title: "Backend & AI Engineer",
  location: "Gurugram, Haryana, India",
  email: "shreyansh1418@gmail.com",
  phone: "+91-8957671418",
  tagline: "I build scalable backends and AI systems that ship.",
  // Two-column editorial bio
  bio: [
    "Backend engineer (B.Tech CS, 2026) building scalable systems, AI-powered applications and high-performance architectures across fintech, AI and developer platforms.",
    "At Scopex I'm architecting an LLM-powered customer-support platform with RAG, semantic search and conversational memory for a cross-border remittance product — alongside Django admin systems for KYC, wallets and payouts, and Go microservices processing high-volume transactions.",
  ],
  // Short punchy statements for the hero / about marquee
  statements: [
    "Backend engineering",
    "Distributed systems",
    "AI / LLM applications",
    "Competitive programming",
  ],
  availability: "Open to SDE, Backend & AI Engineer roles",
  // Fill these in with your real handles/URLs — placeholders for now.
  socials: {
    github: "https://github.com/SHREYANSHx07",
    linkedin: "https://www.linkedin.com/in/shreyansh-tech/",
    leetcode: "https://leetcode.com/u/shreyansh0806/",
    codeforces: "https://codeforces.com/profile/shreyansh1418",
    codechef: "https://www.codechef.com/users/shreyansh1418",
    email: "mailto:shreyansh1418@gmail.com",
  },
  resumeUrl: "/resume.pdf",
  // Ready Player Me avatar .glb — replace with your own model URL.
  avatarUrl: "",
} as const;

export type Social = keyof typeof profile.socials;
