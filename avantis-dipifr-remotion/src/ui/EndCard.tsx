import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, CARD_COLORS, COLUMN, COPY, TIMING} from '../data';
import {SANS, SERIF} from '../fonts';
import {easeInOut, easeOut, ramp} from '../lib/timeline';
import {Logo} from './Logo';

/** The end card's choreography, in frames after TIMING.endCardStart. */
export const END = {fade: 46, shield: 28, laurels: [44, 92], wordmark: [64, 102], tagline: [90, 118], launch: 112, cta: 132, ring: [150, 196]};

/** 26–30s: soft blur and fade to off-white, the logo, the launch line and the CTA, then a hold. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = TIMING.endCardStart;
  if (frame < start) return null;
  const r = frame - start;
  const fade = ramp(frame, start, start + END.fade, easeInOut);
  const sp = (at: number, damping = 13, stiffness = 120) => (r < at ? 0 : spring({frame: r - at, fps, config: {damping, stiffness, mass: 0.9}}));
  const anim = {
    shield: sp(END.shield),
    laurels: ramp(r, END.laurels[0], END.laurels[1], easeInOut),
    wordmark: ramp(r, END.wordmark[0], END.wordmark[1], easeInOut),
    tagline: ramp(r, END.tagline[0], END.tagline[1], easeOut),
  };
  const launch = ramp(r, END.launch, END.launch + 24, easeOut);
  const cta = sp(END.cta, 12, 160);
  const ring = ramp(r, END.ring[0], END.ring[1], easeOut);
  const LOGO_W = 640;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: BRAND.background, opacity: fade}} />
      <div
        style={{
          position: 'absolute',
          left: COLUMN.x,
          width: COLUMN.width,
          top: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: SANS,
        }}
      >
        <Logo width={LOGO_W} anim={anim} />
        <div
          style={{
            fontFamily: SERIF,
            textWrap: 'balance',
            fontSize: 60,
            lineHeight: 1.1,
            color: CARD_COLORS.heading,
            textAlign: 'center',
            marginTop: 64,
            opacity: launch,
            transform: `translateY(${(1 - launch) * 24}px)`,
          }}
        >
          {COPY.launch}
        </div>
        <div style={{position: 'relative', marginTop: 44}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `3px solid ${BRAND.navy}`,
              transform: `scale(${1 + ring * 0.18}, ${1 + ring * 0.5})`,
              opacity: ring > 0 ? (1 - ring) * 0.5 : 0,
            }}
          />
          <div
            style={{
              background: BRAND.navy,
              color: '#fff',
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: 0.5,
              padding: '26px 64px',
              borderRadius: 999,
              transform: `scale(${cta})`,
              boxShadow: '0 18px 40px rgba(11,35,81,0.32)',
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
