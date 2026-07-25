export type Experience = {
  company: string;
  role: string;
  location: string;
  period: string;
  current?: boolean;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    company: "Scopex",
    role: "Backend Developer",
    location: "Berlin, Germany · Remote",
    period: "Jan 2026 — Present",
    current: true,
    highlights: [
      "Architecting and deploying an LLM-powered AI customer-support platform from scratch using RAG, semantic search and prompt engineering — automating assistance across KYC, wallets, remittances and transaction workflows.",
      "Built an end-to-end AI knowledge pipeline that turns internal documentation into a searchable knowledge base with context-aware retrieval and conversational memory for accurate responses.",
      "Developing Django Admin platforms for users, KYC, wallets, pay-ins, payouts and transaction operations, streamlining internal ops.",
      "Contributing to Go-based microservices powering high-volume fintech transaction processing — scalable services, business logic and inter-service communication.",
    ],
    stack: ["RAG", "LangGraph", "Django", "Go", "PostgreSQL", "Redis"],
  },
  {
    company: "GeeksforGeeks",
    role: "Member of Technical Staff (Intern)",
    location: "Noida, India",
    period: "Oct 2025 — Dec 2025",
    highlights: [
      "Developed backend features and REST APIs with Django, contributing to scalable architecture, database design and internal engineering tools.",
      "Designed and published 50+ DSA and Competitive Programming problems used by thousands of learners; collaborated with engineering and editorial teams on production-ready solutions.",
    ],
    stack: ["Django", "REST", "C++", "DSA"],
  },
  {
    company: "Quizy",
    role: "SDE Intern",
    location: "Gurgaon, India",
    period: "Apr 2025 — Jun 2025",
    highlights: [
      "Developed and optimized 15+ REST APIs with Django REST Framework and PostgreSQL; collaborated on scalable, production-ready backend services.",
      "Implemented authentication, input validation and error-handling middleware across 15+ endpoints; unit tests reached ~85% coverage, cutting bug turnaround ~30%.",
    ],
    stack: ["Django REST", "PostgreSQL", "Testing"],
  },
];

// Leadership / community involvement — shown as a compact grid under the timeline.
export type Involvement = {
  org: string;
  role: string;
  period: string;
  blurb: string;
  accent: "cobalt" | "coral" | "ink";
};

export const involvement: Involvement[] = [
  {
    org: "Programming Club, AKGEC",
    role: "Coordinator",
    period: "Oct 2023 — May 2026",
    blurb:
      "Leading the campus competitive-programming culture — coding contests, DSA workshops, hackathons and mentoring.",
    accent: "coral",
  },
  {
    org: "GDSC, AKGEC",
    role: "ML Developer",
    period: "Sep 2023 — May 2026",
    blurb:
      "Building AI/ML and backend solutions in Python & Django — data prep, model development and deployment; NLP and GenAI.",
    accent: "cobalt",
  },
  {
    org: "Big Data Centre of Excellence",
    role: "Trainee",
    period: "Sep 2023 — Dec 2023",
    blurb: "Hands-on training in big-data systems and data engineering fundamentals.",
    accent: "ink",
  },
];
