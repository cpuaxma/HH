import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND, COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER_W} from '../lib/layout';
import {fitSize} from '../lib/text';
import {Caption} from '../components/Caption';
import {FlameFlicker} from '../components/Flame';
import {Icon} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.cta;
const LOGO_W = 500;
const LOGO_H = LOGO_W / BRAND.logoAspect;
const LOGO_TOP = 340;

export const Cta: React.FC = () => {
  const t = useSceneFrame();
  const reveal = spr(t, C.logoAt, MOTION.snap);
  const wipe = clamp(spr(t, C.logoAt, MOTION.smooth, 16));
  // Ignition flicker: brightness stutters for the first ~16 frames, then holds.
  const ignite = t < C.logoAt + 16 ? 0.55 + 0.45 * Math.abs(Math.sin(t * 1.9)) * clamp((t - C.logoAt) / 6) : 1;
  const burst = 1 - clamp((t - C.logoAt - 6) / 26) * 0.55;
  const flameI = clamp((t - C.logoAt + 2) / 8) * burst;

  const dm = spr(t, C.dmAt, MOTION.slam);
  const pill = spr(t, C.dmAt + 5, MOTION.bouncy);
  const tag = spr(t, C.taglineAt, MOTION.snap);
  const handle = spr(t, C.handleAt, MOTION.snap);

  const kw = `‘${BRAND.dmKeyword}’`;
  const dmSize = fitSize([`${C.dm} ${kw}`], SIZES.ctaDm, INNER_W - 140);
  const glow = 0.5 + 0.5 * Math.sin(t * 0.22);

  return (
    <AbsoluteFill>
      <FlameFlicker cx={CX} baseY={LOGO_TOP + LOGO_H * 0.92} width={LOGO_W * 1.05} height={LOGO_H * 0.95} frame={t} intensity={flameI} />
      <div
        style={{
          position: 'absolute',
          left: CX - LOGO_W / 2,
          top: LOGO_TOP,
          width: LOGO_W,
          height: LOGO_H,
          clipPath: `inset(${((1 - wipe) * 100).toFixed(2)}% -10% -10% -10%)`,
          transform: `scale(${mix(0.82, 1, reveal).toFixed(4)}) translateY(${(Math.sin(t * 0.08) * 4).toFixed(2)}px)`,
          opacity: ignite,
          filter: `drop-shadow(0 0 ${(18 + glow * 16).toFixed(1)}px rgba(255,122,26,${(0.28 * flameI + 0.1).toFixed(3)}))`,
        }}
      >
        <Img data-qa="text" src={staticFile(BRAND.logoOnDark)} style={{width: LOGO_W, height: LOGO_H}} />
      </div>

      <Caption lines={C.question} at={C.questionAt} top={790} size={SIZES.ctaQuestion} />

      <div
        style={{
          position: 'absolute',
          left: CX - 500,
          width: 1000,
          top: 1000,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          data-qa="text"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: dmSize * 0.24,
            fontFamily: FONT.family,
            fontWeight: FONT.bold,
            fontSize: dmSize,
            color: COLORS.offWhite,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          <span style={{display: 'inline-block', opacity: clamp(dm * 3), transform: `scale(${mix(1.8, 1, dm).toFixed(4)})`}}>{C.dm}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: `${dmSize * 0.12}px ${dmSize * 0.24}px`,
              borderRadius: dmSize,
              border: `5px solid ${COLORS.orange}`,
              color: COLORS.red,
              boxShadow: `0 0 ${(20 + glow * 24).toFixed(1)}px rgba(255,122,26,${(0.25 + glow * 0.15).toFixed(3)})`,
              transform: `scale(${pill.toFixed(4)}) rotate(${((1 - pill) * -8).toFixed(2)}deg)`,
              opacity: clamp(pill * 3),
            }}
          >
            <Icon name="dm" size={dmSize * 0.52} color={COLORS.offWhite} accent={COLORS.orange} stroke={4.5} />
            {kw}
          </span>
        </div>
      </div>

      <div
        data-qa="text"
        style={{
          position: 'absolute',
          left: CX - 380,
          width: 760,
          top: 1192,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.medium,
          fontSize: SIZES.ctaTagline,
          letterSpacing: '0.04em',
          color: COLORS.offWhite,
          opacity: clamp(tag * 2) * 0.92,
          transform: `translateY(${((1 - tag) * 30).toFixed(1)}px)`,
        }}
      >
        {BRAND.tagline}
      </div>
      <div
        data-qa="text"
        style={{
          position: 'absolute',
          left: CX - 380,
          width: 760,
          top: 1262,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: SIZES.ctaHandle,
          color: COLORS.orange,
          opacity: clamp(handle * 2),
          transform: `translateY(${((1 - handle) * 30).toFixed(1)}px)`,
        }}
      >
        {BRAND.handle}
      </div>
      <Sfx name="pop" at={C.dmAt + 5} />
    </AbsoluteFill>
  );
};
