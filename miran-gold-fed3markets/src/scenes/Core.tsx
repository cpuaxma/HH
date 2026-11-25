// S2a: the "%" from the odds card becomes the price tag on a coin; the tag gets heavier on three
// beats and the coin sinks. Then the coin is pulled up into the Fed node as the lanes return (S2b).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../brand';
import {HIT, SCENES} from '../timeline';
import {clamp, hexA, impulse, push, springAt} from '../motion';
import {Coin} from '../components/Mechanisms';

const COIN = {x: 540, y: 880, size: 230};

export const Core: React.FC = () => {
  const frame = useCurrentFrame();
  const [from] = SCENES.core;
  const appear = springAt(frame, HIT.coinIn, {damping: 13, stiffness: 150});
  const steps = HIT.tagSteps.map((f) => springAt(frame, f, {damping: 10, stiffness: 170}));
  const weight = steps.reduce((a, b) => a + b, 0); // 0 → 3
  const squash = HIT.tagSteps.reduce((m, f) => Math.max(m, impulse(frame, f, 16, 2)), 0);
  const sink = weight * 26;
  const cam = push(frame, from, HIT.corePulse, 0.05);
  // exit: coin is drawn up into the node, ahead of the pulse
  const out = interpolate(frame, [HIT.corePulse - 16, HIT.corePulse + 2], [0, 1], {...clamp, easing: (t) => t * t});
  const cx = COIN.x;
  const cy = COIN.y + sink + (400 - (COIN.y + sink)) * out;
  const scale = (0.4 + 0.6 * Math.min(1.05, appear)) * (1 - out * 0.8);
  // the "%" glyph flies in from the odds card's hero number (match-cut), then becomes the tag
  const fly = interpolate(frame, [HIT.coinIn - 12, HIT.coinIn + 10], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const tagScale = 1 + weight * 0.28;
  const tagX = cx - 190 - weight * 8;
  const tagY = cy - 150 + weight * 18;
  const startX = 545;
  const startY = 845;
  const gx = startX + (tagX - startX) * fly;
  const gy = startY + (tagY - startY) * fly;
  const glyphScale = 2.2 - 1.2 * fly;
  const shadow = 1 - out;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: '50% 50%', opacity: 1 - out * 0.9}}>
      {/* weight indicator: a soft shadow that darkens as the coin gets heavier */}
      <div
        style={{
          position: 'absolute',
          left: cx - 170,
          top: COIN.y + COIN.size / 2 + 70,
          width: 340,
          height: 40,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(0,0,0,${(0.35 + weight * 0.12) * shadow}) 0%, rgba(0,0,0,0) 70%)`,
          opacity: Math.min(1, appear),
        }}
      />
      {/* string from tag to coin */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: fly * Math.min(1, appear)}}>
        <path
          d={`M${tagX + 40} ${tagY + 20} Q${(tagX + cx) / 2} ${tagY + 40 + weight * 10} ${cx - COIN.size * 0.32 * scale} ${cy - COIN.size * 0.32 * scale}`}
          stroke={hexA(C.gold1, 0.7)}
          strokeWidth={3}
          fill="none"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx - COIN.size / 2,
          top: cy - COIN.size / 2,
          transform: `scale(${scale * (1 + squash * 0.05)}, ${scale * (1 - squash * 0.07)})`,
          opacity: Math.min(1, appear * 1.5),
        }}
      >
        <Coin size={COIN.size} />
      </div>
      {/* the % tag */}
      <div
        style={{
          position: 'absolute',
          left: gx - 50,
          top: gy - 50,
          width: 100,
          height: 100,
          transform: `scale(${glyphScale * tagScale * (1 - out * 0.8)}) rotate(${-8 + weight * 4}deg)`,
          opacity: fly,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '22px 22px 22px 50px',
            background: `linear-gradient(150deg, ${C.text}, #D9D3C2)`,
            boxShadow: `0 ${10 + weight * 6}px ${20 + weight * 8}px rgba(0,0,0,0.45)`,
            opacity: interpolate(fly, [0.6, 1], [0, 1], clamp),
          }}
        />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.en, fontWeight: 700, fontSize: 58, color: fly > 0.7 ? C.red : C.gold2}}>%</div>
        <div style={{position: 'absolute', right: 14, top: 14, width: 12, height: 12, borderRadius: '50%', background: C.bg0, opacity: interpolate(fly, [0.6, 1], [0, 1], clamp)}} />
      </div>
      {/* step labels: the cost of money climbs */}
      <div dir="rtl" style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', gap: 18, opacity: Math.min(1, appear) * (1 - out)}}>
        <span style={{fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 30, color: C.slate}}>تكلفة المال</span>
        {HIT.tagSteps.map((f, i) => (
          <span key={f} style={{fontFamily: FONT.en, fontWeight: 700, fontSize: 30, color: C.red, opacity: Math.min(1, steps[i] * 1.5), transform: `translateY(${(1 - Math.min(1, steps[i])) * 12}px)`, display: 'inline-block'}}>
            ▲
          </span>
        ))}
      </div>
    </div>
  );
};
