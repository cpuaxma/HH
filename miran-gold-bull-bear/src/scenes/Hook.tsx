import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {GoldFlash} from '../components/Atmosphere';
import {BearSilhouette, BullSilhouette} from '../components/Silhouettes';
import {COLORS, EASE, FONT, SPRING} from '../constants';
import {clamp, ease, goldGlow, rand, shake, springAt} from '../lib';

const SLAM_AT = 5;
const IMPACT = 15;
const SIL_W = 500;

/** 1) Hook — gold flash cut, bull and bear slam in, screen shake, big headline. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // Flash cut: one hard gold frame out of black, then a softer pulse on impact.
  const flash =
    interpolate(frame, [2, 3, 9], [0, 0.95, 0], {...clamp, easing: EASE.out}) +
    interpolate(frame, [IMPACT, IMPACT + 1, IMPACT + 8], [0, 0.4, 0], clamp);

  const slam = springAt(frame, SLAM_AT, SPRING.slam);
  const slamOffset = (1 - slam) * 900;
  const blur = Math.max(0, 1 - slam) * 14;

  const sh = shake(frame, IMPACT, 14, 24);
  const push = 1 + ease(frame, IMPACT, 90) * 0.04;

  const head = springAt(frame, IMPACT + 3, {damping: 12, stiffness: 200});
  const sparks = ease(frame, IMPACT, 16);

  return (
    <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${push})`}}>
      {/* Headline */}
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 340,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.heavy,
          fontSize: 104,
          lineHeight: 1.3,
          color: COLORS.white,
          opacity: interpolate(head, [0, 0.3], [0, 1], clamp),
          transform: `scale(${interpolate(head, [0, 1], [1.5, 1])})`,
          textShadow: goldGlow(0.6),
        }}
      >
        <span style={{color: COLORS.green}}>ثور</span> 🐂 أم <span style={{color: COLORS.red}}>دب</span> 🐻؟
      </div>
      <div
        style={{
          position: 'absolute',
          top: 540,
          left: '50%',
          width: interpolate(head, [0, 1], [0, 520], clamp),
          height: 4,
          transform: 'translateX(-50%)',
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
          boxShadow: `0 0 18px ${COLORS.gold}`,
        }}
      />

      {/* Bear from the left, bull from the right */}
      <div style={{position: 'absolute', top: 760, left: 40 - slamOffset, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
        <BearSilhouette width={SIL_W} />
      </div>
      <div style={{position: 'absolute', top: 760, right: 40 - slamOffset, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
        <BullSilhouette width={SIL_W} />
      </div>

      {/* Impact sparks where they meet */}
      {sparks > 0 && sparks < 1 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 16}, (_, i) => {
            const a = (i / 16) * Math.PI * 2 + rand(i) * 0.3;
            const r0 = 20 + sparks * 120;
            const r1 = r0 + 40 + rand(i + 5) * 90 * (1 - sparks);
            const cx = 548;
            const cy = 900;
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r0}
                y1={cy + Math.sin(a) * r0}
                x2={cx + Math.cos(a) * r1}
                y2={cy + Math.sin(a) * r1}
                stroke={COLORS.goldLight}
                strokeWidth={5 * (1 - sparks) + 1}
                strokeLinecap="round"
                opacity={1 - sparks}
              />
            );
          })}
          <circle cx={548} cy={900} r={30 + sparks * 220} fill="none" stroke={COLORS.gold} strokeWidth={6 * (1 - sparks)} opacity={1 - sparks} />
        </svg>
      ) : null}

      <GoldFlash amount={Math.min(1, flash)} />
    </AbsoluteFill>
  );
};
