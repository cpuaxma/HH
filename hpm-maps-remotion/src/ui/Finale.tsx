import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, CITY_COLORS, COPY, FOCUS_SCREEN, SAFE, TIMING} from '../data';
import {FONT} from '../fonts';
import {easeIn, easeInOut, easeOut, ramp} from '../lib/timeline';
import {PepperPin} from './PepperPin';

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

/** 22–25s: soft blur and fade to off-white, the wordmark and the CTA. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = TIMING.endCardStart;
  if (frame < start) return null;
  const fade = ramp(frame, start, start + 46, easeInOut);
  const pinPop = frame < start + 30 ? 0 : spring({frame: frame - start - 30, fps, config: {damping: 10, stiffness: 150, mass: 0.8}});
  const word1 = ramp(frame, start + 38, start + 58, easeOut);
  const word2 = ramp(frame, start + 46, start + 66, easeOut);
  const cta = frame < start + 64 ? 0 : spring({frame: frame - start - 64, fps, config: {damping: 12, stiffness: 160, mass: 0.8}});
  const ring = ramp(frame, start + 74, start + 120, easeOut);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: CITY_COLORS.ground, opacity: fade}} />
      <div
        style={{
          position: 'absolute',
          left: FOCUS_SCREEN.x - 400,
          width: 800,
          top: 620,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: FONT,
        }}
      >
        <div style={{transform: `scale(${pinPop})`, transformOrigin: '50% 100%', height: 170}}>
          <PepperPin height={160} />
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 118,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 0.95,
            color: BRAND.red,
            opacity: word1,
            transform: `translateY(${(1 - word1) * 30}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.wordmark.split(' ').slice(0, -1).join(' ')}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 50,
            fontWeight: 800,
            letterSpacing: 18,
            paddingLeft: 18,
            color: BRAND.ink,
            opacity: word2,
            transform: `translateY(${(1 - word2) * 24}px)`,
          }}
        >
          {COPY.wordmark.split(' ').slice(-1)[0]}
        </div>
        <div style={{position: 'relative', marginTop: 70}}>
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
              fontSize: 50,
              fontWeight: 800,
              letterSpacing: -0.5,
              padding: '26px 56px',
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
