import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {BEATS, LAYOUT, MOTION, SAFE, TEXT} from '../config';
import {HookCandles} from '../components/Charts';
import {useSceneFrame} from '../components/SceneShell';
import {WordReveal} from '../components/WordReveal';
import {clamp, pulse, springAt} from '../lib/motion';

/** 0-3s: huge gold question punches in over a faint red candlestick dip. */
export const Scene1Hook: React.FC = () => {
  const frame = useSceneFrame();
  const b = BEATS.hook;
  const L = LAYOUT.hook;
  const punch = springAt(frame, b.wordsAt, MOTION.punch);
  const scale = interpolate(punch, [0, 1], [1.18, 1]);
  const drift = interpolate(frame, [0, 90], [1, 1.03], clamp); // slow push-in while it holds
  return (
    <AbsoluteFill>
      <HookCandles frame={frame} />
      <div
        style={{
          position: 'absolute',
          left: SAFE.side,
          width: SAFE.contentWidth,
          top: L.centerY,
          transform: `translateY(-50%) scale(${scale * drift})`,
        }}
      >
        <WordReveal
          lines={TEXT.hook.lines}
          frame={frame}
          start={b.wordsAt}
          stagger={b.stagger}
          fontSize={L.fontSize}
          fill="gold"
          variant="punch"
          lineHeight={1.38}
          glow={0.5 + pulse(frame, 40) * 0.5}
        />
      </div>
    </AbsoluteFill>
  );
};
