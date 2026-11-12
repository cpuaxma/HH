"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMedia, FINE_POINTER, REDUCED } from "@/lib/useMedia";

/** Desktop-only cursor: a dot that tracks exactly and a ring that follows on a spring. */
export function Cursor() {
  const fine = useMedia(FINE_POINTER);
  const reduced = useMedia(REDUCED);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });
  const [state, setState] = useState<"idle" | "link" | "press">("idle");
  const [visible, setVisible] = useState(false);
  const pressed = useRef(false);

  useEffect(() => {
    if (!fine) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      if (pressed.current) return;
      const t = e.target as Element | null;
      // Text fields keep the system I-beam; the custom cursor steps aside.
      if (t?.closest("input:not([type=radio]):not([type=range]), textarea, select")) { setVisible(false); return; }
      setState(t?.closest("a, button, [role=button], input, textarea, select, label, [data-cursor]") ? "link" : "idle");
    };
    const down = () => { pressed.current = true; setState("press"); };
    const up = () => { pressed.current = false; setState("idle"); };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, [fine, x, y]);

  if (!fine) return null;
  const size = state === "link" ? 56 : state === "press" ? 22 : 30;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}>
      <motion.div
        className="absolute left-0 top-0 rounded-full border border-ink/70"
        style={{
          x: reduced ? x : rx,
          y: reduced ? y : ry,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          background: state === "link" ? "rgb(226 59 36 / 0.18)" : "transparent",
          borderColor: state === "link" ? "rgb(255 90 46 / 0.9)" : undefined,
          transition: "width 220ms var(--ease-out), height 220ms var(--ease-out), margin 220ms var(--ease-out), background-color 200ms ease, border-color 200ms ease",
        }}
      />
      <motion.div className="absolute left-0 top-0 -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-ink" style={{ x, y }} />
    </div>
  );
}
