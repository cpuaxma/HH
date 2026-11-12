"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useMedia, DESKTOP, REDUCED } from "@/lib/useMedia";
import { Phone, REELS } from "./Reels";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Work() {
  const desktop = useMedia(DESKTOP);
  const reduced = useMedia(REDUCED);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [dist, setDist] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [index, setIndex] = useState(0);

  // Pinned travel distance = how far the track overruns the screen.
  useIso(() => {
    if (!desktop || !track.current) { setDist(0); return; }
    const measure = () => {
      const t = track.current!;
      const last = t.lastElementChild as HTMLElement | null;
      const end = last ? last.offsetLeft + last.offsetWidth : t.scrollWidth;
      const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) * 16 || 48;
      setDist(Math.max(0, end + gutter - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [desktop]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const zero = useMotionValue(0);
  const tx = useTransform(scrollYProgress, (p) => -p * dist);

  // Phone carousel position, for the counter.
  const onSwipe = () => {
    const t = track.current;
    if (!t || desktop) return;
    const item = t.firstElementChild as HTMLElement | null;
    if (!item) return;
    setIndex(Math.round(t.scrollLeft / (item.offsetWidth + 16)));
  };

  const running = onScreen && !paused && !reduced;

  return (
    <section
      id="work"
      ref={section}
      aria-labelledby="work-title"
      className={`relative ${running ? "" : "reels-paused"}`}
      style={desktop ? { height: `calc(100vh + ${dist}px)` } : undefined}
    >
      <div className="py-24 md:py-32 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden lg:py-0 lg:pt-20">
        <div className="wrap mb-10 grid gap-5 lg:mb-[3.5vh] lg:grid-cols-12 lg:items-end">
          <h2 id="work-title" className="font-display text-[clamp(3.5rem,14vw,8.5rem)] uppercase lg:col-span-8 lg:whitespace-nowrap lg:text-[min(6.6vw,13vh)]">
            Work made for the feed
          </h2>
          <div className="flex items-end justify-between gap-6 lg:col-span-4 lg:justify-self-end">
            <p className="max-w-[36ch] text-lg text-ink/75">
              Vertical first, because that is where your customers scroll. These phones hold placeholder reels until the real work goes in.
            </p>
          </div>
        </div>

        <motion.ul
          ref={track}
          onScroll={onSwipe}
          style={{ x: desktop && !reduced ? tx : zero }}
          className="work-track flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-2 [scrollbar-width:none] lg:snap-none lg:gap-[2.5vw] lg:overflow-visible lg:pr-[8vw] lg:pl-[max(var(--gutter),calc((100vw-1600px)/2+var(--gutter)))] [&::-webkit-scrollbar]:hidden"
          aria-label="Placeholder reels"
        >
          {REELS.map((r, i) => (
            <li
              key={r.id}
              className="shrink-0 snap-center text-[3.2vw] sm:text-[1.9vw] lg:text-[1.37vh]"
              style={{ height: desktop ? "58vh" : undefined }}
              aria-label={`Placeholder ${r.kind.toLowerCase()}`}
            >
              <div className={`w-[64vw] sm:w-[38vw] lg:h-full lg:w-auto ${desktop && i % 2 ? "lg:translate-y-[4vh]" : ""}`}>
                <Phone reel={r} />
              </div>
            </li>
          ))}
          <li className="flex shrink-0 snap-center items-center lg:h-[58vh]">
            <a href="#contact" data-cta className="group flex h-full w-[64vw] flex-col justify-end rounded-[2rem] border border-line p-6 transition-[border-color,transform] duration-300 ease-[var(--ease-out)] active:scale-[0.98] sm:w-[38vw] lg:w-[34vw] lg:p-10 [@media(hover:hover)]:hover:border-accent">
              <span className="font-display text-[clamp(3rem,13vw,5rem)] uppercase lg:text-[min(7vw,14vh)]">Your reel next</span>
              <span className="mt-4 inline-flex items-center gap-2 text-lg text-ink/75 transition-colors group-hover:text-ink">
                Book a call about yours
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </a>
          </li>
        </motion.ul>

        <div className="wrap mt-6 flex items-center justify-between lg:mt-[6vh]">
          <p className="tabular text-sm text-ink/60 lg:hidden" aria-live="polite">
            {Math.min(index + 1, REELS.length + 1)} / {REELS.length + 1}
          </p>
          <p className="hidden text-sm text-ink/60 lg:block">Scroll to move through the reels</p>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="flex min-h-12 items-center gap-2 rounded-full border border-line px-5 text-sm text-ink/80 transition-[border-color,color,transform] duration-200 active:scale-[0.97] [@media(hover:hover)]:hover:border-ink/50 [@media(hover:hover)]:hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
              {paused ? <path d="M4 2.5v11l9-5.5z" fill="currentColor" /> : <path d="M4 2.5h2.6v11H4zM9.4 2.5H12v11H9.4z" fill="currentColor" />}
            </svg>
            {paused ? "Play reels" : "Pause reels"}
          </button>
        </div>
      </div>
    </section>
  );
}
