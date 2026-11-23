import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER_W} from '../lib/layout';
import {textWidth} from '../lib/text';
import {Caption} from '../components/Caption';
import {Icon, IconName} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.strategy;
const TARGET = {x: CX, y: 690};
const RINGS = [
  {r: 280, fill: COLORS.red},
  {r: 218, fill: COLORS.card},
  {r: 156, fill: COLORS.red},
  {r: 94, fill: COLORS.card},
  {r: 40, fill: COLORS.red},
];
// Dart flies in along this direction (from upper right), tail pointing back along it.
const ANGLE = (-38 * Math.PI) / 180;
const DART_LEN = 300;

export const Strategy: React.FC = () => {
  const t = useSceneFrame();

  // Dart flight: far away → centre, arriving exactly at dartAt.
  const fly = clamp(spr(t, C.dartAt - 9, MOTION.smooth, 9));
  const hit = t >= C.dartAt;
  const dist = mix(1500, 0, fly);
  const tipX = TARGET.x + Math.cos(ANGLE) * dist;
  const tipY = TARGET.y + Math.sin(ANGLE) * dist;
  // Shaft vibrates after the hit.
  const since = t - C.dartAt;
  const quiver = hit ? Math.exp(-since * 0.16) * Math.sin(since * 1.9) * 7 : 0;
  const tailAng = ANGLE + (quiver * Math.PI) / 180;
  const tailX = tipX + Math.cos(tailAng) * DART_LEN;
  const tailY = tipY + Math.sin(tailAng) * DART_LEN;
  // Board kicks back on impact.
  const kick = hit ? Math.exp(-since * 0.25) * Math.sin(since * 1.6) : 0;
  const impact = clamp(since / 18);

  // Chips row
  const chipW = C.chips.map((c) => textWidth(c.title, SIZES.chip) + 60 + 44 + 16);
  const gap = 18;
  const totalW = chipW.reduce((a, b) => a + b, 0) + gap * (chipW.length - 1);
  const chipScale = Math.min(1, INNER_W / totalW);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g transform={`translate(${TARGET.x} ${TARGET.y}) scale(${(1 - kick * 0.04).toFixed(4)}) rotate(${(kick * 2).toFixed(2)})`}>
          <circle r={RINGS[0].r + 16} fill="none" stroke={COLORS.ink} strokeWidth={4} opacity={clamp(spr(t, C.targetAt, MOTION.snap))} />
          {RINGS.map((ring, i) => {
            const s = spr(t, C.targetAt + i * 3, MOTION.bouncy);
            return <circle key={i} r={Math.max(0, ring.r * s)} fill={ring.fill} stroke={COLORS.ink} strokeWidth={4} />;
          })}
          {hit && impact < 1 ? <circle r={50 + impact * 330} fill="none" stroke={COLORS.orange} strokeWidth={10 * (1 - impact) + 1} opacity={1 - impact} /> : null}
        </g>
        {fly > 0 ? (
          <g>
            {/* shaft */}
            <line x1={tipX} y1={tipY} x2={tailX} y2={tailY} stroke={COLORS.ink} strokeWidth={16} strokeLinecap="round" />
            {/* metal tip */}
            <line x1={tipX} y1={tipY} x2={tipX + Math.cos(tailAng) * 50} y2={tipY + Math.sin(tailAng) * 50} stroke={COLORS.inkFaint} strokeWidth={10} strokeLinecap="round" />
            {/* fletching */}
            <g transform={`translate(${tailX} ${tailY}) rotate(${((tailAng * 180) / Math.PI).toFixed(2)})`}>
              <path d="M -70 0 L 12 -46 L 0 0 Z" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -70 0 L 12 46 L 0 0 Z" fill={COLORS.orange} stroke={COLORS.ink} strokeWidth={4} strokeLinejoin="round" />
            </g>
          </g>
        ) : null}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: CX - totalW / 2,
          top: 1040,
          width: totalW,
          display: 'flex',
          gap,
          transform: `scale(${chipScale})`,
          transformOrigin: 'center top',
        }}
      >
        {C.chips.map((chip, i) => {
          const s = spr(t, C.chipAt[i], MOTION.bouncy);
          return (
            <div
              key={i}
              data-qa="text"
              style={{
                width: chipW[i],
                height: 84,
                borderRadius: 42,
                background: COLORS.card,
                border: `3px solid ${COLORS.ink}`,
                boxShadow: `0 10px 24px ${COLORS.shadow}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 26px 0 14px',
                boxSizing: 'border-box',
                fontFamily: FONT.family,
                fontWeight: FONT.bold,
                fontSize: SIZES.chip,
                color: COLORS.ink,
                whiteSpace: 'nowrap',
                opacity: clamp(s * 3),
                transform: `translateY(${((1 - s) * 60).toFixed(1)}px) scale(${mix(0.6, 1, s).toFixed(4)})`,
              }}
            >
              <div style={{width: 56, height: 56, borderRadius: 28, background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={chip.icon as IconName} size={38} t={t} accent={COLORS.red} stroke={4} />
              </div>
              {chip.title}
            </div>
          );
        })}
      </div>

      <Caption lines={C.caption} at={C.captionAt} />
      <Sfx name="whoosh" at={C.dartAt - 8} />
      <Sfx name="bass-hit" at={C.dartAt} />
      {C.chipAt.map((at, i) => (
        <Sfx key={i} name="pop" at={at} />
      ))}
    </AbsoluteFill>
  );
};
