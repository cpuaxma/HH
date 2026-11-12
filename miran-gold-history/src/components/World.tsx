import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, DOLLY, DOLLY_INTO, EASE, ERA_TINT, FONT, LAYOUT, SceneKey, SCENES, TIMELINE, VIDEO} from '../theme';
import {heroState, toScreen} from '../heroTrack';
import {hexA, noise, rand} from '../motion';
import {arYear} from '../numbers';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PULL = {start: SCENES.today[0] + 10, dur: 200};

/** How far the camera has travelled down the corridor (gates passed). It pulls back to the start in scene 11. */
export const camZ = (frame: number) => {
  const forward = DOLLY_INTO.reduce(
    (sum, k) => sum + interpolate(frame, [SCENES[k][0] - DOLLY / 2, SCENES[k][0] + DOLLY / 2], [0, 1], {...clamp, easing: EASE.glide}),
    0,
  );
  const back = interpolate(frame, [PULL.start, PULL.start + PULL.dur], [0, 1], {...clamp, easing: EASE.glide});
  return forward - back * (DOLLY_INTO.length + 0.6);
};

/** 0→1 as each gate lights up during the pull-back (most recent first). */
const gateLit = (frame: number, k: number) => {
  const order = TIMELINE.length - 1 - k;
  return interpolate(frame, [PULL.start + 20 + order * 18, PULL.start + 40 + order * 18], [0, 1], clamp);
};

const GATE = {w: 780, h: 980, base: 560};
const GATE_TINT: SceneKey[] = ['first', 'egypt', 'lydia', 'dinar', 'rush', 'standard', 'break1971', 'today'];

