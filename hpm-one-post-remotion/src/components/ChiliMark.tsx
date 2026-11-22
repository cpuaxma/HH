import React from 'react';
import {COLORS} from '../config';
import {Point, smoothPath} from '../lib/path';

// Chili outline traced from the brand logo (coordinates in the 1600 px logo artboard).
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

export const CHILI = {
  viewBox: '430 540 740 520',
  body: smoothPath(BODY, 0.9) + ' Z',
  stem: smoothPath(STEM, 0.9),
  highlight: smoothPath(HIGHLIGHT),
};

export const ChiliMark: React.FC<{
  width: number;
  color?: string;
  fill?: string;
  stroke?: number;
  style?: React.CSSProperties;
}> = ({width, color = COLORS.offWhite, fill = 'none', stroke = 26, style}) => (
  <svg width={width} height={(width * 520) / 740} viewBox={CHILI.viewBox} style={{display: 'block', overflow: 'visible', ...style}}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={CHILI.body} fill={fill} />
      <path d={CHILI.stem} />
      <path d={CHILI.highlight} opacity={0.8} />
    </g>
  </svg>
);
