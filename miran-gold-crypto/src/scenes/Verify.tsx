import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS} from '../config';
import {Headline} from '../components/Headline';
import {WalletIcon} from '../components/icons';
import {useSceneFrame} from '../components/SceneShell';
import {EASE} from '../config';
import {lerp, ramp, settle} from '../motion';

// Route of the transaction: sender wallet (right) → over the network → receiver wallet (left).
const P0 = [872, 1236];
const P1 = [830, 860];
const P2 = [250, 860];
const P3 = [208, 1236];
const bez = (s: number) => {
  const u = 1 - s;
  const a = u * u * u, b = 3 * u * u * s, c = 3 * u * s * s, d = s * s * s;
  return [a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0], a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1]];
};
const ROUTE = `M${P0} C${P1} ${P2} ${P3}`;
const TRAVEL = [34, 112]; // frames
const travelS = (f: number) => ramp(f, TRAVEL[0], TRAVEL[1], EASE.inOut);
/** Frame at which the packet reaches route position s (inverse of travelS, by search). */
const frameAt = (s: number) => {
  for (let f = TRAVEL[0]; f <= TRAVEL[1]; f++) if (travelS(f) >= s) return f;
  return TRAVEL[1];
};

// Network nodes along and around the route.
const NODES = [
  {s: 0.1, off: -70}, {s: 0.2, off: 80}, {s: 0.32, off: -95}, {s: 0.42, off: 60},
  {s: 0.5, off: -60}, {s: 0.58, off: 95}, {s: 0.68, off: -90}, {s: 0.8, off: 70}, {s: 0.9, off: -75},
].map((n) => {
  const [x, y] = bez(n.s);
  const [x2, y2] = bez(Math.min(1, n.s + 0.01));
  const len = Math.hypot(x2 - x, y2 - y);
  const nx = -(y2 - y) / len, ny = (x2 - x) / len; // normal
  return {x: x + nx * n.off, y: y + ny * n.off, at: frameAt(n.s)};
});
const EDGES: [number, number][] = [];
NODES.forEach((_, i) => {
  if (i + 1 < NODES.length) EDGES.push([i, i + 1]);
  if (i + 2 < NODES.length) EDGES.push([i, i + 2]);
});

const Node: React.FC<{f: number; i: number}> = ({f, i}) => {
  const n = NODES[i];
  const show = settle(f, 4 + i * 3, 24);
  const lit = ramp(f, n.at - 2, n.at + 10);
  const ripple = ramp(f, n.at, n.at + 30, EASE.out);
  return (
    <g transform={`translate(${n.x} ${n.y})`} opacity={show}>
      <circle r={22 + ripple * 40} fill="none" stroke={COLORS.goldLight} strokeWidth={2.5} opacity={(1 - ripple) * lit * 0.8} />
      <circle r={20} fill={lit > 0.5 ? COLORS.gold : '#1C1A14'} stroke={COLORS.gold} strokeWidth={3}
        style={{filter: `drop-shadow(0 0 ${6 + lit * 20}px rgba(243,220,133,${0.25 + lit * 0.6}))`}} />
      <circle r={20} fill={COLORS.goldLight} opacity={lit * 0.85} />
      <path d="M-8 1 L-2 7 L9 -6" fill="none" stroke="#2A2008" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={30} strokeDashoffset={30 * (1 - ramp(f, n.at + 4, n.at + 16))} />
    </g>
  );
};

