import {useCurrentFrame} from 'remotion';
import {COLORS, COLUMN, COPY, SAFE, TIMING} from '../data';
import {SANS, SERIF} from '../fonts';
import {easeIn, easeOut, ramp, springAt} from '../lib/timeline';

/** 2–6s: "Meet DipIFR" above the certificate, what it is, and the sub-line below. */
export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const a = TIMING.answerStart;
  const out = ramp(frame, TIMING.breakStart - 4, TIMING.breakStart + 18, easeIn);
  if (frame < a - 2 || out >= 1) return null;
  const rise = (at: number, len = 18) => {
    const p = ramp(frame, at, at + len, easeOut);
    return {opacity: p * (1 - out), transform: `translateY(${(1 - p) * 34 - out * 30}px)`};
  };
  const [w1, w2] = COPY.answerTitle;
  const pop = springAt(frame, a + 30, 26, 0.45);
  return (
    <>
      <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: SAFE.top + 20, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontSize: 118, lineHeight: 1, color: COLORS.headline, ...rise(a)}}>
          {w1}{' '}
          <span style={{color: COLORS.gold, display: 'inline-block', transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 2)}}>{w2}</span>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, lineHeight: 1.3, color: COLORS.body, marginTop: 18, textWrap: 'balance', ...rise(a + 30)}}>
          {COPY.answerLine}
        </div>
      </div>
      <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: 1372, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontSize: 52, lineHeight: 1.1, color: COLORS.headline, textWrap: 'balance', ...rise(a + 90, 20)}}>
          {COPY.answerSub.split('. ').map((part, i, arr) => (
            <span key={i} style={{color: i === arr.length - 1 ? COLORS.goldLight : COLORS.headline}}>
              {part}
              {i < arr.length - 1 ? '. ' : ''}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};
