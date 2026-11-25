import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENTS, BEATS, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {prog} from '../lib/anim';
import {Block} from './layout';

/** 0:00–0:03 · The arena lights up; «١٠٠ متداول دخلوا السوق...» → «...كم بقي منهم؟» */
export const Hook: React.FC = () => {
  const f = useCurrentFrame() + SCENES.hook[0];
  const o = SCENES.hook[0];
  const scrim = prog(f, 6, 16) * (1 - prog(f, 86, 98));
  return (
    <Block scrim={scrim}>
      <AnimatedText text={TEXT.hook1} accents={ACCENTS.hook1} size={116} start={BEATS.hookLine1 - o} exit={BEATS.hookLine2 - 8 - o} />
      <div style={{position: 'absolute'}}>
        <AnimatedText text={TEXT.hook2} accents={ACCENTS.hook2} size={128} start={BEATS.hookLine2 - o} exit={SCENES.hook[1] - 14 - o} stagger={5} />
      </div>
    </Block>
  );
};
