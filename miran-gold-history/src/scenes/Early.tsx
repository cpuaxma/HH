import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, ERA_TINT, LAYOUT, VIDEO} from '../theme';
import {S1_HOOK, S2_FIRST, S3_EGYPT, S4_LYDIA, S5_DINAR} from '../strings';
import {Layer, SceneText} from '../components/SceneText';
import {DollyLayer} from '../components/World';
import {LightStreak} from '../components/LightStreak';
import {ease, enter, hexA} from '../motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 1 · Hook: darkness, then the first light on a nugget (the nugget and rays live at the reel level). */
export const Hook: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'back') {
    // Start from black and open up.
    const open = interpolate(frame, [0, 40], [1, 0], {...clamp, easing: EASE.enter});
    return <AbsoluteFill style={{background: '#05070C', opacity: open}} />;
  }
  return <SceneText k="hook" block={S1_HOOK} size={LAYOUT.headlineSize + 2} start={4} />;
};

/** 2 · The first gold: the nugget becomes a hammered bangle. */
export const First: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'back') {
    // A soft sand-coloured halo on the floor where the bangle turns.
    const p = enter(frame, 30, 50);
    return (
      <DollyLayer k="first">
        <div
          style={{
            position: 'absolute',
            left: 540 - 360,
            top: 1240,
            width: 720,
            height: 180,
            borderRadius: '50%',
            opacity: p,
            background: `radial-gradient(ellipse at center, ${hexA(ERA_TINT.first, 0.22)} 0%, ${hexA(ERA_TINT.first, 0)} 70%)`,
          }}
        />
      </DollyLayer>
    );
  }
  return <SceneText k="first" block={S2_FIRST} />;
};

/** 3 · Egypt: a line-art pyramid drawn in light, the sun disc rising behind it with rays. */
export const Egypt: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'front') return <SceneText k="egypt" block={S3_EGYPT} />;
  const base = 1400;
  const apex = {x: 540, y: 1000};
  const left = 214;
  const right = 866;
  const face = 610; // the visible edge between the two faces
  const draw = ease(frame, 26, 56, EASE.inOut);
  const edge = ease(frame, 70, 30, EASE.inOut);
  const sun = {x: 540, y: 868};
  const rays = ease(frame, 76, 50, EASE.enter);
  const amber = ERA_TINT.egypt;
  const fill = enter(frame, 60, 50);
  return (
    <DollyLayer k="egypt">
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="pyr-fill" x1="0" y1={apex.y} x2="0" y2={base} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={amber} stopOpacity="0.16" />
            <stop offset="1" stopColor={amber} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* sun rays fanning out behind everything */}
        {new Array(16).fill(0).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 + frame * 0.002;
          const r0 = 130;
          const r1 = 130 + 260 * rays * (i % 2 ? 0.7 : 1);
          return (
            <line
              key={i}
              x1={sun.x + Math.cos(a) * r0}
              y1={sun.y + Math.sin(a) * r0}
              x2={sun.x + Math.cos(a) * r1}
              y2={sun.y + Math.sin(a) * r1}
              stroke={amber}
              strokeOpacity={0.35 * rays}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        <polygon points={`${left},${base} ${apex.x},${apex.y} ${right},${base}`} fill="url(#pyr-fill)" opacity={fill} />
        <LightStreak
          id="pyr-outline"
          d={`M${left},${base} L${apex.x},${apex.y} L${right},${base} Z`}
          head={draw}
          color="amber"
          width={2.6}
          bloom={8}
          from={[left, base]}
          to={[right, base]}
        />
        <LightStreak id="pyr-edge" d={`M${apex.x},${apex.y} L${face},${base}`} head={edge} color="amber" width={1.8} bloom={6} from={[apex.x, apex.y]} to={[face, base]} />
        {/* courses of stone, faint */}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = apex.y + (base - apex.y) * t;
          const half = ((right - left) / 2) * t;
          return <line key={t} x1={apex.x - half} x2={apex.x + half} y1={y} y2={y} stroke={amber} strokeOpacity={0.14 * fill} />;
        })}
        <line x1={120} x2={960} y1={base} y2={base} stroke={amber} strokeOpacity={0.3 * draw} />
      </svg>
    </DollyLayer>
  );
};

