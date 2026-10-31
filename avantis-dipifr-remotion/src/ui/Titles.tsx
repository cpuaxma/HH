import {useCurrentFrame} from 'remotion';
import {BRAND, CARD_COLORS, COLUMN, COPY, FOCUS_Y, SAFE, TIMING} from '../data';
import {SANS, SERIF} from '../fonts';
import {easeIn, easeOut, ramp} from '../lib/timeline';

/** 0–3s: the headline builds word by word under the globe. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > TIMING.hookOut + 40) return null;
  const words = COPY.hook.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x,
        width: COLUMN.width,
        top: FOCUS_Y.hook + 372,
        textAlign: 'center',
        fontFamily: SERIF,
        textWrap: 'balance',
        fontSize: 92,
        lineHeight: 1.06,
        letterSpacing: -0.5,
        color: CARD_COLORS.heading,
      }}
    >
      {words.map((w, i) => {
        const start = TIMING.hookWordsStart + i * TIMING.hookWordGap;
        const p = ramp(frame, start, start + 18, easeOut);
        const out = ramp(frame, TIMING.hookOut + i * 2, TIMING.hookOut + 18 + i * 2, easeIn);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: i === words.length - 1 ? 0 : '0.24em',
              opacity: p * (1 - out),
              transform: `translateY(${(1 - p) * 44 - out * 36}px)`,
              filter: `blur(${(1 - p) * 8 + out * 6}px)`,
              color: COPY.hookHighlight.includes(w) ? BRAND.navy : CARD_COLORS.heading,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** 3–9s: what DipIFR is, above the globe while the routes draw. */
export const GlobalTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const a = TIMING.globalTitleIn;
  if (frame < a - 1 || frame > TIMING.globalOut + 40) return null;
  const out = ramp(frame, TIMING.globalOut, TIMING.globalOut + 24, easeIn);
  const line = (delay: number) => {
    const p = ramp(frame, a + delay, a + delay + 22, easeOut);
    return {opacity: p * (1 - out), transform: `translateY(${(1 - p) * 30 - out * 24}px)`, filter: `blur(${(1 - p) * 6 + out * 4}px)`};
  };
  return (
    <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: SAFE.top + 34, textAlign: 'center'}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 5, color: BRAND.navy, textTransform: 'uppercase', ...line(0)}}>
        {COPY.globalEyebrow}
      </div>
      <div style={{fontFamily: SERIF, textWrap: 'balance', fontSize: 68, lineHeight: 1.08, color: CARD_COLORS.heading, marginTop: 16, ...line(6)}}>
        {COPY.globalTitle}
      </div>
    </div>
  );
};
