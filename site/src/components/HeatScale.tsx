"use client";
import { AnimatePresence, motion } from "motion/react";
import { LEVELS, setHeat, useHeat, type HeatLevel } from "@/lib/heat";
import { PepperPhoto } from "./pepper/PepperPhoto";
import { Button } from "./Button";

export function HeatScale() {
  const level = useHeat();
  const L = LEVELS[level];

  return (
    <section id="heat" aria-labelledby="heat-title" className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-700 ease-[var(--ease-out)]"
        style={{ background: `radial-gradient(55% 45% at 30% 55%, rgb(${L.glow} / ${0.12 + L.heat * 0.32}), transparent 72%)` }} />
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="heat-title" className="font-display text-[clamp(3.5rem,14vw,9.5rem)] uppercase lg:col-span-7">
            Four heat levels
          </h2>
          <p className="max-w-[40ch] text-lg text-ink/75 lg:col-span-5 lg:justify-self-end">
            The Scoville scale measures how hot a pepper is. We use it to show how much of your social media we take on.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-8 md:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="relative mx-auto aspect-square w-full max-w-[min(80vw,420px)] lg:sticky lg:top-24 lg:col-span-5 lg:max-w-none">
            <PepperPhoto placement="center" className="absolute inset-0" />
          </div>

          <div className="lg:col-span-7">
            <div className="relative overflow-hidden" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={level}
                  initial={{ y: "60%", opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-60%", opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  <p className="font-display text-[clamp(4rem,17vw,10rem)] uppercase">{L.name}</p>
                  <p className="tabular mt-3 text-xl text-ink md:text-2xl">{L.shu.replace(" SHU", "")} <span className="text-ink/60">Scoville heat units</span></p>
                  <p className="mt-2 max-w-[40ch] text-lg text-ink/70">{L.line}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Native range for keyboard and screen readers; four big targets for thumbs. */}
            <div className="mt-8">
              <label htmlFor="heat-range" className="sr-only">Heat level</label>
              <input
                id="heat-range"
                type="range"
                min={0}
                max={3}
                step={1}
                value={level}
                onChange={(e) => setHeat(Number(e.target.value) as HeatLevel)}
                aria-valuetext={`${L.name}, ${L.shu}`}
                className="heat-range w-full"
                style={{ "--p": `${(level / 3) * 100}%` } as React.CSSProperties}
              />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose a heat level">
                {LEVELS.map((lv, i) => (
                  <button
                    key={lv.name}
                    type="button"
                    aria-pressed={level === i}
                    onClick={() => setHeat(i as HeatLevel)}
                    className={`min-h-14 rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] ${
                      level === i ? "border-accent-fill bg-accent-fill text-white" : "border-line text-ink/80 [@media(hover:hover)]:hover:border-ink/40 [@media(hover:hover)]:hover:text-ink"
                    }`}
                  >
                    <span className="block font-medium">{lv.name}</span>
                    <span className={`block text-sm ${level === i ? "text-white" : "text-ink/60"}`}>{lv.scope}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-line pt-6">
              <h3 className="text-sm font-medium text-ink/60">What {L.name} includes</h3>
              <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {L.includes.map((item, i) => (
                    <motion.li
                      key={`${level}-${item}`}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                      className={`flex items-baseline gap-3 border-b border-line py-3 text-lg ${i === 0 && level > 0 ? "text-ink/60 sm:col-span-2" : "text-ink"}`}
                    >
                      {!(i === 0 && level > 0) && <span aria-hidden className="size-1.5 shrink-0 translate-y-[-0.2em] rounded-full bg-accent" />}
                      {item}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <div data-cta className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button href="#contact" className="w-full sm:w-auto" wrapClassName="w-full sm:w-auto">{`Book a ${L.name} call`}</Button>
                <p className="text-base text-ink/60">[Price for this level]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