/** The corridor of time: thin gold arches receding into fog, each engraved with its era's year. */
export const TimeGates: React.FC = () => {
  const frame = useCurrentFrame();
  const z0 = camZ(frame);
  const appear = interpolate(frame, [18, 80], [0, 1], {...clamp, easing: EASE.enter});
  const {vp} = LAYOUT;
  const gates = TIMELINE.map((year, k) => {
    const z = k + 1 - z0 + 0.7;
    return {year, k, z};
  })
    .filter((g) => g.z > 0.55)
    .sort((a, b) => b.z - a.z); // far first
  return (
    <AbsoluteFill style={{opacity: appear, pointerEvents: 'none'}}>
      <svg width={VIDEO.width} height={VIDEO.height}>
        <defs>
          <filter id="gate-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="corridor-fog" cx="0.5" cy={vp.y / VIDEO.height} r="0.6">
            <stop offset="0" stopColor="#F3D27A" stopOpacity="0.1" />
            <stop offset="1" stopColor="#F3D27A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={VIDEO.width} height={VIDEO.height} fill="url(#corridor-fog)" />
        {/* floor rays from the vanishing point */}
        {new Array(9).fill(0).map((_, i) => {
          const x = -400 + i * 235;
          return <line key={i} x1={vp.x} y1={vp.y} x2={x} y2={VIDEO.height} stroke="#F3D27A" strokeOpacity={0.05} />;
        })}
        {gates.map(({year, k, z}) => {
          const s = 1 / z;
          const near = interpolate(z, [0.55, 1.0], [0, 1], clamp);
          const far = interpolate(z, [1.7, 7], [1, 0.1], clamp);
          const lit = gateLit(frame, k);
          const o = near * far * (0.32 + 0.6 * lit);
          if (o < 0.01) return null;
          const w = GATE.w * s;
          const h = GATE.h * s;
          const base = vp.y + GATE.base * s;
          const top = base - h;
          const x0 = vp.x - w / 2;
          const x1 = vp.x + w / 2;
          const d = `M${x0},${base} V${top + w / 2} A${w / 2},${w / 2} 0 0 1 ${x1},${top + w / 2} V${base}`;
          const inset = 14 * s;
          const di = `M${x0 + inset},${base} V${top + w / 2} A${w / 2 - inset},${w / 2 - inset} 0 0 1 ${x1 - inset},${top + w / 2} V${base}`;
          const tint = lit > 0 ? ERA_TINT[GATE_TINT[k]] : COLORS.goldB;
          return (
            <g key={k} opacity={o}>
              {lit > 0.01 ? <path d={d} fill="none" stroke={tint} strokeWidth={10 * s} opacity={0.6 * lit} filter="url(#gate-glow)" /> : null}
              <path d={d} fill="none" stroke={tint} strokeWidth={2.2 * Math.max(0.6, s)} />
              <path d={di} fill="none" stroke={tint} strokeOpacity={0.45} strokeWidth={1.2 * Math.max(0.6, s)} />
              <line x1={x0 - 40 * s} x2={x1 + 40 * s} y1={base} y2={base} stroke={tint} strokeOpacity={0.4} strokeWidth={1.5} />
              <text
                x={vp.x}
                y={top - 22 * s}
                textAnchor="middle"
                direction="rtl"
                fontFamily={FONT.family}
                fontWeight={FONT.key}
                fontSize={38 * s}
                fill={tint}
                opacity={0.85 * interpolate(z, [1.0, 1.6], [0, 1], clamp)}
              >
                {arYear(year)}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const DUST = new Array(70).fill(0).map((_, i) => ({
  x: (rand(i + 1) - 0.5) * 2600,
  y: (rand(i + 40) - 0.6) * 2600,
  z: rand(i + 80) * 8,
  r: 1 + rand(i + 7) * 2.2,
}));

/** Floating gold dust in the corridor; it streams past (and blooms) as the camera dollies. */
export const GoldDust: React.FC = () => {
  const frame = useCurrentFrame();
  const z0 = camZ(frame);
  const {vp} = LAYOUT;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={VIDEO.width} height={VIDEO.height}>
        <defs>
          <filter id="bokeh" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {DUST.map((d, i) => {
          const z = ((((d.z - z0 * 1.2 - frame * 0.0015) % 8) + 8) % 8) + 0.35;
          const s = 1 / z;
          const x = vp.x + (d.x + noise(i, frame * 0.01) * 40) * s * 0.45;
          const y = vp.y + (d.y - frame * 0.25) * s * 0.45;
          if (x < -40 || x > VIDEO.width + 40 || y < -40 || y > VIDEO.height + 40) return null;
          const r = d.r * s * 2.4;
          const big = r > 7;
          const tw = 0.5 + 0.5 * Math.sin(frame * 0.05 + i * 2.1);
          const o = interpolate(z, [0.35, 1, 6, 8.35], [0, 0.55, 0.25, 0], clamp) * (0.5 + 0.5 * tw);
          return <circle key={i} cx={x} cy={y} r={Math.min(18, r)} fill="#F6D88A" opacity={o * (big ? 0.5 : 1)} filter={big ? 'url(#bokeh)' : undefined} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const sceneAt = (frame: number): SceneKey => {
  let key: SceneKey = 'hook';
  (Object.keys(SCENES) as SceneKey[]).forEach((k) => {
    if (frame >= SCENES[k][0] + 5) key = k;
  });
  return key;
};

/** A subtle full-frame wash in the current era's color (crossfades at each scene start). */
export const EraTint: React.FC = () => {
  const frame = useCurrentFrame();
  const keys = Object.keys(SCENES) as SceneKey[];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {keys.map((k, i) => {
        const [s, e] = SCENES[k];
        const next = keys[i + 1];
        const o = interpolate(frame, [s - 10, s + 20, next ? SCENES[next][0] - 10 : e, next ? SCENES[next][0] + 20 : e + 1], [0, 1, 1, 0], clamp);
        if (o <= 0.001) return null;
        return (
          <AbsoluteFill
            key={k}
            style={{opacity: o, background: `radial-gradient(ellipse 80% 55% at 50% 55%, ${hexA(ERA_TINT[k], 0.1)} 0%, ${hexA(ERA_TINT[k], 0.03)} 55%, ${hexA(ERA_TINT[k], 0)} 100%)`}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const RAY_STRENGTH: Partial<Record<SceneKey, number>> = {hook: 1, first: 0.7, egypt: 0.9, lydia: 0.6, dinar: 0.6, rush: 0.5, standard: 0.5, break1971: 0.8, cube: 0.9};

/** Soft volumetric light rays falling from above onto the gold object. */
export const GodRays: React.FC = () => {
  const frame = useCurrentFrame();
  const st = heroState(frame);
  const scene = sceneAt(frame);
  const strength = (RAY_STRENGTH[scene] ?? 0) * st.opacity * interpolate(frame, [12, 50], [0, 1], clamp);
  if (strength < 0.01) return null;
  const p = toScreen(st.pos[0], st.pos[1]);
  const src = {x: p.x - 60, y: p.y - 820};
  const rays = [-11, -6, -2.5, 0.5, 3.5, 7.5, 12];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <svg width={VIDEO.width} height={VIDEO.height}>
        <defs>
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF1C8" stopOpacity="0" />
            <stop offset="0.55" stopColor="#FFE3A0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFE3A0" stopOpacity="0" />
          </linearGradient>
          <filter id="ray-blur" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <g filter="url(#ray-blur)">
          {rays.map((deg, i) => {
            const a = ((deg + Math.sin(frame * 0.008 + i) * 1.2) * Math.PI) / 180;
            const len = 1100;
            const wTop = 6;
            const wBot = 60 + (i % 3) * 30;
            const ex = src.x + Math.sin(a) * len;
            const ey = src.y + Math.cos(a) * len;
            const nx = Math.cos(a);
            const ny = -Math.sin(a);
            const flick = 0.6 + 0.4 * (0.5 + 0.5 * noise(i + 3, frame * 0.02));
            return (
              <polygon
                key={i}
                points={`${src.x - nx * wTop},${src.y - ny * wTop} ${src.x + nx * wTop},${src.y + ny * wTop} ${ex + nx * wBot},${ey + ny * wBot} ${ex - nx * wBot},${ey - ny * wBot}`}
                fill="url(#ray)"
                opacity={0.22 * strength * flick}
              />
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Wraps a scene's 2D visuals so they ride the dolly: the incoming scene grows out of the
 * distance, the outgoing one swells past the camera and fades. `from` is the scene's start.
 */
export const DollyLayer: React.FC<{k: SceneKey; children: React.ReactNode; zoom?: boolean}> = ({k, children, zoom = true}) => {
  const frame = useCurrentFrame() + SCENES[k][0];
  const keys = Object.keys(SCENES) as SceneKey[];
  const next = keys[keys.indexOf(k) + 1];
  const inDolly = DOLLY_INTO.includes(k);
  const outDolly = next && DOLLY_INTO.includes(next);
  const start = SCENES[k][0];
  const pIn = inDolly ? interpolate(frame, [start - DOLLY / 2, start + DOLLY / 2], [0, 1], {...clamp, easing: EASE.glide}) : 1;
  const nextStart = next ? SCENES[next][0] : Infinity;
  const pOut = outDolly ? interpolate(frame, [nextStart - DOLLY / 2, SCENES[k][1]], [0, 1], {...clamp, easing: EASE.exit}) : 0;
  const scale = zoom ? interpolate(pIn, [0, 1], [0.72, 1]) * interpolate(pOut, [0, 1], [1, 1.45]) : 1;
  const opacity = interpolate(pIn, [0.3, 1], [0, 1], clamp) * (1 - pOut);
  const blur = (1 - pIn) * 10 + pOut * 14;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: `${LAYOUT.vp.x}px ${LAYOUT.vp.y}px`,
        opacity,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
