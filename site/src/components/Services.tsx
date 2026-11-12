"use client";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useMedia, DESKTOP, FINE_POINTER, REDUCED } from "@/lib/useMedia";
import { AdsVisual, CommunityVisual, ContentVisual, ReportVisual, StrategyVisual } from "./ServiceVisuals";

const SERVICES = [
  { name: "Strategy", text: "We study your market and your competitors, then set the goals, the voice and a content calendar to follow.", Visual: StrategyVisual },
  { name: "Content production", text: "Photos, reels and stories, planned, shot and edited for each platform your customers use.", Visual: ContentVisual },
  { name: "Community management", text: "We answer comments and messages in your voice and keep the conversation going between posts.", Visual: CommunityVisual },
  { name: "Paid ads", text: "Ads on Instagram, Facebook and TikTok, aimed at the people most likely to buy and adjusted as results come in.", Visual: AdsVisual },
  { name: "Reporting", text: "A plain report on what worked, what didn’t and what we change next.", Visual: ReportVisual },
];

export function Services() {
  const fine = useMedia(FINE_POINTER);
  const desktop = useMedia(DESKTOP);
  const hoverMode = fine && desktop;
  const rowBox = useRef<{ top: number; bottom: number } | null>(null);
  const reduced = useMedia(REDUCED);
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  const Active = hover !== null ? SERVICES[hover].Visual : null;

  return (
    <section id="services" aria-labelledby="services-title" className="relative py-24 md:py-36">
      <div className="wrap">
        <div className="mb-12 grid gap-6 md:mb-20 lg:grid-cols-12 lg:items-end">
          <h2 id="services-title" className="font-display text-[clamp(3.5rem,14vw,9.5rem)] uppercase lg:col-span-8">
            Five services, one team
          </h2>
          <p className="max-w-[38ch] text-lg text-ink/75 lg:col-span-4 lg:justify-self-end">
            Take one service or hand us all five. Each one is planned around your business, not a template.
          </p>
        </div>

        <ul
          className="border-t border-line"
          onPointerMove={(e) => {
            if (!hoverMode) return;
            // Follow the cursor sideways, but sit above or below the hovered row so it never covers it.
            const W = 272, H = 340, gap = 20;
            x.set(Math.min(Math.max(e.clientX - W / 2, 24), window.innerWidth - W - 24));
            const r = rowBox.current;
            if (!r) return;
            const above = r.top - gap - H;
            y.set(above > 88 ? above : Math.min(r.bottom + gap, window.innerHeight - H - 16));
          }}
          onPointerLeave={() => { setHover(null); rowBox.current = null; }}
        >
          {SERVICES.map((s, i) => {
            const isOpen = open === i;
            const dim = hoverMode && hover !== null && hover !== i;
            return (
              <li
                key={s.name}
                className="svc-row border-b border-line transition-opacity duration-300 ease-[var(--ease-out)]"
                style={{ opacity: dim ? 0.38 : 1 }}
                onPointerEnter={(e) => {
                  if (!hoverMode) return;
                  const b = e.currentTarget.getBoundingClientRect();
                  rowBox.current = { top: b.top, bottom: b.bottom };
                  setHover(i);
                }}
              >
                {hoverMode ? (
                  <div className="grid grid-cols-12 items-center gap-8 py-7">
                    <h3 className={`font-display col-span-8 whitespace-nowrap text-[min(6.2vw,6rem)] uppercase transition-[transform,color] duration-500 ease-[var(--ease-out)] ${hover === i ? "translate-x-4 text-accent" : ""}`}>
                      {s.name}
                    </h3>
                    <p className="col-span-4 max-w-[34ch] text-lg text-ink/70">{s.text}</p>
                  </div>
                ) : (
                  <h3>
                    <button
                      type="button"
                      className="group flex w-full items-center gap-4 py-5 text-left md:py-7 lg:grid lg:grid-cols-12 lg:gap-8"
                      aria-expanded={isOpen}
                      aria-controls={`${uid}-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="font-display flex-1 text-[clamp(2.6rem,11vw,6.25rem)] uppercase lg:col-span-8 lg:whitespace-nowrap lg:text-[min(6.2vw,6rem)]">{s.name}</span>
                      <span aria-hidden className={`relative flex size-12 shrink-0 items-center justify-center rounded-full border border-line transition-[transform,background-color,border-color] duration-300 ease-[var(--ease-out)] lg:col-span-4 lg:justify-self-end ${isOpen ? "rotate-45 border-accent-fill bg-accent-fill" : ""}`}>
                        <span className="absolute h-0.5 w-4 rounded bg-ink" />
                        <span className="absolute h-4 w-0.5 rounded bg-ink" />
                      </span>
                    </button>
                  </h3>
                )}
                <div
                  id={`${uid}-${i}`}
                  className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-drawer)] ${hoverMode ? "hidden" : ""}`}
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0 overflow-hidden" inert={!isOpen}>
                    <div className="grid gap-5 pb-7 sm:grid-cols-2 sm:items-start">
                      <p className="max-w-[38ch] text-lg text-ink/80">{s.text}</p>
                      <div className="aspect-[4/5] w-full max-w-[320px] sm:justify-self-end"><s.Visual /></div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Desktop: the hovered row's visual floats beside the cursor. */}
      {hoverMode && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-20 hidden h-[340px] w-[272px] lg:block"
          style={{ x: reduced ? x : sx, y: reduced ? y : sy }}
        >
          <AnimatePresence mode="popLayout">
            {Active && (
              <motion.div
                key={hover}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)", rotate: -3 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
                transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
              >
                <Active />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