/** 4 · Lydia: the first coins (the coin is the 3D hero); a small stack rises beside it. */
export const Lydia: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'back') return null;
  const coins = 6;
  return (
    <AbsoluteFill>
      <DollyLayer k="lydia">
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="lyd-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FBE7A9" />
              <stop offset="0.5" stopColor={COLORS.goldB} />
              <stop offset="1" stopColor="#B07A36" />
            </linearGradient>
            <linearGradient id="lyd-side" x1="0" x2="1">
              <stop offset="0" stopColor="#6E4A1C" />
              <stop offset="0.45" stopColor="#C08A52" />
              <stop offset="1" stopColor="#5A3C16" />
            </linearGradient>
          </defs>
          {new Array(coins).fill(0).map((_, k) => {
            const p = ease(frame, 120 + k * 8, 22, EASE.enter);
            if (p <= 0) return null;
            const cx = 820 + (k % 2 ? 3 : -2);
            const cy = 1380 - k * 16 - (1 - p) * 40;
            return (
              <g key={k} opacity={p}>
                <path d={`M${cx - 52},${cy} v12 a52,14 0 0 0 104,0 v-12 Z`} fill="url(#lyd-side)" />
                <ellipse cx={cx} cy={cy} rx={52} ry={14} fill="url(#lyd-top)" stroke="#FFF0BE" strokeOpacity={0.5} />
              </g>
            );
          })}
        </svg>
      </DollyLayer>
      <SceneText k="lydia" block={S4_LYDIA} />
    </AbsoluteFill>
  );
};

/** 5 · The dinar: an 8-point geometric star draws itself in teal-gold light behind the coin. */
export const Dinar: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'front') return <SceneText k="dinar" block={S5_DINAR} />;
  const c = {x: 540, y: 1090};
  const R = 330;
  const teal = ERA_TINT.dinar;
  const rot = frame * 0.0015;
  const square = (r: number, a0: number) =>
    [0, 1, 2, 3].map((i) => {
      const a = a0 + rot + (i * Math.PI) / 2;
      return `${c.x + Math.cos(a) * r},${c.y + Math.sin(a) * r}`;
    });
  const star = (r: number) => `M${square(r, 0).join(' L')} Z M${square(r, Math.PI / 4).join(' L')} Z`;
  const octagon = (r: number) =>
    'M' +
    new Array(8)
      .fill(0)
      .map((_, i) => {
        const a = rot + Math.PI / 8 + (i * Math.PI) / 4;
        return `${c.x + Math.cos(a) * r},${c.y + Math.sin(a) * r}`;
      })
      .join(' L') +
    ' Z';
  const p1 = ease(frame, 20, 60, EASE.inOut);
  const p2 = ease(frame, 50, 60, EASE.inOut);
  const p3 = ease(frame, 80, 50, EASE.inOut);
  return (
    <DollyLayer k="dinar">
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
        <circle cx={c.x} cy={c.y} r={R + 40} fill="none" stroke={teal} strokeOpacity={0.35 * p1} strokeWidth={1.5} />
        <LightStreak id="dinar-star" d={star(R)} head={p1} color="teal" width={2.2} bloom={7} from={[c.x - R, c.y]} to={[c.x + R, c.y]} />
        <LightStreak id="dinar-star2" d={star(R * 0.62)} head={p2} color="gold" width={1.8} bloom={6} from={[c.x - R, c.y]} to={[c.x + R, c.y]} />
        <path d={octagon(R * 0.86)} fill="none" stroke={teal} strokeOpacity={0.4 * p3} strokeWidth={1.2} />
        {/* eight small stars around the ring */}
        {new Array(8).fill(0).map((_, i) => {
          const a = rot + (i * Math.PI) / 4;
          const x = c.x + Math.cos(a) * (R + 40);
          const y = c.y + Math.sin(a) * (R + 40);
          const sp = ease(frame, 90 + i * 4, 20);
          const sq = (r: number, a0: number) =>
            [0, 1, 2, 3].map((j) => {
              const b = a0 + (j * Math.PI) / 2;
              return `${x + Math.cos(b) * r},${y + Math.sin(b) * r}`;
            });
          return (
            <path
              key={i}
              d={`M${sq(14, 0).join(' L')} Z M${sq(14, Math.PI / 4).join(' L')} Z`}
              fill={hexA(teal, 0.25)}
              stroke={COLORS.goldB}
              strokeWidth={1.2}
              opacity={sp}
              transform={`rotate(${(sp - 1) * 45} ${x} ${y})`}
            />
          );
        })}
      </svg>
    </DollyLayer>
  );
};
