import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CUES, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {Scrim} from '../components/Scrim';
import {windowed} from '../lib/motion';

const from = SCENES.lesson.from;
const c = CUES.lesson;

/** 0:37.5-0:40 The heartbeat settles into a calm, steady line. The lesson. */
export const S8Lesson: React.FC = () => {
  const g = useCurrentFrame() + from;
  return (
    <AbsoluteFill>
      <Scrim y={500} h={520} opacity={windowed(g, c.text1 - 4, c.text1 + 8, c.exit + 4, c.exit + 14)} />
      <AnimatedText {...TEXT.lesson.line1} enter={c.text1 - from} exit={c.exit - from} shineAt={c.shine - from} size={96} y={400} />
      <AnimatedText {...TEXT.lesson.line2} enter={c.text2 - from} exit={c.exit - from + 3} shineAt={c.shine - from + 8} size={78} y={610} />
    </AbsoluteFill>
  );
};
