import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {SideTag} from '../components/SideTag';
import {SpeechBubble} from '../components/SpeechBubble';
import {COPY, Lang} from '../i18n';
import {colors, layout} from '../theme';
import {BEAT, BUBBLES, SCENES} from '../timeline';
import {POS} from './positions';

const FROM = SCENES.panic[0];
const l = (abs: number) => abs - FROM;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 6-frame white → red flash over Ray's panel at each quick cut
const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let white = 0;
  let red = 0;
  for (const c of BEAT.cuts) {
    const d = frame - l(c);
    if (d >= -3 && d <= 3) {
      white = Math.max(white, interpolate(d, [-3, -1, 1], [0, 0.85, 0], clamp));
      red = Math.max(red, interpolate(d, [-1, 1, 3], [0, 0.6, 0], clamp));
    }
  }
  if (white + red <= 0) return null;
  const box: React.CSSProperties = {position: 'absolute', left: 0, top: layout.panel.top, width: 540, height: layout.panel.height};
  return (
    <>
      <div style={{...box, background: '#FFF6EC', opacity: white}} />
      <div style={{...box, background: colors.red, opacity: red, mixBlendMode: 'screen'}} />
    </>
  );
};

export const Scene4Panic: React.FC<{lang: Lang}> = ({lang}) => {
  const c = COPY[lang];
  return (
    <>
      <CutFlash />
      <SpeechBubble lang={lang} lines={c.s4RayBubble} start={l(BUBBLES.ray4[0])} exit={l(BUBBLES.ray4[1])} tipX={POS.rayTip.x} tipY={POS.rayTip.y} x={POS.rayX} accent={colors.red} />
      <SideTag lang={lang} kind="x" lines={c.s4RayTag} start={l(1760)} exit={l(2250)} x={POS.rayX} color={colors.red} weight={600} />
      <SideTag lang={lang} kind="check" lines={c.s4SamTag} start={l(1820)} exit={l(2254)} x={POS.samX} />
    </>
  );
};
