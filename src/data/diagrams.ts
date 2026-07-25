/**
 * Architecture diagrams for the flagship case studies, authored from the
 * public architecture bullets in flagship.ts. Coordinates live in a
 * 640×360 viewBox; nodes are 130×36 boxes anchored at their top-left.
 */
export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  accent?: "cobalt" | "coral";
};

export type Diagram = {
  nodes: DiagramNode[];
  edges: [string, string][];
};

export const diagrams: Record<string, Diagram> = {
  "scopex-admin": {
    nodes: [
      { id: "staff", label: "Ops / Support", sub: "SSO + FIDO2", x: 20, y: 30 },
      { id: "nginx", label: "nginx", sub: "scanner filter", x: 20, y: 150 },
      { id: "django", label: "Django Admin", sub: "EC2 · Gunicorn", x: 255, y: 150, accent: "cobalt" },
      { id: "replica", label: "MySQL replica", sub: "reads", x: 490, y: 60 },
      { id: "master", label: "MySQL master", sub: "writes", x: 490, y: 150 },
      { id: "s3", label: "AWS S3", sub: "static · media", x: 490, y: 240 },
      { id: "twilio", label: "Twilio Voice", sub: "call center", x: 255, y: 285, accent: "coral" },
      { id: "datadog", label: "Datadog APM", sub: "traces ↔ logs", x: 20, y: 285 },
    ],
    edges: [
      ["staff", "nginx"],
      ["nginx", "django"],
      ["django", "replica"],
      ["django", "master"],
      ["django", "s3"],
      ["django", "twilio"],
      ["django", "datadog"],
    ],
  },
  "ai-support-agent": {
    nodes: [
      { id: "customer", label: "Customer", sub: "web · Intercom", x: 20, y: 30 },
      { id: "chat", label: "Next.js chat", sub: "SSE streaming", x: 20, y: 150 },
      { id: "api", label: "FastAPI core", sub: "multi-agent", x: 255, y: 150, accent: "coral" },
      { id: "rag", label: "ChromaDB RAG", sub: "hybrid retrieval", x: 490, y: 60 },
      { id: "claude", label: "Claude", sub: "Bedrock · tools", x: 490, y: 150, accent: "cobalt" },
      { id: "tools", label: "Live account APIs", sub: "JWT-scoped", x: 490, y: 240 },
      { id: "pg", label: "Postgres", sub: "conversation memory", x: 255, y: 285 },
      { id: "human", label: "Human handoff", sub: "confidence-gated", x: 20, y: 285 },
    ],
    edges: [
      ["customer", "chat"],
      ["chat", "api"],
      ["api", "rag"],
      ["api", "claude"],
      ["api", "tools"],
      ["api", "pg"],
      ["api", "human"],
    ],
  },
};
