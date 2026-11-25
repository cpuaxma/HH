import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BEATS, FONT, LAYOUT, SAFE, TEXT, VIDEO} from '../config';
import {ExampleLabel} from '../components/Chrome';
import {useSceneFrame} from '../components/SceneShell';
import {WordReveal} from '../components/WordReveal';

/** 9-17s: weights are not equal; the bubble morph/swell is drawn by CompanyField. */
export const Scene3NotEqual: React.FC = () => {
  const frame = useSceneFrame();
  const b = BEATS.notEqual;
  const L = LAYOUT.notEqual;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: L.firstTop, left: SAFE.side, width: SAFE.contentWidth}}>
        <WordReveal
          lines={TEXT.notEqual.first}
          frame={frame}
          start={b.firstAt}
          stagger={b.stagger}
          fontSize={L.firstSize}
          fill="white"
          // "ليست متساوية الوزن" carries the idea: gold
          wordFill={(i) => (i >= 2 ? 'gold' : undefined)}
          glow={0.4}
        />
      </div>
      <ExampleLabel text={TEXT.notEqual.label} frame={frame} at={b.labelAt} style={{top: LAYOUT.bubbles.labelTop, right: VIDEO.width - LAYOUT.bubbles.maxX}} />
      <div style={{position: 'absolute', top: L.secondTop, left: SAFE.side, width: SAFE.contentWidth}}>
        <WordReveal lines={TEXT.notEqual.second} frame={frame} start={b.secondAt} stagger={b.stagger} fontSize={L.secondSize} weight={FONT.bold} fill="white" />
      </div>
    </AbsoluteFill>
  );
};
