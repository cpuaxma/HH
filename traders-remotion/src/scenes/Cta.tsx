import React from 'react';
import {getStaticFiles, useCurrentFrame} from 'remotion';
import {ACCENTS, BEATS, COLORS, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {Logo} from '../components/Overlays';
import {EASE, prog, springAt} from '../lib/anim';
import {ARROW_CENTER, project} from '../arena/camera';
import {Block} from './layout';

const hasLogo = () => {
  try {
    return getStaticFiles().some((f) => f.name === 'logo.png');
  } catch {
    return true;
  }
};

/** 0:35–0:40 · The arrow settles behind the logo; the logo shines in and keeps shining. CTA + disclaimer. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame() + SCENES.cta[0];
  const o = SCENES.cta[0];
  const inP = EASE.out(prog(f, BEATS.logoIn, BEATS.logoIn + 20));
  const pop = springAt(f, BEATS.logoIn, 0.32, 0.5);
  // Shine sweeps: the first as it lands, then every BEATS.shineEvery frames.
  const since = f - (BEATS.logoIn + 14);
  const shine = since < 0 ? 0 : EASE.inOut(prog(since % BEATS.shineEvery, 0, 26));
  const c = project(f, ARROW_CENTER.x, ARROW_CENTER.y + 0.15, ARROW_CENTER.z);
  return (
    <>
      <Logo has={hasLogo()} x={540} y={c.y} size={400} o={inP} scale={0.82 + 0.18 * pop} shine={shine} />
      <Block y={1318} h={420} scrim={prog(f, BEATS.ctaText - 8, BEATS.ctaText + 6)}>
        <AnimatedText text={TEXT.cta} accents={ACCENTS.cta} size={88} start={BEATS.ctaText - o} stagger={4} shineEvery={BEATS.shineEvery * 2} />
      </Block>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1512, display: 'flex', justifyContent: 'center'}}>
        <AnimatedText text={TEXT.disclaimer} size={28} weight={600} color={COLORS.white} start={BEATS.ctaText + 24 - o} stagger={2} style={{opacity: 0.6}} />
      </div>
    </>
  );
};
