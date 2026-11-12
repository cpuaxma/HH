"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { LEVELS, useHeat } from "@/lib/heat";
import { useMedia, FINE_POINTER, REDUCED } from "@/lib/useMedia";

/**
 * The real pepper: a photographed chili in four heat colours that cross-fade with the heat
 * scale. It tilts toward the cursor on a spring (desktop), drifts with the scroll in the hero,
 * drops in on load (CSS, so it never waits for JS), and carries a gloss sweep clipped to its
 * own silhouette.
 */
export function PepperPhoto({ placement = "hero", className = "" }: { placement?: "hero" | "center"; className?: string }) {
  const heat = useHeat();
  const fine = useMedia(FINE_POINTER);
  const reduced = useMedia(REDUCED);
  const box = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, (v) => v * -10), { stiffness: 90, damping: 14, mass: 0.8 });
  const ry = useSpring(useTransform(px, (v) => v * 14), { stiffness: 90, damping: 14, mass: 0.8 });
  const { scrollYProgress } = useScroll({ target: box, offset: ["start start", "end start"] });
  const sy = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const sr = useTransform(scrollYProgress, [0, 1], [0, 16]);
  const live = fine && !reduced;
  const hero = placement === "hero";

  useEffect(() => {
    if (!live) return;
    const move = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [live, px, py]);

  return (
    <div ref={box} aria-hidden className={`pointer-events-none [perspective:1400px] ${className}`}>
      <motion.div
        className={`pepper-stage ${hero ? "pepper-stage--hero" : "pepper-stage--center"}`}
        style={reduced ? undefined : { y: hero ? sy : 0, rotate: hero ? sr : 0, rotateX: live ? rx : 0, rotateY: live ? ry : 0 }}
      >
        <div className="pepper-drop">
          <div className="pepper-float">
            <div className="pepper-glow" />
            {LEVELS.map((lv, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={lv.name}
                src={`/pepper/pepper-${i}.webp`}
                alt=""
                width={767}
                height={723}
                decoding="async"
                loading={hero && i === 2 ? "eager" : "lazy"}
                fetchPriority={hero && i === 2 ? "high" : "auto"}
                className="pepper-img"
                style={{ opacity: heat === i ? 1 : 0, filter: heat === i ? "none" : "blur(6px)" }}
              />
            ))}
            <div className="pepper-sheen" />
          </div>
        </div>
        <div className="pepper-shadow" />
      </motion.div>
    </div>
  );
}
