import {useCurrentFrame} from 'remotion';
import {CARD_COLORS, COLORS, COLUMN, COPY, COURSE_FORMAT, MODULES, SAFE, TIMING, lockFrame} from '../data';
import {SANS, SERIF} from '../fonts';
import {easeIn, easeInOut, easeOut, easeOutQuint, ramp, springAt} from '../lib/timeline';

const C = CARD_COLORS;
const BOTTOM = 1920 - SAFE.bottom - 24;

/** Card timing, relative to its tile's lock frame. */
export const CARD = {in: -6, inLen: 22, out: 96, outLen: 18};

/** 6–18s: course progress (gold bar, %), and the course format as gold-outlined chips. */
export const CourseHud: React.FC = () => {
  const frame = useCurrentFrame();
  const a = TIMING.courseStart - 6;
  const end = TIMING.benefitsStart - 8;
  if (frame < a || frame > end + 24) return null;
  const inP = ramp(frame, a, a + 22, easeOutQuint);
  const out = ramp(frame, end, end + 20, easeIn);
  // Progress fills a quarter as each tile locks.
  let progress = 0;
  MODULES.forEach((_, i) => {
    progress += ramp(frame, lockFrame(i), lockFrame(i) + 16, easeOut) / MODULES.length;
  });
  const pct = Math.round(progress * 100);
  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: COLUMN.width,
        top: SAFE.top + 22,
        fontFamily: SANS,
        opacity: Math.min(1, inP * 1.5) * (1 - out),
        transform: `translateY(${(1 - inP) * -50 - out * 30}px)`,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{fontSize: 26, fontWeight: 700, letterSpacing: 4, color: COLORS.body, textTransform: 'uppercase'}}>{COPY.courseEyebrow}</div>
        <div style={{fontSize: 40, fontWeight: 800, color: COLORS.gold, fontVariantNumeric: 'tabular-nums'}}>{pct}%</div>
      </div>
      <div style={{display: 'flex', gap: 10, marginTop: 14}}>
        {MODULES.map((_, i) => {
          const fill = ramp(frame, lockFrame(i), lockFrame(i) + 16, easeOut);
          const flash = Math.exp(-Math.max(0, frame - lockFrame(i)) / 10) * (frame >= lockFrame(i) ? 1 : 0);
          return (
            <div key={i} style={{flex: 1, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.14)', overflow: 'hidden'}}>
              <div
                style={{
                  width: `${fill * 100}%`,
                  height: '100%',
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                  boxShadow: `0 0 ${10 + 20 * flash}px rgba(241,217,160,${0.4 + 0.5 * flash})`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap'}}>
        {COURSE_FORMAT.map((chip, i) => {
          const p = ramp(frame, a + 12 + i * 6, a + 30 + i * 6, easeOut);
          return (
            <div
              key={i}
              style={{
                border: `2px solid ${COLORS.gold}`,
                color: COLORS.goldLight,
                borderRadius: 999,
                padding: '10px 22px',
                fontSize: 26,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                opacity: p,
                transform: `translateY(${(1 - p) * 12}px)`,
                background: 'rgba(217,178,106,0.08)',
              }}
            >
              {chip}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{index: number; rel: number}> = ({index, rel}) => {
  const m = MODULES[index];
  const inP = ramp(rel, CARD.in, CARD.in + CARD.inLen, easeOutQuint);
  const outP = ramp(rel, CARD.out, CARD.out + CARD.outLen, easeIn);
  const badge = springAt(rel, CARD.in + 4, 26, 0.45);
  const reveal = (d: number) => {
    const p = ramp(rel, CARD.in + d, CARD.in + d + 16, easeOut);
    return {opacity: p, transform: `translateY(${(1 - p) * 14}px)`};
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
        boxShadow: '0 30px 70px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.18)',
        padding: '30px 36px 32px',
        boxSizing: 'border-box',
        fontFamily: SANS,
        borderTop: `6px solid ${COLORS.gold}`,
        transform: `translateY(${(1 - inP) * 560 + outP * 600}px)`,
        opacity: Math.min(1, inP * 2) * (1 - outP * 0.5),
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <div
          style={{
            width: 104,
            height: 104,
            flexShrink: 0,
            borderRadius: 24,
            background: COLORS.navy,
            color: COLORS.gold,
            fontFamily: SERIF,
            fontSize: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${badge})`,
          }}
        >
          {number}
        </div>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.meta, ...reveal(4)}}>
            MODULE {index + 1} OF {MODULES.length}
          </div>
          <div style={{fontFamily: SERIF, fontSize: 50, lineHeight: 1.04, color: C.heading, marginTop: 8, textWrap: 'balance', ...reveal(7)}}>{m.title}</div>
        </div>
      </div>
      <div style={{height: 1, background: C.divider, margin: '24px 0 20px'}} />
      <div style={{fontSize: 32, fontWeight: 500, lineHeight: 1.34, color: C.text, textWrap: 'pretty', ...reveal(11)}}>{m.learn}</div>
    </div>
  );
};

/** One card per module, sliding up as its tile locks in. */
export const ModuleCards: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {MODULES.map((_, i) => {
        const rel = frame - lockFrame(i);
        if (rel < CARD.in - 1 || rel > CARD.out + CARD.outLen + 1) return null;
        return <ModuleCard key={i} index={i} rel={rel} />;
      })}
    </>
  );
};

/** Once all four lock in and flip back: the payoff line under the certificate. */
export const Payoff: React.FC = () => {
  const frame = useCurrentFrame();
  const a = TIMING.sealStamp - 8;
  const out = ramp(frame, TIMING.benefitsStart - 10, TIMING.benefitsStart + 10, easeIn);
  if (frame < a || out >= 1) return null;
  const [l1, l2] = COPY.coursePayoff;
  const line = (d: number) => {
    const p = ramp(frame, a + d, a + d + 16, easeOut);
    return {opacity: p * (1 - out), transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`};
  };
  return (
    <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: 1300, textAlign: 'center', fontFamily: SERIF, fontSize: 66, lineHeight: 1.08}}>
      <div style={{color: COLORS.headline, ...line(0)}}>{l1}</div>
      <div style={{color: COLORS.gold, ...line(8)}}>{l2}</div>
      <div
        style={{
          margin: '18px auto 0',
          height: 4,
          borderRadius: 2,
          width: `${60 * ramp(frame, a + 14, a + 34, easeInOut)}%`,
          background: `linear-gradient(90deg, rgba(217,178,106,0), ${COLORS.gold}, rgba(217,178,106,0))`,
          opacity: 1 - out,
        }}
      />
    </div>
  );
};
