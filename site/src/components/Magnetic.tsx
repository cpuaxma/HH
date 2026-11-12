"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMedia, FINE_POINTER, REDUCED } from "@/lib/useMedia";

/** Pulls its child toward the pointer on desktop. Inert on touch and under reduced motion. */
export function Magnetic({ children, strength = 0.28, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useMedia(FINE_POINTER);
  const reduced = useMedia(REDUCED);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.5 });
  const active = fine && !reduced;

  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className}`}
      style={active ? { x: sx, y: sy } : undefined}
      onPointerMove={(e) => {
        if (!active || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.span>
  );
}
