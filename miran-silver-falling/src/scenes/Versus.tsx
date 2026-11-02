import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {EASE, FONT, LAYOUT, SCENES, VIDEO} from '../theme';
import {S3_GOLD, S3_GOLD_PCT, S3_SILVER, S3_SILVER_PCT, S3_VERSUS} from '../strings';
import {ArabicText, Label} from '../components/ArabicText';
import {At, Headline} from '../components/Layout';
import {LiquidColumn, surfaceY} from '../components/LiquidColumn';
import {Pill} from '../components/Pill';
import {Station} from '../components/World';
import {ease, enter, hero, heroStyle} from '../motion';

const START = SCENES.versus[0];
const TEXT_END = SCENES.versus[1] - START;
const COL = {w: 168, h: 500, top: 812};
const SILVER_X = 380; // RTL: gold on the right, silver on the left
const GOLD_X = 700;
const T = {cols: 12, fill: 34, drain: 104, goldPill: 168, silverPill: 178};
const GOLD_END = 0.72;
const SILVER_END = 0.4;

export const Versus: React.FC = () => {
  const frame = useCurrentFrame();
  const colIn = (k: number) => Math.max(0, hero(frame, T.cols + k * 8));
  const fill = ease(frame, T.fill, 50, EASE.inOut);

  const goldDrain = ease(frame, T.drain, 64, EASE.inOut);
  const gold = fill * (1 - (1 - GOLD_END) * goldDrain);
  // Silver drains faster and overshoots: an underdamped spring makes it slosh.
  const sDrain = spring({frame: frame - T.drain, fps: VIDEO.fps, config: {damping: 9, stiffness: 70, mass: 1}});
  const silver = fill * (1 - (1 - SILVER_END) * sDrain);
  const sVel = Math.abs(
    spring({frame: frame - T.drain + 1, fps: VIDEO.fps, config: {damping: 9, stiffness: 70, mass: 1}}) - sDrain,
  );
  const gVel = Math.abs(ease(frame + 1, T.drain, 64, EASE.inOut) - goldDrain);
  const baseWave = 2.2;
  const silverWave = baseWave + Math.min(26, sVel * 900);
  const goldWave = baseWave + Math.min(8, gVel * 500);

  const goldPill = hero(frame, T.goldPill);
  const silverPill = hero(frame, T.silverPill);
  const labels = enter(frame, T.cols + 20);

  const col = (x: number, k: number, metal: 'silver' | 'gold', level: number, wave: number) => (
    <div style={{position: 'absolute', left: x - COL.w / 2 - 16, top: COL.top, ...heroStyle(colIn(k))}}>
      <LiquidColumn id={`vs-${metal}`} metal={metal} w={COL.w} h={COL.h} level={level} wave={wave} frame={frame} />
    </div>
  );

  return (
    <AbsoluteFill>
      <Station index={2} from={START}>
        {col(GOLD_X, 0, 'gold', gold, goldWave)}
        {col(SILVER_X, 1, 'silver', silver, silverWave)}
        <At x={GOLD_X + COL.w / 2 + 74} y={surfaceY(COL.top, COL.h, gold)}>
          <Pill text={S3_GOLD_PCT} p={goldPill} accent="red" size={30} />
        </At>
        <At x={SILVER_X - COL.w / 2 - 74} y={surfaceY(COL.top, COL.h, silver)}>
          <Pill text={S3_SILVER_PCT} p={silverPill} accent="red" size={36} />
        </At>
        {/* dashed level lines from each surface to its pill */}
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <line
            x1={GOLD_X + COL.w / 2 + 4}
            x2={GOLD_X + COL.w / 2 + 22}
            y1={surfaceY(COL.top, COL.h, gold)}
            y2={surfaceY(COL.top, COL.h, gold)}
            stroke="#FFFFFF"
            strokeOpacity={0.5 * Math.min(1, Math.max(0, goldPill))}
            strokeDasharray="4 4"
          />
          <line
            x1={SILVER_X - COL.w / 2 - 22}
            x2={SILVER_X - COL.w / 2 - 4}
            y1={surfaceY(COL.top, COL.h, silver)}
            y2={surfaceY(COL.top, COL.h, silver)}
            stroke="#FFFFFF"
            strokeOpacity={0.5 * Math.min(1, Math.max(0, silverPill))}
            strokeDasharray="4 4"
          />
        </svg>
        <At x={GOLD_X} y={COL.top + COL.h + 70}>
          <Label text={S3_GOLD} size={36} p={labels} tone="gold" weight={FONT.key} />
        </At>
        <At x={SILVER_X} y={COL.top + COL.h + 70}>
          <Label text={S3_SILVER} size={36} p={labels} tone="silver" weight={FONT.key} />
        </At>
      </Station>

      <Headline>
        <ArabicText block={S3_VERSUS} size={LAYOUT.headlineSize - 2} start={8} exitEnd={TEXT_END} />
      </Headline>
    </AbsoluteFill>
  );
};

