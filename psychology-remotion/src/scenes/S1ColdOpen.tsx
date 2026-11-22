import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CUES, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {EmotionWord} from '../components/EmotionWord';
import {Scrim} from '../components/Scrim';
import {windowed} from '../lib/motion';

const from = SCENES.coldOpen.from;
const c = CUES.coldOpen;

/** 0:00-0:03 Mid-crash: plunging down the red track, «ذعر» slams in, the question lands. */
export const S1ColdOpen: React.FC = () => {
  const g = useCurrentFrame() + from;
  return (
    <AbsoluteFill>
      <Scrim y={400} h={420} opacity={windowed(g, c.text - 4, c.text + 6, c.textExit + 6, c.textExit + 16)} />
      <Scrim y={830} h={460} w={1000} strength={0.4} opacity={windowed(g, 0, 4, c.wordExit, c.wordExit + 10)} />
      <EmotionWord word={TEXT.coldOpen.word} at={c.slam - from} out={c.wordExit - from} fx="panic" y={830} size={300} glitchAt={[c.glitch - from]} />
      <AnimatedText {...TEXT.coldOpen.line} enter={c.text - from} exit={c.textExit - from} size={86} y={400} />
    </AbsoluteFill>
  );
};
