// The "home" three-lane board and the docked chapter header. Both are global: their state is a
// function of the reel frame, so lanes persist across scenes and match-cut between them.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {LANE_ORDER, LAYOUT, LaneKey, SPRING, VIDEO} from '../brand';
import {HIT, SCENES} from '../timeline';
import {clamp, fmt, impulse, kf, springAt} from '../motion';
import {LaneRail, reactionShake} from './LaneRail';
import {mblurX} from './MotionBlur';
import data from '../data.json';

export const HOME_Y: Record<LaneKey, number> = {nasdaq: 820, spx: 980, gold: 1140};
const DOCK_Y = 566;
const DIVE = {from: SCENES.nasdaq[0], to: SCENES.nasdaq[0] + 24};
const RETURN = {from: SCENES.twist[0], to: SCENES.twist[0] + 32};

/** Impact frames on the docked headers (the chapter pulse reaches the rail ~10 frames after leaving the node). */
export const HEADER_IMPACT: Record<LaneKey, number> = {nasdaq: HIT.ch1Impact, spx: HIT.ch2Pulse + 10, gold: HIT.ch3Pulse + 10};

const arrowFor = (frame: number, lane: LaneKey) => {
  const i = LANE_ORDER.indexOf(lane);
  const double = lane === 'nasdaq';
  // Core (S2b): arrows land on impact
  if (frame < SCENES.twist[0]) {
    const at = HIT.coreImpact[lane];
    return {flip: 0, double, opacity: interpolate(frame, [at, at + 8], [0, 1], clamp)};
  }
  // Twist: flip up one by one, then back to the usual reaction for the recap
  const up = springAt(frame, HIT.flip[lane], {damping: 13, stiffness: 160});
  const back = springAt(frame, HIT.flipBack + i * 6, {damping: 16, stiffness: 160});
  return {flip: Math.max(0, Math.min(1.08, up - back)), double, opacity: 1};
};

export const LaneBoard: React.FC = () => {
  const frame = useCurrentFrame();
  // visible windows: hook → context, core → dive, twist → tease
  const visible = frame < SCENES.context[0] + 26 || (frame >= HIT.corePulse - 16 && frame < DIVE.to) || (frame >= RETURN.from && frame < SCENES.tease[0] + 24);
  if (!visible) return null;

  // group camera: hook exit, core re-entry, dive into Nasdaq, pull-back for the twist, tease exit
  const hookExit = interpolate(frame, [HIT.nodeToTop, HIT.nodeToTop + 24], [0, 1], clamp);
  const coreIn = springAt(frame, HIT.corePulse - 16, SPRING.card);
  const dive = interpolate(frame, [DIVE.from, DIVE.to], [0, 1], {...clamp, easing: (t) => t * t * t});
  const ret = interpolate(frame, [RETURN.from, RETURN.to], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const teaseOut = interpolate(frame, [SCENES.tease[0] - 4, SCENES.tease[0] + 20], [0, 1], clamp);
  const recapLift = kf(frame, [[SCENES.recap[0], 0], [SCENES.recap[0] + 30, -50]]);

  let scale = 1;
  let opacity = 1;
  let blur = 0;
  let dy = recapLift;
  if (frame < SCENES.context[0] + 26) {
    opacity = 1 - hookExit;
    dy += hookExit * 90;
    blur = hookExit * 10;
  } else if (frame < DIVE.to) {
    const inP = Math.min(1, coreIn);
    opacity = interpolate(coreIn, [0, 0.5], [0, 1], clamp) * (1 - interpolate(dive, [0.35, 1], [0, 1], clamp));
    dy += (1 - inP) * 70;
    scale = 1 + dive * 2.4;
    blur = dive * 14;
  } else {
    scale = 1 + (1 - ret) * 0.35;
    opacity = ret * (1 - teaseOut);
    blur = (1 - ret) * 10 + teaseOut * 8;
    dy += -teaseOut * 70;
  }
  const origin = `540px ${HOME_Y.nasdaq}px`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transformOrigin: origin,
        transform: `translateY(${dy}px) scale(${scale})`,
        opacity,
        filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
      }}
    >
      {LANE_ORDER.map((lane, i) => {
        const snapAt = HIT.laneSnap[i];
        const snap = frame < SCENES.context[0] ? springAt(frame, snapAt, SPRING.pill) : 1;
        const snapO = frame < SCENES.context[0] ? interpolate(frame, [snapAt, snapAt + 6], [0, 1], clamp) : 1;
        // reactions to the core pulse (S2b)
        const shake = lane === 'nasdaq' ? reactionShake(frame, HIT.coreImpact.nasdaq) : {x: 0, r: 0, k: 0};
        const nudge = lane === 'spx' ? impulse(frame, HIT.coreImpact.spx, 26, 4) * 14 : 0;
        const dim = lane === 'gold' && frame < SCENES.twist[0] ? interpolate(frame, [HIT.coreImpact.gold, HIT.coreImpact.gold + 6, HIT.coreImpact.gold + 40], [0, 1, 0.55], clamp) : 0;
        const hit = Math.max(shake.k, impulse(frame, HIT.coreImpact[lane], 30, 2), frame >= SCENES.twist[0] ? impulse(frame, HIT.flip[lane], 24, 2) : 0);
        const recapRow = HIT.recapRows[i];
        const b = data.board[lane];
        const value = frame >= SCENES.recap[0] ? `${b.prefix}${fmt(b.value, b.decimals)}` : undefined;
        const draw = frame < SCENES.context[0] ? interpolate(frame, [snapAt + 4, snapAt + 60], [0, 1], clamp) : 1;
        return (
          <div
            key={lane}
            style={{
              position: 'absolute',
              left: LAYOUT.railX,
              top: HOME_Y[lane] - LAYOUT.railH / 2,
              opacity: snapO,
              transform: `translate(${(1 - snap) * 90 + shake.x + Math.sin(frame / 34 + i * 2.1) * 5}px, ${nudge + Math.sin(frame / 27 + i * 1.3) * 7}px) rotate(${shake.r + Math.sin(frame / 45 + i) * 0.35}deg) scale(${0.86 + 0.14 * snap})`,
            }}
          >
            <LaneRail
              lane={lane}
              w={LAYOUT.railW}
              h={LAYOUT.railH}
              t={frame}
              draw={draw}
              arrow={arrowFor(frame, lane)}
              value={value}
              valueOpacity={interpolate(frame, [recapRow, recapRow + 10], [0, 1], clamp)}
              hit={hit}
              dim={dim}
              drop={shake.k + nudge / 30}
            />
          </div>
        );
      })}
    </div>
  );
};

