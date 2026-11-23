import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER_W} from '../lib/layout';
import {fitSize, parseWord} from '../lib/text';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.hook;

/** 0–2 s: "What goes into ONE post?" slams in word by word on black. */
export const Hook: React.FC = () => {
  const t = useSceneFrame();
  const words = [...C.line1, ...C.line2].map(parseWord);
  const maxW = INNER_W - 20;

  // Screen shake: decaying kick after every slam.
  let shake = 0;
  C.wordAt.forEach((at, i) => {
    const d = t - at;
    if (d >= 0 && d < 10) shake += (i === C.bassHitWord ? 22 : 9) * Math.exp(-d * 0.45) * Math.sin(d * 2.6 + i);
  });

  // "ONE" keeps scaling up after it lands (font-size grows, so the line re-centres).
  const oneIdx = words.findIndex((w) => w.accent);
  const grow = mix(1, SIZES.hookOneGrowTo, clamp(spr(t, C.wordAt[oneIdx] + 4, MOTION.soft, 40)));

  const size1 = fitSize([C.line1.join(' ')], SIZES.hookLine1, maxW);
  // Size line 2 for its largest state (ONE fully grown) so it never overflows.
  const l2 = C.line2.map(parseWord);
  const base2 = fitSize([l2.map((w) => w.text).join(' ')], SIZES.hookLine2 * (1 + (SIZES.hookOneGrowTo - 1) * 0.5), maxW);
  const size2 = base2 / (1 + (SIZES.hookOneGrowTo - 1) * 0.5);

  const renderWord = (w: {text: string; accent: boolean}, i: number, size: number) => {
    const at = C.wordAt[i] ?? 0;
    const s = spr(t, at, MOTION.slam);
    const visible = t >= at;
    const fs = w.accent ? size * grow : size;
    return (
      <span
        key={i}
        style={{
          display: 'inline-block',
          fontSize: fs,
          color: w.accent ? COLORS.red : COLORS.ink,
          opacity: visible ? clamp(s * 3) : 0,
          transform: `scale(${mix(2.4, 1, s).toFixed(4)})`,
          filter: s < 0.9 ? `blur(${((1 - s) * 14).toFixed(1)}px)` : undefined,
          textShadow: w.accent ? '0 0 40px rgba(230,57,70,0.22)' : 'none',
        }}
      >
        {w.text}
      </span>
    );
  };

  return (
    <AbsoluteFill style={{background: 'transparent'}}>
      <div
        style={{
          position: 'absolute',
          left: CX - maxW / 2,
          width: maxW,
          top: 700,
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          lineHeight: 1.02,
          letterSpacing: '-0.025em',
          transform: `translate(${(shake * 0.6).toFixed(2)}px, ${shake.toFixed(2)}px)`,
        }}
      >
        <div>
          <span data-qa="text" style={{display: 'inline-flex', gap: '0.24em', alignItems: 'baseline', whiteSpace: 'nowrap', fontSize: size1}}>
            {C.line1.map((w, i) => renderWord(parseWord(w), i, size1))}
          </span>
        </div>
        <div style={{height: size2 * SIZES.hookOneGrowTo * 1.05, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <span data-qa="text" style={{display: 'inline-flex', gap: '0.22em', alignItems: 'baseline', whiteSpace: 'nowrap', fontSize: size2}}>
            {l2.map((w, i) => renderWord(w, i + C.line1.length, size2))}
          </span>
        </div>
      </div>
      <Sfx name="bass-hit" at={C.wordAt[C.bassHitWord]} />
    </AbsoluteFill>
  );
};
