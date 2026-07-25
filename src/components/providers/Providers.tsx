"use client";

import { SmoothScrollProvider } from "./SmoothScrollProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