const Lock: React.FC<{f: number}> = ({f}) => {
  const show = settle(f, 116, 30);
  const close = ramp(f, 136, 152, EASE.inOut);
  const pulse = ramp(f, 150, 180, EASE.out);
  return (
    <g transform={`translate(540 1250) scale(${0.9 + 0.1 * show})`} opacity={show}>
      <circle r={90 + pulse * 90} fill="none" stroke={COLORS.goldLight} strokeWidth={3} opacity={(1 - pulse) * 0.7 * (pulse > 0 ? 1 : 0)} />
      <circle r={100} fill="rgba(10,10,10,0.75)" />
      <circle r={100} fill="none" stroke={COLORS.gold} strokeOpacity={0.35} strokeWidth={2} />
      <path
        d="M-30 -10 V-40 A30 30 0 0 1 30 -40 V-10"
        transform={`translate(0 ${-30 * (1 - close)})`}
        fill="none"
        stroke={COLORS.goldLight}
        strokeWidth={13}
        strokeLinecap="round"
      />
      <rect x={-50} y={-14} width={100} height={78} rx={14} fill="url(#lockBody)" stroke={COLORS.goldPale} strokeWidth={2}
        style={{filter: `drop-shadow(0 0 ${14 + 24 * close}px rgba(212,175,55,${0.4 + 0.4 * close}))`}} />
      <circle cx={0} cy={18} r={9} fill="#2A2008" />
      <path d="M0 22 V40" stroke="#2A2008" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

/** 17–23s: a transaction travels between wallets, the network verifies it, and it locks. */
export const Verify: React.FC = () => {
  const f = useSceneFrame();
  const s = travelS(f);
  const moving = f >= TRAVEL[0] - 4 && f <= TRAVEL[1] + 10;
  const arrive = ramp(f, TRAVEL[1] - 4, TRAVEL[1] + 14) * (1 - ramp(f, TRAVEL[1] + 30, TRAVEL[1] + 60));
  const send = ramp(f, TRAVEL[0] - 8, TRAVEL[0] + 6) * (1 - ramp(f, TRAVEL[0] + 10, TRAVEL[0] + 40));
  const walletIn = settle(f, 0, 30);
  const routeDraw = ramp(f, 10, 40);
  const packetOpacity = lerp(f, [TRAVEL[0] - 4, TRAVEL[0] + 4, TRAVEL[1], TRAVEL[1] + 10], [0, 1, 1, 0]);
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <linearGradient id="lockBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.goldLight} />
            <stop offset="100%" stopColor="#9C7A22" />
          </linearGradient>
          <radialGradient id="packet">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor={COLORS.goldPale} />
            <stop offset="100%" stopColor={COLORS.gold} />
          </radialGradient>
        </defs>
        {EDGES.map(([a, b], k) => {
          const lit = Math.min(ramp(f, NODES[a].at, NODES[a].at + 12), ramp(f, NODES[b].at, NODES[b].at + 12));
          return (
            <line key={k} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
              stroke={COLORS.gold} strokeWidth={2} strokeOpacity={(0.14 + lit * 0.5) * ramp(f, 6 + k, 30 + k)} />
          );
        })}
        <path d={ROUTE} fill="none" stroke={COLORS.gold} strokeOpacity={0.35} strokeWidth={3}
          strokeDasharray="4 14" strokeLinecap="round" pathLength={1000}
          style={{clipPath: `inset(0 0 0 ${(1 - routeDraw) * 100}%)`}} />
        {NODES.map((_, i) => (
          <Node key={i} f={f} i={i} />
        ))}
        {moving
          ? Array.from({length: 9}, (_, k) => {
              const sk = Math.max(0, s - k * 0.018);
              const [x, y] = bez(sk);
              return (
                <circle key={k} cx={x} cy={y} r={20 - k * 1.8} fill="url(#packet)"
                  opacity={packetOpacity * (k === 0 ? 1 : 0.35 * (1 - k / 9))}
                  style={k === 0 ? {filter: 'drop-shadow(0 0 22px rgba(255,241,194,0.95))'} : undefined} />
              );
            })
          : null}
        <Lock f={f} />
      </svg>
      {[
        {x: P0[0], glow: send},
        {x: P3[0], glow: arrive},
      ].map((w, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: w.x - 80,
            top: 1270,
            width: 160,
            height: 160,
            opacity: walletIn,
            transform: `translateY(${(1 - walletIn) * 20}px) scale(${1 + w.glow * 0.06})`,
            filter: `drop-shadow(0 0 ${12 + w.glow * 30}px rgba(243,220,133,${0.3 + w.glow * 0.6}))`,
          }}
        >
          <WalletIcon size={160} color={COLORS.goldLight} stroke={5} />
        </div>
      ))}
      <Headline />
    </AbsoluteFill>
  );
};
