export type Stat = {
  label: string;
  value: number;
  display: string;
  suffix?: string;
  sub: string;
  accent: "cobalt" | "coral" | "ink";
  // normalized 0..1 height for the 3D stat tower
  height: number;
};

// Competitive-programming ratings + volume, tuned for the 3D "stat towers".
export const stats: Stat[] = [
  {
    label: "Codeforces",
    value: 1513,
    display: "1513",
    sub: "Specialist",
    accent: "cobalt",
    height: 0.62,
  },
  {
    label: "CodeChef",
    value: 1817,
    display: "1817",
    sub: "4★ Rating",
    accent: "coral",
    height: 0.82,
  },
  {
    label: "LeetCode",
    value: 1769,
    display: "1769",
    sub: "Rating",
    accent: "ink",
    height: 0.74,
  },
  {
    label: "Problems Solved",
    value: 1000,
    display: "1000",
    suffix: "+",
    sub: "DSA across judges",
    accent: "cobalt",
    height: 1,
  },
];

export type Achievement = {
  title: string;
  detail: string;
  accent: "cobalt" | "coral" | "ink";
};

export const achievements: Achievement[] = [
  {
    title: "SIH 2024 Finalist",
    detail:
      "Among top teams nationally in India's largest government hackathon — built an AI-based solution for a real-world problem statement.",
    accent: "coral",
  },
  {
    title: "Multiple Hackathon Winner",
    detail:
      "Won 2+ college and inter-college hackathons out of 5+ competitions — recognized for rapid prototyping, full-stack delivery and technical pitching under deadlines.",
    accent: "cobalt",
  },
  {
    title: "Top 100 Contest Ranks",
    detail:
      "Peak contest rank under 100 across multiple Codeforces and CodeChef Div. 2 & Div. 3 rounds — consistently in the top percentile.",
    accent: "ink",
  },
  {
    title: "1000+ Problems Solved",
    detail:
      "DP, graphs, trees, binary search and greedy techniques across LeetCode, Codeforces and CodeChef.",
    accent: "cobalt",
  },
];

export const education = {
  degree: "B.Tech in Computer Science",
  school: "Dr. APJ Abdul Kalam Technical University",
  location: "Ghaziabad, India",
  period: "2022 — 2026",
};
