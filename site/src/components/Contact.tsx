"use client";
import { useState } from "react";
import { SITE, instagramHref, whatsappHref } from "@/lib/site";

const GOALS = ["More customers through the door", "More online orders", "A launch or opening", "A stronger brand", "Something else"];

type Errors = Partial<Record<"name" | "business" | "phone" | "goal", string>>;

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base font-medium text-ink/85">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-2 text-base text-[#ff8a6b]">{error}</p>}
    </div>
  );
}

const input =
  "block min-h-14 w-full rounded-2xl border bg-surface px-5 text-lg text-ink placeholder:text-ink/35 transition-[border-color,background-color] duration-200 " +
  "outline-none focus:border-accent focus:bg-raised aria-[invalid=true]:border-[#ff8a6b]";

export function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed" | "offline">("idle");
  const [sentName, setSentName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    const next: Errors = {};
    if (!data.name?.trim()) next.name = "Write your name so we know who to ask for.";
    if (!data.business?.trim()) next.business = "Write the name of your business.";
    if (!data.phone || data.phone.replace(/\D/g, "").length < 7) next.phone = "Write a number we can reach on WhatsApp, with the country code.";
    if (!data.goal) next.goal = "Pick the goal closest to yours.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(first === "goal" ? "goal-0" : `f-${first}`)?.focus();
      return;
    }
    if (!SITE.formEndpoint) { setState("offline"); return; }
    setState("sending");
    try {
      const res = await fetch(SITE.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
      setSentName(data.name.trim().split(" ")[0]);
      setState("sent");
    } catch {
      setState("failed");
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden pt-24 pb-16 md:pt-36 md:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(var(--glow)/0.32),transparent_70%)]" />
      <div className="wrap">
        <h2 id="contact-title" className="font-display text-[clamp(4.25rem,21vw,18rem)] uppercase lg:text-[min(13.4vw,26vh)]">
          Let&rsquo;s talk about your feed
        </h2>

        <div className="mt-12 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="max-w-[34ch] text-xl text-ink/80">
              Tell us about your business and we will message you on WhatsApp to book a call. Prefer to write first? Use the links below.
            </p>
            <ul className="mt-10 border-t border-line">
              {[
                { href: whatsappHref, label: "WhatsApp", value: SITE.whatsappNumber },
                { href: instagramHref, label: "Instagram", value: `@${SITE.instagramHandle}` },
              ].map((l) => (
                <li key={l.label} className="border-b border-line">
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex min-h-16 items-center justify-between gap-4 py-4">
                    <span>
                      <span className="font-display block text-4xl uppercase transition-colors duration-200 group-hover:text-accent md:text-5xl">{l.label}</span>
                      <span className="block text-base text-ink/55">{l.value}</span>
                    </span>
                    <svg aria-hidden viewBox="0 0 16 16" className="size-5 shrink-0 transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {state === "sent" ? (
              <div role="status" className="rounded-3xl border border-line bg-surface p-8 md:p-12">
                <p className="font-display text-6xl uppercase">Request in</p>
                <p className="mt-4 max-w-[38ch] text-xl text-ink/80">Thanks, {sentName}. Your call request is with us. We will message you on WhatsApp to pick a time.</p>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} className="grid gap-6" aria-describedby="form-note">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field id="f-name" label="Your name" error={errors.name}>
                    <input id="f-name" name="name" type="text" autoComplete="name" autoCapitalize="words" enterKeyHint="next" className={input + " border-line"} aria-invalid={!!errors.name} aria-describedby={errors.name ? "f-name-error" : undefined} />
                  </Field>
                  <Field id="f-business" label="Business" error={errors.business}>
                    <input id="f-business" name="business" type="text" autoComplete="organization" autoCapitalize="words" enterKeyHint="next" className={input + " border-line"} aria-invalid={!!errors.business} aria-describedby={errors.business ? "f-business-error" : undefined} />
                  </Field>
                </div>
                <Field id="f-phone" label="WhatsApp number" error={errors.phone}>
                  <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="+961" className={input + " border-line"} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "f-phone-error" : undefined} />
                </Field>
                <fieldset aria-describedby={errors.goal ? "goal-error" : undefined}>
                  <legend className="mb-3 text-base font-medium text-ink/85">Your goal</legend>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((g, i) => (
                      <label key={g} className="goal-chip relative">
                        <input id={`goal-${i}`} type="radio" name="goal" value={g} className="peer sr-only" />
                        <span className="flex min-h-12 cursor-pointer items-center rounded-full border border-line px-5 text-base text-ink/80 transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-hot [@media(hover:hover)]:hover:border-ink/40">
                          {g}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.goal && <p id="goal-error" className="mt-2 text-base text-[#ff8a6b]">{errors.goal}</p>}
                </fieldset>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" disabled={state === "sending"} className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-accent px-8 text-[1.0625rem] font-medium text-white transition-[transform,background-color,opacity] duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] disabled:opacity-60 sm:w-auto [@media(hover:hover)]:hover:bg-accent-hot">
                    {state === "sending" ? "Sending…" : "Book a call"}
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-200 group-hover:translate-x-1"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <p id="form-note" className="text-sm text-ink/55">We only use your number to arrange the call.</p>
                </div>
                {state === "failed" && <p role="alert" className="text-base text-[#ff8a6b]">That did not send. Check your connection and try again, or message us on WhatsApp.</p>}
                {state === "offline" && <p role="alert" className="text-base text-[#ff8a6b]">[This form is not connected yet.] Message us on WhatsApp in the meantime.</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
