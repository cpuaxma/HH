import {ArrowRight} from 'lucide-react';
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {MaskReveal} from '../components/MaskReveal';
import {TrackingLabel} from '../components/TrackingLabel';
import {COPY} from '../copy';
import {headlineSize} from '../layout';
import {enterProgress, kick, mix, progress} from '../lib/anim';
import {smoothPath} from '../lib/path';
import {COLORS, COLUMN, COLUMN_CENTER, EASE_IN_OUT, FONT, SAFE, TYPE, WEIGHT, WIDTH} from '../theme';

const T = {
  logo: 14,
  headline: 34,
  body: 76,
  button: 96,
  email: 112,
  tagline: 128,
  pulse: 150, // first pulse; repeats every PULSE_EVERY
  shine: 162,
};
const PULSE_EVERY = 60;
const PULSE_LENGTH = 30;

const LOGO = {w: 753, h: 521, width: 540};
const Y = {logo: 230, headline: 710};

const Waves: React.FC<{frame: number}> = ({frame}) => {
  const fade = enterProgress(frame, 20, 40);
  const wave = (baseY: number, amp: number, lambda: number, speed: number, phase: number) => {
    const shift = ((frame * speed) % lambda + lambda) % lambda;
    const pts = [];
    for (let x = -lambda * 2; x <= WIDTH + lambda * 2; x += lambda / 4) {
      pts.push([x + shift - lambda, baseY + amp * Math.sin((2 * Math.PI * x) / lambda + phase)] as const);
    }
    return smoothPath(pts);
  };
  return (
    <svg width={WIDTH} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.15 * fade}}>
      <path d={wave(1690, 22, 560, 0.9, 0)} fill="none" stroke={COLORS.cream} strokeWidth={4} strokeLinecap="round" />
      <path d={wave(1772, 16, 440, -0.6, 1.4)} fill="none" stroke={COLORS.cream} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const size = headlineSize();
  const bodyTop = Y.headline + size * 2 + 64;
  const buttonTop = bodyTop + 110;

  const logoK = kick(frame, T.logo);
  const btnK = kick(frame, T.button);
  const since = frame - T.pulse;
  const phase = since >= 0 ? (since % PULSE_EVERY) / PULSE_LENGTH : 1;
  const pulse = phase < 1 ? Math.sin(Math.PI * EASE_IN_OUT(phase)) : 0;
  const shine = progress(frame, T.shine, 36, EASE_IN_OUT);
  const body = enterProgress(frame, T.body, 28);

  return (
    <AbsoluteFill>
      <Waves frame={frame} />

      <Img
        src={staticFile('logo-reversed.png')}
        style={{
          position: 'absolute',
          left: COLUMN_CENTER - LOGO.width / 2,
          top: Y.logo,
          width: LOGO.width,
          height: (LOGO.width * LOGO.h) / LOGO.w,
          transform: `scale(${mix(0.6, 1, logoK)})`,
          opacity: interpolate(logoK, [0, 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      />

      <MaskReveal
        lines={COPY.cta.headline}
        start={T.headline}
        fontSize={size}
        align="center"
        color={COLORS.cream}
        accent={COLORS.cream}
        style={{position: 'absolute', left: SAFE.left, width: COLUMN, top: Y.headline}}
      />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: COLUMN,
          top: bodyTop,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: WEIGHT.body,
          fontSize: TYPE.bodySize,
          lineHeight: 1.35,
          color: COLORS.cream,
          opacity: body,
          transform: `translateY(${mix(24, 0, body)}px)`,
        }}
      >
        {COPY.cta.body}
      </div>

      <div style={{position: 'absolute', left: SAFE.left, width: COLUMN, top: buttonTop, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: 124,
            padding: '0 64px',
            borderRadius: 62,
            backgroundColor: COLORS.cream,
            color: COLORS.red,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: FONT,
            fontWeight: WEIGHT.headline,
            fontSize: 46,
            letterSpacing: '-0.01em',
            transform: `scale(${mix(0.6, 1, btnK) * (1 + 0.04 * pulse)})`,
            opacity: interpolate(btnK, [0, 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {COPY.cta.button}
          <ArrowRight size={48} strokeWidth={3} color={COLORS.red} />
          {shine > 0 && shine < 1 ? (
            <div
              style={{
                position: 'absolute',
                top: -20,
                bottom: -20,
                left: `${mix(-20, 115, shine)}%`,
                width: 44,
                backgroundColor: '#FFFFFF',
                opacity: 0.6,
                transform: 'skewX(-20deg)',
              }}
            />
          ) : null}
        </div>
      </div>

      <TrackingLabel
        text={COPY.cta.email}
        start={T.email}
        size={30}
        color={COLORS.cream}
        align="center"
        style={{position: 'absolute', left: SAFE.left, width: COLUMN, top: buttonTop + 124 + 48}}
      />

      <TrackingLabel
        text={COPY.cta.tagline}
        start={T.tagline}
        size={28}
        color={COLORS.cream}
        trackingFrom={0.6}
        trackingTo={0.3}
        align="center"
        style={{position: 'absolute', left: SAFE.left, width: COLUMN, top: 1500}}
      />
    </AbsoluteFill>
  );
};