/** The focused lane, docked under the Fed node during its chapter. Chapters whip-pan between headers. */
export const LaneHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const windows: {lane: LaneKey; from: number; to: number; enter: 'dive' | 'whip'; exit: 'whip' | 'fade'}[] = [
    {lane: 'nasdaq', from: DIVE.from + 14, to: SCENES.spx[0] + 10, enter: 'dive', exit: 'whip'},
    {lane: 'spx', from: SCENES.spx[0], to: SCENES.gold[0] + 10, enter: 'whip', exit: 'whip'},
    {lane: 'gold', from: SCENES.gold[0], to: RETURN.from + 16, enter: 'whip', exit: 'fade'},
  ];
  return (
    <>
      {windows.map((w) => {
        if (frame < w.from || frame > w.to) return null;
        const inP = w.enter === 'dive' ? interpolate(frame, [w.from, w.from + 22], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)}) : interpolate(frame, [w.from, w.from + 16], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
        const outP = interpolate(frame, [w.to - 16, w.to], [0, 1], {...clamp, easing: (t) => t * t});
        let x = 0;
        let scale = 1;
        let blur = 0;
        let opacity = 1;
        if (w.enter === 'dive') {
          scale = 1.5 - 0.5 * inP;
          opacity = inP;
          blur = (1 - inP) * 12;
        } else {
          x = (1 - inP) * VIDEO.width;
          blur = (1 - inP) * 28;
        }
        if (w.exit === 'whip') {
          x -= outP * VIDEO.width;
          blur += outP * 28;
        } else {
          opacity *= 1 - outP;
          scale *= 1 - 0.1 * outP;
        }
        const at = HEADER_IMPACT[w.lane];
        const shake = w.lane === 'nasdaq' ? reactionShake(frame, at, 18) : {x: 0, r: 0, k: 0};
        const nudge = w.lane === 'spx' ? impulse(frame, at, 26, 4) * 14 : 0;
        const dim = w.lane === 'gold' ? interpolate(frame, [at, at + 6, at + 50], [0, 1, 0.5], clamp) : 0;
        const hit = Math.max(shake.k, impulse(frame, at, 30, 2));
        return (
          <div
            key={w.lane}
            style={{
              position: 'absolute',
              left: LAYOUT.railX,
              top: DOCK_Y - LAYOUT.railH / 2,
              opacity,
              filter: blur > 0.5 ? (w.enter === 'dive' && inP < 1 ? `blur(${blur}px)` : mblurX(blur)) : undefined,
              transform: `translate(${x + shake.x}px, ${nudge}px) rotate(${shake.r}deg) scale(${scale})`,
            }}
          >
            <LaneRail
              lane={w.lane}
              w={LAYOUT.railW}
              h={LAYOUT.railH}
              t={frame}
              arrow={{flip: 0, double: w.lane === 'nasdaq', opacity: interpolate(frame, [at, at + 8], [0, 1], clamp)}}
              hit={hit}
              dim={dim}
              drop={shake.k}
            />
          </div>
        );
      })}
    </>
  );
};
