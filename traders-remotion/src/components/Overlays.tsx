import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {BEATS, COLORS, SAFE, TEXT} from '../config';
import {CAIRO} from '../fonts';
import {EASE, clamp, impulse, prog} from '../lib/anim';
import {PLAN} from '../arena/plan';
import {project} from '../arena/camera';
import {ARROW_TIP, worldAt} from '../arena/world';
import {rumorReach} from '../arena/mechanisms/rumor';
import {PILLAR_H} from '../arena/grid';

/** Soft dark scrim behind a text block (an ellipse, no hard edges). */
export const Scrim: React.FC<{y: number; h: number; o: number}> = ({y, h, o}) =>
  o <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: -100,
        right: -100,
        top: y - h / 2,
        height: h,
        opacity: o,
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.72) 45%, rgba(5,5,5,0) 100%)',
        pointerEvents: 'none',
      }}
    />
  );

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.72) 100%)', pointerEvents: 'none'}} />
);

/** Subtle film grain, re-seeded every frame. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.055}) => {
  const seed = useCurrentFrame() % 113;
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none', mixBlendMode: 'overlay'}}>
      <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none">
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.2 -0.6" />
        </filter>
        <rect width="540" height="960" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Loss-red edge pulse on every counter hit. */
export const HitFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const a = PLAN.traps.reduce((m, t) => Math.max(m, impulse(frame, t.hit, 16)), 0);
  const slam = impulse(frame, BEATS.counterSlam, 14);
  return (
    <>
      {a > 0 ? <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 50%, rgba(200,55,45,0) 50%, rgba(200,55,45,${0.38 * a}) 100%)`}} /> : null}
      {slam > 0 ? <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 22% at 50% 19%, rgba(245,215,122,${0.32 * slam}) 0%, rgba(245,215,122,0) 100%)`, mixBlendMode: 'screen'}} /> : null}
    </>
  );
};

/** Gold flare where the arrow locks: a core glow and an anamorphic streak (screen-blended). */
export const Flare: React.FC = () => {
  const frame = useCurrentFrame();
  const a = impulse(frame, BEATS.arrowLock, 34);
  const pre = EASE.in(prog(frame, BEATS.arrowLock - 6, BEATS.arrowLock));
  const i = frame < BEATS.arrowLock ? pre * 0.6 : a;
  if (i <= 0.005) return null;
  const p = project(frame, ARROW_TIP.x, ARROW_TIP.y + 0.2, ARROW_TIP.z);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: p.x - 360, top: p.y - 360, width: 720, height: 720, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,246,220,${0.95 * i}) 0%, rgba(245,215,122,${0.5 * i}) 14%, rgba(212,175,55,${0.16 * i}) 38%, rgba(0,0,0,0) 70%)`}} />
      <div style={{position: 'absolute', left: -200, right: -200, top: p.y - 14, height: 28, background: `radial-gradient(ellipse 50% 50% at ${p.x + 200}px 50%, rgba(255,240,200,${0.9 * i}) 0%, rgba(245,215,122,${0.25 * i}) 40%, rgba(0,0,0,0) 100%)`}} />
      <AbsoluteFill style={{background: `rgba(245,215,122,${0.14 * a})`}} />
    </AbsoluteFill>
  );
};

/** «سمعتُ أن...» drifting up from the pillars that follow the rumour. */
export const Whispers: React.FC = () => {
  const frame = useCurrentFrame();
  const t = PLAN.traps.find((x) => x.def.mechanism === 'rumor');
  if (!t) return null;
  const reach = rumorReach(t.prepared);
  const lt = frame - t.start;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {t.prepared.victims.map((cell, k) => {
        if (k % 2 === 1 && k !== t.prepared.victims.length - 1) return null;
        const u = prog(lt, reach[k] - 2, reach[k] + 40);
        if (u <= 0 || u >= 1) return null;
        const p = worldAt(frame).pillars[cell];
        const sp = project(frame, p.x, Math.max(0, p.y) + PILLAR_H * 1.1, p.z);
        const w = 280;
        const x = clamp(sp.x, SAFE.left + w / 2 + 10, SAFE.right - w / 2 - 10);
        const y = clamp(sp.y - 150 * EASE.out(u), SAFE.top + 40, SAFE.bottom - 60);
        const o = Math.sin(Math.PI * u) * 0.75;
        return (
          <div key={cell} dir="rtl" style={{position: 'absolute', left: x - w / 2, width: w, top: y - 30, textAlign: 'center', fontFamily: CAIRO, fontWeight: 700, fontSize: 46, color: COLORS.whisper, opacity: o, filter: `blur(${(1 - Math.sin(Math.PI * u)) * 4 + 0.4}px)`, textShadow: '0 0 16px rgba(185,188,196,0.5)'}}>
            {TEXT.whisper}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Debug overlay: the text-safe area (centre 900 px, clear of the top 250 / bottom 350). */
export const SafeZone: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: SAFE.left, top: SAFE.top, width: SAFE.right - SAFE.left, height: SAFE.bottom - SAFE.top, border: '3px dashed rgba(0,255,170,0.8)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: 'rgba(255,0,80,0.18)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: 'rgba(255,0,80,0.18)'}} />
  </AbsoluteFill>
);

/** The brand mark: /public/logo.png with a shine sweep masked to its own shape; falls back to a gold wordmark. */
export const Logo: React.FC<{has: boolean; x: number; y: number; size: number; o: number; scale: number; shine: number}> = ({has, x, y, size, o, scale, shine}) => {
  const style: React.CSSProperties = {position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: o, transform: `scale(${scale})`};
  if (!has) {
    return (
      <div style={{...style, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: CAIRO, fontWeight: 800, fontSize: size * 0.2, backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${shine * 140 - 30}%, rgba(255,250,235,0.95) ${shine * 140 - 20}%, rgba(255,255,255,0) ${shine * 140 - 10}%), linear-gradient(180deg, ${COLORS.goldLight}, ${COLORS.gold} 55%, ${COLORS.goldDark})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
        {TEXT.brandFallback}
      </div>
    );
  }
  const src = staticFile('logo.png');
  return (
    <div style={style}>
      <div style={{position: 'absolute', inset: -size * 0.1, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,10,10,0.95) 52%, rgba(10,10,10,0) 70%)'}} />
      <Img src={src} style={{position: 'absolute', inset: 0, width: size, height: size, filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.45))'}} />
      {shine > 0 && shine < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${shine * 160 - 40}%, rgba(255,248,225,0.75) ${shine * 160 - 25}%, rgba(255,255,255,0) ${shine * 160 - 10}%)`,
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
    </div>
  );
};
