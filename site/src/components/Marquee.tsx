"use client";
import { useState } from "react";

type Word = { t: string; ar?: boolean; fr?: boolean };
const ROW_A: Word[] = [
  { t: "Content" }, { t: "محتوى", ar: true }, { t: "Contenu", fr: true },
  { t: "Reels" }, { t: "ريلز", ar: true }, { t: "Réels", fr: true },
];
const ROW_B: Word[] = [
  { t: "Ads" }, { t: "إعلانات", ar: true }, { t: "Publicités", fr: true },
  { t: "Community" }, { t: "مجتمع", ar: true }, { t: "Communauté", fr: true },
];

function Track({ words, reverse, paused }: { words: Word[]; reverse?: boolean; paused: boolean }) {
  const run = [...words, ...words];
  return (
    <div className="marquee-row flex overflow-hidden" dir="ltr">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden
          className={`marquee-track flex shrink-0 items-center ${reverse ? "marquee-reverse" : ""}`}
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {run.map((w, i) => (
            <li key={i} className="flex items-center">
              {w.ar ? (
                <span lang="ar" dir="rtl" className="marquee-ar">{w.t}</span>
              ) : (
                <span lang={w.fr ? "fr" : "en"} className="marquee-word">{w.t}</span>
              )}
              <span className="marquee-dot" />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function Marquee() {
  const [paused, setPaused] = useState(false);
  return (
    <section aria-label="What we make" className="relative border-y border-line pt-6 pb-3 md:pt-10 md:pb-4">
      <p className="sr-only">Content, reels, ads and community, in English, Arabic and French.</p>
      <div className="flex flex-col gap-1 md:gap-3">
        <Track words={ROW_A} paused={paused} />
        <div className="text-accent"><Track words={ROW_B} reverse paused={paused} /></div>
      </div>
      <div className="wrap mt-2 flex justify-end">
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Play the moving text" : "Pause the moving text"}
        className="marquee-toggle flex size-11 items-center justify-center rounded-full border border-line bg-bg/80 text-ink/70 transition-[color,border-color,transform] duration-200 hover:border-ink/50 hover:text-ink active:scale-[0.94] md:bottom-3"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          {paused ? <path d="M4 2.5v11l9-5.5z" fill="currentColor" /> : <path d="M4 2.5h2.6v11H4zM9.4 2.5H12v11H9.4z" fill="currentColor" />}
        </svg>
      </button>
      </div>
    </section>
  );
}
