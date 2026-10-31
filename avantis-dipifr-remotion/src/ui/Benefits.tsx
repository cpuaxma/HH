import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BENEFITS, BRAND, BenefitIcon, CARD_COLORS, COLUMN, COPY, SAFE, TIMING} from '../data';
import {SANS, SERIF} from '../fonts';
import {easeIn, easeOut, ramp} from '../lib/timeline';

const C = CARD_COLORS;
const BOTTOM = 1920 - SAFE.bottom - 24;

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
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </>
  ),
};

/** 21–26s: why DipIFR, as three quick cards under the globe. */
export const Benefits: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = TIMING.benefitsIn;
  if (frame < a - 1 || frame > TIMING.benefitsOut + 60) return null;
  const head = (d: number) => {
    const p = ramp(frame, a + d, a + d + 22, easeOut);
    const o = ramp(frame, TIMING.benefitsOut, TIMING.benefitsOut + 22, easeIn);
    return {opacity: p * (1 - o), transform: `translateY(${(1 - p) * 26 - o * 20}px)`};
  };
  return (
    <>
      <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: SAFE.top + 24, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 25, color: C.meta, ...head(0)}}>{COPY.benefitsEyebrow}</div>
        <div style={{fontFamily: SERIF, textWrap: 'balance', fontSize: 82, lineHeight: 1.05, color: C.heading, marginTop: 10, ...head(5)}}>{COPY.benefitsTitle}</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: COLUMN.x,
          width: COLUMN.width,
          bottom: 1920 - BOTTOM,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {BENEFITS.map((b, i) => {
          const at = a + 18 + i * TIMING.benefitGap;
          const pop = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 150, mass: 0.8}});
          const icon = spring({frame: frame - at - 8, fps, config: {damping: 10, stiffness: 180, mass: 0.6}});
          const outAt = TIMING.benefitsOut + i * 4;
          const out = ramp(frame, outAt, outAt + 20, easeIn);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: C.card,
                borderRadius: 24,
                padding: '24px 30px',
                boxShadow: '0 22px 50px rgba(20,25,45,0.14), 0 4px 12px rgba(20,25,45,0.06)',
                fontFamily: SANS,
                opacity: Math.min(1, pop * 1.5) * (1 - out),
                transform: `translateY(${(1 - pop) * 90 + out * 60}px) scale(${0.94 + 0.06 * pop})`,
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: BRAND.navySoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${icon})`,
                }}
              >
                <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={BRAND.navy} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[b.icon]}
                </svg>
              </div>
              <div style={{minWidth: 0}}>
                <div style={{fontFamily: SERIF, textWrap: 'balance', fontSize: 40, lineHeight: 1.08, color: C.heading}}>{b.title}</div>
                <div style={{fontSize: 25, fontWeight: 500, lineHeight: 1.35, color: C.text, marginTop: 6, textWrap: 'balance'}}>{b.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
