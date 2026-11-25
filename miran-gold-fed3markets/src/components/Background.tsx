import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {BLOOM, C, VIDEO} from '../brand';
import {CHAPTER, SCENES} from '../timeline';
import {clamp, hexA, mixHex, noise, rand} from '../motion';

/** Bloom tint follows the chapter: neutral gold → blue-violet → slate-teal → gold → back to neutral. */
export const bloomColor = (frame: number) => {
  const stops: [number, string][] = [
    [0, BLOOM.neutral],
    [CHAPTER[0].from, BLOOM.neutral],
    [CHAPTER[0].from + 30, BLOOM.nasdaq],
    [CHAPTER[1].from, BLOOM.nasdaq],
    [CHAPTER[1].from + 30, BLOOM.spx],
    [CHAPTER[2].from, BLOOM.spx],
    [CHAPTER[2].from + 30, BLOOM.gold],
    [SCENES.twist[0], BLOOM.gold],
    [SCENES.twist[0] + 30, BLOOM.neutral],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [f0, c0] = stops[i];
    const [f1, c1] = stops[i + 1];
    if (frame <= f1) return f1 === f0 ? c1 : mixHex(c0, c1, interpolate(frame, [f0, f1], [0, 1], clamp));
  }
  return stops[stops.length - 1][1];
};

/** Perspective grid floor: lines scroll toward the viewer, giving the 2.5D depth. */
const GridFloor: React.FC<{frame: number; tint: string}> = ({frame, tint}) => {
  const scroll = (frame * 1.1) % 80;
  const rows = Array.from({length: 26}, (_, i) => i * 80 + scroll);
  const cols = Array.from({length: 29}, (_, i) => (i - 14) * 90);
  return (
    <div
      style={{
        position: 'absolute',
        left: -600,
        width: VIDEO.width + 1200,
        top: 1080,
        height: 2000,
        transformOrigin: '50% 0%',
        transform: 'perspective(700px) rotateX(74deg)',
        WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0) 100%)',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0) 100%)',
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${VIDEO.width + 1200} 2000`}>
        {rows.map((y, i) => (
          <line key={`r${i}`} x1={0} x2={VIDEO.width + 1200} y1={y} y2={y} stroke={hexA(tint, 0.22)} strokeWidth={2} />
        ))}
        {cols.map((x, i) => (
          <line key={`c${i}`} x1={(VIDEO.width + 1200) / 2 + x} x2={(VIDEO.width + 1200) / 2 + x} y1={0} y2={2000} stroke={hexA('#8FA6E8', 0.12)} strokeWidth={2} />
        ))}
      </svg>
    </div>
  );
};

/** Far dust: three parallax depths drifting at different speeds. */
const Dust: React.FC<{frame: number}> = ({frame}) => (
  <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 46}, (_, i) => {
      const depth = 0.3 + rand(i) * 0.7;
      const x = (rand(i + 50) * VIDEO.width + frame * 0.25 * depth + noise(i, frame / 90) * 20) % VIDEO.width;
      const y = (rand(i + 90) * VIDEO.height - frame * 0.4 * depth + VIDEO.height * 4) % VIDEO.height;
      return <circle key={i} cx={x} cy={y} r={0.8 + depth * 1.6} fill={hexA('#C9D4F5', 0.08 + depth * 0.14)} />;
    })}
  </svg>
);

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.05}) => {
  const seed = Math.floor(useCurrentFrame() / 2) % 97;
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none', mixBlendMode: 'overlay'}}>
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none">
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.8 -0.4" />
        </filter>
        <rect width="540" height="960" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  const tint = bloomColor(frame);
  const bx = Math.sin(t * 0.35) * 60;
  const by = Math.cos(t * 0.28) * 30;
  const fadeIn = interpolate(frame, [0, 24], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 70% at 50% 30%, ${C.bg1} 0%, ${C.bg0} 72%)`}}>
      <AbsoluteFill style={{opacity: fadeIn}}>
        {/* bloom near the bottom, chapter-tinted */}
        <div
          style={{
            position: 'absolute',
            width: 1700,
            height: 1100,
            left: VIDEO.width / 2 - 850 + bx,
            top: 1180 + by,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${hexA(tint, 0.3)} 0%, ${hexA(tint, 0.09)} 40%, ${hexA(tint, 0)} 70%)`,
          }}
        />
        <GridFloor frame={frame} tint={tint} />
        <Dust frame={frame} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};
