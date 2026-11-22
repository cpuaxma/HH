import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, CUES, FONT, SCENES, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {AnimatedText} from '../components/AnimatedText';
import {Logo} from '../components/Logo';
import {Scrim} from '../components/Scrim';
import {project} from '../lib/director';
import {EASE, ease, springIn} from '../lib/motion';
import {RING_CENTER} from '../lib/track';

const from = SCENES.cta.from;
const c = CUES.cta;

/** 0:40-0:45 The track coils into a calm loop behind the logo. CTA and footnote. */
export const S9CTA: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + from;
  const ring = project(g, RING_CENTER);
  const logoIn = springIn(g, c.logo, {damping: 18, stiffness: 90, mass: 0.9});
  const logoOpacity = ease(g, [c.logo, c.logo + 14], [0, 1], EASE.out);
  // repeated shine sweeps keep the end card alive
  const shines = c.logoShine.filter((s) => g >= s);
  const last = shines[shines.length - 1];
  const shine = last === undefined ? 0 : ease(g, [last, last + 26], [0, 1], EASE.inOut);
  const foot = ease(g, [c.footnote, c.footnote + 16], [0, 1], EASE.out);
  return (
    <AbsoluteFill>
      <Logo y={ring.y} size={300} shine={shine} opacity={logoOpacity} scale={0.86 + 0.14 * logoIn} />
      <Scrim y={1250} h={320} strength={0.5} opacity={ease(g, [c.text - 4, c.text + 8])} />
      <AnimatedText {...TEXT.cta.line} enter={c.text - from} shineAt={c.textShine.map((s) => s - from)} size={74} y={1250} />
      <div
        style={{
          position: 'absolute',
          left: 90,
          width: 900,
          top: 1500,
          textAlign: 'center',
          direction: 'rtl',
          fontFamily,
          fontWeight: FONT.weightRegular,
          fontSize: 28,
          color: COLORS.text,
          opacity: 0.5 * foot,
        }}
      >
        {TEXT.cta.footnote}
      </div>
    </AbsoluteFill>
  );
};
