import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, CARD_COLORS, COLUMN, COPY, COURSE_FORMAT, MODULES, SAFE, TIMING, arrivalFrame} from '../data';
import {SANS, SERIF} from '../fonts';
import {departFrame, easeIn, easeInOut, easeOut, easeOutQuint, ramp} from '../lib/timeline';

const C = CARD_COLORS;
const BOTTOM = 1920 - SAFE.bottom - 24;

/** Card timing, relative to the stop's arrival frame. A card leaves soon after the journey moves on. */
export const CARD = {inFrom: -8, inTo: 18, outFrom: 112, outTo: 132, afterDepart: 24};

const cardOut = (i: number) => Math.min(CARD.outFrom, departFrame(i) - arrivalFrame(i) + CARD.afterDepart);

const Check: React.FC = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" style={{flexShrink: 0}}>
    <circle cx="12" cy="12" r="11" fill={BRAND.navy} />
    <path d="M7 12.5 L10.5 16 L17 9" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 9–21s: the course format, in a banner over the journey. */
export const CourseBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const a = TIMING.journeyStart - 20;
  const b = arrivalFrame(MODULES.length - 1) + CARD.outFrom;
  if (frame < a - 1 || frame > b + 30) return null;
  const inP = ramp(frame, a, a + 24, easeOutQuint);
  const out = ramp(frame, b, b + 22, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        top: SAFE.top + 22,
        width: COLUMN.width,
        boxSizing: 'border-box',
        padding: '24px 28px 26px',
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 26,
        boxShadow: '0 22px 50px rgba(20,25,45,0.14), 0 4px 12px rgba(20,25,45,0.06)',
        fontFamily: SANS,
        opacity: Math.min(1, inP * 1.6) * (1 - out),
        transform: `translateY(${(1 - inP) * -60 - out * 40}px)`,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.meta, textTransform: 'uppercase'}}>{COPY.courseEyebrow}</div>
        <div style={{fontSize: 22, fontWeight: 600, color: C.meta}}>{MODULES.length} modules</div>
      </div>
      <div style={{height: 1, background: C.divider, margin: '18px 0 18px'}} />
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 18px'}}>
        {COURSE_FORMAT.map((item, i) => {
          const p = ramp(frame, a + 10 + i * 6, a + 28 + i * 6, easeOut);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', opacity: p, transform: `translateY(${(1 - p) * 10}px)`}}>
              <Check />
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{index: number; rel: number}> = ({index, rel}) => {
  const {fps} = useVideoConfig();
  const m = MODULES[index];
  const inP = ramp(rel, CARD.inFrom, CARD.inTo, easeOutQuint);
  const outP = ramp(rel, cardOut(index), cardOut(index) + CARD.outTo - CARD.outFrom, easeIn);
  const badge = spring({frame: rel - CARD.inFrom - 6, fps, config: {damping: 12, stiffness: 170, mass: 0.7}});
  const reveal = (d: number) => {
    const p = ramp(rel, CARD.inFrom + d, CARD.inFrom + d + 18, easeOut);
    return {opacity: p, transform: `translateY(${(1 - p) * 16}px)`};
  };
  const number = String(index + 1).padStart(2, '0');
  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: COLUMN.width,
        bottom: 1920 - BOTTOM,
        background: C.card,
        borderRadius: 28,
        boxShadow: '0 30px 70px rgba(20,25,45,0.18), 0 6px 18px rgba(20,25,45,0.08)',
        padding: '32px 36px 30px',
        boxSizing: 'border-box',
        fontFamily: SANS,
        transform: `translateY(${(1 - inP) * 640 + outP * 660}px)`,
        opacity: Math.min(1, inP * 2) * (1 - outP * 0.6),
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <div
          style={{
            width: 104,
            height: 104,
            flexShrink: 0,
            borderRadius: 24,
            background: BRAND.navy,
            color: '#fff',
            fontFamily: SERIF,
            textWrap: 'balance',
            fontSize: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${badge})`,
            boxShadow: '0 10px 22px rgba(11,35,81,0.3)',
          }}
        >
          {number}
        </div>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.meta, ...reveal(4)}}>
            MODULE {index + 1} OF {MODULES.length}
          </div>
          <div style={{fontFamily: SERIF, textWrap: 'balance', fontSize: 50, lineHeight: 1.04, color: C.heading, marginTop: 8, ...reveal(8)}}>{m.title}</div>
        </div>
      </div>
      <div style={{height: 1, background: C.divider, margin: '26px 0 22px'}} />
      <div style={{fontSize: 20, fontWeight: 700, letterSpacing: 2.5, color: C.meta, ...reveal(12)}}>WHAT YOU&apos;LL LEARN</div>
      <div style={{fontSize: 31, fontWeight: 500, lineHeight: 1.36, color: C.text, marginTop: 8, textWrap: 'pretty', ...reveal(15)}}>{m.learn}</div>
      {/* Progress through the course */}
      <div style={{display: 'flex', gap: 10, marginTop: 26}}>
        {MODULES.map((_, k) => {
          const fill = k < index ? 1 : k === index ? ramp(rel, 10, 46, easeInOut) : 0;
          return (
            <div key={k} style={{flex: 1, height: 8, borderRadius: 4, background: C.divider, overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 4, background: BRAND.navy}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** One card per module, sliding up as the journey arrives at its stop. */
export const ModuleCards: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {MODULES.map((_, i) => {
        const rel = frame - arrivalFrame(i);
        if (rel < CARD.inFrom - 1 || rel > cardOut(i) + CARD.outTo - CARD.outFrom + 1) return null;
        return <ModuleCard key={i} index={i} rel={rel} />;
      })}
    </>
  );
};
