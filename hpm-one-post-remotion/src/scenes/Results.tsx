import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER, INNER_W} from '../lib/layout';
import {fitSize, formatStat} from '../lib/text';
import {Caption} from '../components/Caption';
import {Icon, IconName} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.results;
const G = {left: INNER.left, right: INNER.right, top: 360, bottom: 1060};
const fmt = (s: {value: number; format: string; prefix: string; suffix: string}, k = 1) => `${s.prefix}${formatStat(s.value * k, s.format)}${s.suffix}`;

export const Results: React.FC = () => {
  const t = useSceneFrame();
  const draw = clamp(spr(t, C.heroAt - 4, MOTION.smooth, 46));
  const pts = C.graph.map((v, i) => [mix(G.left, G.right, i / (C.graph.length - 1)), mix(G.bottom, G.top, v)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L ${G.right} ${G.bottom} L ${G.left} ${G.bottom} Z`;
  const headX = mix(G.left, G.right, draw);
  const fi = draw * (pts.length - 1);
  const i0 = Math.min(pts.length - 2, Math.floor(fi));
  const headY = mix(pts[i0][1], pts[i0 + 1][1], fi - i0);
  const pulse = (t % 20) / 20;

  const hero = spr(t, C.heroAt, MOTION.slam);
  const count = clamp(spr(t, C.heroAt + 2, MOTION.smooth, C.countFrames));
  const heroSize = fitSize([fmt(C.hero)], SIZES.heroStat, INNER_W);
  const landed = t >= C.heroAt + C.countFrames;
  const landKick = landed ? Math.exp(-(t - C.heroAt - C.countFrames) * 0.3) : 0;

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.14} />
            <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
          </linearGradient>
          <clipPath id="graphReveal">
            <rect x={G.left - 20} y={0} width={headX - G.left + 20} height={1920} />
          </clipPath>
        </defs>
        <g clipPath="url(#graphReveal)">
          <path d={area} fill="url(#areaFill)" />
          <path d={line} fill="none" stroke={COLORS.red} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {draw > 0.01 ? (
          <>
            <circle cx={headX} cy={headY} r={16 + pulse * 36} fill="none" stroke={COLORS.red} strokeWidth={4} opacity={1 - pulse} />
            <circle cx={headX} cy={headY} r={16} fill={COLORS.card} stroke={COLORS.red} strokeWidth={7} />
          </>
        ) : null}
      </svg>

      {/* hero number */}
      <div
        data-qa="text"
        style={{
          position: 'absolute',
          left: CX - INNER_W / 2,
          width: INNER_W,
          top: 500,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          color: COLORS.ink,
          opacity: clamp(hero * 3),
          transform: `scale(${(mix(1.8, 1, hero) * (1 + landKick * 0.06)).toFixed(4)})`,
        }}
      >
        <div style={{fontSize: heroSize, lineHeight: 0.95, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textShadow: `0 0 24px ${COLORS.bg}, 0 0 24px ${COLORS.bg}, 0 0 8px ${COLORS.bg}`}}>{fmt(C.hero, count)}</div>
        <div style={{fontWeight: FONT.medium, fontSize: SIZES.heroStatLabel, color: COLORS.inkSoft, marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 12, background: COLORS.bg, padding: '2px 14px', borderRadius: 12}}>
          <Icon name="arrowUp" size={40} color={COLORS.red} stroke={6} />
          {C.hero.label}
        </div>
      </div>

      {/* secondary stats */}
      <div style={{position: 'absolute', left: INNER.left, width: INNER_W, top: 880, display: 'flex', justifyContent: 'center', gap: 20}}>
        {C.stats.map((s, i) => {
          const pop = spr(t, C.statAt[i], MOTION.bouncy);
          const c = clamp(spr(t, C.statAt[i] + 2, MOTION.smooth, 24));
          return (
            <div
              key={i}
              data-qa="text"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 28px 14px 14px',
                borderRadius: 50,
                background: COLORS.card,
                border: `3px solid ${COLORS.ink}`,
                boxShadow: `0 12px 26px ${COLORS.shadow}`,
                fontFamily: FONT.family,
                whiteSpace: 'nowrap',
                opacity: clamp(pop * 3),
                transform: `translateY(${((1 - pop) * 60).toFixed(1)}px) scale(${mix(0.6, 1, pop).toFixed(4)})`,
              }}
            >
              <div style={{width: 60, height: 60, borderRadius: 30, background: COLORS.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={s.icon as IconName} size={36} t={t} color={COLORS.offWhite} accent={COLORS.offWhite} stroke={4} />
              </div>
              <span style={{fontWeight: FONT.bold, fontSize: SIZES.statValue, color: COLORS.ink, fontVariantNumeric: 'tabular-nums'}}>{fmt(s, c)}</span>
              <span style={{fontWeight: FONT.medium, fontSize: SIZES.statLabel, color: COLORS.inkSoft}}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {C.showExampleLabel ? (
        <div
          data-qa="text"
          style={{
            position: 'absolute',
            left: CX - 200,
            width: 400,
            top: 1010,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: SIZES.tiny,
            color: COLORS.inkSoft,
            opacity: clamp((t - C.statAt[C.statAt.length - 1] - 8) / 10) * 0.9,
          }}
        >
          <Icon name="info" size={26} color={COLORS.inkSoft} stroke={3.4} />
          {C.exampleLabel}
        </div>
      ) : null}
      <Caption lines={C.caption} at={C.captionAt} />
      <Sfx name="bass-hit" at={C.heroAt + C.countFrames} />
      {C.statAt.map((at, i) => (
        <Sfx key={i} name="pop" at={at} />
      ))}
    </AbsoluteFill>
  );
};
