import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ACCENT_GLOW, CHAIN, COLORS, EASE, FONT, LAYOUT, VIDEO} from '../theme';
import {CHAIN_NODES} from '../strings';
import {ease, enter, hero, hexA} from '../motion';
import {LightStreak} from './LightStreak';
import {toneStyle} from './ArabicText';

const NODE_W = 136;
const NODE_H = 62;
const LINK_W = 54;
const MAX_SCALE = 1.2;

/**
 * The story chain at the top-middle, built right to left:
 * النفط ← التضخم ← الفائدة ← الدولار ← الذهب
 * Space for each node opens smoothly, its link draws in with a light streak,
 * then the node pops. The whole chain scales down as it grows so it always fits.
 * Expects to sit in a <Sequence from={CHAIN.start}>.
 */
export const Chain: React.FC = () => {
  const frame = useCurrentFrame() + CHAIN.start;

  const items = CHAIN_NODES.map((node, i) => {
    const t = CHAIN.nodes[i];
    return {
      ...node,
      t,
      space: enter(frame, t - 26, 32), // layout share 0→1
      pop: hero(frame, t),
      link: i === 0 ? 0 : ease(frame, t - 20, 22),
    };
  });

  // Layout (x measured from the chain's right edge, RTL).
  let cursor = 0;
  const placed = items.map((it, i) => {
    if (i > 0) cursor += it.space * LINK_W;
    const right = cursor;
    cursor += it.space * NODE_W;
    return {...it, right, center: right + (it.space * NODE_W) / 2};
  });
  const width = cursor;
  const scale = Math.min(MAX_SCALE, (LAYOUT.contentWidth * 0.94) / Math.max(1, width));
  const cx = VIDEO.width / 2;
  const xOf = (fromRight: number) => cx + width / 2 - fromRight; // chain-space → screen x (before scaling)

  const fade = interpolate(frame, CHAIN.fadeOut, [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.exit});
  const y = LAYOUT.chainY;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 1 - fade,
        filter: fade > 0.001 ? `blur(${fade * 10}px)` : undefined,
        transform: `scale(${scale})`,
        transformOrigin: `${cx}px ${y}px`,
      }}
    >
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {placed.map((it, i) => {
          if (i === 0 || it.link <= 0) return null;
          const prev = placed[i - 1];
          const x1 = xOf(prev.right + prev.space * NODE_W) - 8; // left edge of previous node
          const x2 = xOf(it.right) + 10; // right edge of this node
          const accent = it.accent;
          const head = it.link;
          const arrow = interpolate(head, [0.75, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <g key={i}>
              <LightStreak id={`chain-${i}`} d={`M${x1},${y} L${x2},${y}`} head={head} color={accent} width={2.4} bloom={6} from={[x1, y]} to={[x2, y]} />
              <path
                d={`M${x2 + 12},${y - 9} L${x2},${y} L${x2 + 12},${y + 9}`}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={arrow}
              />
            </g>
          );
        })}
      </svg>
      {placed.map((it, i) => {
        if (it.space <= 0.001) return null;
        const glow = ACCENT_GLOW[it.accent];
        const p = Math.max(0, it.pop);
        const ring = interpolate(frame, [it.t, it.t + 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.enter});
        const down = it.accent === 'gold' ? enter(frame, CHAIN.goldDownArrow, 24) : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: xOf(it.center) - NODE_W / 2,
              top: y - NODE_H / 2,
              width: NODE_W,
              height: NODE_H,
              opacity: interpolate(p, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
              transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
            }}
          >
            {ring > 0 && ring < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: NODE_H,
                  border: `2px solid ${glow}`,
                  opacity: 1 - ring,
                  transform: `scale(${1 + ring * 0.35})`,
                }}
              />
            ) : null}
            <div
              dir="rtl"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: NODE_H,
                border: `1.5px solid ${hexA(glow, 0.85)}`,
                background: `linear-gradient(180deg, ${hexA(glow, 0.16)}, ${hexA(COLORS.ink, 0.7)})`,
                boxShadow: `0 0 26px ${hexA(glow, 0.45)}, inset 0 0 14px ${hexA(glow, 0.18)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: FONT.family,
                fontSize: 32,
                lineHeight: 1,
              }}
            >
              <span style={{...toneStyle(it.accent, FONT.key), paddingBottom: 4}}>{it.label}</span>
              {down > 0.001 ? (
                <span
                  style={{
                    color: COLORS.red,
                    fontSize: 20,
                    opacity: down,
                    transform: `translateY(${(1 - down) * -10}px)`,
                    display: 'inline-block',
                  }}
                >
                  ▼
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
