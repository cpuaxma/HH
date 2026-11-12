import { Button } from "./Button";
import { Pepper3D } from "./pepper/Pepper3D";

const LINES = ["Social media,", "served hot."];

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <Pepper3D className="hero-pepper absolute inset-0 -z-10" />
      {/* Floor of the frame: lets the pepper sink into the page instead of ending on an edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-bg via-bg/75 lg:h-1/3 to-transparent" />

      <div className="wrap flex flex-1 flex-col pt-[calc(var(--safe-t)+5.5rem)] pb-[calc(var(--safe-b)+1.25rem)] md:pt-32 lg:justify-end lg:pb-14">
        <h1 id="hero-title" className="font-display hero-title uppercase">
          {LINES.map((l, i) => (
            <span key={l} className="reveal-line block overflow-hidden pb-[0.04em]" style={{ "--i": i } as React.CSSProperties}>
              <span className="block">{l}</span>
            </span>
          ))}
        </h1>

        <div className="mt-auto flex flex-col gap-6 pt-8 lg:mt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:pt-0">
          <p className="hero-fade max-w-[34ch] text-[1.0625rem] leading-relaxed text-ink/85 md:text-xl" style={{ "--d": "520ms" } as React.CSSProperties}>
            A social media marketing agency in Beirut. Strategy, content, community, ads and reporting for businesses of every kind.
          </p>
          <div id="hero-actions" className="hero-fade grid gap-3 sm:grid-cols-2 lg:flex lg:shrink-0" style={{ "--d": "640ms" } as React.CSSProperties}>
            <Button href="#contact" className="w-full" wrapClassName="w-full">Book a call</Button>
            <Button href="#work" variant="ghost" className="w-full" wrapClassName="w-full">See the work</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
