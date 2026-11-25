import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {BEATS, COLORS, LAYOUT, MOTION, SCENES, TRANSITION} from '../config';
import {COMPANIES} from '../lib/bubbles';
import {clamp, EASE, lerp, progress, pulse, rgba, springAt} from '../lib/motion';
import {counterValue} from '../lib/timeline';

/**
 * The 100 index constituents as one continuous layer across scenes 2-4:
 *   scene 2: gold dots fill a 10×10 grid in step with the 0 → 100 counter
 *   scene 3: dots travel into a packed bubble cluster, a few giants swell
 *   scene 4: the cluster shrinks upward, the giants turn red and deflate
 * Rendering it once (instead of per scene) keeps the morph seamless across scene boundaries.
 */
export const CompanyField: React.FC = () => {
  const frame = useCurrentFrame();
  const start = SCENES.whatIs.from - TRANSITION / 2;
  const end = SCENES.domino.to + TRANSITION / 2;
  if (frame < start || frame > end) return null;

  const l2 = frame - SCENES.whatIs.from;
  const l3 = frame - SCENES.notEqual.from;
  const l4 = frame - SCENES.domino.from;
  const n = BEATS.notEqual;
  const d = BEATS.domino;
  const g = LAYOUT.grid;
  const bub = LAYOUT.bubbles;
  const dom = LAYOUT.domino;

  const count = counterValue(l2);
  const swellAll = progress(l3, n.swellFrom, n.swellDur, EASE.inOut);
  const regroup = springAt(l4, d.regroupFrom, {damping: 200, stiffness: 80, mass: 1});
  const clusterScale = lerp(1, dom.clusterScale, regroup);
  const clusterDy = lerp(0, dom.clusterCenterY - bub.centerY, regroup);
  const drop = progress(l4, d.dropFrom, d.dropDur, EASE.inOut);

  const fadeOut = interpolate(frame, [SCENES.domino.to - TRANSITION / 2, end], [1, 0], {...clamp, easing: EASE.inOut});
  const exitBlur = (1 - fadeOut) * 10;

  let giantIndex = 0;
  return (
    <AbsoluteFill style={{opacity: fadeOut, filter: exitBlur > 0.05 ? `blur(${exitBlur}px)` : undefined}}>
      {COMPANIES.map((c, i) => {
        // scene 2: appear with the counter
        const a = interpolate(count - i, [0, 2.5], [0, 1], clamp);
        if (a <= 0) return null;
        const pop = interpolate(a, [0, 0.6, 1], [0, 1.3, 1]);

        // scene 3: morph to the bubble layout, then giants swell
        const m = springAt(l3, n.morphFrom + c.jitter * 16, MOTION.bubble);
        const gi = c.giant ? giantIndex++ : -1;
        const swell = c.giant ? springAt(l3, n.swellFrom + gi * 5, MOTION.bubble) : 0;
        const baseR = c.giant ? 16 : c.r;
        let r = lerp(g.dotRadius, baseR, m);
        if (c.giant) r = lerp(r, c.r, swell);

        // scene 4: giants turn red and deflate (staggered so they fall one after another)
        const gDrop = c.giant ? progress(l4, d.dropFrom + gi * 4, d.dropDur - 12, EASE.inOut) : 0;
        if (c.giant) r *= lerp(1, dom.giantShrink, gDrop);

        let x = lerp(c.gridX, c.x, m);
        let y = lerp(c.gridY, c.y, m);
        // cluster regroup (scale about the cluster center and move up)
        x = bub.centerX + (x - bub.centerX) * clusterScale;
        y = bub.centerY + (y - bub.centerY) * clusterScale + clusterDy;
        r *= clusterScale * pop;

        const base = c.giant ? interpolateColors(gDrop, [0, 1], [COLORS.gold, COLORS.red]) : COLORS.gold;
        const light = c.giant ? interpolateColors(gDrop, [0, 1], [COLORS.goldLight, '#FF9A9D']) : COLORS.goldLight;
        const deep = c.giant ? interpolateColors(gDrop, [0, 1], [COLORS.goldDeep, COLORS.redDeep]) : COLORS.goldDeep;

        const smallDim = c.giant ? 1 : lerp(1, 0.4, swellAll) * lerp(1, 0.8, drop);
        const glowPulse = pulse(frame, MOTION.glowPulseFrames, gi * 9);
        const glow = c.giant
          ? `0 0 ${(22 + glowPulse * 26) * clusterScale}px ${rgba(base, 0.32 + glowPulse * 0.2 + gDrop * 0.1)}`
          : 'none';

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              opacity: Math.min(1, a * 1.5) * smallDim,
              background: `radial-gradient(circle at 34% 28%, ${light} 0%, ${base} 46%, ${deep} 100%)`,
              boxShadow: c.giant
                ? `${glow}, inset 0 -${r * 0.18}px ${r * 0.4}px rgba(0,0,0,0.28), inset 0 0 0 1.5px ${rgba(light, 0.5)}`
                : `0 0 ${6 * (1 - swellAll)}px ${rgba(COLORS.gold, 0.4)}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
