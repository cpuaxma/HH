import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CUES, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {Scrim} from '../components/Scrim';
import {windowed} from '../lib/motion';

const from = SCENES.reveal.from;
const c = CUES.reveal;

/** 0:25-0:29 Pull back: the rollercoaster was a price chart all along. */
export const S5Reveal: React.FC = () => {
  const g = useCurrentFrame() + from;
  return (
    <AbsoluteFill>
      <Scrim y={420} h={420} opacity={windowed(g, c.text1 - 4, c.text1 + 8, c.text2Exit + 4, c.text2Exit + 16)} />
      <AnimatedText {...TEXT.reveal.line1} enter={c.text1 - from} exit={c.text1Exit - from} shineAt={c.text1 - from + 18} size={86} y={420} />
      <AnimatedText {...TEXT.reveal.line2} enter={c.text2 - from} exit={c.text2Exit - from} shineAt={c.text2 - from + 16} size={86} y={420} />
    </AbsoluteFill>
  );
};
