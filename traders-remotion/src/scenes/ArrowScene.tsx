import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENTS, BEATS, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {prog} from '../lib/anim';
import {Block} from './layout';

/** 0:33–0:35 · The survivors lock into one upward arrow (3D + <Flare/>). «كن من القلّة التي تبقى» */
export const ArrowScene: React.FC = () => {
  const f = useCurrentFrame() + SCENES.arrow[0];
  const o = SCENES.arrow[0];
  const exit = SCENES.arrow[1] + 6;
  return (
    <Block y={1380} scrim={prog(f, BEATS.arrowText - 6, BEATS.arrowText + 6) * (1 - prog(f, exit, exit + 12))}>
      <AnimatedText text={TEXT.arrow} accents={ACCENTS.arrow} size={112} start={BEATS.arrowText - o} exit={exit - o} stagger={4} />
    </Block>
  );
};
