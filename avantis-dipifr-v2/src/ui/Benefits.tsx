import {useCurrentFrame} from 'remotion';
import {BENEFITS, BenefitIcon, COLORS, COLUMN, SAFE, TIMING} from '../data';
import {SANS, SERIF} from '../fonts';
import {easeIn, easeOut, ramp, springAt} from '../lib/timeline';

const ICONS: Record<BenefitIcon, React.ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 13.8 7 21l5-2.6 5 2.6-1.5-7.2" />
      <path d="m9.6 9 1.6 1.6L14.6 7.4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="m7.5 15 4-4 3 3 5-6" />
    </>
  ),
  book: <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z" />,
};

/** 18–24s: three fast, near-fullscreen beats: a big gold icon, 3–5 big words, one small line. */
export const Benefits: React.FC = () => {
  const frame = useCurrentFrame();
  const L = TIMING.benefitLength;
  // Each later beat starts a few frames before its beat, so its build lands on the beat and no frame is empty.
  const LEAD = 6;
  const startOf = (k: number) => TIMING.benefitsStart + k * L - (k > 0 ? LEAD : 0);
  if (frame < startOf(0) || frame > TIMING.endStart + 16) return null;
  let i = 0;
  while (i < BENEFITS.length - 1 && frame >= startOf(i + 1)) i++;
  const b = BENEFITS[i];
  const r = frame - startOf(i);
  // Enter from the right, leave to the left just before the next beat (the last one leaves with the end card's sweep).
  const inP = ramp(r, 0, 14, easeOut);
  const last = i === BENEFITS.length - 1;
  const span = last ? 0 : startOf(i + 1) - startOf(i);
  const out = last ? ramp(frame, TIMING.endStart - 4, TIMING.endStart + 14, easeIn) : ramp(r, span - 12, span, easeIn);
  const icon = springAt(r, 2, 26, 0.5);
  const ring = ramp(r, 4, 40, easeOut);
  const lines = b.words.split('|').map((s) => s.trim());
  const words = lines.map((l) => l.split(' '));
  let k = 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: COLUMN.width,
        top: SAFE.top,
        height: 1920 - SAFE.top - SAFE.bottom,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transform: `translateX(${(1 - inP) * 160 - out * 220}px)`,
        opacity: Math.min(1, inP * 1.4) * (1 - out),
        filter: out > 0.01 ? `blur(${out * 10}px)` : inP < 0.99 ? `blur(${(1 - inP) * 8}px)` : undefined,
      }}
    >
      <div style={{fontFamily: SANS, fontSize: 28, fontWeight: 700, letterSpacing: 6, color: COLORS.gold, marginBottom: 46}}>
        {String(i + 1).padStart(2, '0')} / {String(BENEFITS.length).padStart(2, '0')}
      </div>
      <div style={{position: 'relative', width: 230, height: 230}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `3px solid ${COLORS.gold}`,
            transform: `scale(${1 + ring * 0.45})`,
            opacity: (1 - ring) * 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(217,178,106,0.28), rgba(217,178,106,0.06))',
            border: `3px solid ${COLORS.gold}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${icon})`,
            boxShadow: '0 0 60px rgba(217,178,106,0.25)',
          }}
        >
          <svg width={128} height={128} viewBox="0 0 24 24" fill="none" stroke={COLORS.goldLight} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            {ICONS[b.icon]}
          </svg>
        </div>
      </div>
      <div style={{fontFamily: SERIF, fontSize: 120, lineHeight: 1.0, marginTop: 64}}>
        {words.map((ws, li) => (
          <div key={li} style={{whiteSpace: 'nowrap', color: li === words.length - 1 ? COLORS.gold : COLORS.headline}}>
            {ws.map((w, wi) => {
              const at = 6 + 5 * k++;
              const p = springAt(r, at, 20, 0.4);
              const o = ramp(r, at, at + 6, easeOut);
              return (
                <span key={wi} style={{display: 'inline-block', margin: '0 0.11em', opacity: o, transform: `scale(${1.7 - 0.7 * p})`, filter: o < 0.99 ? `blur(${(1 - o) * 8}px)` : undefined}}>
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 34,
          fontWeight: 500,
          lineHeight: 1.35,
          color: COLORS.body,
          marginTop: 40,
          textWrap: 'balance',
          opacity: ramp(r, 26, 42, easeOut),
          transform: `translateY(${(1 - ramp(r, 26, 42, easeOut)) * 16}px)`,
        }}
      >
        {b.line}
      </div>
    </div>
  );
};
