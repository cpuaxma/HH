import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, getStaticFiles} from 'remotion';
import {enter, kick, mix} from '../lib/anim';
import {Point, smoothPath} from '../lib/path';
import {HPM} from '../theme';

export const PEPPER_VIEWBOX = {x: 440, y: 552, w: 720, h: 500} as const;

// Placeholder pepper, traced from the brand logo (coordinates are in the 1600px logo
// artboard). Replaced automatically by public/pepper-icon.svg when that file exists.
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
const DOT = {cx: 973, cy: 621};

type Stroke = {tag: string; attrs: Record<string, string>};
type PepperArt = {viewBox: string; strokes: Stroke[]; user: boolean};

const VB = `${PEPPER_VIEWBOX.x} ${PEPPER_VIEWBOX.y} ${PEPPER_VIEWBOX.w} ${PEPPER_VIEWBOX.h}`;
const PLACEHOLDER: PepperArt = {
  viewBox: VB,
  user: false,
  strokes: [smoothPath(BODY, 0.9), smoothPath(STEM, 0.9), smoothPath(HIGHLIGHT)].map((d) => ({tag: 'path', attrs: {d}})),
};

const DRAWABLE = ['path', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'rect'];
const toCamel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// Loads public/pepper-icon.svg once when it exists.
let cache: PepperArt | null = null;
const usePepperArt = () => {
  const file = getStaticFiles().find((f) => f.name === 'pepper-icon.svg');
  const [art, setArt] = useState<PepperArt | null>(cache);
  const [handle] = useState(() => (file && !cache ? delayRender('Loading pepper-icon.svg') : null));
  useEffect(() => {
    if (!file || handle === null) return;
    fetch(file.src)
      .then((r) => r.text())
      .then((text) => {
        const svg = new DOMParser().parseFromString(text, 'image/svg+xml').querySelector('svg');
        if (!svg) return;
        const vb = svg.getAttribute('viewBox') ?? `0 0 ${svg.getAttribute('width') ?? 100} ${svg.getAttribute('height') ?? 100}`;
        const strokes = Array.from(svg.querySelectorAll(DRAWABLE.join(','))).map((el) => {
          const attrs: Record<string, string> = {};
          for (const a of Array.from(el.attributes)) if (!['style', 'class', 'stroke', 'fill', 'stroke-width'].includes(a.name)) attrs[toCamel(a.name)] = a.value;
          return {tag: el.tagName, attrs};
        });
        cache = {viewBox: vb, strokes, user: true};
        setArt(cache);
      })
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [file, handle]);
  return art ?? PLACEHOLDER;
};

type Props = {
  frame: number;
  width: number;
  color?: string;
  strokePx?: number; // on-screen stroke width
  drawAt?: number; // strokes draw in (strokeDashoffset); omit = already drawn
  ghost?: string; // colour of the outline before it is drawn
  kickAt?: number; // rotate -8° → 0 with overshoot
  style?: React.CSSProperties;
};

const DRAW = 40;
const STAGGER = 8;

export const PepperDraw: React.FC<Props> = ({frame, width, color = HPM.red, strokePx = 5, drawAt, ghost, kickAt, style}) => {
  const art = usePepperArt();
  const [, , vw, vh] = art.viewBox.split(/[\s,]+/).map(Number);
  const sw = (strokePx * vw) / width;
  const k = kickAt === undefined ? 1 : kick(frame, kickAt);
  const rotate = mix(-8, 0, k);

  const strokeProps = (s: Stroke, p: number, stroke: string) => ({
    ...s.attrs,
    fill: 'none',
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    pathLength: 1,
    strokeDasharray: '1 2',
    strokeDashoffset: 1 - p,
  });
  const drawn = (i: number) => (drawAt === undefined ? 1 : enter(frame, drawAt + i * STAGGER, DRAW));
  const dot = drawn(art.strokes.length);

  return (
    <div style={{width, height: (width * vh) / vw, transform: `rotate(${rotate}deg)`, transformOrigin: '20% 85%', ...style}}>
      <svg width="100%" height="100%" viewBox={art.viewBox} style={{overflow: 'visible'}}>
        {ghost
          ? art.strokes.map((s, i) => React.createElement(s.tag, {key: `g${i}`, ...strokeProps(s, 1, ghost)}))
          : null}
        {art.strokes.map((s, i) => {
          const p = drawn(i);
          return p > 0 ? React.createElement(s.tag, {key: i, ...strokeProps(s, p, color)}) : null;
        })}
        {art.user ? null : (
          <>
            {ghost ? <circle cx={DOT.cx} cy={DOT.cy} r={sw * 0.62} fill={ghost} /> : null}
            <circle cx={DOT.cx} cy={DOT.cy} r={sw * 0.62 * dot} fill={color} />
          </>
        )}
      </svg>
    </div>
  );
};
