import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {Accent, EmotionFx, FONT, GRADIENTS} from '../config';
import {fontFamily} from '../fonts';
import {EASE, clamp01, ease, springIn} from '../lib/motion';

/**
 * Measured width of each word in Cairo Black at 100 px. Sizes are chosen so no word is wider than
 * ~600 px, which leaves room for the exit (it scales up as it trails past the camera) inside the
 * 900 px safe column.
 */
const WIDTH_100: Record<string, number> = {
  ذعر: 148, تفاؤل: 281, حماس: 300, إثارة: 217, نشوة: 265, قلق: 201, إنكار: 214, خوف: 231, استسلام: 426, إحباط: 252, أمل: 178, ارتياح: 264,
};
export const wordSize = (word: string, max = 210, maxWidth = 600) => Math.min(max, (maxWidth / (WIDTH_100[word] ?? 280)) * 100);

const FX_ACCENT: Record<EmotionFx, Accent> = {
  soft: 'gold', pop: 'green', spark: 'gold', swell: 'hot', wobble: 'amber', strike: 'amber', fear: 'red', panic: 'red', drop: 'red', heavy: 'ice', ray: 'dawn', color: 'gold', climb: 'gold', flash: 'white',
};
const GLOW: Record<Accent, string> = {
  gold: 'rgba(212,175,55,0.55)', green: 'rgba(201,199,90,0.55)', hot: 'rgba(255,244,210,0.85)', amber: 'rgba(255,164,54,0.5)', red: 'rgba(255,40,40,0.6)', ice: 'rgba(140,160,190,0.35)', dawn: 'rgba(255,176,112,0.6)', white: 'rgba(255,255,255,0.4)',
};

type Props = {
  word: string;
  /** frame (in the current Sequence) when the word has fully landed */
  at: number;
  /** frame when it starts to leave */
  out: number;
  fx: EmotionFx;
  y?: number;
  size?: number;
  /** frames (in the current Sequence) of heavy glitch bursts */
  glitchAt?: number[];
};

