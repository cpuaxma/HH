// The signature device: a gold ring shockwave that leaves the Fed node and travels to the lanes.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE, VIDEO} from '../brand';
import {HIT} from '../timeline';
import {clamp} from '../motion';
import {nodeState} from './FedNode';

export type Pulse = {at: number; reach: number};

/** Every pulse in the reel. Each chapter opens with one. */
export const PULSES: Pulse[] = [
  {at: HIT.hookPulse, reach: 1300},
  {at: HIT.corePulse, reach: 1100},
  {at: HIT.ch1Pulse, reach: 700},
  {at: HIT.ch2Pulse, reach: 900},
  {at: HIT.ch3Pulse, reach: 900},
  {at: HIT.teasePulse, reach: 1200},
];

const DUR = 54;

const Ring: React.FC<{r: number; w: number; o: number; color: string; dx?: number}> = ({r, w, o, color, dx = 0}) => (
  <circle cx={dx} cy={0} r={Math.max(0, r)} fill="none" stroke={color} strokeWidth={w} opacity={o} />
);

export const FedPulseLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const node = nodeState(frame);
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {PULSES.map((p, i) => {
        const rings = [0, 9];
        return rings.map((delay, k) => {
          const t = frame - p.at - delay;
          if (t < 0 || t > DUR) return null;
          const prog = interpolate(t, [0, DUR], [0, 1], {...clamp, easing: EASE.entry});
          const r = node.size * 0.5 + prog * p.reach;
          const o = interpolate(t, [0, 4, DUR], [0, 1, 0], clamp) * (k === 0 ? 1 : 0.45);
          const w = interpolate(prog, [0, 1], [10, 1.5]);
          return (
            <g key={`${i}-${k}`} transform={`translate(${node.x} ${node.y})`} style={{mixBlendMode: 'screen'}}>
              {/* 2px chromatic fringe */}
              <Ring r={r} w={w} o={o * 0.55} color="#FF4D6D" dx={-2} />
              <Ring r={r} w={w} o={o * 0.55} color="#4DD8FF" dx={2} />
              <g filter="url(#ringGlow)">
                <Ring r={r} w={w} o={o} color={C.gold1} />
              </g>
            </g>
          );
        });
      })}
    </svg>
  );
};
