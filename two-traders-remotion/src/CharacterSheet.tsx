import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Ray, RayExpression, RayPose, Look} from './characters/Ray';
import {Sam, SamExpression, SamPose} from './characters/Sam';
import {useFonts} from './fonts';
import {colors, fonts, layout} from './theme';

export type SheetProps = {who: 'ray' | 'sam'};
export const SHEET_W = 3400;
export const SHEET_H = 1640;

// Panel-space placement, identical to the reel's split screen
const RAY_X = layout.rayBoxX;
const SAM_X = layout.samBoxX - layout.divider;
const HEAD = {ray: RAY_X + 112, sam: SAM_X + layout.boxW - 112};

type Cell = {label: string; node: React.ReactNode};

// Placeholder screen so the monitor reads on the sheet (the reel draws the shared price path)
const SampleScreen: React.FC<{color: string}> = ({color}) => (
  <path d="M 10 200 L 60 180 L 100 190 L 150 120 L 190 140 L 240 90 L 280 110 L 330 60 L 370 70" fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
);

const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 30, color: colors.text, textAlign: 'center', marginTop: 14, letterSpacing: '0.04em'}}>
    {children}
  </div>
);

const Frame: React.FC<{w: number; h: number; viewBox: string; children: React.ReactNode}> = ({w, h, viewBox, children}) => (
  <svg width={w} height={h} viewBox={viewBox} style={{borderRadius: 24, border: `1px solid ${colors.glassBorder}`, display: 'block'}}>
    {children}
  </svg>
);

const rayAt = (props: React.ComponentProps<typeof Ray>, uid: string) => (
  <g transform={`translate(${RAY_X} 0)`}>
    <Ray uid={uid} {...props} />
  </g>
);
const samAt = (props: React.ComponentProps<typeof Sam>, uid: string) => (
  <g transform={`translate(${SAM_X} 0)`}>
    <Sam uid={uid} mirror {...props} />
  </g>
);

export const CharacterSheet: React.FC<SheetProps> = ({who}) => {
  useFonts();
  const isRay = who === 'ray';
  const hx = HEAD[who];
  const headBox = `${hx - 135} 196 270 310`;

  const exprs: Cell[] = isRay
    ? (['excited', 'panic', 'confused', 'despair', 'shocked'] as RayExpression[]).map((e) => ({
        label: e,
        node: rayAt({expression: e, look: 'viewer', intensity: 0}, `rx-${e}`),
      }))
    : (['neutral', 'focused', 'calm', 'smile'] as SamExpression[]).map((e) => ({
        label: e === 'smile' ? 'slight smile' : e,
        node: samAt({expression: e, look: 'viewer'}, `sx-${e}`),
      }));

  const rayPoses: Array<[RayPose, number, RayExpression, Look, number, string]> = [
    ['idle', 0, 'neutral', 'screen', 0, 'idle'],
    ['slam', 19, 'excited', 'screen', 2, 'slam (impact)'],
    ['double-down', 18, 'panic', 'screen', 3, 'double-down'],
    ['hair-pull', 30, 'despair', 'down', 3, 'hair-pull'],
    ['phone-juggle', 22, 'panic', 'down', 4, 'phone-juggle'],
    ['frozen', 40, 'shocked', 'screen', 0, 'frozen'],
  ];
  const samPoses: Array<[SamPose, number, SamExpression, Look, string, number]> = [
    ['idle', 0, 'neutral', 'screen', 'idle', 0],
    ['read-phone', 30, 'focused', 'down', 'read-phone', 0],
    ['copy-trade', 18, 'focused', 'down', 'copy-trade (phone tap)', 0],
    ['copy-trade', 54, 'focused', 'screen', 'copy-trade (keyboard)', 0],
    ['write-notes', 60, 'calm', 'down', 'write-notes', 0],
    ['wait', 100, 'calm', 'screen', 'wait (sip)', 0],
  ];
  const poses: Cell[] = isRay
    ? rayPoses.map(([p, t, e, l, i, label], k) => ({
        label,
        node: rayAt({pose: [{at: -t, v: p}], expression: e, look: l, intensity: i, clutter: p === 'phone-juggle' ? 2 : 0, screen: <SampleScreen color="#D9534F" />}, `rp-${k}`),
      }))
    : samPoses.map(([p, t, e, l, label], k) => ({
        label,
        node: samAt({pose: [{at: -t, v: p}], expression: e, look: l, screen: <SampleScreen color="#3FB68B" />}, `sp-${k}`),
      }));

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${colors.navy}, ${colors.base})`, padding: 50}}>
      <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 52, color: colors.goldTo}}>
        {isRay ? 'Reckless Ray' : 'Steady Sam'}
        <span style={{fontWeight: 300, color: colors.muted, fontSize: 34, marginLeft: 24}}>
          character sheet · expressions (top) · poses (bottom) · same rig, same room
        </span>
      </div>
      <div style={{display: 'flex', gap: 30, marginTop: 30}}>
        {exprs.map((c) => (
          <div key={c.label}>
            <Frame w={378} h={434} viewBox={headBox}>
              {c.node}
            </Frame>
            <Label>{c.label}</Label>
          </div>
        ))}
      </div>
      <div style={{display: 'flex', gap: 20, marginTop: 30}}>
        {poses.map((c) => (
          <div key={c.label}>
            <Frame w={540} h={860} viewBox="0 180 540 860">
              {c.node}
            </Frame>
            <Label>{c.label}</Label>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
