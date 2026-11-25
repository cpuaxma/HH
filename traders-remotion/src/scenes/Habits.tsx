import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENTS, BEATS, COLORS, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {EASE, prog} from '../lib/anim';
import {Block} from './layout';

/** 0:28–0:33 · The survivors rise into warm light; their four habits, one at a time, each with a shine. */
export const Habits: React.FC = () => {
  const f = useCurrentFrame() + SCENES.habits[0];
  const o = SCENES.habits[0];
  const first = BEATS.habitAt[0];
  const last = BEATS.habitAt[3] + BEATS.habitLen - 4;
  return (
    <Block scrim={prog(f, first - 6, first + 6) * (1 - prog(f, last, last + 12))} h={360}>
      {TEXT.habits.map((h, j) => {
        const at = BEATS.habitAt[j];
        const exit = at + BEATS.habitLen - (j === 3 ? 4 : 10);
        if (f < at - 2 || f > exit + 14) return null;
        const bar = EASE.out(prog(f, at, at + 14)) * (1 - prog(f, exit, exit + 10));
        return (
          <div key={j} style={{position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 6}}>
              <span style={{width: 140 * bar, height: 3, borderRadius: 2, background: `linear-gradient(90deg, rgba(212,175,55,0), ${COLORS.goldLight}, rgba(212,175,55,0))`, opacity: bar}} />
            </div>
            <AnimatedText text={h} accents={ACCENTS.habits[j]} size={104} start={at - o} exit={exit - o} stagger={3} shineAll />
          </div>
        );
      })}
    </Block>
  );
};
