import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CAMERA, COLORS, TRANSITION} from '../config';
import {ease, mix} from '../lib/anim';
import {H, ORIGIN, W} from '../lib/layout';
import {SceneTiming} from '../lib/timeline';
import {FlameWipe, flameEdge} from './Flame';

const Ctx = createContext<SceneTiming | null>(null);
export const useScene = () => useContext(Ctx)!;
/** Frames since this scene's cut (negative during the incoming transition). */
export const useSceneFrame = () => useCurrentFrame() - useScene().head;

// Whip progress for a window of `len` frames starting at `start`.
const whip = (f: number, start: number, len: number) => ease(f, start, start + len, (t) =>
  // strong in-out: slow → very fast at the cut → slow
  t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2,
);

const DotGrid: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <defs>
      <pattern id="dots" width={54} height={54} patternUnits="userSpaceOnUse">
        <circle cx={2} cy={2} r={2} fill={COLORS.offWhite} opacity={0.05} />
      </pattern>
    </defs>
    <rect width={W} height={H} fill="url(#dots)" />
  </svg>
);

export const SceneShell: React.FC<{timing: SceneTiming; background?: boolean; children: React.ReactNode}> = ({
  timing,
  background = true,
  children,
}) => {
  const f = useCurrentFrame(); // local to this sequence (0 = start of incoming transition)
  const {head, duration, tail, inType, outType, inFrames, outFrames, name} = timing;
  const total = head + duration + tail;

  // Constant slow push-in across the whole time the scene is on screen.
  // Mostly constant speed, with a soft start and finish (never a hard linear ramp).
  const pushEased = mix(CAMERA.pushFrom, CAMERA.pushTo, ease(f, 0, total, (t) => 0.7 * t + 0.3 * (0.5 - Math.cos(Math.PI * t) / 2)));

  // Whip in / out (horizontal, with motion blur proportional to speed).
  let x = 0;
  let blur = 0;
  const D = TRANSITION.whipDistance;
  if (inType === 'whip' && f < inFrames) {
    const p = whip(f, 0, inFrames);
    const v = Math.abs(p - whip(f - 1, 0, inFrames)) * D;
    x = (1 - p) * D;
    blur = v;
  }
  const outStart = total - outFrames;
  if (outType === 'whip' && f >= outStart) {
    const p = whip(f, outStart, outFrames);
    const v = Math.abs(p - whip(f - 1, outStart, outFrames)) * D;
    x = -p * D;
    blur = v;
  }
  blur = Math.min(TRANSITION.maxBlur, blur * 0.45);

  // Flame wipe: clip the incoming scene below a flickering flame edge.
  let clipPath: string | undefined;
  let flameP = -1;
  if (inType === 'flame' && f < inFrames) {
    flameP = ease(f, 0, inFrames);
    clipPath = `polygon(${flameEdge(flameP, f, 0)
      .map(([px, py]) => `${px.toFixed(1)}px ${py.toFixed(1)}px`)
      .join(', ')}, ${W}px ${H + 400}px, 0px ${H + 400}px)`;
  }

  const filterId = `whip-${name}`;
  return (
    <Ctx.Provider value={timing}>
      <AbsoluteFill>
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={filterId} x="-20%" y="0%" width="140%" height="100%">
            <feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} />
          </filter>
        </svg>
        <AbsoluteFill
          style={{
            clipPath,
            transform: `translateX(${x.toFixed(2)}px)`,
            filter: blur > 0.5 ? `url(#${filterId})` : undefined,
          }}
        >
          {background ? <DotGrid /> : null}
          <AbsoluteFill style={{transform: `scale(${pushEased.toFixed(5)})`, transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`}}>
            {children}
          </AbsoluteFill>
        </AbsoluteFill>
        {flameP >= 0 && flameP < 1 ? <FlameWipe p={flameP} frame={f} /> : null}
      </AbsoluteFill>
    </Ctx.Provider>
  );
};
