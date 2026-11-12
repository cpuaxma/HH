"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useHeat } from "@/lib/heat";
import { useMedia, DESKTOP, FINE_POINTER, REDUCED } from "@/lib/useMedia";

const PepperScene = dynamic(() => import("./PepperScene"), { ssr: false });

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The hero pepper. Loads the 3D scene after the page is idle; phones get the light build
 * (dpr 1, no bloom, fewer polygons) and every build pauses off screen. Under 50fps, or with
 * no WebGL, it hands over to a pre-rendered still of the same pepper in the current heat colour.
 */
export function Pepper3D({ className = "", placement = "hero" }: { className?: string; placement?: "hero" | "center" }) {
  const desktop = useMedia(DESKTOP, true);
  const fine = useMedia(FINE_POINTER, true);
  const reduced = useMedia(REDUCED);
  const heat = useHeat();
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"wait" | "3d" | "still">("wait");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [flags, setFlags] = useState({ capture: false, keep: false, nodrop: false });
  const [near, setNear] = useState(placement === "hero");

  useEffect(() => {
    if (!near) return;
    const q = new URLSearchParams(location.search);
    setFlags({ capture: q.has("capture"), keep: q.has("keep3d") || q.has("capture"), nodrop: q.has("nodrop") });
    if (q.has("still")) { setMode("still"); return; }
    if (!webglOk()) { setMode("still"); return; }
    const go = () => setMode("3d");
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1200 });
    else setTimeout(go, 300);
  }, [near]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); pre.disconnect(); } }, { rootMargin: "900px" });
    pre.observe(el);
    io.observe(el);
    return () => { io.disconnect(); pre.disconnect(); };
  }, []);

  const lite = !desktop || !fine;

  return (
    <div ref={box} aria-hidden className={`pointer-events-none ${className}`}>
      {mode === "still" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/pepper/solo-${heat}.webp`}
          alt=""
          className={`pepper-still pepper-still--${placement}`}
          decoding="async"
        />
      )}
      {mode === "3d" && (
        <div className="absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out)]" style={{ opacity: ready ? 1 : 0 }}>
          <PepperScene
            lite={lite}
            reduced={reduced}
            active={visible}
            layout={placement === "center" ? "center" : desktop ? "desktop" : "phone"}
            capture={flags.capture}
            skipIntro={flags.nodrop}
            onReady={() => setReady(true)}
            onLowFps={flags.keep ? undefined : () => setMode("still")}
          />
        </div>
      )}
    </div>
  );
}
