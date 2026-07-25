export type Challenge = {
  title: string;
  problem: string;
  fix: string;
};

export type IncidentCause = {
  title: string;
  detail: string;
};

export type Flagship = {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  accent: "cobalt" | "coral";
  metrics: { value: string; label: string }[];
  architecture: string[];
  challenges: Challenge[];
  incident?: {
    title: string;
    intro: string;
    causes: IncidentCause[];
    result: string;
  };
  stack: string[];
};

export const flagship: Flagship[] = [
  {
    id: "scopex-admin",
    index: "01",
    title: "ScopeX Admin Panel",
    subtitle: "The back-office running a cross-border remittance fintech",
    description:
      "A production internal admin & operations console giving support, compliance and call-center staff one secure place to manage users, KYC, transfers, pay-ins/payouts and providers — built end-to-end on Django 5.2 and deployed on AWS EC2 behind nginx + Gunicorn.",
    image: "/textures/projects/scopex-admin.png",
    accent: "cobalt",
    metrics: [
      { value: "40+", label: "live MySQL tables mapped" },
      { value: "100%", label: "sensitive actions audited" },
      { value: "2×", label: "auth layers — SSO + FIDO2" },
      { value: "444", label: "scanner traffic dropped at nginx" },
    ],
    architecture: [
      "Maps the live remittance schema with managed=False ORM models — Django consumes 40+ production tables without ever owning a migration.",
      "Custom MasterSlaveRouter: reads → replica, writes → master, with master-pinned apps to kill replication-lag races.",
      "Google SSO (django-allauth) layered with WebAuthn/FIDO2 hardware-key login — phishing-resistant access to money movement.",
      "PII encrypted at rest with decrypt-on-reveal; a dedicated audit app logs every REVEAL_PII, DECRYPT_CSV and API call into a compliance trail.",
      "admin_calls: a Twilio Voice call-center inside the admin — click-to-call, TwiML connect, live status callbacks, contact search, call notes.",
      "Datadog APM with trace↔log correlation, S3 static/media, ⌘K command palette on a custom-branded admin theme, prod + staging environments.",
    ],
    challenges: [
      {
        title: "Reading a live production DB without owning it",
        problem:
          "The MySQL schema belongs to another service (Drizzle migrations, 40+ tables). Letting Django manage it risked corrupting production data.",
        fix: "Modeled every table managed=False with explicit db_table mappings; allow_migrate blocks any accidental schema change from the admin side.",
      },
      {
        title: "Read replica returning stale data",
        problem:
          "Routing reads to a replica meant freshly-written records (e.g. call logs) intermittently came back empty from replication lag.",
        fix: "Built a MasterSlaveRouter with a MASTER_ONLY_APPS allowlist that pins read-after-write-sensitive apps to the master — lag race gone, replica offloading kept.",
      },
      {
        title: "Exposing PII to staff safely",
        problem:
          "Support needs customer bank/KYC data, but free exposure is a compliance and insider-risk problem.",
        fix: "Field-level encryption at rest, decrypt-on-reveal, and an audit log that turns every sensitive access into a traceable event with user + endpoint + timestamp.",
      },
      {
        title: "Passwords aren't enough for a money console",
        problem: "A back-office with access to money movement can't rely on passwords alone.",
        fix: "Google SSO for identity + WebAuthn/FIDO2 hardware keys for passwordless, phishing-resistant login.",
      },
      {
        title: "Datadog flooded by scanner noise",
        problem:
          "Bots hitting the raw IP with bad Host headers spammed DisallowedHost errors, burying real incidents.",
        fix: "A first-loading nginx catch-all default_server (with TLS variant) drops unknown-Host traffic with 444 before Django ever sees it.",
      },
      {
        title: "Logs that couldn't be traced",
        problem: "Plain logs made it impossible to follow one request across the stack.",
        fix: "ddtrace APM with DD_LOGS_INJECTION and a trace formatter that stays safe in local dev — full trace-to-log correlation in prod.",
      },
    ],
    stack: [
      "Django 5.2",
      "Python",
      "MySQL master/replica",
      "Google OAuth",
      "WebAuthn/FIDO2",
      "Twilio Voice",
      "AWS EC2/S3",
      "nginx · Gunicorn",
      "Datadog APM",
      "cryptography",
    ],
  },
  {
    id: "ai-support-agent",
    index: "02",
    title: "AI Customer Support Agent",
    subtitle: "RAG + tool-calling platform resolving real fintech queries",
    description:
      "A production support platform for EU→India remittances that autonomously answers customers from a knowledge base and live account data. Multi-agent RAG pipeline on async FastAPI, a ChatGPT-style Next.js 15 frontend streaming over SSE, and a provider-agnostic LLM layer running Claude through a streaming two-round tool-use loop.",
    image: "/textures/projects/ai-support.svg",
    accent: "coral",
    metrics: [
      { value: "2-round", label: "streaming tool-use loop" },
      { value: "3", label: "root causes fixed in prod incident" },
      { value: "700→1", label: "runaway threads bounded" },
      { value: "0", label: "hallucinated account answers" },
    ],
    architecture: [
      "Hybrid retrieval: sentence-transformer vectors in ChromaDB fused with a lexical pass, similarity-floor filtering and per-response source citations.",
      "Function-calling tools against live backend APIs — transfer/pay-in status, KYC, recipients, settlements — JWT-scoped per request, so answers come from real data.",
      "Multi-agent orchestrator: intent classifier → RAG → answer generation → async Postgres conversation memory → confidence-scored escalation to humans.",
      "Intercom integration via HMAC-verified webhooks: background replies, round-robin handoff, idle auto-close, CSAT → CleverTap; Redis for dedupe, rate-limits and handoff locks.",
      "Datadog APM + LLM Observability tracing, an admin dashboard for KB and session analytics, full stack containerized with Docker Compose.",
      "Reliability by design: graceful LLM-failure degradation to human handoff, prompt-level anti-hallucination guardrails, safe auto-migrating schema.",
    ],
    challenges: [],
    incident: {
      title: "War story: the 100%-CPU night",
      intro:
        "The single 2-vCPU EC2 box (API + ChromaDB + Postgres + Redis co-located) hit 100% CPU with cascading 500s overnight. I traced it to three independent root causes and fixed each:",
      causes: [
        {
          title: "Reconnect storm (primary)",
          detail:
            "An expired Bedrock credential raised mid-stream, closing the SSE with no terminal [DONE] frame → browsers auto-reconnected → every reconnect re-ran the CPU-heavy intent + embedding pipeline. Fixed with a graceful-degradation guard that always closes the stream with a canonical handoff response, plus a route-level exception net and capped client retries.",
        },
        {
          title: "Unbounded thread growth",
          detail:
            "A new ChromaDB HttpClient was instantiated on every RAG call (~2× per message), pushing 500–700+ threads on a 2-vCPU box. LRU-cached the client so connections are reused.",
        },
        {
          title: "Memory / infra ceiling",
          detail:
            "The co-located topology capped at ~4 GB RAM (worse after adding the Datadog agent). Added daily CPU/memory alerting and drove the resize + managed Postgres/Redis plan to remove the single point of failure.",
        },
      ],
      result:
        "Reconnect-amplified spikes eliminated, thread/connection growth bounded, and alerting in place to catch regressions before customers do.",
    },
    stack: [
      "Python",
      "FastAPI",
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Bedrock · Claude",
      "ChromaDB",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Intercom",
      "Datadog LLM Obs",
    ],
  },
];
