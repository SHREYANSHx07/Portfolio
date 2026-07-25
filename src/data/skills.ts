export type SkillCategory =
  | "Languages"
  | "Frameworks"
  | "AI / ML"
  | "Databases"
  | "Tools & Cloud";

export type Skill = {
  name: string;
  category: SkillCategory;
  // accent: which palette color the 3D node + label uses
  accent: "cobalt" | "coral" | "ink";
  // relative visual weight (drives node size in the 3D constellation)
  weight: number;
};

export const skillCategories: SkillCategory[] = [
  "Languages",
  "Frameworks",
  "AI / ML",
  "Databases",
  "Tools & Cloud",
];

export const skills: Skill[] = [
  // Languages
  { name: "Go", category: "Languages", accent: "cobalt", weight: 1 },
  { name: "Python", category: "Languages", accent: "cobalt", weight: 1 },
  { name: "C++", category: "Languages", accent: "ink", weight: 0.8 },
  { name: "C", category: "Languages", accent: "ink", weight: 0.7 },
  { name: "JavaScript", category: "Languages", accent: "ink", weight: 0.8 },
  // Frameworks
  { name: "Django", category: "Frameworks", accent: "coral", weight: 1 },
  { name: "DRF", category: "Frameworks", accent: "coral", weight: 0.8 },
  { name: "FastAPI", category: "Frameworks", accent: "coral", weight: 1 },
  { name: "Gin", category: "Frameworks", accent: "coral", weight: 0.9 },
  { name: "TensorFlow", category: "Frameworks", accent: "ink", weight: 0.7 },
  // AI / ML
  { name: "RAG", category: "AI / ML", accent: "coral", weight: 1 },
  { name: "LangGraph", category: "AI / ML", accent: "cobalt", weight: 0.9 },
  { name: "LangChain", category: "AI / ML", accent: "cobalt", weight: 0.8 },
  { name: "Semantic Search", category: "AI / ML", accent: "coral", weight: 0.8 },
  { name: "LlamaIndex", category: "AI / ML", accent: "cobalt", weight: 0.7 },
  { name: "OpenAI API", category: "AI / ML", accent: "cobalt", weight: 0.8 },
  { name: "FAISS", category: "AI / ML", accent: "cobalt", weight: 0.8 },
  // Databases
  { name: "PostgreSQL", category: "Databases", accent: "ink", weight: 1 },
  { name: "Redis", category: "Databases", accent: "coral", weight: 0.9 },
  { name: "MongoDB", category: "Databases", accent: "ink", weight: 0.8 },
  { name: "MySQL", category: "Databases", accent: "ink", weight: 0.7 },
  { name: "SQLite", category: "Databases", accent: "ink", weight: 0.6 },
  // Tools & Cloud
  { name: "Docker", category: "Tools & Cloud", accent: "cobalt", weight: 0.8 },
  { name: "AWS", category: "Tools & Cloud", accent: "cobalt", weight: 0.8 },
  { name: "GCP", category: "Tools & Cloud", accent: "cobalt", weight: 0.7 },
  { name: "Git", category: "Tools & Cloud", accent: "ink", weight: 0.7 },
];
