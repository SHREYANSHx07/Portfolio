"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins exactly once — guarded so React 19 StrictMode double-mounts
// don't re-register (which would warn and can duplicate internal state).
let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
  registered = true;
}

export { gsap, ScrollTrigger };
