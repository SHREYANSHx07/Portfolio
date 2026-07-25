import { Providers } from "@/components/providers/Providers";
import { CanvasClient } from "@/components/three/CanvasClient";
import { AuroraBackdrop } from "@/components/ui/AuroraBackdrop";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Preloader } from "@/components/ui/Preloader";
import { ScrollHUD } from "@/components/ui/ScrollHUD";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Experience } from "@/components/sections/Experience";
import { Flagship } from "@/components/sections/Flagship";
import { Projects } from "@/components/sections/Projects";
import { Achievements } from "@/components/sections/Achievements";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <Providers>
      {/* Ambient aurora wash + persistent 3D layer behind everything */}
      <AuroraBackdrop />
      <CanvasClient />

      {/* Overlays */}
      <Preloader />
      <CustomCursor />
      <ScrollHUD />
      <Nav />

      <main className="relative">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Flagship />
        <Projects />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </Providers>
  );
}
