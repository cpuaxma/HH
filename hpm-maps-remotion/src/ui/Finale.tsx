import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, CITY_COLORS, COPY, FOCUS_SCREEN, SAFE, TIMING} from '../data';
import {FONT} from '../fonts';
import {easeIn, easeInOut, easeOut, ramp} from '../lib/timeline';
import {Logo} from './Logo';

const W = 1080 - SAFE.left - SAFE.right - 20;

/** 19–22s: the line over the top-down city. */
export const FinaleText: React.FC = () => {
  const frame = useCurrentFrame();
  const start = TIMING.finaleStart + 70;
  if (frame < start - 1 || frame > TIMING.endCardStart + 50) return null;
  const inP = ramp(frame, start, start + 20, easeOut);
  const out = ramp(frame, TIMING.endCardStart + 4, TIMING.endCardStart + 30, easeIn);
  const line = (text: string, color: string, delay: number) => {
    const p = ramp(frame, start + delay, start + delay + 18, easeOut);
    return (
      <div style={{color, opacity: p, transform: `translateY(${(1 - p) * 26}px)`}}>{text}</div>
    );
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: SAFE.top + 30,
        width: W,
        padding: '34px 30px 38px',
        boxSizing: 'border-box',
        borderRadius: 30,
        background: 'rgba(255,255,255,0.94)',
        boxShadow: '0 24px 60px rgba(40,25,10,0.16), 0 4px 14px rgba(40,25,10,0.06)',
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.1,
        letterSpacing: -1.8,
        opacity: inP * (1 - out),
        transform: `translateY(${(1 - inP) * -40 - out * 20}px) scale(${0.96 + 0.04 * inP})`,
      }}
    >
      {line(COPY.finaleLine1, BRAND.ink, 4)}
      {line(COPY.finaleLine2, BRAND.red, 14)}
    </div>
  );
};

/** 22–25s: soft blur and fade to off-white, the logo and the CTA. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = TIMING.endCardStart;
  if (frame < start) return null;
  const fade = ramp(frame, start, start + 46, easeInOut);
  const pepper = frame < start + 26 ? 0 : spring({frame: frame - start - 26, fps, config: {damping: 13, stiffness: 120, mass: 0.9}});
  const letters = ramp(frame, start + 36, start + 70, easeInOut);
  const cta = frame < start + 70 ? 0 : spring({frame: frame - start - 70, fps, config: {damping: 12, stiffness: 160, mass: 0.8}});
  const ring = ramp(frame, start + 80, start + 126, easeOut);
  const LOGO_W = 800;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: CITY_COLORS.ground, opacity: fade}} />
      <div
        style={{
          position: 'absolute',
          left: FOCUS_SCREEN.x - LOGO_W / 2,
          width: LOGO_W,
          top: 560,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: FONT,
        }}
      >
        <Logo width={LOGO_W} pepper={pepper} letters={letters} red={BRAND.red} ink={BRAND.ink} />
        <div style={{position: 'relative', marginTop: 80}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `3px solid ${BRAND.glow}`,
              transform: `scale(${1 + ring * 0.25}, ${1 + ring * 0.6})`,
              opacity: (1 - ring) * 0.6 * (ring > 0 ? 1 : 0),
            }}
          />
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND.glow}, ${BRAND.red})`,
              color: '#fff',
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: 2,
              padding: '26px 72px',
              borderRadius: 999,
              transform: `scale(${cta})`,
              boxShadow: '0 18px 40px rgba(230,57,34,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            {COPY.cta}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
