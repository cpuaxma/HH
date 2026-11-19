import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {CHART_POINTS, chartProgress, DotGrid} from '../components/DotGrid';
import {IndexLabel} from '../components/IndexLabel';
import {SceneFrame} from '../components/SceneFrame';
import {COLORS, CUES, SCENES, TEXT} from '../config';
import {EASE, ease, heartbeat} from '../lib/motion';
import {useTextOnly} from '../components/Debug';
import {LABEL_REST} from './Scene2SP500';

const C = CUES.heartbeat;
const FROM = SCENES.heartbeat.from;

/** Partial polyline up to progress p (0..1 of total length) and its head point. */
export const partialLine = (pts: {x: number; y: number}[], p: number) => {
  const seg: number[] = [];
  let total = 0;
  for (let k = 1; k < pts.length; k++) {
    const l = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
    seg.push(l);
    total += l;
  }
  let remaining = total * p;
  const out = [pts[0]];
  for (let k = 1; k < pts.length; k++) {
    if (remaining >= seg[k - 1]) {
      out.push(pts[k]);
      remaining -= seg[k - 1];
    } else {
      const t = remaining / seg[k - 1];
      out.push({x: pts[k - 1].x + (pts[k].x - pts[k - 1].x) * t, y: pts[k - 1].y + (pts[k].y - pts[k - 1].y) * t});
      break;
    }
  }
  return {points: out, head: out[out.length - 1]};
};

const toPath = (pts: {x: number; y: number}[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');

/** 0:09-0:15 — the dots beat like a heart while a gold chart climbs behind them. */
export const Scene3Heartbeat: React.FC = () => {
  const frame = useCurrentFrame();
  const g = frame + FROM;
  const textOnly = useTextOnly();

  const p = chartProgress(g);
  const {points, head} = partialLine(CHART_POINTS, p);
  let hb = 0;
  for (let k = 0; k < C.beatCount; k++) hb += heartbeat(frame - (C.beatStart + k * C.beatEvery));
  const chartOut = ease(frame, [C.gridExit + 6, C.gridExit + 30], [0, 1], EASE.in);
  const labelOut = ease(frame, [C.textExit, C.textExit + 16], [0, 1], EASE.in);

  return (
    <SceneFrame from={FROM} range={[SCENES.sp500.from, FROM + SCENES.heartbeat.duration]}>
      {!textOnly && p > 0 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - chartOut}}>
          <defs>
            <linearGradient id="hbArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.28} />
              <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${toPath(points)} L${head.x},1280 L${points[0].x},1280 Z`} fill="url(#hbArea)" />
          <path d={toPath(points)} fill="none" stroke={COLORS.gold} strokeOpacity={0.25 + hb * 0.15} strokeWidth={22 + hb * 10} strokeLinejoin="round" strokeLinecap="round" />
          <path d={toPath(points)} fill="none" stroke={COLORS.goldLight} strokeWidth={6 + hb * 2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={head.x} cy={head.y} r={26 + hb * 14} fill={COLORS.gold} opacity={0.25} />
          <circle cx={head.x} cy={head.y} r={10 + hb * 3} fill="#FFF6D8" />
        </svg>
      ) : null}
      <Sequence from={5} layout="none">
        <DotGrid globalFrame={g} />
      </Sequence>
      <IndexLabel
        text={TEXT.sp500.label}
        y={LABEL_REST.y - labelOut * 20}
        size={LABEL_REST.size * (1 + hb * 0.04)}
        charProgress={() => 1}
        underline={1}
        shine={ease(frame, [C.text2Shine - 20, C.text2Shine], [0, 1], EASE.inOut)}
        opacity={1 - labelOut}
        blur={labelOut * 14}
      />
      <AnimatedText {...TEXT.heartbeat.line1} enter={C.text1} exit={C.text1Exit} shineAt={C.text1 + 34} size={74} y={1500} anchor="bottom" />
      <AnimatedText {...TEXT.heartbeat.line2} enter={C.text2} exit={C.textExit} shineAt={C.text2Shine} size={74} y={1500} anchor="bottom" variant="rise" />
    </SceneFrame>
  );
};
