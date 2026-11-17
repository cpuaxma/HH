import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, STAGE} from '../config';
import {Headline} from '../components/Headline';
import {useSceneFrame} from '../components/SceneShell';
import {ramp, settle} from '../motion';

const COUNT = 4;
const S = 96; // cube edge (isometric half-height)
const W = S * Math.cos(Math.PI / 6); // half width
const GAP = 242; // centre to centre
const CY = STAGE.cy + 10;
const xOf = (i: number) => STAGE.cx + ((COUNT - 1) / 2 - i) * GAP; // i = 0 is the rightmost (first in RTL)
const APPEAR = (i: number) => 14 + i * 20;
const LINK = (i: number) => APPEAR(i + 1) + 12; // link between block i and i+1
const PULSE = [118, 178];

/** An isometric gold block with ledger lines engraved on its faces. */
const Block: React.FC<{f: number; i: number; lit: number}> = ({f, i, lit}) => {
  const p = settle(f, APPEAR(i), 30);
  const rows = ramp(f, APPEAR(i) + 10, APPEAR(i) + 34);
  const top = `0,${-S} ${W},${-S / 2} 0,0 ${-W},${-S / 2}`;
  const left = `${-W},${-S / 2} 0,0 0,${S} ${-W},${S / 2}`;
  const right = `0,0 ${W},${-S / 2} ${W},${S / 2} 0,${S}`;
  return (
    <g
      transform={`translate(${xOf(i)} ${CY + (1 - p) * 40}) scale(${0.85 + 0.15 * p})`}
      opacity={p}
      style={{filter: `drop-shadow(0 0 ${18 + lit * 26}px rgba(212,175,55,${0.3 + lit * 0.45}))`}}
    >
      <polygon points={top} fill="url(#blkTop)" stroke={COLORS.goldPale} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={left} fill="url(#blkLeft)" stroke="#B8912C" strokeWidth={2} strokeLinejoin="round" />
      <polygon points={right} fill="url(#blkRight)" stroke="#D9BB5A" strokeWidth={2} strokeLinejoin="round" />
      {/* ledger rows on the right face (sheared to the face) */}
      <g transform={`matrix(${W / 100} ${-S / 2 / 100} 0 ${S / 100} 0 0)`} opacity={0.85}>
        {[22, 42, 62].map((y, k) => (
          <line
            key={y}
            x1={14}
            y1={y}
            x2={14 + (k === 2 ? 44 : 72) * Math.min(1, Math.max(0, rows * 3 - k))}
            y2={y}
            stroke="#5E4512"
            strokeWidth={5}
            strokeLinecap="round"
          />
        ))}
      </g>
      <g transform={`matrix(${W / 100} ${S / 2 / 100} 0 ${S / 100} ${-W} ${-S / 2})`} opacity={0.6}>
        {[22, 42, 62].map((y, k) => (
          <line
            key={y}
            x1={14}
            y1={y}
            x2={14 + 60 * Math.min(1, Math.max(0, rows * 3 - k))}
            y2={y}
            stroke="#3E2E0B"
            strokeWidth={5}
            strokeLinecap="round"
          />
        ))}
      </g>
      {/* glow on the top face as the pulse passes */}
      <polygon points={top} fill={COLORS.goldPale} opacity={lit * 0.55} />
    </g>
  );
};

/** Two interlocking chain links between block i and i+1. */
const Link: React.FC<{f: number; i: number; lit: number}> = ({f, i, lit}) => {
  const p = ramp(f, LINK(i), LINK(i) + 20);
  const x = (xOf(i) + xOf(i + 1)) / 2;
  const y = CY + S * 0.1;
  const ringLen = 2 * Math.PI * 22;
  return (
    <g transform={`translate(${x} ${y})`} style={{filter: `drop-shadow(0 0 ${10 + lit * 18}px rgba(243,220,133,${0.5 + lit * 0.4}))`}}>
      <ellipse
        cx={13}
        cy={0}
        rx={26}
        ry={14}
        fill="none"
        stroke={COLORS.goldLight}
        strokeWidth={7}
        strokeDasharray={ringLen}
        strokeDashoffset={ringLen * (1 - p)}
      />
      <rect
        x={-40}
        y={-5}
        width={48 * p}
        height={10}
        rx={5}
        fill={COLORS.gold}
        stroke={COLORS.goldPale}
        strokeWidth={2}
        opacity={p}
      />
      <circle r={9} cx={0} fill={COLORS.goldPale} opacity={lit} />
    </g>
  );
};

/** 10–17s: gold blocks appear one after another and lock together into a glowing chain. */
export const Blockchain: React.FC = () => {
  const f = useSceneFrame();
  // a light pulse runs along the chain, right to left, then the whole chain breathes
  const pulse = ramp(f, PULSE[0], PULSE[1], (x) => x);
  const pulseX = xOf(0) + (xOf(COUNT - 1) - xOf(0)) * pulse;
  const near = (x: number) => (pulse > 0 && pulse < 1 ? Math.exp(-(((x - pulseX) / 110) ** 2)) : 0);
  const after = ramp(f, PULSE[1] - 10, PULSE[1] + 20) * 0.35;
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <linearGradient id="blkTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.goldPale} />
            <stop offset="55%" stopColor={COLORS.goldLight} />
            <stop offset="100%" stopColor={COLORS.gold} />
          </linearGradient>
          <linearGradient id="blkLeft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8912C" />
            <stop offset="100%" stopColor="#5E4512" />
          </linearGradient>
          <linearGradient id="blkRight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.gold} />
            <stop offset="100%" stopColor="#8C6B1C" />
          </linearGradient>
        </defs>
        {/* reflection line under the chain */}
        <line
          x1={xOf(COUNT - 1) - 140}
          x2={xOf(0) + 140}
          y1={CY + S + 46}
          y2={CY + S + 46}
          stroke={COLORS.gold}
          strokeOpacity={0.25 * ramp(f, 20, 80)}
          strokeWidth={2}
        />
        {Array.from({length: COUNT - 1}, (_, i) => (
          <Link key={i} f={f} i={i} lit={Math.max(near((xOf(i) + xOf(i + 1)) / 2), after)} />
        ))}
        {Array.from({length: COUNT}, (_, i) => (
          <Block key={i} f={f} i={i} lit={Math.max(near(xOf(i)), after)} />
        ))}
      </svg>
      <Headline />
    </AbsoluteFill>
  );
};
