import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {COLORS, EASE, FONT, LAYOUT, SCENES, VIDEO} from '../theme';
import {S5_DEMAND, S5_ICONS, S5_INDUSTRY, S5_SLOWDOWN} from '../strings';
import {ArabicText} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {IndustryIcon} from '../components/IndustryIcon';
import {Pill} from '../components/Pill';
import {SilverBar2D} from '../components/SilverBar2D';
import {Station} from '../components/World';
import {ease, enter, hero, heroStyle, hexA, noise} from '../motion';

const START = SCENES.industry[0];
const TEXT_END = SCENES.industry[1] - START;
const TILE = {w: 186, h: 196, y: 930};
const XS = [790, 540, 290]; // RTL order
const KINDS = ['solar', 'chip', 'car'] as const;
const INGOT = {x: 540, y: 1300, w: 250};
const T = {tiles: 14, traces: 54, flowStart: 80, slowdown: 168, wave: 40};
const METER = {x: 832, y: 1236, w: 120, h: 14};

const tileBottom = TILE.y + TILE.h / 2;
const bus = 1150;
const ingotTop = INGOT.y - 40;
const TRACES = [
  `M${XS[0]},${tileBottom} V${bus - 20} Q${XS[0]},${bus} ${XS[0] - 20},${bus} H${INGOT.x + 70} Q${INGOT.x + 50},${bus} ${INGOT.x + 50},${bus + 20} V${ingotTop}`,
  `M${XS[1]},${tileBottom} V${ingotTop}`,
  `M${XS[2]},${tileBottom} V${bus - 20} Q${XS[2]},${bus} ${XS[2] + 20},${bus} H${INGOT.x - 70} Q${INGOT.x - 50},${bus} ${INGOT.x - 50},${bus + 20} V${ingotTop}`,
];
const LENS = TRACES.map((d) => getLength(d));

