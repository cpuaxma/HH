import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, TRAPS} from '../config';
import {AnimatedText} from '../components/AnimatedText';
import {CAIRO} from '../fonts';
import {EASE, prog} from '../lib/anim';
import {ar} from '../lib/digits';
import {PLAN} from '../arena/plan';
import {Block, TEXT_Y} from './layout';

/** 0:05–0:25 · One trap: its number, then its title as a big word-by-word reveal. (The mechanism plays in the arena.) */
export const Trap: React.FC<{k: number; from: number}> = ({k, from}) => {
  const f = useCurrentFrame() + from;
  const t = PLAN.traps[k];
  const inAt = t.start + 2;
  const exit = t.start + t.len - 8;
  const two = t.def.title.includes('\n');
  const label = EASE.out(prog(f, inAt - 2, inAt + 10)) * (1 - prog(f, exit, exit + 10));
  const lineW = 90 * EASE.out(prog(f, inAt, inAt + 16));
  return (
    <>
      <Block scrim={prog(f, inAt - 4, inAt + 6) * (1 - prog(f, exit, exit + 12))} h={two ? 520 : 440}>
        <AnimatedText text={t.def.title} accents={{red: t.def.accent}} size={two ? 116 : 124} start={inAt + 4 - from} exit={exit - from} stagger={4} />
      </Block>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: TEXT_Y - (two ? 232 : 150),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          opacity: label,
          transform: `translateY(${(1 - label) * 12}px)`,
        }}
      >
        <span style={{height: 2, width: lineW, background: `linear-gradient(90deg, rgba(200,55,45,0), ${COLORS.red})`}} />
        <span style={{fontFamily: CAIRO, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: COLORS.red, direction: 'ltr'}}>
          {ar(String(k + 1).padStart(2, '0'))}
          <span style={{color: 'rgba(246,241,228,0.6)', margin: '0 10px'}}>/</span>
          <span style={{color: 'rgba(246,241,228,0.6)'}}>{ar(String(TRAPS.length).padStart(2, '0'))}</span>
        </span>
        <span style={{height: 2, width: lineW, background: `linear-gradient(270deg, rgba(200,55,45,0), ${COLORS.red})`}} />
      </div>
    </>
  );
};
