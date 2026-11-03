// THE BREAKDOWN: three numbered callout cards, one per camera angle, each with a thin
// leader line to the part of the hero post it explains. The leader's end is projected from
// the 3D post every frame, so it stays locked on while the camera drifts.
import {useCurrentFrame} from 'remotion';
import {BRAND, CALLOUTS, COLUMN, T} from '../data';
import {TEXT} from '../fonts';
import {clamp01, easeIn, easeInOut, easeOut, ramp, springAt} from '../lib/ease';
import {projectHeroPoint} from '../lib/shots';
import {HERO_TARGETS} from '../three/feedTextures';
import {inWindows, MotionBlurLayer} from './MotionBlur';

/** Card top (frame px): clear of the post's targets above, and of Instagram's bottom zone. */
export const CARD_TOP = 1150;

const Callout: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const at = T.calloutAt[i];
  const end = at + T.calloutHold;
  if (f < at - 0.5 || f > end + 14) return null;
  const c = CALLOUTS[i];
  const pop = springAt(f, at, 0.36, 0.55);
  const op = ramp(f, at, at + 5, easeOut);
  const exit = ramp(f, end, end + 12, easeIn);
  const draw = ramp(f, at + 8, at + 24, easeInOut);
  const dot = springAt(f, at + 20, 0.45, 0.45);
  const pulse = ramp(f, at + 22, at + 58, easeOut);

  const [tx, ty] = projectHeroPoint(f, ...HERO_TARGETS[i]);
  const ax = Math.min(COLUMN.x + COLUMN.width - 80, Math.max(COLUMN.x + 80, tx));
  const ay = CARD_TOP + 10;
  const ex = ax + (tx - ax) * draw;
  const ey = ay + (ty - ay) * draw;
  const fade = op * (1 - exit);

  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - exit, overflow: 'visible'}}>
        {draw > 0 ? (
          <>
            <line x1={ax} y1={ay} x2={ex} y2={ey} stroke="rgba(255,255,255,0.9)" strokeWidth={8} strokeLinecap="round" />
            <line x1={ax} y1={ay} x2={ex} y2={ey} stroke={BRAND.ink} strokeWidth={3} strokeLinecap="round" />
          </>
        ) : null}
        {dot > 0 ? (
          <g transform={`translate(${tx} ${ty}) scale(${dot})`}>
            <circle r={16 + 40 * pulse} fill="none" stroke={BRAND.glow} strokeWidth={3} opacity={(1 - pulse) * 0.8 * (pulse > 0 ? 1 : 0)} />
            <circle r={16} fill="#FFFFFF" stroke={BRAND.ink} strokeWidth={3} />
            <circle r={6.5} fill={BRAND.red} />
          </g>
        ) : null}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: COLUMN.x,
          top: CARD_TOP,
          width: COLUMN.width,
          boxSizing: 'border-box',
          padding: '34px 42px 40px',
          borderRadius: 34,
          background: '#FFFFFF',
          boxShadow: '0 30px 70px rgba(40,25,10,0.16), 0 6px 18px rgba(40,25,10,0.08)',
          fontFamily: TEXT,
          opacity: fade,
          transform: `translateY(${(1 - pop) * 70 + exit * 50}px) scale(${0.92 + 0.08 * clamp01(pop) + 0.0 * exit})`,
          transformOrigin: '50% 0%',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 6, fontWeight: 800, fontSize: 28, letterSpacing: 1}}>
            <span style={{color: BRAND.red}}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{color: BRAND.meta, fontWeight: 600}}>/ {String(CALLOUTS.length).padStart(2, '0')}</span>
          </div>
          <div style={{color: BRAND.meta, fontWeight: 700, fontSize: 21, letterSpacing: 3}}>WHY IT STOPPED THE SCROLL</div>
        </div>
        <div style={{color: BRAND.ink, fontWeight: 800, fontSize: 60, lineHeight: 1.06, letterSpacing: -1.6}}>{c.title}</div>
        <div style={{color: BRAND.text, fontWeight: 500, fontSize: 36, lineHeight: 1.34, marginTop: 14}}>{c.body}</div>
      </div>
    </>
  );
};

const MOVING = inWindows(T.calloutAt.flatMap((at) => [[at - 1, at + 30] as [number, number], [at + T.calloutHold - 1, at + T.calloutHold + 14] as [number, number]]));

export const Callouts: React.FC = () => (
  <MotionBlurLayer moving={MOVING} samples={8}>
    {CALLOUTS.map((_, i) => (
      <Callout key={i} i={i} />
    ))}
  </MotionBlurLayer>
);
