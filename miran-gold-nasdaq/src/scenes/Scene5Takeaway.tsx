import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {BEATS, COLORS, LAYOUT, SAFE, TEXT} from '../config';
import {useSceneFrame} from '../components/SceneShell';
import {WordReveal} from '../components/WordReveal';
import {clamp, EASE, pulse, rgba} from '../lib/motion';

/** 25-30s: the takeaway, large gold, with a highlight band sweeping behind the key phrase. */
export const Scene5Takeaway: React.FC = () => {
  const frame = useSceneFrame();
  const b = BEATS.takeaway;
  const L = LAYOUT.takeaway;
  const lines = TEXT.takeaway.lines;
  const sweep = interpolate(frame, [b.highlightFrom, b.highlightFrom + b.highlightDur], [0, 1], {...clamp, easing: EASE.out});
  const glow = 0.4 + pulse(frame) * 0.6;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: L.centerY,
          left: SAFE.side - 20,
          width: SAFE.contentWidth + 40,
          transform: 'translateY(-50%)',
        }}
      >
        <WordReveal
          lines={lines}
          frame={frame}
          start={b.firstAt}
          stagger={b.stagger}
          fontSize={L.fontSize}
          fill="gold"
          glow={glow}
          lineHeight={1.5}
          renderBehindLine={(li) =>
            li === TEXT.takeaway.highlightLine ? (
              <div
                style={{
                  position: 'absolute',
                  top: '14%',
                  bottom: '8%',
                  left: '6%',
                  right: '6%',
                  borderRadius: 22,
                  background: `linear-gradient(270deg, ${rgba(COLORS.gold, 0.26)}, ${rgba(COLORS.gold, 0.12)})`,
                  border: `2px solid ${rgba(COLORS.gold, 0.45)}`,
                  boxShadow: `0 0 ${30 + glow * 30}px ${rgba(COLORS.gold, 0.18 + glow * 0.12)}`,
                  transform: `scaleX(${sweep})`,
                  transformOrigin: 'right center', // sweeps in reading direction (right → left)
                  opacity: sweep > 0 ? 1 : 0,
                }}
              />
            ) : null
          }
        />
      </div>
    </AbsoluteFill>
  );
};
