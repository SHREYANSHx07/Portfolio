export type Project = {
  id: string;
  title: string;
  tagline: string;
  stack: string[];
  highlights: string[];
  accent: "cobalt" | "coral";
  // texture used on the 3D frame — placeholder gradient until real screenshots arrive
  image?: string;
  href?: string;
};

export const projects: Project[] = [
  {
    id: "pagepersona-ai",
    title: "PagePersona AI",
    tagline: "Turn ad creative into a personalized landing page.",
    stack: ["Django", "React", "Gemini", "Vision", "BeautifulSoup"],
    accent: "cobalt",
    highlights: [
      "End-to-end CRO system: upload an ad image + a landing-page URL, and Gemini Vision extracts the ad's message, tone and audience, then generates copy that surgically re-aligns the page for conversion.",
      "Scrapes landing-page elements (headlines, CTAs, hero) with BeautifulSoup, injects optimized copy via HTML patching, and renders a side-by-side diff with a reasoned changelog.",
      "Validator schema checks and graceful fallbacks guard against hallucinations and broken output; REST API with multipart uploads and a sandboxed iframe preview.",
    ],
    image: "/textures/projects/pagepersona.png",
    href: "https://github.com/SHREYANSHx07/PagePersona-AI",
  },
  {
    id: "rbac-dashboard",
    title: "Admin Dashboard with RBAC",
    tagline: "Granular role-based access for internal ops.",
    stack: ["Python", "Django", "JavaScript", "PostgreSQL", "Redis"],
    accent: "cobalt",
    highlights: [
      "Full-featured Django admin dashboard with granular RBAC across 3 role types and 20+ internal team members; Redis session caching cut load times ~35%.",
      "User management, project tracking, task assignment, analytics and reporting across 5 core modules on PostgreSQL — eliminating manual overhead for ops teams.",
    ],
    image: "/textures/projects/rbac.svg",
  },
  {
    id: "restaurant-system",
    title: "Restaurant Management System",
    tagline: "Production Go/Gin backend with JWT + RBAC.",
    stack: ["Go", "Gin", "MongoDB", "JWT", "Redis"],
    accent: "coral",
    highlights: [
      "MVC backend handling 5+ concurrent roles; JWT auth (access + refresh), RBAC via Gin middleware and Redis token blacklisting for 1,000+ session requests.",
      "20+ RESTful endpoints for menus, orders, tables and invoices with auto-calculated billing, MongoDB persistence and Redis caching for high-frequency reads.",
    ],
    image: "/textures/projects/restaurant.svg",
  },
  {
    id: "ai-tone-system",
    title: "AI Tone Adaptation System",
    tagline: "Emotion-aware LLM responses with vector memory.",
    stack: ["LangGraph", "FastAPI", "FAISS", "PostgreSQL"],
    accent: "cobalt",
    highlights: [
      "FastAPI AI system with 5+ tone profiles at <500ms inference; adapts tone using user context, real-time emotion detection and a multi-layer memory architecture on PostgreSQL.",
      "FAISS vector store indexes 10,000+ memory vectors for sub-100ms semantic retrieval — personalized, context-aware interactions with memory analytics and feedback calibration.",
    ],
    image: "/textures/projects/ai-tone.svg",
  },
];
