import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const SITE = "https://shreyansh-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Shreyansh Gupta — Backend & AI Engineer",
    template: "%s · Shreyansh Gupta",
  },
  description:
    "Backend & AI engineer building scalable microservices in Go, Django and FastAPI. Codeforces Specialist, CodeChef 4★, SIH 2024 Finalist. 1000+ DSA problems solved.",
  keywords: [
    "Shreyansh Gupta",
    "Backend Engineer",
    "AI Engineer",
    "Golang",
    "Django",
    "FastAPI",
    "Portfolio",
    "Competitive Programming",
  ],
  authors: [{ name: "Shreyansh Gupta" }],
  openGraph: {
    title: "Shreyansh Gupta — Backend & AI Engineer",
    description:
      "Scalable microservices in Go, Django and FastAPI · AI/LLM systems · Codeforces Specialist · SIH 2024 Finalist.",
    url: SITE,
    siteName: "Shreyansh Gupta",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyansh Gupta — Backend & AI Engineer",
    description:
      "Scalable microservices in Go, Django and FastAPI · AI/LLM systems · Codeforces Specialist.",
  },
};

// Runs before paint so a saved dark preference never flashes light.
const THEME_INIT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="grain min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
