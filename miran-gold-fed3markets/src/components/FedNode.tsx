import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, SPRING} from '../brand';
import {HIT, SCENES} from '../timeline';
import {hexA, impulse, kf, springAt} from '../motion';
import {PULSES} from './FedPulse';

/** Abstract columned building (no seal, no logo). Drawn in a 200×200 box. */
export const BuildingIcon: React.FC<{size: number; glow?: number}> = ({size, glow = 0}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="fedGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.gold1} />
        <stop offset="52%" stopColor={C.gold2} />
        <stop offset="100%" stopColor={C.gold3} />
      </linearGradient>
      <radialGradient id="fedDisc" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stopColor="#16285A" />
        <stop offset="100%" stopColor="#081230" />
      </radialGradient>
    </defs>
    <circle cx={100} cy={100} r={96} fill="url(#fedDisc)" stroke="url(#fedGold)" strokeWidth={3} />
    <circle cx={100} cy={100} r={86} fill="none" stroke={hexA(C.gold2, 0.25 + glow * 0.5)} strokeWidth={1.5} />
    <g fill="url(#fedGold)">
      <path d="M48 80 L100 50 L152 80 Z" />
      <rect x={46} y={82} width={108} height={8} rx={1.5} />
      {[56, 80, 108, 132].map((x) => (
        <rect key={x} x={x} y={94} width={12} height={40} rx={2} />
      ))}
      <rect x={44} y={137} width={112} height={7} rx={1.5} />
      <rect x={36} y={147} width={128} height={7} rx={1.5} />
    </g>
  </svg>
);

/** Where the node sits (centre x/y and diameter) at any frame of the reel. */
export const nodeState = (frame: number) => {
  const slam = springAt(frame, HIT.nodeSlam, SPRING.slam);
  const y = kf(frame, [
    [HIT.nodeToTop, 530],
    [HIT.nodeToTop + 30, 400],
  ]);
  const size = kf(frame, [
    [HIT.nodeToTop, 230],
    [HIT.nodeToTop + 30, 150],
  ]);
  const enterScale = frame < HIT.nodeSlam ? 0 : 2.4 - 1.4 * slam;
  const opacity = frame < HIT.nodeSlam ? 0 : Math.min(1, (frame - HIT.nodeSlam) / 4) * kf(frame, [[SCENES.outro[0], 1], [SCENES.outro[0] + 20, 0]]);
  return {x: 540, y, size: size * enterScale, opacity};
};

export const FedNode: React.FC = () => {
  const frame = useCurrentFrame();
  const s = nodeState(frame);
  if (s.opacity <= 0) return null;
  // each pulse flashes the node; a slow breathing glow keeps it alive between hits
  const flash = PULSES.reduce((m, p) => Math.max(m, impulse(frame, p.at, 24, 2)), 0);
  const slamFlash = impulse(frame, HIT.nodeSlam, 20, 1);
  const breathe = 0.5 + 0.5 * Math.sin(frame / 22);
  const glow = Math.max(flash, slamFlash);
  const scale = 1 + flash * 0.06;
  return (
    <div style={{position: 'absolute', left: s.x - s.size / 2, top: s.y - s.size / 2, width: s.size, height: s.size, opacity: s.opacity, transform: `scale(${scale})`}}>
      <div
        style={{
          position: 'absolute',
          inset: -s.size * 0.35,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hexA(C.gold2, 0.22 + 0.08 * breathe + glow * 0.45)} 0%, ${hexA(C.gold2, 0)} 65%)`,
        }}
      />
      <BuildingIcon size={s.size} glow={glow} />
      <div
        style={{
          position: 'absolute',
          top: s.size + 8,
          left: -100,
          right: -100,
          textAlign: 'center',
          fontFamily: FONT.en,
          fontWeight: FONT.enSemi,
          fontSize: Math.max(16, s.size * 0.13),
          letterSpacing: 6,
          color: C.slate,
        }}
      >
        FED
      </div>
    </div>
  );
};
