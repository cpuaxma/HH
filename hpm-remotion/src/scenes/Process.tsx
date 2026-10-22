import {getLength, getPointAtLength} from '@remotion/paths';
import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {brandLinePath} from '../components/BrandLine';
import {MaskReveal} from '../components/MaskReveal';
import {TrackingLabel} from '../components/TrackingLabel';
import {COPY} from '../copy';
import {LAYOUT} from '../layout';
import {exitProgress, kick, mix, progress} from '../lib/anim';
import {COLORS, EASE_OUT, TYPE} from '../theme';
import {PROCESS_FIRST, PROCESS_STEP, SCENES} from '../timeline';

const EXIT = 226;
const RECOLOR = 8; // frames for the previous word to go from red to charcoal
const DOT_TRAVEL = 14;
const DOT_R = 11;

const wordAt = (i: number) => PROCESS_FIRST + i * PROCESS_STEP;
const stepY = (i: number) => LAYOUT.process.wordsTop + i * LAYOUT.process.wordStep + TYPE.processWord * 0.6;

// Point on the red line at a given height (the process shape runs top to bottom).
const pointAtY = (d: string, y: number) => {
  const total = getLength(d);
  let lo = 0;
  let hi = total;
  for (let n = 0; n < 24; n++) {
    const mid = (lo + hi) / 2;
    if ((getPointAtLength(d, mid)?.y ?? 0) < y) lo = mid;
    else hi = mid;
  }
  return getPointAtLength(d, (lo + hi) / 2) ?? {x: LAYOUT.process.lineX, y};
};

export const Process: React.FC = () => {
  const frame = useCurrentFrame();
  const L = LAYOUT.process;
  const words = COPY.process;

  // The dot hops to each step as its word lands.
  let dotY = stepY(0);
  for (let i = 1; i < words.length; i++) {
    dotY = mix(dotY, stepY(i), progress(frame, wordAt(i), DOT_TRAVEL, EASE_OUT));
  }
  const dot = pointAtY(brandLinePath(frame + SCENES.process[0]), dotY);
  const dotScale = kick(frame, wordAt(0) - 4) * (1 - exitProgress(frame, EXIT + 6));

  return (
    <AbsoluteFill>
      {words.map((word, i) => {
        const t = wordAt(i);
        const isLast = i === words.length - 1;
        const redness = isLast ? 1 : 1 - progress(frame, wordAt(i + 1), RECOLOR, EASE_OUT);
        const color = interpolateColors(redness, [0, 1], [COLORS.charcoal, COLORS.red]);
        const scale = mix(0.6, 1, kick(frame, t));
        return (
          <React.Fragment key={word}>
            <div
              style={{
                position: 'absolute',
                left: L.wordsCenterX - 500,
                width: 1000,
                top: L.wordsTop + i * L.wordStep,
                transform: `scale(${frame < t ? 0.6 : scale})`,
              }}
            >
              <MaskReveal
                lines={[word]}
                start={t}
                exitAt={EXIT + i * 2}
                fontSize={TYPE.processWord}
                align="center"
                color={color}
              />
            </div>
            <TrackingLabel
              text={String(i + 1)}
              start={t + 6}
              exitAt={EXIT + i * 2}
              size={26}
              color={COLORS.charcoal}
              trackingFrom={0.3}
              trackingTo={0.08}
              style={{position: 'absolute', left: L.lineX + 36, top: stepY(i) - 16}}
            />
          </React.Fragment>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: dot.x - DOT_R,
          top: dot.y - DOT_R,
          width: DOT_R * 2,
          height: DOT_R * 2,
          borderRadius: DOT_R,
          backgroundColor: COLORS.red,
          transform: `scale(${Math.max(0, dotScale)})`,
          opacity: interpolate(dotScale, [0, 0.1], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'}),
        }}
      />
    </AbsoluteFill>
  );
};
