"use client";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Button } from "./Button";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
];

function Logo() {
  return (
    <a href="#top" className="relative z-10 -m-2 block p-2 transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]" aria-label="Hot Pepper Media, back to top">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.png" alt="Hot Pepper Media" width={737} height={508} className="h-12 w-auto md:h-14" />
    </a>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [barOn, setBarOn] = useState(false);
  const lenis = useLenis();
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The phone bar stays away from screens that already show a booking button ([data-cta]).
  useEffect(() => {
    const watched = Array.from(document.querySelectorAll("[data-cta]"));
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      setBarOn(![...seen.values()].some(Boolean) && window.scrollY > 200);
    });
    watched.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      firstLink.current?.focus();
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) { setOpen(false); menuBtn.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  return (
    <>
      <a href="#main" className="fixed left-4 top-4 z-[90] -translate-y-24 rounded-full bg-ink px-5 py-3 font-medium text-bg focus:translate-y-[var(--safe-t)]">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[var(--safe-t)] transition-[background-color,border-color] duration-300 ease-[var(--ease-out)] ${
          scrolled && !open ? "border-b border-line bg-bg/88 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between md:h-20">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-10 lg:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="group relative py-2 text-[1.0625rem] text-ink/80 transition-colors duration-200 hover:text-ink">
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          <div className="hidden lg:block">
            <Button href="#contact" className="min-h-12 px-6">Book a call</Button>
          </div>
          <button
            ref={menuBtn}
            type="button"
            className="relative z-10 -mr-2 flex size-12 items-center justify-center rounded-full transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.94] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3.5 w-7">
              <span className={`absolute left-0 top-0 h-0.5 w-7 rounded bg-ink transition-transform duration-300 ease-[var(--ease-out)] ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-0.5 rounded bg-ink transition-[transform,width] duration-300 ease-[var(--ease-out)] ${open ? "w-7 -translate-y-[6px] -rotate-45" : "w-5"}`} />
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 flex flex-col bg-bg pt-[calc(var(--safe-t)+5rem)] pb-[calc(var(--safe-b)+1.5rem)] lg:hidden"
        style={{
          clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          transition: `clip-path ${open ? 520 : 320}ms var(--ease-drawer)`,
          visibility: open ? "visible" : "hidden",
          transitionProperty: "clip-path, visibility",
          transitionDelay: open ? "0ms, 0ms" : "0ms, 320ms",
        }}
        aria-hidden={!open}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_80%_0%,rgb(var(--glow)/0.28),transparent_70%)]" />
        <nav aria-label="Menu" className="wrap relative flex flex-1 flex-col justify-center">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              ref={i === 0 ? firstLink : undefined}
              href={l.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="font-display block border-b border-line py-3 text-[clamp(3.5rem,17vw,6rem)] uppercase transition-[opacity,transform] duration-500 ease-[var(--ease-out)] active:text-accent"
              style={{ opacity: open ? 1 : 0, transform: open ? "none" : "translateY(24px)", transitionDelay: open ? `${120 + i * 50}ms` : "0ms" }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="wrap relative">
          <Button href="#contact" className="w-full" wrapClassName="w-full" magnetic={false} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
            Book a call
          </Button>
        </div>
      </div>

      {/* Phone action bar: thumb height, clear of the home indicator. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(var(--safe-b)+0.75rem)] pt-3 lg:hidden"
        style={{
          transform: barOn && !open ? "translateY(0)" : "translateY(120%)",
          transition: "transform 380ms var(--ease-drawer)",
          background: "linear-gradient(to top, rgb(11 9 8 / 0.95) 55%, transparent)",
        }}
      >
        <Button href="#contact" className="w-full" magnetic={false} tabIndex={barOn ? 0 : -1}>
          Book a call
        </Button>
      </div>
    </>
  );
}
