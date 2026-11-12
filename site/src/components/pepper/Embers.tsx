"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useMedia, DESKTOP, FINE_POINTER, REDUCED } from "@/lib/useMedia";

const EmbersScene = dynamic(() => import("./EmbersScene"), { ssr: false });

/**
 * Rising embers behind the hero pepper (React Three Fiber). Loads after the page is idle,
 * runs a light build on phones (fewer embers, dpr 1, no bloom), pauses off screen, and
 * switches itself off if the frame rate falls under 50fps or WebGL is missing.
 */
export function Embers({ className = "" }: { className?: string }) {
  const desktop = useMedia(DESKTOP, true);
  const fine = useMedia(FINE_POINTER, true);
  const reduced = useMedia(REDUCED);
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [visible, setVisible] = useState(true);
  const [keep, setKeep] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setKeep(q.has("keep3d"));
    if (q.has("still")) return;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    } catch {
      return;
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => setOn(true);
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1500 });
    else setTimeout(go, 400);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced) return null;
  return (
    <div ref={box} aria-hidden className={`pointer-events-none ${className}`}>
      {on && <EmbersScene lite={!desktop || !fine} active={visible} onLowFps={keep ? undefined : () => setOn(false)} />}
    </div>
  );
}