/** A big emotion word with its own typography treatment. DOM text, so Arabic always joins. */
export const EmotionWord: React.FC<Props> = ({word, at, out, fx, y = 800, size, glitchAt = []}) => {
  const frame = useCurrentFrame();
  const S = size ?? wordSize(word);
  const lead = fx === "panic" ? 3 : fx === "flash" ? 1 : fx === "heavy" ? 14 : 7;
  const start = at - lead;
  if (frame < start - 1 || frame > out + 26) return null;

  const t = frame - start;
  const inK = ease(frame, [start, at], [0, 1], EASE.out);
  let opacity = inK;
  let tx = 0;
  let ty = 0;
  let scale = 1;
  let rot = 0;
  let skew = 0;
  let blur = (1 - inK) * 10;
  let glow = 0.6;
  let gray = 0;
  let accent: Accent = FX_ACCENT[fx];
  let mask: string | undefined;
  let split = 0;
  let strike = 0;

  // ---- entrances / holds
  switch (fx) {
    case 'soft':
      scale = 0.95 + 0.05 * inK;
      blur = (1 - inK) * 16;
      break;
    case 'pop': {
      const p = springIn(frame, start, {damping: 9, stiffness: 180, mass: 0.6});
      scale = 0.35 + 0.65 * p;
      blur = 0;
      opacity = clamp01(t / 3);
      break;
    }
    case 'spark': {
      const p = springIn(frame, start, {damping: 14, stiffness: 200, mass: 0.6});
      tx = (1 - p) * 150;
      skew = (1 - p) * -18;
      blur = (1 - p) * 14;
      glow = 0.7 + 0.3 * Math.abs(Math.sin(frame * 0.9));
      break;
    }
    case 'swell': {
      const life = ease(frame, [start, out], [0, 1], EASE.sine);
      scale = 0.88 + 0.22 * life;
      glow = 0.7 + 0.8 * life;
      break;
    }
    case 'wobble': {
      const d = Math.exp(-Math.max(0, t) / 16);
      rot = Math.sin(t * 0.55) * 6 * d + Math.sin(t * 0.2) * 1.2;
      tx = Math.sin(t * 0.37) * 14 * d;
      break;
    }
    case 'strike': {
      // appears, then a glitch crosses it out
      strike = ease(frame, [at + 3, at + 9], [0, 1], EASE.out);
      const glitching = frame >= at + 3 && frame < at + 9;
      if (glitching) {
        tx = (random(`st-x-${frame}`) - 0.5) * 34;
        split = 8;
      }
      opacity = inK * (1 - 0.4 * strike);
      break;
    }
    case 'fear': {
      scale = 1.2 - 0.2 * ease(frame, [start, at + 4], [0, 1], EASE.out);
      tx = (random(`fe-x-${frame}`) - 0.5) * 6;
      ty = (random(`fe-y-${frame}`) - 0.5) * 6;
      glow = 0.9;
      break;
    }
    case 'panic': {
      const p = springIn(frame, start, {damping: 11, stiffness: 260, mass: 0.7});
      scale = 1.8 - 0.8 * p;
      blur = (1 - p) * 8;
      opacity = clamp01(t / 2);
      tx = (random(`pa-x-${frame}`) - 0.5) * 22;
      ty = (random(`pa-y-${frame}`) - 0.5) * 18;
      split = 7 + random(`pa-s-${frame}`) * 9;
      // the word flickers on some frames
      if (random(`pa-f-${frame}`) > 0.86) opacity *= 0.45;
      glow = 1;
      break;
    }
    case 'drop':
      scale = 1;
      break;
    case 'heavy': {
      const life = ease(frame, [start, out + 18], [0, 1], EASE.sine);
      ty = life * 34;
      opacity = inK * 0.82;
      blur = (1 - inK) * 6;
      glow = 0.25;
      break;
    }
    case 'ray': {
      // the warm light sweeps across and reveals the word
      const p = ease(frame, [start, at + 8], [0, 1], EASE.inOut);
      mask = `linear-gradient(105deg, #000 ${p * 150 - 30}%, rgba(0,0,0,0) ${p * 150 - 5}%)`;
      opacity = 1;
      blur = 0;
      glow = 0.6 + 0.6 * Math.exp(-Math.max(0, frame - at) / 12);
      break;
    }
    case 'color':
      gray = 1 - ease(frame, [at - 2, at + 14], [0, 1], EASE.inOut);
      break;
    case 'climb': {
      const p = springIn(frame, start, {damping: 15, stiffness: 120, mass: 0.8});
      ty = (1 - p) * 110;
      blur = (1 - p) * 10;
      break;
    }
    case 'flash': {
      // rewind flashes: a few frames each, stretched like a tape
      opacity = 1;
      scale = 1;
      skew = (random(`fl-k-${word}`) - 0.5) * 20;
      tx = (random(`fl-x-${frame}`) - 0.5) * 40;
      split = 6;
      blur = 1.5;
      break;
    }
  }

  // ---- heavy glitch bursts: the word tears sideways for a few frames
  const burst = glitchAt.find((gf) => frame >= gf && frame < gf + 5);
  if (burst !== undefined) {
    const k = 1 - (frame - burst) / 5;
    tx += (random(`gb-x-${frame}`) - 0.5) * 90 * k;
    skew += (random(`gb-k-${frame}`) - 0.5) * 30 * k;
    split += 22 * k;
    scale *= 1 + 0.08 * k;
  }

  // ---- exits
  const e = ease(frame, [out, out + 9], [0, 1], EASE.in);
  if (fx === 'drop') {
    const tf = Math.max(0, frame - out);
    ty += 0.5 * 3.4 * tf * tf;
    rot += tf * 1.2;
    opacity *= 1 - ease(frame, [out + 3, out + 13], [0, 1], EASE.in);
  } else if (fx === 'heavy') {
    opacity *= 1 - ease(frame, [out, out + 18], [0, 1], EASE.inOut);
    blur += e * 6;
  } else if (fx === 'flash') {
    opacity *= 1 - ease(frame, [out, out + 3], [0, 1], EASE.in);
  } else if (fx === 'panic') {
    // glitch out: smear sideways and vanish
    opacity *= 1 - e;
    tx += e * 60;
    split += e * 20;
    blur += e * 10;
  } else if (fx === 'climb') {
    ty -= e * 150;
    opacity *= 1 - e;
    blur += e * 12;
  } else if (fx === 'swell') {
    // white-hot bloom out
    scale *= 1 + 0.3 * e;
    glow += e * 1.5;
    opacity *= 1 - e;
    blur += e * 14;
  } else {
    // trail off behind the camera: grows, slides down past the lens, blurs out
    scale *= 1 + 0.42 * e;
    ty += 100 * e;
    blur += 18 * e;
    opacity *= 1 - e;
  }
  if (opacity <= 0.002) return null;

  const g = GLOW[accent];
  const glowPx = S * 0.18 * glow;
  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  };
  const textStyle: React.CSSProperties = {
    fontFamily,
    fontWeight: FONT.weightBlack,
    fontSize: S,
    lineHeight: 1.25,
    padding: '0 0.1em',
    direction: 'rtl',
  };
  const fill: React.CSSProperties = {
    ...textStyle,
    backgroundImage: GRADIENTS[accent],
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: '#fff',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        width: 900,
        top: y - S * 0.7,
        height: S * 1.4,
        opacity,
        transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rot}deg) skewX(${skew}deg)`,
        filter: `blur(${blur.toFixed(2)}px) grayscale(${gray})`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      {split > 0.5 ? (
        <>
          <div style={{...layerStyle, transform: `translateX(${-split}px)`, mixBlendMode: 'screen', opacity: 0.85}}>
            <span style={{...textStyle, color: '#FF1E3C'}}>{word}</span>
          </div>
          <div style={{...layerStyle, transform: `translateX(${split}px)`, mixBlendMode: 'screen', opacity: 0.75}}>
            <span style={{...textStyle, color: '#1EE6FF'}}>{word}</span>
          </div>
        </>
      ) : null}
      <div style={{...layerStyle, filter: `drop-shadow(0 0 ${glowPx}px ${g}) drop-shadow(0 6px 24px rgba(0,0,0,0.6))`}}>
        <span style={fill}>{word}</span>
      </div>
      {strike > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '52%',
            width: (WIDTH_100[word] ?? 250) * (S / 100) * 1.12,
            height: Math.max(8, S * 0.06),
            marginLeft: -((WIDTH_100[word] ?? 250) * (S / 100) * 1.12) / 2,
            background: 'linear-gradient(90deg, #FF3B3B, #FF8A7A)',
            boxShadow: '0 0 18px rgba(255,59,59,0.8)',
            transformOrigin: 'right center',
            transform: `scaleX(${strike}) rotate(-4deg)`,
            borderRadius: 4,
          }}
        />
      ) : null}
    </div>
  );
};
