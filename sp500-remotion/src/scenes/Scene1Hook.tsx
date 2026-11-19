import React from 'react';
import {Easing, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {SceneFrame} from '../components/SceneFrame';
import {COLORS, CUES, FONT, GOLD_GRADIENT, SCENES, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {toArabicDigits} from '../lib/arabic';
import {EASE, ease, springIn} from '../lib/motion';
import {useTextOnly} from '../components/Debug';

const C = CUES.hook;

/** 0:00-0:03 — black screen, a giant gold ٠ -> ٥٠٠ counter lands with a shake, then the hook lines. */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const textOnly = useTextOnly();

  const count = Math.round(ease(frame, [C.countStart, C.countEnd], [0, TEXT.hook.count], Easing.out(Easing.cubic)));
  const appear = ease(frame, [C.countStart - 2, C.countStart + 8], [0, 1]);

  // landing punch: scale overshoot, then the number lifts to make room for the sentence
  const land = springIn(frame, C.countEnd, {damping: 9, stiffness: 220, mass: 0.6});
  const punch = frame >= C.countEnd ? 1 + 0.16 * Math.sin(Math.min(1, land) * Math.PI) : 0.86 + 0.14 * ease(frame, [C.countStart, C.countEnd], [0, 1]);
  const lift = ease(frame, [C.countEnd + 4, C.countEnd + 20], [0, 1], EASE.out);
  const y = 900 - lift * 290;
  const scale = punch * (1 - lift * 0.22);

  // glow pulse peaks on landing
  const pulse = frame < C.countEnd ? 0.5 + 0.3 * Math.sin(frame * 0.9) : 1.6 * Math.exp(-(frame - C.countEnd) / 10) + 0.55;

  // morph out: the number blurs away while "S&P 500" forms in the same spot (scene 2)
  const out = ease(frame, [C.numberExit, C.numberExit + 12], [0, 1], EASE.in);

  // expanding ring on landing
  const ringT = frame - C.countEnd;
  const ring = ringT >= 0 && ringT < 26 ? ease(ringT, [0, 26], [0, 1], EASE.out) : -1;

  return (
    <SceneFrame from={0} range={[0, SCENES.hook.from + SCENES.hook.duration]}>
      {!textOnly && ring >= 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 900,
            width: 200 + ring * 900,
            height: 200 + ring * 900,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `${3 + (1 - ring) * 5}px solid ${COLORS.goldLight}`,
            opacity: (1 - ring) * 0.6,
            boxShadow: `0 0 60px rgba(212,175,55,${(1 - ring) * 0.6})`,
          }}
        />
      ) : null}
      {!textOnly ? (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: y,
            width: 900,
            height: 900,
            transform: `translate(-50%, -50%) scale(${0.7 + pulse * 0.25})`,
            background: `radial-gradient(circle, rgba(212,175,55,${0.22 * pulse * (1 - out)}) 0%, rgba(140,109,31,${0.1 * pulse * (1 - out)}) 35%, rgba(0,0,0,0) 65%)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y,
          transform: `translateY(-50%) scale(${scale * (1 - out * 0.35)})`,
          textAlign: 'center',
          direction: 'rtl',
          fontFamily,
          fontWeight: FONT.weightBlack,
          fontSize: 340,
          lineHeight: 1,
          opacity: appear * (1 - out),
          filter: `drop-shadow(0 0 ${30 + pulse * 30}px rgba(212,175,55,${0.35 + pulse * 0.2})) blur(${out * 26}px)`,
        }}
      >
        <span
          style={{
            backgroundImage: GOLD_GRADIENT,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: COLORS.gold,
            fontVariantNumeric: 'tabular-nums',
            padding: '0 0.05em',
          }}
        >
          {toArabicDigits(count)}
        </span>
      </div>
      <AnimatedText
        {...TEXT.hook.line1}
        enter={C.line1}
        exit={C.textExit}
        shineAt={C.line1Shine}
        size={104}
        y={785}
        anchor="top"
        lineHeight={1.25}
      />
      <AnimatedText {...TEXT.hook.line2} enter={C.line2} exit={C.textExit + 4} size={62} y={1105} anchor="top" variant="rise" weight={FONT.weightBold} />
    </SceneFrame>
  );
};
