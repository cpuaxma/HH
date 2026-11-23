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
const RED = C.redBackground;
const LOGO_W = 460;
const LOGO_H = LOGO_W / BRAND.logoAspect;
const LOGO_TOP = 350;
// Colours for the red card vs. the light fallback
const FG = RED ? COLORS.offWhite : COLORS.ink;
const PILL_BG = RED ? COLORS.offWhite : COLORS.red;
const PILL_FG = RED ? COLORS.red : COLORS.offWhite;

export const Cta: React.FC = () => {
  const t = useSceneFrame();
  const reveal = spr(t, C.logoAt, MOTION.slam);
  // Ignition flicker: brightness stutters for the first ~14 frames, then holds.
  const ignite = t < C.logoAt + 14 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 1.9)) * clamp((t - C.logoAt) / 5) : 1;
  const flameI = clamp((t - C.logoAt + 2) / 8) * (1 - clamp((t - C.logoAt - 6) / 24) * 0.6);

  const dm = spr(t, C.dmAt, MOTION.slam);
  const pill = spr(t, C.dmAt + 5, MOTION.bouncy);
  const tag = spr(t, C.taglineAt, MOTION.snap);
  const handle = spr(t, C.handleAt, MOTION.snap);
  const breathe = 1 + 0.025 * Math.sin(t * 0.18); // the KICK pill keeps pulsing

  const kw = `‘${BRAND.dmKeyword}’`;
  const dmSize = fitSize([`${C.dm} ${kw}`], SIZES.ctaDm, INNER_W - 120);

  return (
    <AbsoluteFill style={{background: RED ? COLORS.red : undefined}}>
      {RED ? (
        // soft darker corners keep the red rich, not flat
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 42%, rgba(255,122,26,0.22) 0%, rgba(150,20,30,0) 55%, rgba(120,10,20,0.35) 100%)'}} />
      ) : null}
      <FlameFlicker cx={CX} baseY={LOGO_TOP + LOGO_H * 0.92} width={LOGO_W * 1.05} height={LOGO_H * 0.9} frame={t} intensity={flameI * (RED ? 0.9 : 0.6)} />
      <div
        style={{
          position: 'absolute',
          left: CX - LOGO_W / 2,
          top: LOGO_TOP,
          width: LOGO_W,
          height: LOGO_H,
          transform: `scale(${mix(1.6, 1, reveal).toFixed(4)}) translateY(${(Math.sin(t * 0.08) * 4).toFixed(2)}px)`,
          opacity: clamp(reveal * 3) * ignite,
        }}
      >
        <Img data-qa="text" src={staticFile(RED ? BRAND.logoWhite : BRAND.logo)} style={{width: LOGO_W, height: LOGO_H}} />
      </div>

      <Caption lines={C.question} at={C.questionAt} top={730} size={SIZES.ctaQuestion} color={FG} accent={FG} />

      <div style={{position: 'absolute', left: CX - 500, width: 1000, top: 990, display: 'flex', justifyContent: 'center'}}>
        <div
          data-qa="text"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: dmSize * 0.22,
            fontFamily: FONT.family,
            fontWeight: FONT.bold,
            fontSize: dmSize,
            color: FG,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          <span style={{display: 'inline-block', opacity: clamp(dm * 3), transform: `scale(${mix(2, 1, dm).toFixed(4)})`}}>{C.dm}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: `${dmSize * 0.13}px ${dmSize * 0.26}px`,
              borderRadius: dmSize,
              background: PILL_BG,
              color: PILL_FG,
              boxShadow: '0 16px 40px rgba(80,10,15,0.3)',
              transform: `scale(${(pill * breathe).toFixed(4)}) rotate(${((1 - pill) * -10 - 2).toFixed(2)}deg)`,
              opacity: clamp(pill * 3),
            }}
          >
            <Icon name="dm" size={dmSize * 0.5} color={PILL_FG} accent={RED ? COLORS.orange : COLORS.offWhite} stroke={5} />
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
          top: 1190,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.medium,
          fontSize: SIZES.ctaTagline,
          letterSpacing: '0.04em',
          color: FG,
          opacity: clamp(tag * 2) * 0.9,
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
          top: 1256,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: SIZES.ctaHandle,
          color: RED ? COLORS.offWhite : COLORS.red,
          opacity: clamp(handle * 2),
          transform: `translateY(${((1 - handle) * 30).toFixed(1)}px)`,
        }}
      >
        {BRAND.handle}
      </div>
      <Sfx name="bass-hit" at={C.logoAt} />
      <Sfx name="pop" at={C.dmAt + 5} />
    </AbsoluteFill>
  );
};
