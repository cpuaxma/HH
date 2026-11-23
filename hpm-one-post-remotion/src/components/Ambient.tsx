import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, NO_HUD} from '../config';
import {clamp, rand} from '../lib/anim';
import {H, W} from '../lib/layout';
import {TIMELINE, TOTAL_FRAMES} from '../lib/timeline';

// How "hot" the ambient layer is per frame: full on the hook and CTA, faint in
// between. Value at the last frame equals the first → the loop is seamless.
export const heat = (f: number) => {
  let v = 0;
  for (const s of TIMELINE.scenes) {
    if (!NO_HUD.includes(s.name)) continue;
    const a = s.cut - s.head - 6;
    const b = s.cut + s.duration + s.tail + 6;
    // no fade at the very start / end, so frame N-1 matches frame 0
    const inV = s.index === 0 ? 1 : clamp((f - a) / 12);
    const outV = s.index === TIMELINE.scenes.length - 1 ? 1 : clamp((b - f) / 12);
    v = Math.max(v, Math.min(inV, outV));
  }
  return v;
};

/** Rising embers + low chili glow. Periodic over the whole video so frame N-1 flows into frame 0. */
export const Ambient: React.FC = () => {
  const f = useCurrentFrame();
  const P = TOTAL_FRAMES;
  const k = heat(f);
  const embers = Array.from({length: 46}).map((_, i) => {
    const cycles = 1 + Math.floor(rand(i) * 3); // integer → periodic
    const phase = rand(i + 99);
    const u = (phase + (cycles * f) / P) % 1; // 0 → 1 rising
    const y = H + 40 - u * (H + 80);
    const x = rand(i + 7) * W + Math.sin(((f / P) * 2 * Math.PI * (1 + (i % 3))) + i) * 40;
    const r = 1.2 + rand(i + 3) * 2.4;
    const life = Math.sin(Math.PI * u);
    const flick = 0.6 + 0.4 * Math.sin(f * 0.35 + i * 1.3);
    return {x, y, r, a: life * flick, c: i % 3 === 0 ? COLORS.red : COLORS.orange};
  });
  const pulse = 0.85 + 0.15 * Math.sin((f / P) * 2 * Math.PI * 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 34% at 50% 112%, rgba(230,57,70,${(0.16 * k * pulse).toFixed(3)}) 0%, rgba(255,122,26,${(0.07 * k * pulse).toFixed(3)}) 40%, rgba(255,251,239,0) 72%)`,
        }}
      />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {embers.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.r} fill={e.c} opacity={(e.a * 0.45 * k).toFixed(3)} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Base backdrop: soft pool of light behind the middle scenes, flat charcoal on hook + CTA. */
export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const k = 1 - heat(f);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(62% 48% at 50% 42%, rgba(255,255,255,${(0.9 * k).toFixed(3)}) 0%, rgba(255,255,255,0) 100%)`,
      }}
    />
  );
};

/** Film grain (re-positioned every frame) + vignette. */
export const GrainVignette: React.FC = () => {
  const f = useCurrentFrame();
  const ox = Math.floor(rand(f + 1) * 512);
  const oy = Math.floor(rand(f + 501) * 512);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(120,90,50,0) 65%, rgba(120,90,50,0.06) 100%)',
        }}
      />
      {/* hidden <Img> makes Remotion wait for the tile before the first frame */}
      <Img src={staticFile('grain.png')} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
      <AbsoluteFill
        style={{
          opacity: 0.035,
          mixBlendMode: 'multiply',
          backgroundImage: `url(${staticFile('grain.png')})`,
          backgroundRepeat: 'repeat',
          backgroundPosition: `${-ox}px ${-oy}px`,
        }}
      />
    </AbsoluteFill>
  );
};
