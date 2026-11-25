import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, random, staticFile, useCurrentFrame} from 'remotion';
import {BEATS, COLORS, SCENES} from '../config';
import {clamp, EASE, pulse, rgba} from '../lib/motion';

/**
 * Deep charcoal base, a soft radial gold glow that breathes, a vignette and animated film grain.
 * During the domino drop the glow warms toward red, then returns to gold.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const dropStart = SCENES.domino.from + BEATS.domino.dropFrom;
  const redMix =
    interpolate(frame, [dropStart, dropStart + 40], [0, 1], {...clamp, easing: EASE.inOut}) *
    interpolate(frame, [SCENES.takeaway.from - 12, SCENES.takeaway.from + 20], [1, 0], {...clamp, easing: EASE.inOut});
  const glowColor = interpolateColors(redMix, [0, 1], [COLORS.gold, COLORS.red]);
  const breathe = pulse(frame, 90);
  const glowAlpha = 0.16 + breathe * 0.06;
  const glowY = interpolate(frame, [0, SCENES.cta.from, SCENES.cta.to], [46, 44, 36], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 42% at 50% ${glowY}%, ${rgba(glowColor, glowAlpha)} 0%, ${rgba(glowColor, glowAlpha * 0.35)} 38%, rgba(0,0,0,0) 72%)`,
        }}
      />
      {/* faint lower glow so the frame never feels flat */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 30% at 50% 100%, ${rgba(COLORS.gold, 0.05)} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <FilmGrain />
    </AbsoluteFill>
  );
};

/** Tiled noise texture jumping to a new random offset every frame. */
const FilmGrain: React.FC = () => {
  // a new grain pattern every 2 frames (15 fps): reads as film, and keeps the bitrate sane
  const step = Math.floor(useCurrentFrame() / 2);
  const x = Math.floor(random(`gx${step}`) * 512);
  const y = Math.floor(random(`gy${step}`) * 512);
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity: 0.045, mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', left: -x, top: -y, width: 512 * 5, height: 512 * 6, display: 'flex', flexWrap: 'wrap'}}>
        {Array.from({length: 5 * 6}).map((_, i) => (
          <Img key={i} src={staticFile('grain.png')} style={{width: 512, height: 512, display: 'block'}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
