import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, SPRING} from '../brand';
import {Coin} from './CauseChain';
import {lin} from './motion';

/**
 * Constellation: market nodes (dollar, rates, bonds…) light up one by one and send pulses
 * along drawn lines to gold at the centre. `start` = local frame the first line draws.
 */
export const NodeConstellation: React.FC<{nodes: string[]; centre: string; start: number; width: number; height: number}> = ({
  nodes,
  centre,
  start,
  width,
  height,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.62;
  const RX = width * 0.36;
  const RY = height * 0.42;
  const angles = nodes.map((_, i) => -Math.PI / 2 - Math.PI / 2 + (i * Math.PI) / Math.max(1, nodes.length - 1)); // arc over the top
  const centreIn = spring({frame: f - (start + nodes.length * 14 + 6), fps, config: {damping: 11, stiffness: 140}});
  const stars = Array.from({length: 26}, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = ((i * 53) % 100) / 100;
    return {x: cx + Math.cos(a) * RX * 1.2 * r, y: cy + Math.sin(a) * RY * 1.1 * r, tw: (i * 17) % 40};
  });
  return (
    <div style={{position: 'relative', width, height}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={1.6} fill={C.gold0} opacity={(0.15 + 0.35 * (0.5 + 0.5 * Math.sin((f + s.tw * 3) / 14))) * lin(f, start - 20, start)} />
        ))}
        {nodes.map((_, i) => {
          const nx = cx + Math.cos(angles[i]) * RX;
          const ny = cy + Math.sin(angles[i]) * RY;
          const at = start + i * 14;
          const draw = lin(f, at, at + 18);
          const ex = nx + (cx - nx) * draw;
          const ey = ny + (cy - ny) * draw;
          const pulseT = ((f - at - 18) % 40) / 40;
          const showPulse = f > at + 18;
          return (
            <g key={i}>
              <line x1={nx} y1={ny} x2={ex} y2={ey} stroke={C.gold1} strokeOpacity={0.55} strokeWidth={2.5} />
              {showPulse ? <circle cx={nx + (cx - nx) * pulseT} cy={ny + (cy - ny) * pulseT} r={5} fill={C.gold0} opacity={1 - pulseT * 0.6} /> : null}
            </g>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const nx = cx + Math.cos(angles[i]) * RX;
        const ny = cy + Math.sin(angles[i]) * RY;
        const t = spring({frame: f - (start + i * 14 - 6), fps, config: SPRING.pill});
        return (
          <div
            key={n}
            dir="rtl"
            style={{
              position: 'absolute',
              left: nx,
              top: ny,
              transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * t})`,
              opacity: t,
              padding: '10px 22px',
              borderRadius: 999,
              background: 'rgba(11,24,56,0.85)',
              border: `1px solid rgba(212,175,55,0.45)`,
              boxShadow: '0 0 22px rgba(212,175,55,0.2)',
              color: C.text,
              fontFamily: FONT.ar,
              fontWeight: 700,
              fontSize: 28,
              whiteSpace: 'nowrap',
            }}
          >
            {n}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * centreIn})`,
          opacity: Math.min(1, centreIn * 1.5),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <div style={{filter: `drop-shadow(0 0 ${20 + 14 * Math.sin(f / 10)}px rgba(212,175,55,0.7))`}}>
          <Coin size={104} f={f} />
        </div>
        <div dir="rtl" style={{fontFamily: FONT.ar, fontWeight: 700, fontSize: 30, color: C.gold0}}>
          {centre}
        </div>
      </div>
    </div>
  );
};
