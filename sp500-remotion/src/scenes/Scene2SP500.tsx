import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {CHIP_CENTERS, CHIP_DOTS, chipWindow, DotGrid, dotPos} from '../components/DotGrid';
import {IndexLabel} from '../components/IndexLabel';
import {SceneFrame} from '../components/SceneFrame';
import {COLORS, CUES, FONT, SCENES, TEXT} from '../config';
import {fontFamily} from '../fonts';
import {EASE, ease, springIn} from '../lib/motion';

const C = CUES.sp500;
const FROM = SCENES.sp500.from;

/** Shared final state of the label, so scene 3 can pick it up without a visible change. */
export const LABEL_REST = {y: 330, size: 112};

export const labelState = (frame: number) => {
  const move = ease(frame, [C.labelMoveUp, C.labelMoveUp + 24], [0, 1], EASE.inOut);
  return {
    y: 610 + (LABEL_REST.y - 610) * move,
    size: 176 + (LABEL_REST.size - 176) * move,
    underline: ease(frame, [C.labelMoveUp + 10, C.labelMoveUp + 36], [0, 1]),
    shine: ease(frame, [C.labelMoveUp + 24, C.labelMoveUp + 50], [0, 1], EASE.inOut),
  };
};

const Chip: React.FC<{k: number; name: string; globalFrame: number}> = ({k, name, globalFrame: f}) => {
  const w = chipWindow(k);
  if (f < w.start || f >= w.end) return null;
  const grow = springIn(f, w.start, {damping: 14, stiffness: 120, mass: 0.8});
  const back = ease(f, [w.end - 18, w.end], [0, 1], EASE.inOut);
  const p = Math.max(0, grow * (1 - back));
  const from = dotPos(CHIP_DOTS[k]);
  const to = CHIP_CENTERS[k];
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p;
  const width = 9.2 + (380 - 9.2) * p;
  const height = 9.2 + (112 - 9.2) * p;
  const float = Math.sin((f - w.start) / 14 + k) * 6 * p;
  const textO = ease(p, [0.55, 0.95], [0, 1]);
  const shineStart = FROM + C.chipsShine + k * 5;
  const shine = ease(f, [shineStart, shineStart + 22], [0, 1], EASE.inOut);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + float,
        width,
        height,
        transform: 'translate(-50%, -50%)',
        borderRadius: height / 2,
        background: p < 0.3 ? COLORS.gold : `linear-gradient(180deg, rgba(42,34,12,0.95), rgba(16,13,6,0.95))`,
        border: `${Math.min(2.5, p * 6)}px solid rgba(245,215,122,${0.4 + 0.5 * p})`,
        boxShadow: `0 0 ${20 + 30 * p}px rgba(212,175,55,${0.25 + 0.25 * p}), inset 0 1px 0 rgba(255,240,200,0.25)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        dir="ltr"
        style={{
          fontFamily,
          fontWeight: FONT.weightBold,
          fontSize: 54,
          color: COLORS.text,
          opacity: textO,
          transform: `scale(${0.8 + 0.2 * textO})`,
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, rgba(255,255,255,0) ${shine * 160 - 50}%, rgba(255,245,210,0.35) ${shine * 160 - 30}%, rgba(255,255,255,0) ${shine * 160 - 10}%)`,
        }}
      />
    </div>
  );
};

/** 0:03-0:09 — ٥٠٠ morphs into "S&P 500", 500 dots fill the screen, four of them become company chips. */
export const Scene2SP500: React.FC = () => {
  const frame = useCurrentFrame();
  const g = frame + FROM;
  const label = labelState(frame);

  return (
    <SceneFrame from={FROM} range={[FROM, SCENES.heartbeat.from + SCENES.heartbeat.duration]}>
      <Sequence durationInFrames={SCENES.heartbeat.from + 5 - FROM} layout="none">
        <DotGrid globalFrame={g} />
      </Sequence>
      {TEXT.sp500.companies.map((name, k) => (
        <Chip key={name} k={k} name={name} globalFrame={g} />
      ))}
      <IndexLabel
        text={TEXT.sp500.label}
        y={label.y}
        size={label.size}
        charProgress={(i) => springIn(frame, C.labelIn + i * 2, {damping: 13, stiffness: 150, mass: 0.7})}
        underline={label.underline}
        shine={label.shine}
      />
      <AnimatedText {...TEXT.sp500.line} enter={C.text} exit={C.textExit} shineAt={C.text + 40} size={78} y={1500} anchor="bottom" />
    </SceneFrame>
  );
};
