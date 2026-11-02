import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, GLIDE, LAYOUT, SCENES, STATIONS, VIDEO} from '../theme';
import {hexA, noise, rand} from '../motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Camera position in stations (0 = hook, 1 = drop, …). It glides one station at the start of
 * each scene after the hook, so the whole reel reads as one continuous camera move.
 */
export const camPos = (frame: number) =>
  STATIONS.slice(1).reduce((sum, key) => sum + interpolate(frame, [SCENES[key][0], SCENES[key][0] + GLIDE], [0, 1], {...clamp, easing: EASE.glide}), 0);

/** Camera speed in px per frame (for motion blur). */
export const camSpeed = (frame: number) => (camPos(frame + 0.5) - camPos(frame - 0.5)) * VIDEO.width;

/**
 * Puts a station's visuals into the world: offset by where the camera is, with a horizontal
 * motion blur while the camera is gliding. New stations enter from the left (RTL story order).
 * `from` is the absolute frame at which the enclosing Sequence starts.
 */
export const Station: React.FC<{index: number; from: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  index,
  from,
  children,
  style,
}) => {
  const frame = useCurrentFrame() + from;
  const x = (camPos(frame) - index) * VIDEO.width;
  const blur = Math.min(46, Math.abs(camSpeed(frame)) * 0.32);
  const id = `glide-blur-${index}`;
  return (
    <AbsoluteFill style={{transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined, ...style}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blur} 0`} />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/** The reflective floor: a soft horizon line and perspective lines that scroll with the camera. */
export const Floor: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const frame = useCurrentFrame();
  const shift = camPos(frame) * VIDEO.width * 0.9;
  const y0 = LAYOUT.floorY;
  const vp = {x: VIDEO.width / 2, y: y0 - 900}; // vanishing point above the horizon
  const spacing = 150;
  const lines = [];
  const span = spacing * 20;
  for (let i = 0; i < 20; i++) {
    const x = ((((i * spacing + shift) % span) + span) % span) - spacing * 6;
    // Line from the horizon point outwards, extended to the bottom of the frame.
    const t = (VIDEO.height - y0) / (y0 - vp.y);
    const xb = x + (x - vp.x) * t;
    lines.push(<line key={i} x1={x} y1={y0} x2={xb} y2={VIDEO.height} stroke="#9FB0CC" strokeWidth={1} />);
  }
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
      <svg width={VIDEO.width} height={VIDEO.height}>
        <defs>
          <linearGradient id="floor-fade" x1="0" y1={y0} x2="0" y2={VIDEO.height} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <mask id="floor-mask">
            <rect x={0} y={y0} width={VIDEO.width} height={VIDEO.height - y0} fill="url(#floor-fade)" />
          </mask>
          <linearGradient id="horizon" x1="0" x2="1">
            <stop offset="0" stopColor="#C9D3E2" stopOpacity="0" />
            <stop offset="0.5" stopColor="#C9D3E2" stopOpacity="0.55" />
            <stop offset="1" stopColor="#C9D3E2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={0} y={y0} width={VIDEO.width} height={VIDEO.height - y0} fill="#05070D" opacity={0.35} />
        <g mask="url(#floor-mask)">{lines}</g>
        <rect x={0} y={y0 - 1} width={VIDEO.width} height={2} fill="url(#horizon)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Covers reflections below the horizon with a fade to the background, so they fall off naturally. */
export const FloorFade: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: LAYOUT.floorY,
      height: 360,
      background: `linear-gradient(180deg, ${hexA(COLORS.bgBottom, 0.35)} 0%, ${hexA(COLORS.bgBottom, 0.85)} 45%, ${COLORS.bgBottom} 100%)`,
      pointerEvents: 'none',
    }}
  />
);

const DUST = new Array(46).fill(0).map((_, i) => ({
  x: rand(i + 1) * (VIDEO.width + 200) - 100,
  y: 140 + rand(i + 50) * 1500,
  z: 0.15 + rand(i + 99) * 0.55, // parallax depth: nearer specks move more
  r: 0.8 + rand(i + 7) * 1.8,
}));

/** Drifting specks of light at different depths; they parallax with the camera. */
export const Dust: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = camPos(frame) * VIDEO.width;
  const w = VIDEO.width + 200;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={VIDEO.width} height={VIDEO.height}>
        {DUST.map((d, i) => {
          const x = ((((d.x + shift * d.z + frame * 0.08 * d.z) % w) + w) % w) - 100;
          const y = d.y - frame * 0.12 * d.z + noise(i, frame * 0.01) * 12;
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * 0.04 + i * 1.7));
          return <circle key={i} cx={x} cy={y} r={d.r} fill="#DCE6F5" opacity={0.08 + 0.22 * d.z * tw} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
