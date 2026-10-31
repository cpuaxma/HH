import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, COLUMN, HOOK, TIMING} from '../data';
import {SERIF} from '../fonts';
import {easeIn, easeOut, ramp, springAt} from '../lib/timeline';

/** Lines of the hook, split where an entry has `br`. */
const lines = () => {
  const out: (typeof HOOK)[] = [[]];
  HOOK.forEach((w) => {
    out[out.length - 1].push(w);
    if (w.br) out.push([]);
  });
  return out.filter((l) => l.length);
};

/**
 * 0–2s: huge kinetic type. Each word slams in (big, blurred → sharp, with a
 * springy settle); the accent word lands on a beat with a punch-in and a gold
 * underline swipe. At ~1.6s the whole line snap-zooms past the camera.
 */
export const Hook: React.FC<{frameOverride?: number; static?: boolean}> = ({frameOverride, static: still}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  if (frame > TIMING.answerStart + 4) return null;
  const accentAt = HOOK.find((w) => w.accent)?.at ?? 60;
  // Punch-in when the accent lands.
  const punch = still ? 0 : springAt(frame, accentAt, 26, 0.5) * (1 - ramp(frame, accentAt + 10, accentAt + 30));
  // Pattern interrupt: snap zoom through the text.
  const snap = still ? 0 : ramp(frame, TIMING.hookInterrupt, TIMING.answerStart, easeIn);

  return (
    <div
      style={{
        position: 'absolute',
        left: COLUMN.x - 40,
        width: COLUMN.width + 80,
        top: still ? 330 : 560,
        textAlign: 'center',
        fontFamily: SERIF,
        color: COLORS.headline,
        transform: `scale(${1 + 0.07 * punch + snap * 2.4})`,
        transformOrigin: '50% 60%',
        opacity: 1 - ramp(frame, TIMING.hookInterrupt + 8, TIMING.answerStart - 2),
        filter: snap > 0.01 ? `blur(${snap * 14}px)` : undefined,
      }}
    >
      {lines().map((line, li) => (
        <div key={li} style={{lineHeight: 1.02, whiteSpace: 'nowrap'}}>
          {line.map((w, wi) => {
            const p = still ? 1 : w.at === 0 ? 1 : springAt(frame, w.at, 22, 0.4);
            const inP = still ? 1 : w.at === 0 ? 1 : ramp(frame, w.at, w.at + 7, easeOut);
            const scale = interpolate(p, [0, 1], [1.9, 1]);
            const underline = still ? 1 : ramp(frame, w.at + 6, w.at + 24, easeOut);
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  margin: '0 0.12em',
                  fontSize: w.accent ? 170 : 132,
                  color: w.accent ? COLORS.gold : COLORS.headline,
                  opacity: inP,
                  transform: `scale(${scale})`,
                  filter: inP < 0.99 ? `blur(${(1 - inP) * 10}px)` : undefined,
                  textShadow: '0 10px 40px rgba(0,0,0,0.35)',
                }}
              >
                {w.text}
                {w.accent ? (
                  <span
                    style={{
                      position: 'absolute',
                      left: '4%',
                      bottom: 6,
                      height: 12,
                      width: `${92 * underline}%`,
                      borderRadius: 6,
                      background: `linear-gradient(90deg, ${COLORS.goldLight}, ${COLORS.gold})`,
                      boxShadow: '0 0 24px rgba(217,178,106,0.6)',
                    }}
                  />
                ) : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
