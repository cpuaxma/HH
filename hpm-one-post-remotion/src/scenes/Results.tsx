import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER} from '../lib/layout';
import {fitSize, formatStat} from '../lib/text';
import {Caption} from '../components/Caption';
import {Icon, IconName} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.results;
const G = {left: INNER.left + 4, right: INNER.right - 4, top: 370, bottom: 1000};
const TILE_W = 250;
const TILE_H = 236;
const TILE_GAP = (G.right - G.left - TILE_W * 3) / 2;
const TILE_TOP = 742;

export const Results: React.FC = () => {
  const t = useSceneFrame();
  const draw = clamp(spr(t, C.graphAt, MOTION.smooth, 56));
  const pts = C.graph.map((v, i) => [mix(G.left, G.right, i / (C.graph.length - 1)), mix(G.bottom - 20, G.top + 20, v)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L ${G.right} ${G.bottom} L ${G.left} ${G.bottom} Z`;
  const headX = mix(G.left, G.right, draw);
  const fi = draw * (pts.length - 1);
  const i0 = Math.min(pts.length - 2, Math.floor(fi));
  const headY = mix(pts[i0][1], pts[i0 + 1][1], fi - i0);
  const pulse = (t % 24) / 24;

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.orange} />
            <stop offset="100%" stopColor={COLORS.red} />
          </linearGradient>
          <clipPath id="graphReveal">
            <rect x={G.left - 20} y={0} width={headX - G.left + 20} height={1920} />
          </clipPath>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = mix(G.top, G.bottom, i / 4);
          const grid = clamp(spr(t, i * 2, MOTION.smooth, 20));
          return <line key={i} x1={G.left} x2={mix(G.left, G.right, grid)} y1={y} y2={y} stroke={COLORS.offWhite} strokeOpacity={0.07} strokeWidth={2} strokeDasharray="6 10" />;
        })}
        <g clipPath="url(#graphReveal)">
          <path d={area} fill="url(#areaFill)" />
          <path d={line} fill="none" stroke="url(#lineStroke)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {draw > 0.01 ? (
          <>
            <circle cx={headX} cy={headY} r={12 + pulse * 30} fill="none" stroke={COLORS.red} strokeWidth={3} opacity={1 - pulse} />
            <circle cx={headX} cy={headY} r={12} fill={COLORS.offWhite} stroke={COLORS.red} strokeWidth={5} />
          </>
        ) : null}
      </svg>

      {C.stats.map((s, i) => {
        const pop = spr(t, C.statAt[i], MOTION.bouncy);
        const count = clamp(spr(t, C.statAt[i] + 2, MOTION.smooth, C.countFrames));
        const value = `${s.prefix}${formatStat(s.value * count, s.format)}${s.suffix}`;
        const finalValue = `${s.prefix}${formatStat(s.value, s.format)}${s.suffix}`;
        const vSize = fitSize([finalValue], SIZES.statValue, TILE_W - 48);
        const float = Math.sin(t * 0.09 + i * 1.6) * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: G.left + i * (TILE_W + TILE_GAP),
              top: TILE_TOP + float,
              width: TILE_W,
              height: TILE_H,
              borderRadius: 28,
              background: 'rgba(24,24,24,0.92)',
              border: `2px solid ${COLORS.border}`,
              boxShadow: '0 26px 60px rgba(0,0,0,0.55)',
              transform: `translateY(${((1 - pop) * 120).toFixed(1)}px) scale(${mix(0.7, 1, pop).toFixed(4)})`,
              opacity: clamp(pop * 2.5),
              padding: '24px 24px',
              fontFamily: FONT.family,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: 54, height: 54, borderRadius: 27, background: COLORS.charcoal, border: `2px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={s.icon as IconName} size={32} t={t} accent={i === 2 ? COLORS.red : COLORS.orange} stroke={4} />
              </div>
              <div style={{marginLeft: 'auto', opacity: clamp(count * 3), transform: `translateY(${((1 - count) * 10).toFixed(1)}px)`}}>
                <Icon name="arrowUp" size={30} color={COLORS.orange} stroke={5} />
              </div>
            </div>
            <div data-qa="text">
              <div style={{fontWeight: FONT.bold, fontSize: vSize, color: COLORS.offWhite, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{value}</div>
              <div style={{fontWeight: FONT.medium, fontSize: SIZES.statLabel, color: COLORS.muted, marginTop: 10}}>{s.label}</div>
            </div>
          </div>
        );
      })}

      {C.showExampleLabel ? (
        <div
          data-qa="text"
          style={{
            position: 'absolute',
            left: CX - 200,
            width: 400,
            top: TILE_TOP + TILE_H + 26,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: SIZES.tiny,
            color: COLORS.muted,
            opacity: clamp((t - C.statAt[2] - 10) / 10) * 0.9,
          }}
        >
          <Icon name="info" size={26} color={COLORS.muted} stroke={3.4} />
          {C.exampleLabel}
        </div>
      ) : null}
      <Caption lines={C.caption} at={C.captionAt} />
      {C.statAt.map((at, i) => (
        <Sfx key={i} name="pop" at={at} />
      ))}
    </AbsoluteFill>
  );
};
