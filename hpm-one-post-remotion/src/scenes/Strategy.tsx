import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {INNER} from '../lib/layout';
import {fitSize} from '../lib/text';
import {Caption} from '../components/Caption';
import {Icon, IconName} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.strategy;
const CARD_H = 200;
const GAP = 34;
const TOP = 360;
const LEFT = INNER.left + 4;
const WIDTH = INNER.right - INNER.left - 8;

export const Strategy: React.FC = () => {
  const t = useSceneFrame();
  const spine = spr(t, C.checkAt[0] - 8, MOTION.smooth, 24);
  const iconCx = LEFT + 34 + 56;

  return (
    <AbsoluteFill>
      {/* spine connecting the three icons */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="spine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.orange} />
            <stop offset="100%" stopColor={COLORS.red} />
          </linearGradient>
        </defs>
        <line
          x1={iconCx}
          x2={iconCx}
          y1={TOP + CARD_H / 2}
          y2={mix(TOP + CARD_H / 2, TOP + 2 * (CARD_H + GAP) + CARD_H / 2, clamp(spine))}
          stroke="url(#spine)"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={spine > 0 ? 0.9 : 0}
        />
      </svg>
      {C.cards.map((card, i) => {
        const s = spr(t, C.cardAt[i], MOTION.snap);
        const dir = 1; // same direction as the whip-pan that brings the scene in
        const x = (1 - s) * dir * 1000;
        const rot = (1 - s) * dir * -8;
        const land = spr(t, C.cardAt[i] + 7, MOTION.bouncy);
        const pulse = 1 + 0.035 * Math.sin(Math.PI * clamp(land)) * (land < 1 ? 1 : 0);
        const check = spr(t, C.checkAt[i], MOTION.bouncy);
        const float = Math.sin(t * 0.08 + i * 1.9) * 4;
        const titleSize = fitSize([card.title], SIZES.cardTitle, 430);
        const lineSize = fitSize([card.line], SIZES.cardLine, 520, FONT.medium);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: LEFT,
              top: TOP + i * (CARD_H + GAP) + float,
              width: WIDTH,
              height: CARD_H,
              borderRadius: 30,
              background: COLORS.card,
              border: `2px solid ${check > 0.5 ? '#F6CDB0' : COLORS.line}`,
              boxShadow: `0 13px 30px ${COLORS.shadow}`,
              transform: `translateX(${x.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${pulse.toFixed(4)})`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 34px',
              gap: 30,
              fontFamily: FONT.family,
              overflow: 'hidden',
            }}
          >
            <div style={{position: 'absolute', left: 0, top: 26, bottom: 26, width: 7, borderRadius: 4, background: i === 1 ? COLORS.red : COLORS.orange}} />
            <div
              style={{
                width: 112,
                height: 112,
                flex: '0 0 112px',
                borderRadius: 56,
                border: `3px solid ${COLORS.line}`,
                background: COLORS.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <Icon name={card.icon as IconName} size={60} t={t} accent={i === 1 ? COLORS.red : COLORS.orange} />
            </div>
            <div data-qa="text" style={{display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0}}>
              <div style={{fontWeight: FONT.bold, fontSize: titleSize, color: COLORS.ink, letterSpacing: '-0.01em'}}>{card.title}</div>
              <div style={{fontWeight: FONT.medium, fontSize: lineSize, color: COLORS.inkSoft, whiteSpace: 'nowrap'}}>{card.line}</div>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                width: 64,
                height: 64,
                flex: '0 0 64px',
                borderRadius: 32,
                border: `3px solid ${check > 0.05 ? COLORS.orange : COLORS.line}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${(0.7 + 0.3 * clamp(check, 0, 1.2)).toFixed(3)})`,
              }}
            >
              <div style={{opacity: clamp(check * 2), transform: `scale(${check.toFixed(3)})`}}>
                <Icon name="check" size={38} color={COLORS.orange} stroke={5} />
              </div>
            </div>
          </div>
        );
      })}
      <Caption lines={C.caption} at={C.captionAt} />
      {C.cardAt.map((at, i) => (
        <Sfx key={`c${i}`} name="pop" at={at + 6} />
      ))}
      {C.checkAt.map((at, i) => (
        <Sfx key={`k${i}`} name="tap" at={at} />
      ))}
    </AbsoluteFill>
  );
};
