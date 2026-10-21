import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, getStaticFiles, useCurrentFrame} from 'remotion';
import {enterProgress, kick, mix} from '../lib/anim';
import {Point, smoothPath} from '../lib/path';
import {COLORS, STROKE} from '../theme';

// Placeholder pepper, traced from the brand logo (coordinates are in the
// 1600px logo artboard). Replaced automatically by public/pepper-icon.svg.
const VIEWBOX = '440 552 720 500';
const BODY: Point[] = [
  [1083, 692], [1050, 684], [1030, 662], [1018, 628], [1003, 606], [980, 598], [950, 606],
  [920, 630], [890, 668], [860, 730], [830, 790], [790, 840], [740, 878], [680, 918],
  [610, 944], [540, 957], [478, 962], [452, 980], [464, 1004], [502, 1020], [560, 1033],
  [650, 1040], [740, 1033], [830, 1008], [920, 968], [1000, 915], [1050, 872], [1082, 822],
  [1105, 770], [1117, 715], [1110, 676], [1092, 652],
];
const STEM: Point[] = [
  [1092, 650], [1104, 630], [1125, 609], [1142, 591], [1147, 573], [1137, 564], [1120, 580],
  [1096, 605], [1075, 616], [1056, 614], [1040, 608],
];
const HIGHLIGHT: Point[] = [[958, 672], [935, 690], [912, 716], [890, 755], [868, 800], [846, 833]];
const DOT = {cx: 973, cy: 621, r: 4};

type Stroke = {d?: string; tag: string; attrs: Record<string, string>};

const PLACEHOLDER: {viewBox: string; strokes: Stroke[]} = {
  viewBox: VIEWBOX,
  strokes: [
    {tag: 'path', d: smoothPath(BODY, 0.9), attrs: {}},
    {tag: 'path', d: smoothPath(STEM, 0.9), attrs: {}},
    {tag: 'path', d: smoothPath(HIGHLIGHT), attrs: {}},
  ],
};

const DRAWABLE = ['path', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'rect'];
const toCamel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// Loads public/pepper-icon.svg when it exists and returns its drawable elements.
const useUserPepper = () => {
  const file = getStaticFiles().find((f) => f.name === 'pepper-icon.svg');
  const [data, setData] = useState<typeof PLACEHOLDER | null>(null);
  const [handle] = useState(() => (file ? delayRender('Loading pepper-icon.svg') : null));
  useEffect(() => {
    if (!file || handle === null) return;
    fetch(file.src)
      .then((r) => r.text())
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        const vb = svg?.getAttribute('viewBox') ?? `0 0 ${svg?.getAttribute('width') ?? 100} ${svg?.getAttribute('height') ?? 100}`;
        const strokes = Array.from(doc.querySelectorAll(DRAWABLE.join(','))).map((el) => {
          const attrs: Record<string, string> = {};
          for (const a of Array.from(el.attributes)) if (a.name !== 'style' && a.name !== 'class') attrs[toCamel(a.name)] = a.value;
          return {tag: el.tagName, attrs};
        });
        setData({viewBox: vb, strokes});
      })
      .catch(() => setData(null))
      .finally(() => continueRender(handle));
  }, [file, handle]);
  return data;
};

type Props = {
  start: number; // first stroke starts drawing
  kickAt: number; // settle: -6° → 0 with overshoot
  width: number;
  style?: React.CSSProperties;
};

const DRAW = 40; // frames per stroke
const STAGGER = 10;

export const PepperDraw: React.FC<Props> = ({start, kickAt, width, style}) => {
  const frame = useCurrentFrame();
  const data = useUserPepper();
  const pepper = data ?? PLACEHOLDER;

  const k = kick(frame, kickAt);
  const rotate = mix(-6, 0, k);
  const scale = mix(0.97, 1, k);
  const [, , vw, vh] = pepper.viewBox.split(/[\s,]+/).map(Number);
  const strokeWidth = data ? undefined : STROKE.pepper;
  const dot = kick(frame, start + DRAW + STAGGER);
  const fill = enterProgress(frame, kickAt, 20);

  return (
    <div
      style={{
        width,
        height: (width * vh) / vw,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: '30% 85%',
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox={pepper.viewBox} style={{overflow: 'visible'}}>
        {pepper.strokes.map((s, i) => {
          const p = enterProgress(frame, start + i * STAGGER, DRAW);
          const common = {
            fill: 'none',
            stroke: s.attrs.stroke ?? COLORS.charcoal,
            strokeWidth: s.attrs.strokeWidth ?? strokeWidth,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
            pathLength: 1,
            strokeDasharray: '1 2',
            strokeDashoffset: 1 - p,
            opacity: p > 0 ? 1 : 0,
          };
          const {fill: ownFill, ...attrs} = s.attrs;
          const filled =
            ownFill && ownFill !== 'none'
              ? React.createElement(s.tag, {key: `f${i}`, ...attrs, d: s.d ?? attrs.d, fill: ownFill, stroke: 'none', opacity: fill})
              : null;
          return (
            <React.Fragment key={i}>
              {filled}
              {React.createElement(s.tag, {...attrs, d: s.d ?? attrs.d, ...common})}
            </React.Fragment>
          );
        })}
        {data ? null : (
          <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r * dot} fill={COLORS.charcoal} />
        )}
      </svg>
    </div>
  );
};
