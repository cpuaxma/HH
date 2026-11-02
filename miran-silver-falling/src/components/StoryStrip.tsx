import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, LAYOUT, SAFE, VIDEO} from '../theme';
import {enter, hexA} from '../motion';
import {LightStreak} from './LightStreak';
import {IndustryIcon} from './IndustryIcon';
import {SilverBar2D} from './SilverBar2D';

const N = 7;
const W = 106;
const H = 188;
const GAP = (LAYOUT.contentWidth - N * W) / (N - 1);
/** Tile geometry. Index 0 is the first station (the hook, right-most); index 6 is the tip (left-most). */
export const STRIP = {
  w: W,
  h: H,
  y: 1000,
  tiles: new Array(N).fill(0).map((_, i) => ({x: VIDEO.width - SAFE.side - W / 2 - i * (W + GAP)})),
};

const Mini: React.FC<{i: number; frame: number}> = ({i, frame}) => {
  switch (i) {
    case 0:
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g transform="translate(13, 66)">
            <SilverBar2D id="mini-bar" width={80} frame={frame} sweepStart={9999} />
          </g>
          <path d="M28,86 L40,82 L46,88 L58,83 L66,88 L78,84" fill="none" stroke={COLORS.red} strokeWidth={2} />
        </svg>
      );
    case 1:
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d="M14,120 L24,96 L30,60 L36,104 L52,110 L70,116 L92,128" fill="none" stroke="#F4F6FA" strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M30,60 L36,104" stroke={COLORS.red} strokeWidth={3} />
        </svg>
      );
    case 2:
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={60} y={50} width={24} height={90} rx={12} fill="none" stroke="#FFFFFF" strokeOpacity={0.4} />
          <rect x={62} y={76} width={20} height={62} rx={10} fill={COLORS.goldA} />
          <rect x={22} y={50} width={24} height={90} rx={12} fill="none" stroke="#FFFFFF" strokeOpacity={0.4} />
          <rect x={24} y={104} width={20} height={34} rx={10} fill="#C9D3E2" />
        </svg>
      );
    case 3:
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[COLORS.green, COLORS.red, COLORS.red].map((c, k) => (
            <rect key={k} x={26} y={56 + k * 18} width={54} height={15} rx={3} fill="#1C2333" stroke={c} strokeWidth={1.5} />
          ))}
          <path d="M30,112 H76 L70,126 H36 Z" fill="#C3CBD7" />
          <path d="M53,128 l-14,5 l28,5 l-28,5 l28,5 l-14,5" fill="none" stroke="#C9D3E2" strokeWidth={1.5} />
        </svg>
      );
    case 4:
      return (
        <div style={{width: W, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <IndustryIcon kind="chip" size={58} color={COLORS.blue} stroke={4} />
        </div>
      );
    case 5:
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <ellipse cx={66} cy={104} rx={28} ry={8} fill={COLORS.goldA} />
          <ellipse cx={30} cy={108} rx={14} ry={4} fill="#C9D3E2" />
          <path d="M30,70 c3,5 4,8 4,10 a4,4 0 0 1 -8,0 c0,-2 1,-5 4,-10 Z" fill={COLORS.red} />
          <ellipse cx={30} cy={108} rx={20} ry={6} fill="none" stroke="#FFFFFF" strokeOpacity={0.6} />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * The whole story at a glance: one small tile per station, in a row (story order right → left).
 * The tip station itself shrinks into the left-most tile (see Tip). `frame` is local to the CTA.
 */
export const StoryStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [76, 92], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
  const line = interpolate(frame, [30, 66], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut});
  const x0 = STRIP.tiles[0].x + W / 2;
  const x1 = STRIP.tiles[N - 1].x - W / 2;
  const ly = STRIP.y + H / 2 + 34;
  if (out >= 1) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 12}px)` : undefined}}>
      {STRIP.tiles.slice(0, N - 1).map((t, i) => {
        const p = enter(frame, 10 + i * 5, 26);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: t.x - W / 2,
              top: STRIP.y - H / 2,
              width: W,
              height: H,
              borderRadius: 14,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
              border: `1px solid ${hexA('#FFFFFF', 0.16)}`,
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px) scale(${0.85 + 0.15 * p})`,
              filter: p < 0.99 ? `blur(${(1 - p) * 8}px)` : undefined,
              overflow: 'hidden',
            }}
          >
            <Mini i={i} frame={frame} />
          </div>
        );
      })}
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
        <LightStreak id="strip-line" d={`M${x0},${ly} L${x1},${ly}`} head={line} width={2.4} bloom={8} from={[x0, ly]} to={[x1, ly]} />
        {STRIP.tiles.map((t, i) => (
          <circle key={i} cx={t.x} cy={ly} r={4} fill="#F4F6FA" opacity={line >= (i / (N - 1)) * 0.98 ? 1 : 0} />
        ))}
      </svg>
    </div>
  );
};
