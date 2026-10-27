import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BRAND, CITY_COLORS, COLUMN, COPY, FOCUS_SCREEN} from '../data';
import {FONT} from '../fonts';
import {easeIn, easeInOut, easeOut, ramp} from '../lib/timeline';
import {PIN_TIP, PepperPin} from './PepperPin';

const PIN_H = 230;
const DROP_START = 4;
const DROP_LEN = 40;
const RING_EVERY = 34;

/** 0–2s: off-white screen, the pepper pin drops in and pulses, the question builds word by word. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 190) return null;

  // Off-white cover over the city; it lifts as the camera dives.
  const cover = 1 - ramp(frame, 126, 180, easeInOut);

  // Drop with a physical bounce.
  const t = interpolate(frame, [DROP_START, DROP_START + DROP_LEN], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fall = Easing.bounce(t);
  const y = -(1 - fall) * 1100;
  // Squash on each impact.
  const nearGround = Math.max(0, 1 - Math.abs(y) / 26);
  const squash = nearGround * (1 - t) * 0.22;
  // Heartbeat after landing.
  const sinceLand = frame - (DROP_START + DROP_LEN);
  const beat =
    sinceLand > 0 ? Math.max(0, Math.sin(Math.min(1, (sinceLand % RING_EVERY) / 12) * Math.PI)) * 0.06 : 0;
  // Morph into the route head: shrink to the tip, then fade.
  const morph = ramp(frame, 122, 176, easeInOut);
  const scale = (1 + beat) * (1 - morph * 0.9);
  const pinOpacity = 1 - ramp(frame, 156, 178, easeIn);

  const rings = [0, 1, 2, 3].map((k) => {
    const start = DROP_START + DROP_LEN + k * RING_EVERY;
    const p = (frame - start) / 46;
    if (p <= 0 || p >= 1 || start > 150) return null;
    const e = easeOut(p);
    return (
      <div
        key={k}
        style={{
          position: 'absolute',
          left: FOCUS_SCREEN.x - 120 * e,
          top: FOCUS_SCREEN.y - 40 * e,
          width: 240 * e,
          height: 80 * e,
          borderRadius: '50%',
          border: `4px solid ${BRAND.glow}`,
          opacity: 0.6 * (1 - p),
        }}
      />
    );
  });

  const shadowW = 120 * (0.45 + 0.55 * fall) * (1 - morph);
  const words = COPY.hook.split(' ');

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: CITY_COLORS.ground, opacity: cover}} />
      {/* Ground shadow */}
      <div
        style={{
          position: 'absolute',
          left: FOCUS_SCREEN.x - shadowW / 2,
          top: FOCUS_SCREEN.y - shadowW * 0.14,
          width: shadowW,
          height: shadowW * 0.28,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(90,40,20,0.28), rgba(90,40,20,0))',
          opacity: (0.4 + 0.6 * fall) * pinOpacity,
        }}
      />
      {rings}
      <div
        style={{
          position: 'absolute',
          left: FOCUS_SCREEN.x,
          top: FOCUS_SCREEN.y + y,
          transform: `translate(-${PIN_TIP.x * 100}%, -${PIN_TIP.y * 100}%) scale(${scale * (1 + squash)}, ${scale * (1 - squash)})`,
          transformOrigin: `${PIN_TIP.x * 100}% ${PIN_TIP.y * 100}%`,
          opacity: pinOpacity,
        }}
      >
        <PepperPin height={PIN_H} />
      </div>
      {/* Headline */}
      <div
        style={{
          position: 'absolute',
          left: COLUMN.x,
          width: COLUMN.width,
          top: FOCUS_SCREEN.y + 110,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 82,
          lineHeight: 1.08,
          letterSpacing: -2,
          color: BRAND.ink,
        }}
      >
        {words.map((w, i) => {
          const start = 26 + i * 5;
          const p = ramp(frame, start, start + 16, easeOut);
          const out = ramp(frame, 118 + i * 2, 134 + i * 2, easeIn);
          const red = COPY.hookHighlight.includes(w);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.24em',
                opacity: p * (1 - out),
                transform: `translateY(${(1 - p) * 40 - out * 36}px)`,
                filter: `blur(${(1 - p) * 8 + out * 6}px)`,
                color: red ? BRAND.red : BRAND.ink,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
