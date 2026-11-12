"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useMedia, DESKTOP, REDUCED } from "@/lib/useMedia";

const STEPS = [
  { name: "Taste", text: "We learn your business, your customers and what your competitors post. Then we tell you what we would change." },
  { name: "Recipe", text: "We write the plan: goals, content pillars, a posting calendar and an ad budget you approve." },
  { name: "Cook", text: "We shoot, edit, post, reply and run the ads, so your accounts stay active every week." },
  { name: "Turn it up", text: "We read the results, keep what works and do more of it." },
];

function Heading() {
  return (
    <h2 id="process-title" className="font-display text-[clamp(3.5rem,14vw,8.5rem)] uppercase lg:text-[min(6.6vw,13vh)] lg:whitespace-nowrap">
      How we work, in four steps
    </h2>
  );
}

function Pinned() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [p, setP] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setP(v);
    setActive(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length * 0.999)));
  });
  const glow = 0.1 + active * 0.12;
  const lenis = useLenis();
  const SEG = 45; // vh of scroll per step
  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / STEPS.length) * (el.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section id="process" ref={ref} aria-labelledby="process-title" className="relative" style={{ height: `${100 + STEPS.length * SEG}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-28 pb-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700 ease-[var(--ease-out)]"
          style={{ background: `radial-gradient(50% 60% at 75% 70%, rgb(var(--glow) / ${glow}), transparent 70%)` }} />
        <div className="wrap"><Heading /></div>
        <ol className="sr-only">
          {STEPS.map((s, i) => (<li key={s.name}><h3>{`Step ${i + 1}: ${s.name}`}</h3><p>{s.text}</p></li>))}
        </ol>

        <div aria-hidden className="wrap relative grid flex-1 grid-cols-12 items-center gap-8">
          <ol className="relative col-span-8 h-[min(52vh,30rem)]">
            {STEPS.map((s, i) => {
              const state = i === active ? "now" : i < active ? "past" : "next";
              return (
                <li
                  key={s.name}
                  aria-current={state === "now" ? "step" : undefined}
                  className="absolute inset-x-0 top-1/2 transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out)]"
                  style={{
                    opacity: state === "now" ? 1 : 0,
                    transform: `translateY(-50%) ${state === "now" ? "" : state === "past" ? "translateY(-18%)" : "translateY(18%)"}`,
                    filter: state === "now" ? "none" : "blur(10px)",
                  }}
                >
                  <span className="tabular font-display block text-[min(9vw,18vh)] text-accent">0{i + 1}</span>
                  <span className="font-display block text-[min(16.5vw,34vh)] uppercase">{s.name}</span>
                </li>
              );
            })}
          </ol>
          <div className="col-span-4">
            <div className="relative min-h-[7.5em] text-xl text-ink/80">
              {STEPS.map((s, i) => (
                <p key={s.name} className="absolute inset-x-0 bottom-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
                  style={{ opacity: i === active ? 1 : 0, transform: i === active ? "none" : "translateY(12px)" }} aria-hidden={i !== active}>
                  {s.text}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <div className="relative h-[3px] overflow-hidden rounded-full bg-line">
                <span className="absolute inset-y-0 left-0 w-full origin-left bg-accent" style={{ transform: `scaleX(${p})` }} />
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1 text-sm">
                {STEPS.map((s, i) => (
                  <button key={s.name} type="button" tabIndex={-1} onClick={() => goTo(i)}
                    className={`min-h-11 rounded-lg text-left transition-colors duration-300 hover:text-ink ${i === active ? "text-ink" : "text-ink/60"}`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stacked({ reduced }: { reduced: boolean }) {
  return (
    <section id="process" aria-labelledby="process-title" className="relative py-24 md:py-32">
      <div className="wrap">
        <Heading />
        <ol className="mt-12 border-t border-line">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.name}
              className="grid gap-3 border-b border-line py-8 sm:grid-cols-[6rem_1fr] sm:gap-6"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            >
              <span className="tabular font-display text-5xl text-accent">0{i + 1}</span>
              <div>
                <h3 className="font-display text-[clamp(3rem,15vw,6rem)] uppercase">{s.name}</h3>
                <p className="mt-3 max-w-[40ch] text-lg text-ink/75">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Process() {
  const desktop = useMedia(DESKTOP);
  const reduced = useMedia(REDUCED);
  return desktop && !reduced ? <Pinned /> : <Stacked reduced={reduced} />;
}