export const Industry: React.FC = () => {
  const frame = useCurrentFrame();
  const ingotIn = Math.max(0, hero(frame, 24));
  const traces = ease(frame, T.traces, 34, EASE.inOut);
  // The red slowdown wave sweeps right → left across the board.
  const waveX = interpolate(frame, [T.slowdown, T.slowdown + T.wave], [VIDEO.width + 120, -120], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
  const hit = (x: number) => interpolate(waveX, [x - 60, x + 60], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const slowPill = hero(frame, T.slowdown + 8);
  const demand = interpolate(frame, [T.slowdown + 10, T.slowdown + 60], [0.86, 0.32], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
  const meterIn = enter(frame, T.flowStart, 30);

  return (
    <AbsoluteFill>
      <Station index={4} from={START}>
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="ind-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <linearGradient id="ind-wave" x1="0" x2="1">
              <stop offset="0" stopColor={COLORS.red} stopOpacity="0" />
              <stop offset="0.5" stopColor={COLORS.red} stopOpacity="0.5" />
              <stop offset="1" stopColor={COLORS.red} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* faint PCB grid */}
          <g opacity={0.06 * traces}>
            {new Array(12).fill(0).map((_, i) => (
              <line key={`h${i}`} x1={150} x2={930} y1={860 + i * 50} y2={860 + i * 50} stroke="#9FB0CC" />
            ))}
          </g>
          {TRACES.map((d, i) => {
            const h = hit(XS[i]);
            const flick = h > 0 ? 0.55 + 0.45 * Math.abs(noise(i + 4, frame * 0.5)) : 1;
            const col = h > 0.5 ? COLORS.red : COLORS.blue;
            const len = LENS[i];
            return (
              <g key={i} opacity={(1 - h * 0.4) * flick}>
                <path d={d} fill="none" stroke={col} strokeWidth={8} opacity={0.25} filter="url(#ind-glow)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - traces} />
                <path d={d} fill="none" stroke={col} strokeWidth={2.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - traces} />
                {/* demand pulses flowing into the ingot; they stop once the slowdown hits */}
                {[0, 1, 2].map((k) => {
                  const t = ((frame - T.flowStart + k * 18) % 54) / 54;
                  if (frame < T.flowStart || h > 0.4) return null;
                  const pt = getPointAtLength(d, len * t);
                  if (!pt) return null;
                  return (
                    <g key={k}>
                      <circle cx={pt.x} cy={pt.y} r={9} fill={COLORS.blue} opacity={0.45} filter="url(#ind-glow)" />
                      <circle cx={pt.x} cy={pt.y} r={3.5} fill="#FFFFFF" />
                    </g>
                  );
                })}
                {/* vias */}
                <circle cx={XS[i]} cy={tileBottom + 4} r={6} fill={COLORS.ink} stroke={col} strokeWidth={2} opacity={traces} />
              </g>
            );
          })}
          {/* the slowdown wave */}
          {frame >= T.slowdown && frame <= T.slowdown + T.wave + 4 ? <rect x={waveX - 120} y={820} width={240} height={620} fill="url(#ind-wave)" /> : null}
        </svg>

        {XS.map((x, i) => {
          const p = Math.max(0, hero(frame, T.tiles + i * 8));
          const h = hit(x);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - TILE.w / 2,
                top: TILE.y - TILE.h / 2,
                width: TILE.w,
                height: TILE.h,
                borderRadius: 24,
                background: `linear-gradient(180deg, ${hexA(COLORS.blue, 0.1 * (1 - h))}, rgba(255,255,255,0.03))`,
                border: `1px solid ${hexA(h > 0.5 ? COLORS.red : COLORS.blue, 0.45)}`,
                boxShadow: `0 0 ${28 * (1 - h)}px ${hexA(COLORS.blue, 0.3)}`,
                ...heroStyle(p),
                opacity: Math.min(1, p * 1.5) * (1 - h * 0.3),
                filter: h > 0 ? `saturate(${1 - h * 0.8})` : undefined,
              }}
            >
              <div style={{position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', justifyContent: 'center'}}>
                <IndustryIcon kind={KINDS[i]} size={96} color={h > 0.5 ? '#8B93A3' : COLORS.blue} />
              </div>
              <div dir="rtl" style={{position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontFamily: FONT.family, fontSize: 26, color: COLORS.text, fontWeight: FONT.key}}>
                {S5_ICONS[i]}
              </div>
            </div>
          );
        })}

        <div style={{position: 'absolute', left: INGOT.x - INGOT.w / 2, top: INGOT.y - (INGOT.w * 160) / 300 + 20, ...heroStyle(ingotIn)}}>
          <SilverBar2D id="ind-bar" width={INGOT.w} frame={frame} sweepStart={60} sweepEvery={300} />
        </div>

        {/* demand meter */}
        <div style={{position: 'absolute', left: METER.x - METER.w / 2, top: METER.y, width: METER.w, opacity: meterIn}}>
          <div dir="rtl" style={{textAlign: 'center', fontFamily: FONT.family, fontSize: 24, color: 'rgba(245,241,232,0.7)', marginBottom: 10}}>
            {S5_DEMAND}
          </div>
          <div style={{height: METER.h, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', overflow: 'hidden', direction: 'rtl'}}>
            <div
              style={{
                width: `${demand * 100}%`,
                height: '100%',
                marginLeft: 'auto',
                background: demand > 0.6 ? COLORS.blue : COLORS.red,
                boxShadow: `0 0 12px ${demand > 0.6 ? COLORS.blue : COLORS.red}`,
              }}
            />
          </div>
          <div style={{textAlign: 'center', marginTop: 8, fontSize: 24, color: demand > 0.6 ? COLORS.blue : COLORS.red, fontFamily: FONT.family}}>
            {demand > 0.6 ? '▲' : '▼'}
          </div>
        </div>

        <At x={540} y={1132}>
          <Pill text={S5_SLOWDOWN} p={slowPill} accent="red" size={30} />
        </At>
      </Station>

      <Headline>
        <ArabicText block={S5_INDUSTRY} size={LAYOUT.headlineSize - 4} start={8} exitEnd={TEXT_END} />
      </Headline>
    </AbsoluteFill>
  );
};

