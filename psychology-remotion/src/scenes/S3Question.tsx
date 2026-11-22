import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CUES, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {Scrim} from '../components/Scrim';
import {windowed} from '../lib/motion';

const from = SCENES.question.from;
const c = CUES.question;

/** 0:05-0:08 The camera orbits the still orb. "Why do people buy at the top... and sell at the bottom?" */
export const S3Question: React.FC = () => {
  const g = useCurrentFrame() + from;
  return (
    <AbsoluteFill>
      <Scrim y={470} h={640} opacity={windowed(g, c.text1 - 4, c.text1 + 8, c.exit + 4, c.exit + 18)} />
      <AnimatedText {...TEXT.question.line1} enter={c.text1 - from} exit={c.exit - from} shineAt={c.shine - from} size={84} y={380} />
      <AnimatedText {...TEXT.question.line2} enter={c.text2 - from} exit={c.exit - from + 4} shineAt={c.shine - from + 6} size={84} y={600} />
    </AbsoluteFill>
  );
};
