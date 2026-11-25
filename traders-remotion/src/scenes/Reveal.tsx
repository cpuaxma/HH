import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ACCENTS, BEATS, COLORS, SAFE, SCENES, TEXT} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {prog} from '../lib/anim';
import {Block} from './layout';

/** 0:25–0:28 · High above: 75 dead tiles, 25 gold pillars. «ثلاثة من كل أربعة... خسروا» + the sourced footnote. */
export const Reveal: React.FC = () => {
  const f = useCurrentFrame() + SCENES.reveal[0];
  const o = SCENES.reveal[0];
  const exit = SCENES.reveal[1] - 14;
  return (
    <>
      <Block y={1300} h={520} scrim={prog(f, BEATS.revealText - 6, BEATS.revealText + 6) * (1 - prog(f, exit, exit + 12))}>
        <AnimatedText text={TEXT.reveal} accents={ACCENTS.reveal} size={112} start={BEATS.revealText - o} exit={exit - o} stagger={5} />
      </Block>
      <div style={{position: 'absolute', left: SAFE.left + 30, right: 1080 - SAFE.right + 30, top: 1476}}>
        <AnimatedText text={TEXT.revealNote} size={27} weight={600} color={COLORS.white} start={BEATS.revealNote - o} exit={exit - o} stagger={1} lineHeight={1.55} style={{opacity: 0.62}} maxWidth={780} />
      </div>
    </>
  );
};
