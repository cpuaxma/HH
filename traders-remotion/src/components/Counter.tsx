import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BEATS, COLORS, GOLD_TEXT} from '../config';
import {CAIRO} from '../fonts';
import {EASE, clamp, impulse, mix, prog, springAt} from '../lib/anim';
import {AR_DIGITS} from '../lib/digits';
import {PLAN, counterValue} from '../arena/plan';
import {COUNT} from '../arena/grid';
import {useAudit} from '../scenes/layout';

const SIZE = 172;
const DIGIT_H = SIZE * 1.3;
const DIGIT_W = SIZE * 0.6;
const RED_TEXT = `linear-gradient(180deg, #E85A4E 0%, ${COLORS.red} 60%, #8E231C 100%)`;

/** Odometer position for digit column k (0 = units) at continuous value v. */
const columnPos = (v: number, k: number) => {
  const p = 10 ** k;
  if (k === 0) return v;
  const base = Math.floor(v / p);
  const rem = v - base * p;
  return rem > p - 1 ? base + (rem - (p - 1)) : base;
};

const Column: React.FC<{pos: number; red: number}> = ({pos, red}) => {
  // A strip of 11 cells (٠…٩ then ٠ again, so 9→0 wraps seamlessly). Counting down moves the strip
  // down: the lower digit drops in from above.
  const m = ((pos % 10) + 10) % 10;
  return (
    <span style={{position: 'relative', display: 'block', width: DIGIT_W, height: DIGIT_H, overflow: 'hidden'}}>
      <span style={{position: 'absolute', left: 0, top: 0, width: DIGIT_W, transform: `translateY(${-m * DIGIT_H}px)`}}>
        {Array.from({length: 11}, (_, d) => (
          <span
            key={d}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: DIGIT_W,
              height: DIGIT_H,
              lineHeight: 1,
              backgroundImage: red > 0.5 ? RED_TEXT : GOLD_TEXT,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {AR_DIGITS[d % 10]}
          </span>
        ))}
      </span>
    </span>
  );
};

/** The big «١٠٠ → ٢٥» counter: rolling digits, a heavy slam, a punch + red flash on every loss wave, and 100 ticks. */
export const Counter: React.FC<{top?: number}> = ({top = 262}) => {
  const frame = useCurrentFrame();
  const v = counterValue(frame);
  const slam = BEATS.counterSlam;
  const inP = EASE.in(prog(frame, slam - 9, slam));
  const settle = springAt(frame, slam, 0.5, 0.38);
  const scale = frame < slam ? mix(2.6, 1, inP) : 1 + (1 - settle) * 0.08;
  const fadeOut = EASE.inOut(prog(frame, 858, 888));
  if (frame < slam - 9 || fadeOut >= 1) return null;

  // Red while a wave of losses is rolling the digits down; a punch on each wave's final hit.
  let punch = 0;
  let red = 0;
  for (const t of PLAN.traps) {
    punch = Math.max(punch, impulse(frame, t.hit, 14));
    const first = t.start + Math.min(...t.prepared.death);
    if (frame >= first && frame < t.hit + 10) red = 1;
  }
  const reveal = prog(frame, 760, 790);
  const cols = [2, 1, 0].map((k) => ({k, pos: columnPos(v, k)}));
  const hundredsW = clamp(v - 99);
  const hit = impulse(frame, slam, 18);
  const audit = useAudit();
  return (
    <>
    {audit ? null : (
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 640, opacity: 0.85 * (frame < slam ? inP : 1) * (1 - fadeOut), background: 'linear-gradient(180deg, rgba(6,6,6,0.9) 0%, rgba(6,6,6,0.75) 45%, rgba(6,6,6,0) 100%)'}} />
    )}
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: (frame < slam ? inP : 1) * (1 - fadeOut)}}>
      <div
        style={{
          position: 'relative',
          fontFamily: CAIRO,
          fontWeight: 900,
          fontSize: SIZE,
          direction: 'ltr',
          display: 'flex',
          transform: `scale(${scale * (1 + punch * 0.12)})`,
          filter: `blur(${frame < slam ? (1 - inP) * 14 : 0}px) drop-shadow(0 0 ${18 + 40 * (hit + punch)}px ${red > 0.5 ? 'rgba(200,55,45,0.75)' : `rgba(212,175,55,${0.35 + 0.4 * reveal})`}) drop-shadow(0 8px 20px rgba(0,0,0,0.9))`,
        }}
      >
        {cols.map(({k, pos}) => (
          <span key={k} style={{display: 'block', width: k === 2 ? DIGIT_W * hundredsW : DIGIT_W, height: DIGIT_H, overflow: 'hidden', opacity: k === 2 ? hundredsW : 1}}>
            <Column pos={pos} red={red} />
          </span>
        ))}
      </div>
      <Ticks />
    </div>
    </>
  );
};

/** 100 ticks, one per trader: gold while standing, a red flash when lost, then a dim stub. */
const Ticks: React.FC = () => {
  const frame = useCurrentFrame();
  const key = (i: number) => (Number.isFinite(PLAN.deathAbs[i]) ? PLAN.deathAbs[i] : 1e9);
  const order = Array.from({length: COUNT}, (_, i) => i).sort((a, b) => key(b) - key(a) || a - b);
  return (
    <div style={{display: 'flex', gap: 3, marginTop: 4, direction: 'ltr'}}>
      {order.map((i, n) => {
        const d = PLAN.deathAbs[i];
        const lost = frame >= d;
        const flash = lost ? Math.exp(-(frame - d) / 6) : 0;
        const fill = lost ? `rgba(200,55,45,${0.18 + 0.82 * flash})` : COLORS.gold;
        const appear = prog(frame, BEATS.counterSlam + 2 + n * 0.25, BEATS.counterSlam + 8 + n * 0.25);
        return <span key={i} style={{width: 4, height: lost ? 10 : 20, marginTop: lost ? 10 : 0, borderRadius: 2, background: fill, opacity: appear, boxShadow: lost ? undefined : '0 0 6px rgba(245,215,122,0.55)'}} />;
      })}
    </div>
  );
};
