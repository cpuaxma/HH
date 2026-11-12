/* Placeholder reels: CSS-only loops that stand in for real client videos. Each is clearly badged. */

export const REELS = [
  { id: "pour", kind: "Café reel" },
  { id: "launch", kind: "Product launch" },
  { id: "wipe", kind: "Before and after" },
  { id: "type", kind: "Offer reel" },
  { id: "bts", kind: "Behind the scenes" },
  { id: "count", kind: "Event countdown" },
] as const;

function Pour() {
  return (
    <div className="absolute inset-0 bg-[#1a0f0a]">
      <div className="absolute left-1/2 top-[44%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#c98b55_0%,#7a4a2a_55%,#3b2214_70%)] shadow-[0_0_0_10px_#efe6da,0_30px_60px_-10px_rgb(0_0_0/0.8)]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="reel-ring absolute inset-[30%] rounded-full border-[6px] border-[#f3e3cc]/85" style={{ animationDelay: `${i * 1.1}s` }} />
        ))}
      </div>
    </div>
  );
}

function Launch() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0d0807]">
      <div className="reel-sweep absolute -inset-1/2 bg-[conic-gradient(from_0deg,transparent,rgb(var(--glow)/0.55),transparent_35%)]" />
      <div className="absolute left-1/2 top-[42%] aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffd2b8,#e23b24_45%,#5a0d05_80%)] shadow-[0_40px_80px_-20px_rgb(226_59_36/0.6)]" />
      <p className="reel-pop font-display absolute inset-x-0 bottom-[22%] text-center text-[3.4em] uppercase text-white">New</p>
    </div>
  );
}

function Wipe() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#5a5652,#2f2c2a)]">
        <span className="absolute left-4 top-16 rounded bg-black/50 px-2 py-0.5 text-[0.75em] text-white/80">BEFORE</span>
      </div>
      <div className="reel-wipe absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,#ff7a1a,#e23b24_45%,#3a0a05)]">
        <span className="absolute right-4 top-16 rounded bg-black/40 px-2 py-0.5 text-[0.75em] text-white">AFTER</span>
      </div>
      <span className="reel-wipe-line absolute inset-y-0 w-0.5 bg-white" />
    </div>
  );
}

function Type() {
  const words = ["This", "week", "only"];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-accent">
      {words.map((w, i) => (
        <span key={w} className="reel-word font-display absolute text-[4.2em] uppercase text-white" style={{ animationDelay: `${i * 1}s` }}>{w}</span>
      ))}
    </div>
  );
}

function Bts() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#120c0a]">
      <span className="reel-blob absolute left-[10%] top-[20%] size-[55%] rounded-full bg-[#ff7a1a]/45 blur-2xl" />
      <span className="reel-blob absolute bottom-[18%] right-[5%] size-[60%] rounded-full bg-[#e23b24]/50 blur-2xl [animation-delay:-2s]" />
      <div className="absolute inset-[12%] border border-white/20" />
      <span className="absolute left-[12%] top-[12%] -translate-x-px -translate-y-px">
        <span className="block h-4 w-4 border-l-2 border-t-2 border-white" />
      </span>
      <div className="absolute inset-x-0 bottom-[26%] flex items-center justify-center gap-2 text-[0.8em] text-white">
        <span className="sv-rec size-2 rounded-full bg-accent" /> REC 00:32
      </div>
    </div>
  );
}

function Count() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0d0807]">
      <svg viewBox="0 0 100 100" className="absolute size-[70%] -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgb(246 239 230 / 0.12)" strokeWidth="3" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#e23b24" strokeWidth="3" strokeLinecap="round" pathLength={100} className="reel-ring-progress" />
      </svg>
      {["3", "2", "1"].map((n, i) => (
        <span key={n} className="reel-num font-display tabular absolute text-[6em] text-white" style={{ animationDelay: `${i * 1}s` }}>{n}</span>
      ))}
    </div>
  );
}

const SCENES = { pour: Pour, launch: Launch, wipe: Wipe, type: Type, bts: Bts, count: Count };

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.6em]" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Phone({ reel }: { reel: (typeof REELS)[number] }) {
  const Scene = SCENES[reel.id];
  return (
    <div className="phone relative aspect-[9/19.5] h-full select-none rounded-[2.6em] bg-[#1b1715] p-[0.55em] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9),inset_0_0_0_1px_rgb(255_255_255/0.08)]">
      <div className="relative h-full w-full overflow-hidden rounded-[2.1em] bg-black text-white">
        <Scene />
        {/* Story-style progress, status bar and island. */}
        <div className="absolute inset-x-[0.9em] top-[2.6em] h-[3px] overflow-hidden rounded bg-white/25">
          <span className="reel-progress block h-full bg-white" />
        </div>
        <div className="absolute inset-x-0 top-0 flex h-[2.2em] items-center justify-between px-[1.4em] text-[0.72em] font-medium">
          <span className="tabular">9:41</span>
          <span className="flex gap-1"><span className="h-2 w-3 rounded-sm bg-white/90" /></span>
        </div>
        <span className="absolute left-1/2 top-[0.5em] h-[1.4em] w-[32%] -translate-x-1/2 rounded-full bg-black" />

        <div className="absolute bottom-[5.2em] right-[0.8em] flex flex-col items-center gap-[1.1em] text-white/95">
          <Icon d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
          <Icon d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />
          <Icon d="M21 4 10 15M21 4l-7 17-4-6-6-4 17-7Z" />
        </div>
        <div className="absolute inset-x-[0.9em] bottom-[1.3em] text-[0.8em]">
          <span className="mb-[0.5em] inline-flex rounded-full bg-white px-[0.7em] py-[0.15em] text-[0.85em] font-semibold uppercase tracking-wide text-black">Placeholder</span>
          <p className="font-semibold">@[client_handle]</p>
          <p className="text-white/75">{reel.kind}</p>
        </div>
      </div>
    </div>
  );
}
