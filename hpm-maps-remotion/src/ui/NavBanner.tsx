import {useCurrentFrame} from 'remotion';
import {BRAND, BUSINESSES, SAFE, arrivalFrame, travelStartFrame, COLUMN} from '../data';
import {FONT} from '../fonts';
import {getCity} from '../lib/city';
import {easeIn, easeOutQuint, headS, ramp} from '../lib/timeline';

const W = COLUMN.width;

const Arrow: React.FC<{turn: 'left' | 'right' | 'straight'}> = ({turn}) => (
  <svg width={78} height={78} viewBox="0 0 64 64" style={{transform: turn === 'left' ? 'scaleX(-1)' : undefined}}>
    {turn === 'straight' ? (
      <>
        <path d="M32 56 V22" stroke="#fff" strokeWidth={7.5} strokeLinecap="round" fill="none" />
        <path d="M18 27 L32 9 L46 27 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth={2} />
      </>
    ) : (
      <>
        <path d="M18 56 V34 Q18 24 28 24 H42" stroke="#fff" strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M40 10 L56 24 L40 38 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth={2} />
      </>
    )}
  </svg>
);

const Flag: React.FC = () => (
  <svg width={70} height={70} viewBox="0 0 64 64">
    <path d="M32 58 C32 58 14 40 14 26 A18 18 0 0 1 50 26 C50 40 32 58 32 58 Z" fill="#fff" />
    <circle cx={32} cy={26} r={7} fill={BRAND.navGreen} />
  </svg>
);

const formatDistance = (m: number) => {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.max(0, Math.round(m / 10) * 10)} m`;
};

/** First frame at which the head is within 5 m of stop i. */
const arrivedAt = (i: number) => {
  const {stopS} = getCity();
  for (let f = travelStartFrame(i); f <= arrivalFrame(i); f++) {
    if (stopS[i] - headS(f) < 5) return f;
  }
  return arrivalFrame(i);
};

/** Turn-by-turn banner at the top while travelling into a stop. */
export const NavBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const city = getCity();
  const {stopS} = getCity();

  return (
    <>
      {BUSINESSES.map((b, i) => {
        const start = travelStartFrame(i);
        const end = arrivalFrame(i) + 92;
        if (frame < start - 1 || frame > end + 1) return null;
        const inP = ramp(frame, start, start + 18, easeOutQuint);
        const outP = ramp(frame, end - 16, end, easeIn);
        const remaining = stopS[i] - headS(frame);
        const at = arrivedAt(i);
        const arrived = ramp(frame, at - 3, at + 5);
        const {turn} = city.approach[i];
        const verb = turn === 'straight' ? 'Continue on' : `Turn ${turn} onto`;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: COLUMN.x,
              top: SAFE.top + 22,
              width: W,
              height: 172,
              borderRadius: 34,
              background: BRAND.navGreen,
              boxShadow: '0 18px 40px rgba(20,60,40,0.28), 0 3px 8px rgba(0,0,0,0.12)',
              transform: `translateY(${(1 - inP) * -240 + outP * -240}px)`,
              opacity: Math.min(inP * 1.4, 1) * (1 - outP),
              display: 'flex',
              alignItems: 'center',
              fontFamily: FONT,
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: 176,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: BRAND.navGreenLight,
                position: 'relative',
              }}
            >
              <div style={{position: 'relative', width: 78, height: 78}}>
                <div style={{position: 'absolute', inset: 0, opacity: 1 - arrived}}>
                  <Arrow turn={turn} />
                </div>
                <div style={{position: 'absolute', inset: 0, opacity: arrived, transform: `scale(${0.6 + 0.4 * arrived})`}}>
                  <Flag />
                </div>
              </div>
              <div style={{fontSize: 30, fontWeight: 800, marginTop: 6, fontVariantNumeric: 'tabular-nums'}}>
                {arrived > 0.5 ? 'Arrived' : formatDistance(remaining)}
              </div>
            </div>
            <div style={{flex: 1, padding: '0 34px', minWidth: 0}}>
              <div style={{fontSize: 30, fontWeight: 600, opacity: 0.8, marginBottom: 4}}>
                {arrived > 0.5 ? b.name : verb}
              </div>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  letterSpacing: -1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {b.street}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
