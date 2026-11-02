import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {COLORS, EASE, LAYOUT, SAFE, SCENES, VIDEO} from '../theme';
import {S1_HOOK} from '../strings';
import {ArabicText} from '../components/ArabicText';
import {Headline} from '../components/Layout';
import {Station} from '../components/World';
import {Studio} from '../components/three/Studio';
import {SilverBar3D} from '../components/three/SilverBar3D';
import {ease, hero, hexA, jitter, rand} from '../motion';

const START = SCENES.hook[0];
const TEXT_END = SCENES.hook[1] - START;
const CANVAS = {top: 660, h: 860};
const T = {bar: 18, crack: 112, crackDur: 30};

// Far-away abstract warning dots, kept off the headline, the hero and the safe zones.
const DOTS = (() => {
  const out: {x: number; y: number; r: number; seed: number; delay: number}[] = [];
  let s = 1;
  while (out.length < 18 && s < 900) {
    const x = 60 + rand(s) * (VIDEO.width - SAFE.right - 90);
    const y = 230 + rand(s + 0.5) * (VIDEO.height - SAFE.bottom - 300);
    s++;
    const inHeadline = y > LAYOUT.headlineTop - 60 && y < LAYOUT.headlineTop + 260;
    const inHero = x > 160 && x < 920 && y > 820 && y < 1380;
    if (inHeadline || inHero) continue;
    if (out.some((d) => Math.hypot(d.x - x, d.y - y) < 140)) continue;
    out.push({x, y, r: 3 + rand(s + 3) * 4, seed: s, delay: 24 + rand(s + 9) * 50});
  }
  return out;
})();

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();

  const barIn = Math.max(0, hero(frame, T.bar));
  const crack = ease(frame, T.crack, T.crackDur, EASE.inOut);
  const dip = ease(frame, T.crack + 6, 26, EASE.enter);
  const flash = interpolate(frame, [T.crack, T.crack + 8, T.crack + 60], [0, 1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shudder = frame > T.crack && frame < T.crack + 24 ? Math.sin((frame - T.crack) * 2.1) * 0.012 * (1 - (frame - T.crack) / 24) : 0;

  const y = -0.15 - (1 - Math.min(1, barIn)) * 0.55 - dip * 0.1;
  const rotY = -0.5 + frame * 0.0022 + (1 - barIn) * 0.44; // 25° extra on entry
  const s = 1.18 * (0.7 + 0.3 * barIn);

  return (
    <AbsoluteFill>
      <Station index={0} from={START}>
        {/* abstract red warning dots, far behind */}
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="hook-dot-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          {DOTS.map((d, i) => {
            const p = ease(frame, d.delay, 24);
            const j = jitter(d.seed, frame, 1);
            const period = 54 + (i % 5) * 9;
            const ph = frame > d.delay ? ((frame - d.delay + i * 13) % period) / period : 0;
            const boost = 1 + flash * 0.8;
            return (
              <g key={i} opacity={p * 0.75} transform={`translate(${d.x + j.x}, ${d.y + j.y})`}>
                <circle r={d.r * 2.6} fill={COLORS.red} opacity={0.3 * j.flicker * boost} filter="url(#hook-dot-glow)" />
                <circle r={d.r} fill={COLORS.red} opacity={0.85 * j.flicker} />
                {ph > 0 ? <circle r={d.r * (1 + ph * 3)} fill="none" stroke={COLORS.red} strokeWidth={1.2} opacity={(1 - ph) * 0.5} /> : null}
              </g>
            );
          })}
        </svg>
        {/* red glow behind the bar when it fractures */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 420,
            top: 1060 - 260,
            width: 840,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${hexA(COLORS.red, 0.32 * flash)} 0%, ${hexA(COLORS.red, 0)} 70%)`,
          }}
        />
        {/* soft silver halo under the bar */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 380,
            top: 1060 - 200,
            width: 760,
            height: 400,
            borderRadius: '50%',
            opacity: Math.min(1, barIn),
            background: `radial-gradient(ellipse at center, ${hexA('#C9D3E2', 0.16)} 0%, ${hexA('#C9D3E2', 0)} 70%)`,
          }}
        />
        <div style={{position: 'absolute', left: 0, top: CANVAS.top, width: VIDEO.width, height: CANVAS.h, opacity: Math.min(1, barIn * 2.5)}}>
          <ThreeCanvas width={VIDEO.width} height={CANVAS.h} camera={{fov: 30, position: [0, 0.35, 7.5]}} gl={{antialias: true}}>
            <Studio />
            <directionalLight position={[-3, 5, 4]} intensity={2.2} />
            <directionalLight position={[4, 2, -3]} intensity={1.2} color="#9CC7FF" />
            <SilverBar3D position={[shudder, y, 0]} rotation={[0.34, rotY, dip * 0.06 + shudder * 2]} scale={s} crack={crack} floorY={-1.02} />
          </ThreeCanvas>
        </div>
      </Station>

      <Headline>
        <ArabicText block={S1_HOOK} size={LAYOUT.headlineSize + 4} start={2} exitEnd={TEXT_END} />
      </Headline>
    </AbsoluteFill>
  );
};
