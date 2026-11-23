import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER_W} from '../lib/layout';
import {fitSize} from '../lib/text';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.hook;
const RED_LOOP = SCENES.cta.redBackground;

/** 0–2 s: "What goes into / ONE / post?" – one giant red word slams in. */
export const Hook: React.FC = () => {
  const t = useSceneFrame();
  const maxW = INNER_W - 10;

  const s1 = spr(t, C.line1At, MOTION.slam);
  const sHero = spr(t, C.heroAt, MOTION.slam);
  const s3 = spr(t, C.line3At, MOTION.slam);
  const grow = mix(1, SIZES.heroGrowTo, clamp(spr(t, C.heroAt + 6, MOTION.soft, 36)));

  // Screen shake, strongest on the giant word.
  let shake = 0;
  for (const [at, amp] of [
    [C.line1At, 8],
    [C.heroAt, 30],
    [C.line3At, 10],
  ] as const) {
    const d = t - at;
    if (d >= 0 && d < 12) shake += amp * Math.exp(-d * 0.42) * Math.sin(d * 2.7 + at);
  }

  const size1 = fitSize([C.line1], SIZES.hookLine1, maxW);
  const heroSize = fitSize([C.hero], SIZES.hookHero, maxW / SIZES.heroGrowTo);
  const size3 = fitSize([C.line3], SIZES.hookLine3, maxW);

  // Red ring that bursts out behind the giant word.
  const ring = clamp((t - C.heroAt) / 16);

  // Loop seam: the reel ends on the red CTA card, so the hook opens red and
  // bursts open to white just before the first word.
  const open = clamp(spr(t, 0, MOTION.smooth, 9));
  const radius = mix(0, 1500, open);

  const word = (text: string, s: number, size: number, color: string, extra?: React.CSSProperties) => (
    <div
      data-qa="text"
      style={{
        fontSize: size,
        color,
        lineHeight: 0.95,
        whiteSpace: 'nowrap',
        opacity: s > 0 ? clamp(s * 3) : 0,
        transform: `scale(${mix(2.6, 1, s).toFixed(4)})`,
        filter: s > 0 && s < 0.85 ? `blur(${((1 - s) * 16).toFixed(1)}px)` : undefined,
        ...extra,
      }}
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill>
      {ring > 0 && ring < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: CX - 80 - ring * 520,
            top: 860 - 80 - ring * 520,
            width: 160 + ring * 1040,
            height: 160 + ring * 1040,
            borderRadius: '50%',
            border: `${(26 * (1 - ring) + 2).toFixed(1)}px solid ${COLORS.red}`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: CX - maxW / 2,
          width: maxW,
          top: 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          letterSpacing: '-0.03em',
          transform: `translate(${(shake * 0.5).toFixed(2)}px, ${shake.toFixed(2)}px)`,
        }}
      >
        {word(C.line1, s1, size1, COLORS.ink)}
        {word(C.hero, sHero, heroSize, COLORS.red, {
          transform: `scale(${(mix(2.6, 1, sHero) * grow).toFixed(4)})`,
          letterSpacing: '-0.04em',
          lineHeight: 0.86,
        })}
        {word(C.line3, s3, size3, COLORS.ink)}
      </div>
      {RED_LOOP && open < 1 ? (
        <AbsoluteFill
          style={{
            background: COLORS.red,
            WebkitMaskImage: `radial-gradient(circle at 50% 45%, transparent ${radius.toFixed(0)}px, #000 ${(radius + 2).toFixed(0)}px)`,
            maskImage: `radial-gradient(circle at 50% 45%, transparent ${radius.toFixed(0)}px, #000 ${(radius + 2).toFixed(0)}px)`,
          }}
        />
      ) : null}
      <Sfx name="bass-hit" at={C.heroAt} />
    </AbsoluteFill>
  );
};
