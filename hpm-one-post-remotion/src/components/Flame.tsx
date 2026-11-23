import React from 'react';
import {COLORS} from '../config';
import {mix} from '../lib/anim';
import {H, W} from '../lib/layout';

type Pt = [number, number];

// Flame-tongue profile in [0, 1] along x, flickering with time.
const tongue = (x: number, t: number, seed: number) => {
  const a = 0.5 + 0.5 * Math.sin(x * 0.021 + t * 0.55 + seed);
  const b = 0.5 + 0.5 * Math.sin(x * 0.047 - t * 0.9 + seed * 2.1);
  const c = 0.5 + 0.5 * Math.sin(x * 0.009 + t * 0.3 + seed * 0.7);
  return a ** 4 * 0.6 + b ** 6 * 0.3 + c * 0.1;
};

/** Points along the flame edge for wipe progress p (bottom → top). */
export const flameEdge = (p: number, t: number, height: number, seed = 0): Pt[] => {
  const base = mix(H + 140, -420, p);
  const pts: Pt[] = [];
  for (let x = -20; x <= W + 20; x += 20) {
    pts.push([x, base - 40 * Math.sin(x * 0.006 + t * 0.4) - height * tongue(x, t, seed)]);
  }
  return pts;
};

const band = (top: Pt[], bottomOffset: number, baseEdge: Pt[]) => {
  const fwd = top.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ');
  const back = [...baseEdge].reverse().map(([x, y]) => `${x.toFixed(1)},${(y + bottomOffset).toFixed(1)}`).join(' L ');
  return `M ${fwd} L ${back} Z`;
};

/** The chili-flame band that rides the wipe edge. */
export const FlameWipe: React.FC<{p: number; frame: number}> = ({p, frame}) => {
  const edge = flameEdge(p, frame, 0);
  const layers = [
    {h: 300, color: COLORS.red, op: 0.92, seed: 0.3, back: 26},
    {h: 190, color: COLORS.orange, op: 0.95, seed: 1.9, back: 18},
    {h: 70, color: '#FFE2B8', op: 0.9, seed: 3.2, back: 6},
  ];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="flameSoft" x="-5%" y="-20%" width="110%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {layers.map((l, i) => (
        <path key={i} d={band(flameEdge(p, frame, l.h, l.seed), l.back, edge)} fill={l.color} opacity={l.op} filter="url(#flameSoft)" />
      ))}
    </svg>
  );
};

/** A cluster of flickering flame tongues rising from a baseline (used behind the CTA logo). */
export const FlameFlicker: React.FC<{
  cx: number;
  baseY: number;
  width: number;
  height: number;
  frame: number;
  intensity: number; // 0..1
}> = ({cx, baseY, width, height, frame, intensity}) => {
  const tongues = 7;
  const paths = [
    {color: COLORS.red, scale: 1, op: 0.32},
    {color: COLORS.orange, scale: 0.68, op: 0.4},
  ].map((layer, li) => {
    let d = '';
    for (let i = 0; i < tongues; i++) {
      const u = (i + 0.5) / tongues;
      const x = cx + (u - 0.5) * width;
      const env = Math.sin(Math.PI * u); // taller in the middle
      const flick = 0.75 + 0.25 * Math.sin(frame * (0.5 + i * 0.07) + i * 2.3 + li) + 0.1 * Math.sin(frame * 1.7 + i);
      const h = height * env * flick * layer.scale * intensity;
      const w = (width / tongues) * 1.25 * layer.scale;
      const sway = Math.sin(frame * 0.25 + i) * w * 0.25;
      d += `M ${x - w / 2} ${baseY} C ${x - w / 2} ${baseY - h * 0.45}, ${x + sway - w * 0.15} ${baseY - h * 0.7}, ${x + sway} ${baseY - h} C ${x + sway + w * 0.15} ${baseY - h * 0.7}, ${x + w / 2} ${baseY - h * 0.45}, ${x + w / 2} ${baseY} Z `;
    }
    return <path key={li} d={d} fill={layer.color} opacity={layer.op * intensity} />;
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="flickerSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <g filter="url(#flickerSoft)">{paths}</g>
    </svg>
  );
};
