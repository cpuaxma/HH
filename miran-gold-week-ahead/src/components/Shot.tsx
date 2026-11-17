import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {EASE, MOTION} from '../brand';
import {OVERLAP} from '../timeline';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type TransitionKind = 'cut' | 'whip' | 'mask' | 'zoom' | 'fade' | 'squash' | 'rise';

/**
 * Wraps a shot: places it on the timeline (overlapping the next by OVERLAP frames),
 * applies a slow camera push 1.00→1.04, and handles enter/exit transitions:
 * - whip: horizontal whip-pan with directional motion blur (RTL: next shot comes from the left)
 * - mask: circular mask wipe
 * - zoom: match-cut style scale-through
 */
const ShotInner: React.FC<{
  id: string;
  len: number;
  enterKind: TransitionKind;
  exitKind: TransitionKind;
  children: React.ReactNode;
  push?: number;
}> = ({id, len, enterKind, exitKind, children, push = MOTION.push}) => {
  const f = useCurrentFrame();
  const total = len + OVERLAP;
  const ENTER = 14;
  const EXIT = exitKind === 'squash' ? 22 : OVERLAP + 4;
  const e = interpolate(f, [0, ENTER], [0, 1], {...CLAMP, easing: EASE.enter});
  const x = interpolate(f, [total - EXIT, total], [0, 1], {...CLAMP, easing: EASE.exit});
  const scale = 1 + push * interpolate(f, [0, total], [0, 1], CLAMP);

  let tx = 0;
  let blur = 0;
  let op = 1;
  let extraScale = 1;
  let clip: string | undefined;

  if (enterKind === 'whip' && e < 1) {
    tx += -(1 - e) * 1100;
    blur += (1 - e) * 60;
  }
  if (exitKind === 'whip' && x > 0) {
    tx += x * 1100;
    blur += x * 60;
  }
  if (enterKind === 'mask' && e < 1) clip = `circle(${e * 120}% at 50% 45%)`;
  if (exitKind === 'mask' && x > 0) op *= 1 - x;
  if (enterKind === 'zoom' && e < 1) {
    extraScale *= 0.85 + 0.15 * e;
    op *= e;
  }
  if (exitKind === 'zoom' && x > 0) {
    extraScale *= 1 + x * 0.35;
    op *= 1 - x;
    blur += x * 12;
  }
  let scaleY = 1;
  if (exitKind === 'squash' && x > 0) {
    scaleY = 1 - 0.985 * x;
    op *= x > 0.9 ? (1 - x) * 10 : 1;
  }
  let ty = 0;
  if (enterKind === 'rise') {
    const er = interpolate(f, [6, 22], [0, 1], {...CLAMP, easing: EASE.enter});
    ty += (1 - er) * 60;
    op *= er;
  }
  if (exitKind === 'rise') {
    const xr = interpolate(f, [total - 18, total - 7], [0, 1], {...CLAMP, easing: EASE.exit});
    ty -= xr * 50;
    op *= 1 - xr;
  }
  if (enterKind === 'fade') op *= e;
  if (exitKind === 'fade') op *= 1 - x;

  const filterId = `whip-${id}`;
  return (
    <AbsoluteFill style={{opacity: op, clipPath: clip}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={filterId} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale * extraScale}) scaleY(${scaleY})`,
          transformOrigin: '50% 45%',
          filter: blur > 0.5 ? `url(#${filterId})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Shot: React.FC<{
  id: string;
  from: number;
  to: number;
  enter?: TransitionKind;
  exit?: TransitionKind;
  push?: number;
  children: React.ReactNode;
}> = ({id, from, to, enter = 'cut', exit = 'cut', push, children}) => (
  <Sequence from={from} durationInFrames={to - from + OVERLAP} name={id}>
    <ShotInner id={id} len={to - from} enterKind={enter} exitKind={exit} push={push}>
      {children}
    </ShotInner>
  </Sequence>
);
