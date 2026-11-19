import React from 'react';
import {useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {Logo} from '../components/Logo';
import {SceneFrame} from '../components/SceneFrame';
import {COLORS, CUES, SCENES, TEXT} from '../config';
import {EASE, ease, springIn} from '../lib/motion';
import {useTextOnly} from '../components/Debug';

const C = CUES.cta;
const FROM = SCENES.cta.from;

/** 0:27-0:30 — everything settles; the call to action, the Telegram line and the logo with a gold shine sweep. */
export const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const textOnly = useTextOnly();
  const logoP = springIn(frame, C.logo, {damping: 18, stiffness: 90, mass: 0.9});
  const logoO = ease(frame, [C.logo, C.logo + 16], [0, 1]);
  const shine = ease(frame, [C.logoShine, C.logoShine + 24], [0, 1], EASE.inOut);
  const divider = ease(frame, [C.telegram + 8, C.telegram + 30], [0, 1], EASE.inOut);

  return (
    <SceneFrame from={FROM} range={[FROM, FROM + SCENES.cta.duration + 30]}>
      <AnimatedText {...TEXT.cta.line} enter={C.text} shineAt={C.textShine} size={76} y={770} anchor="center" />
      <AnimatedText {...TEXT.cta.telegram} enter={C.telegram} shineAt={C.telegramShine} size={60} y={1000} anchor="center" variant="rise" />
      {!textOnly ? (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 1135,
            width: 520 * divider,
            height: 3,
            transform: 'translateX(-50%)',
            borderRadius: 2,
            background: `linear-gradient(90deg, rgba(212,175,55,0), ${COLORS.goldLight}, rgba(212,175,55,0))`,
            opacity: 0.8,
          }}
        />
      ) : null}
      <Logo y={1350} size={180} shine={shine} opacity={logoO} scale={0.88 + 0.12 * logoP} />
    </SceneFrame>
  );
};
