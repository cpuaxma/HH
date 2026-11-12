"use client";
import { ReactLenis } from "lenis/react";
import { useMedia, REDUCED } from "@/lib/useMedia";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useMedia(REDUCED);
  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: 0 }, autoRaf: true }}>
      {children}
    </ReactLenis>
  );
}
