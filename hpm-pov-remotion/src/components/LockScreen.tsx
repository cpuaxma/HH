import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {progress} from '../lib/anim';
import {Point, smoothPath} from '../lib/path';
import {CUE} from '../timeline';
import {EASE_IN_OUT, HEIGHT, HPM, WIDTH} from '../theme';
import {PepperDraw} from './PepperDraw';

const LINE: Point[] = [
  [-60, 1500],
  [220, 1400],
  [480, 1440],
  [720, 1260],
  [900, 1000],
  [1140, 880],
];

// Heat 0 → 1 across the overheat (story time).
export const heatAt = (t: number) => progress(t, CUE.heat, 190, EASE_IN_OUT);

// Wallpaper: Cream → Peach, a faint single-line pepper and one thin Hot Red line.
// During the overheat a turbulence displacement adds a subtle heat shimmer.
export const LockScreen: React.FC<{frame: number; t: number}> = ({frame, t}) => {
  // The line glows in the cold open (the future), dims on the rewind, and lights up
  // again when they hire Hot Pepper Media.
  const glow = Math.max(1 - progress(frame, CUE.rewind, 40), progress(frame, CUE.lineGlow, 50));
  const heat = heatAt(t);
  const shimmer = heat * 9;
  const id = 'heat-shimmer';
  return (
    <AbsoluteFill style={{filter: shimmer > 0.2 ? `url(#${id})` : undefined}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.022" numOctaves={2} seed={Math.floor(t / 3)} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={shimmer} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${HPM.cream} 0%, ${HPM.cream} 18%, ${HPM.peach} 100%)`}} />
      <div style={{position: 'absolute', left: 40, top: 860, opacity: 0.08, transform: 'rotate(-14deg)'}}>
        <PepperDraw frame={frame} width={1000} color={HPM.charcoal} strokePx={7} />
      </div>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path
          d={smoothPath(LINE)}
          fill="none"
          stroke={HPM.red}
          strokeWidth={3 + glow * 1.5}
          strokeLinecap="round"
          opacity={0.35 + 0.65 * glow}
          style={{filter: glow > 0 ? `drop-shadow(0 0 ${14 * glow}px rgba(226,59,36,${0.8 * glow}))` : undefined}}
        />
      </svg>
    </AbsoluteFill>
  );
};

// Heat glow: Hot Red creeping in from the edges, then flooding the whole frame for the CTA.
export const HeatGlow: React.FC<{frame: number; t: number}> = ({frame, t}) => {
  const heat = heatAt(t);
  const flood = progress(frame, CUE.flood, CUE.floodDuration, EASE_IN_OUT);
  if (heat <= 0 && flood <= 0) return null;
  if (flood >= 1) return <AbsoluteFill style={{background: HPM.red}} />;
  const r0 = (1300 - 760 * heat) * (1 - flood) - 220 * flood;
  const r1 = r0 + 640 * (1 - flood) + 30;
  const a = 0.78 * heat + (1 - 0.78 * heat) * flood;
  // A breath of flicker so the glow feels hot, not static.
  const flick = 1 + 0.03 * (random(`glow${Math.floor(t / 2)}`) - 0.5) * heat * (1 - flood);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 540px 900px, rgba(226,59,36,0) ${Math.max(0, r0 * flick)}px, rgba(226,59,36,${a.toFixed(3)}) ${Math.max(1, r1 * flick)}px)`,
      }}
    />
  );
};
