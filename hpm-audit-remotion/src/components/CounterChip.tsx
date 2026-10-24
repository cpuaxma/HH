import {Check} from 'lucide-react';
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {exitP, kick, mix, pop, progress} from '../lib/anim';
import {C, EASE_OUT, FONT} from '../theme';

// ── CounterChip: "n/3" + the current fix label ─────────────────────────────
type Step = {at: number; n: number; label?: string; done?: number};
export const CounterChip: React.FC<{inAt: number; outAt: number; steps: Step[]}> = ({inAt, outAt, steps}) => {
  const frame = useCurrentFrame();
  if (frame < inAt || frame > outAt + 8) return null;
  const idx = steps.reduce((acc, s, i) => (frame >= s.at ? i : acc), 0);
  const step = steps[idx];
  const prev = steps[Math.max(0, idx - 1)];
  const roll = idx === 0 ? 1 : progress(frame, step.at, 10, EASE_OUT);
  const shown = mix(prev.n, step.n, roll);
  const done = step.done !== undefined && frame >= step.done;
  const fill = done ? progress(frame, step.done!, 6) : 0;
  const s = pop(frame, inAt);
  const e = exitP(frame, outAt, 8);
  const labelPop = step.label ? pop(frame, step.at) : 0;
  return (
    <div style={{position: 'absolute', left: 64, top: 96, display: 'flex', gap: 14, alignItems: 'center', transform: `translateY(${-200 * e}px) scale(${s})`, transformOrigin: '0 50%'}}>
      <div
        style={{
          height: 84,
          padding: '0 26px',
          borderRadius: 42,
          background: fill > 0 ? C.red : C.charcoal,
          color: C.cream,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transform: `scale(${1 + 0.12 * kick(frame, step.at, 5) + (done ? 0.1 * kick(frame, step.done!, 5) : 0)})`,
        }}
      >
        <span style={{display: 'inline-block', height: 60, overflow: 'hidden'}}>
          <span style={{display: 'block', transform: `translateY(${-(shown % 1) * 60}px)`, lineHeight: '60px'}}>
            {Math.floor(shown)}
            <br />
            {Math.floor(shown) + 1}
          </span>
        </span>
        <span>/3</span>
        {done && <Check size={44} strokeWidth={4} color={C.cream} style={{transform: `scale(${pop(frame, step.done!)})`}} />}
      </div>
      {step.label && (
        <div
          style={{
            height: 70,
            padding: '0 24px',
            borderRadius: 12,
            background: C.cream,
            border: `4px solid ${C.charcoal}`,
            color: C.charcoal,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            transform: `translateX(${(1 - labelPop) * -40}px) scale(${labelPop})`,
            transformOrigin: '0 50%',
          }}
        >
          {step.label}
        </div>
      )}
    </div>
  );
};
