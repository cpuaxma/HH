/* Small authored interfaces, one per service. Illustrative UI only: no client names, no figures. */

function Frame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[14px] bg-raised p-4 text-[13px] leading-snug text-ink/80 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)] ${className}`}>
      {children}
    </div>
  );
}

export function StrategyVisual() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const plan: Record<number, string> = { 1: "Reel", 3: "Post", 5: "Story", 8: "Reel", 10: "Ad", 12: "Post", 15: "Reel", 17: "Story", 19: "Ad", 22: "Reel", 24: "Post", 26: "Story" };
  return (
    <Frame>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-ink">Content calendar</span>
        <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-ink/60">Month 1</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-ink/40">
        {days.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => {
          const tag = plan[i];
          return (
            <div key={i} className={`flex aspect-square items-end rounded-md p-1 ${tag ? (tag === "Reel" ? "bg-accent/85 text-white" : tag === "Ad" ? "bg-ember/25 text-ember" : "bg-ink/10 text-ink/80") : "bg-ink/[0.03]"}`}>
              {tag && <span className="text-[8.5px] font-medium leading-none">{tag}</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2 text-[11px]">
        {["Voice", "Goals", "Pillars"].map((t) => <span key={t} className="rounded-full bg-ink/8 px-2 py-1 text-ink/70">{t}</span>)}
      </div>
    </Frame>
  );
}

export function ContentVisual() {
  return (
    <Frame className="p-0">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_60%_40%,rgb(var(--glow)/0.55),transparent_70%),linear-gradient(160deg,#2a1610,#0e0a09)]" />
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        {Array.from({ length: 9 }, (_, i) => <span key={i} className="border-[0.5px] border-white/10" />)}
      </div>
      <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-white/80" />
        <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-white/80" />
        <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-white/80" />
        <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-white/80" />
      </div>
      <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[11px] text-white/85">
        <span className="flex items-center gap-1.5"><span className="sv-rec size-2 rounded-full bg-accent" /> REC</span>
        <span className="tabular">00:14 · 4K · 9:16</span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
        <span className="rounded-full bg-black/40 px-2 py-1 text-[11px] text-white/80">Take 3</span>
        <span className="size-11 rounded-full border-[3px] border-white/85 p-1"><span className="block size-full rounded-full bg-accent" /></span>
        <span className="rounded-full bg-black/40 px-2 py-1 text-[11px] text-white/80">1×</span>
      </div>
    </Frame>
  );
}

export function CommunityVisual() {
  return (
    <Frame className="flex flex-col">
      <div className="mb-3 flex items-center gap-2 border-b border-line pb-3">
        <span className="size-7 rounded-full bg-gradient-to-br from-ember to-accent" />
        <span className="font-medium text-ink">Messages</span>
        <span className="ml-auto rounded-full bg-accent px-1.5 text-[10px] text-white">3</span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2">
        <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-ink/10 px-3 py-2">Do you deliver to Hamra?</p>
        <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-accent px-3 py-2 text-white">We do. Send your order here and we&rsquo;ll confirm the time.</p>
        <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-ink/10 px-3 py-2">Perfect, sending it now</p>
        <div className="ml-auto flex gap-1 rounded-2xl bg-ink/10 px-3 py-2.5">
          <span className="sv-typing size-1.5 rounded-full bg-ink/60" />
          <span className="sv-typing size-1.5 rounded-full bg-ink/60 [animation-delay:150ms]" />
          <span className="sv-typing size-1.5 rounded-full bg-ink/60 [animation-delay:300ms]" />
        </div>
      </div>
    </Frame>
  );
}

export function AdsVisual() {
  return (
    <Frame className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="size-6 rounded-full bg-ink/20" />
          <div className="leading-tight"><p className="text-[12px] text-ink">Your business</p><p className="text-[10px] text-ink/50">Sponsored</p></div>
        </div>
        <div className="aspect-[4/3] bg-[radial-gradient(60%_70%_at_30%_30%,rgb(var(--glow)/0.7),transparent_70%),linear-gradient(135deg,#3a1a10,#120c0a)]" />
        <div className="flex items-center justify-between bg-ink/5 px-3 py-2 text-[12px]"><span>Book a table</span><svg viewBox="0 0 16 16" className="size-3 text-ink/50" aria-hidden><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {["Beirut", "25–44", "Food & dining", "Instagram", "TikTok"].map((c) => (
          <span key={c} className="rounded-full border border-line px-2 py-1 text-ink/70">{c}</span>
        ))}
      </div>
    </Frame>
  );
}

export function ReportVisual() {
  const bars = [32, 44, 38, 56, 50, 68, 74, 88];
  return (
    <Frame className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-medium text-ink">Monthly report</span>
        <span className="text-[11px] text-ink/50">Reach · Saves · Messages</span>
      </div>
      <div className="relative flex flex-1 items-end gap-2">
        {bars.map((h, i) => (
          <span key={i} className="sv-bar flex-1 rounded-t-md bg-gradient-to-t from-accent/40 to-accent" style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }} />
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 78 C 15 70, 25 72, 38 60 S 60 50, 70 38 S 90 20, 100 12" fill="none" stroke="#f6efe6" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeDasharray="3 3" />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        {["What worked", "What didn’t", "Next month"].map((t) => <span key={t} className="rounded-lg bg-ink/8 px-2 py-1.5 text-ink/75">{t}</span>)}
      </div>
    </Frame>
  );
}
