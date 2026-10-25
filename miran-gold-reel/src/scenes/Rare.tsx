import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ArabicText} from '../components/ArabicText';
import {GoldCube, cubePoints} from '../components/GoldCube';
import {S2_CUBE, S2_DIMENSION, S2_RARE} from '../strings';
import {COLORS, FONT, GOLD_GRADIENT, LAYOUT, SAFE} from '../theme';
import {dash, ease, enter, exitProgress, exitStyle, hero, heroStyle} from '../motion';

const S = 185; // cube edge on screen
const CX = 540;
const CY = 1090;

export const Rare: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const out = exitProgress(frame, dur);
  const p = hero(frame, 0);
  const rise = interpolate(p, [0, 1], [240, 0]);
  const building = ease(frame, 6, 34);
  const dim = ease(frame, 150, 36);
  const ticks = ease(frame, 176, 16);
  const pill = enter(frame, 184, 28);
  const {h} = cubePoints(S);
  const lineX = -h - 40;

  // Line 1 holds 0.8s after settling, then blurs out as line 2 enters (2-line limit)
  const l1Start = 12;
  const l1End = 121;
  const l2Start = 112;

  return (
    <AbsoluteFill>
      <ArabicText block={S2_RARE} size={78} start={l1Start} exitEnd={l1End} style={{position: 'absolute', top: LAYOUT.headlineTop + 20, left: SAFE.side, right: SAFE.side}} />
      <ArabicText block={S2_CUBE} size={46} start={l2Start} exitEnd={dur} style={{position: 'absolute', top: LAYOUT.headlineTop, left: SAFE.side, right: SAFE.side}} />

      <div style={{position: 'absolute', inset: 0, ...exitStyle(out)}}>
        {/* faint building for scale, behind the cube */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: building * 0.9}}>
          <g transform={`translate(${CX + 96}, ${CY + S / 2 - 196 + (1 - building) * 30})`}>
            <rect x={0} y={0} width={170} height={196} fill={COLORS.silhouette} />
            <rect x={66} y={-28} width={40} height={28} fill={COLORS.silhouette} />
            {Array.from({length: 7}, (_, r) =>
              Array.from({length: 4}, (_, c) => (
                <rect key={`${r}-${c}`} x={16 + c * 38} y={14 + r * 26} width={20} height={12} fill={COLORS.navyGrey} />
              )),
            )}
          </g>
        </svg>

        <div
          style={{
            position: 'absolute',
            left: CX - 200,
            top: CY - 220,
            width: 400,
            height: 440,
            ...heroStyle(p, `translateY(${rise}px)`),
          }}
        >
          <svg width={400} height={440} viewBox="-200 -220 400 440" style={{overflow: 'visible'}}>
            <ellipse cx={0} cy={S + 14} rx={190} ry={26} fill="rgba(0,0,0,0.35)" style={{filter: 'blur(12px)'}} />
            <GoldCube id="cube" s={S} frame={frame} sweepStart={60} />
          </svg>
        </div>

        {/* dimension line along the cube's left vertical edge */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <g transform={`translate(${CX}, ${CY})`}>
            <path d={`M${lineX} ${-S / 2} L${lineX} ${S / 2}`} pathLength={1} stroke={COLORS.goldB} strokeWidth={2} fill="none" style={dash(dim, 0, 0.85)} />
            <g opacity={ticks}>
              <line x1={lineX - 12} y1={-S / 2} x2={lineX + 12} y2={-S / 2} stroke={COLORS.goldB} strokeWidth={2} />
              <line x1={lineX - 12} y1={S / 2} x2={lineX + 12} y2={S / 2} stroke={COLORS.goldB} strokeWidth={2} />
            </g>
          </g>
        </svg>
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            right: 1080 - (CX + lineX - 22),
            top: CY - 30,
            height: 60,
            padding: '0 26px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 999,
            border: `1.5px solid ${COLORS.goldA}`,
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 34,
            opacity: pill,
            filter: pill < 0.99 ? `blur(${(1 - pill) * 8}px)` : undefined,
            transform: `translateY(${(1 - pill) * 18}px)`,
          }}
        >
          <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{S2_DIMENSION}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
