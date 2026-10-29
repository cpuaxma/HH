import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {ArabicText} from '../components/ArabicText';
import {Particles, makeParticles} from '../components/Particles';
import {S2_FEAR} from '../strings';
import {COLORS, LAYOUT, SAFE} from '../theme';
import {dash, ease, exitProgress, exitStyle, hexA} from '../motion';

const SHIELD = {cx: 540, cy: 1110};
const SHIELD_D =
  'M540 930 C 600 968 660 980 712 980 L 712 1080 C 712 1188 640 1258 540 1300 C 440 1258 368 1188 368 1080 L 368 980 C 420 980 480 968 540 930 Z';
export const SPECS = makeParticles(64, {cx: SHIELD.cx, cy: SHIELD.cy + 10, rx: 110, ry: 120}, 90, 70);
const FLOW = 60;

export const Fear: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur, 26);
  const appear = ease(frame, 0, 30);
  const draw = ease(frame, 60, 50);
  const glow = ease(frame, 195, 45);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <linearGradient id="shield-stroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={COLORS.goldB} />
              <stop offset="1" stopColor={COLORS.goldA} />
            </linearGradient>
            <radialGradient id="shield-fill" cx="0.5" cy="0.45" r="0.6">
              <stop offset="0" stopColor={hexA(COLORS.goldB, 0.22)} />
              <stop offset="1" stopColor={hexA(COLORS.goldA, 0)} />
            </radialGradient>
            <filter id="shield-bloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={14} />
            </filter>
          </defs>
          <path d={SHIELD_D} fill="url(#shield-fill)" opacity={glow} />
          <path d={SHIELD_D} pathLength={1} fill="none" stroke={COLORS.goldA} strokeWidth={10} filter="url(#shield-bloom)" style={dash(draw, 0, 0.25 + glow * 0.5)} />
          <path d={SHIELD_D} pathLength={1} fill="none" stroke="url(#shield-stroke)" strokeWidth={2.5} strokeLinejoin="round" style={dash(draw)} />
        </svg>
        <Trail layers={8} lagInFrames={0.6} trailOpacity={0.55}>
          <Particles specs={SPECS} flowDur={FLOW} appear={appear} />
        </Trail>
      </div>
      <ArabicText
        block={S2_FEAR}
        size={LAYOUT.headlineSize}
        start={10}
        exitEnd={dur}
        style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}}
      />
    </AbsoluteFill>
  );
};
