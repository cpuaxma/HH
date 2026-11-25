import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENTS, BEATS, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {prog} from '../lib/anim';
import {Block} from './layout';

/** 0:03–0:05 · The counter slams in (rendered by <Counter/>); «معظمهم ارتكب الأخطاء نفسها». */
export const Setup: React.FC = () => {
  const f = useCurrentFrame() + SCENES.setup[0];
  const o = SCENES.setup[0];
  const exit = SCENES.setup[1] - 18;
  return (
    <Block scrim={prog(f, BEATS.setupText - 6, BEATS.setupText + 6) * (1 - prog(f, exit, exit + 12))}>
      <AnimatedText text={TEXT.setup} accents={ACCENTS.setup} size={110} start={BEATS.setupText - o} exit={exit - o} />
    </Block>
  );
};
