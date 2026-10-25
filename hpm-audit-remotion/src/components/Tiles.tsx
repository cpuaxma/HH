import {Play} from 'lucide-react';
import React from 'react';
import {C, FONT, FONT_APP, FONT_SERIF} from '../theme';
import {LatteReel} from './LatteReel';

// Grid tile artwork, 358×358. Every tile has a BEFORE (boring: desaturated, mismatched
// fonts, uneven crops) and an AFTER (Espresso / Oat / Sage, one font) version.
export const TILE = 358;
export const GAP = 3;
export const REEL_TILE = 1;
export const MARKED_TILES = [0, 4, 6];

const S = TILE;

const CupTop: React.FC<{x: number; y: number; r: number; cup: string; coffee: string; foam: string; saucer: string}> = ({x, y, r, cup, coffee, foam, saucer}) => (
  <g>
    <circle cx={x + r * 0.06} cy={y + r * 0.08} r={r * 1.32} fill="#000" opacity={0.12} />
    <circle cx={x} cy={y} r={r * 1.3} fill={saucer} />
    <path d={`M ${x + r * 0.9} ${y - r * 0.25} q ${r * 0.55} ${r * 0.25} 0 ${r * 0.5}`} stroke={cup} strokeWidth={r * 0.2} fill="none" />
    <circle cx={x} cy={y} r={r} fill={cup} />
    <circle cx={x} cy={y} r={r * 0.82} fill={coffee} />
    <path
      d={`M ${x} ${y + r * 0.45} C ${x - r * 0.75} ${y - r * 0.05}, ${x - r * 0.35} ${y - r * 0.6}, ${x} ${y - r * 0.22} C ${x + r * 0.35} ${y - r * 0.6}, ${x + r * 0.75} ${y - r * 0.05}, ${x} ${y + r * 0.45} Z`}
      fill={foam}
    />
  </g>
);

const Croissant: React.FC<{x: number; y: number; s: number; body: string; line: string}> = ({x, y, s, body, line}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={18} rx={120} ry={22} fill="#000" opacity={0.12} />
    {[-2, -1, 0, 1, 2].map((i) => {
      const a = (i * 26 * Math.PI) / 180;
      const w = 46 - Math.abs(i) * 7;
      return (
        <ellipse key={i} cx={Math.sin(a) * 82} cy={-Math.cos(a) * 30 + 12} rx={w} ry={52 - Math.abs(i) * 9} transform={`rotate(${i * 26} ${Math.sin(a) * 82} ${-Math.cos(a) * 30 + 12})`} fill={body} stroke={line} strokeWidth={5} />
      );
    })}
  </g>
);

const ToGo: React.FC<{x: number; y: number; cup: string; lid: string; sleeve: string}> = ({x, y, cup, lid, sleeve}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -58 -70 L 58 -70 L 44 110 L -44 110 Z" fill={cup} />
    <rect x={-66} y={-92} width={132} height={26} rx={8} fill={lid} />
    <path d="M -54 -10 L 54 -10 L 49 50 L -49 50 Z" fill={sleeve} />
  </g>
);

const Storefront: React.FC<{awning: string; wall: string; trim: string; sign?: string; signFont?: string; signColor?: string; yOff?: number}> = ({awning, wall, trim, sign, signFont = FONT, signColor = '#fff', yOff = 0}) => (
  <g transform={`translate(0 ${yOff})`}>
    <rect x={40} y={70} width={278} height={260} fill={wall} />
    <rect x={40} y={70} width={278} height={50} fill={trim} />
    {sign && (
      <text x={179} y={104} textAnchor="middle" fontFamily={signFont} fontWeight={800} fontSize={24} fill={signColor}>
        {sign}
      </text>
    )}
    {Array.from({length: 7}, (_, i) => (
      <path key={i} d={`M ${40 + i * 39.7} 128 h 39.7 v 40 a 19.85 16 0 0 1 -39.7 0 Z`} fill={i % 2 ? '#fff' : awning} />
    ))}
    <rect x={70} y={200} width={110} height={100} rx={6} fill={trim} opacity={0.85} />
    <rect x={208} y={190} width={80} height={140} rx={4} fill={trim} />
  </g>
);

const Beans: React.FC<{bg: string; bean: string; line: string}> = ({bg, bean, line}) => (
  <g>
    <rect width={S} height={S} fill={bg} />
    {Array.from({length: 16}, (_, i) => {
      const x = 45 + (i % 4) * 90 + (Math.floor(i / 4) % 2) * 22;
      const y = 50 + Math.floor(i / 4) * 86;
      const r = (i * 47) % 180;
      return (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx={30} ry={21} fill={bean} />
          <path d={`M ${x - 24} ${y} q 12 -9 24 0 t 24 0`} stroke={line} strokeWidth={4} fill="none" />
        </g>
      );
    })}
  </g>
);

const ReelBadge: React.FC<{color: string}> = ({color}) => (
  <div style={{position: 'absolute', right: 16, top: 16, display: 'flex'}}>
    <Play size={40} color={color} fill={color} strokeWidth={1.5} />
  </div>
);

const Fill: React.FC<{bg: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({bg, children, style}) => (
  <div style={{position: 'absolute', inset: 0, background: bg, overflow: 'hidden', ...style}}>{children}</div>
);

const Svg: React.FC<{children: React.ReactNode; transform?: string}> = ({children, transform}) => (
  <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position: 'absolute', inset: 0}}>
    <g transform={transform}>{children}</g>
  </svg>
);

export const BeforeTile: React.FC<{i: number; reelT?: number}> = ({i, reelT = 40}) => {
  switch (i) {
    case 0:
      return (
        <Fill bg="#9BA7B4">
          <div style={{position: 'absolute', left: 22, top: 70, fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 64, color: '#F4F4F4', transform: 'rotate(-4deg)'}}>
            MONDAY!!!
          </div>
          <div style={{position: 'absolute', left: 26, top: 170, fontFamily: FONT_APP, fontSize: 30, color: '#E9EDF1'}}>coffee time :)</div>
        </Fill>
      );
    case 1:
      return (
        <Fill bg="#4D4642">
          <div style={{position: 'absolute', left: -60, top: -150, width: 560, height: 700}}>
            <LatteReel t={reelT} width={560} height={700} />
          </div>
          <ReelBadge color="#fff" />
        </Fill>
      );
    case 2:
      return (
        <Fill bg="#D9CFC1">
          <div style={{position: 'absolute', left: 18, top: 18, fontFamily: FONT_APP, fontSize: 30, color: '#6F6A63'}}>new menu</div>
          <div style={{position: 'absolute', left: 18, top: 58, fontFamily: FONT_SERIF, fontSize: 24, color: '#8B857C'}}>(ask inside)</div>
        </Fill>
      );
    case 3:
      return (
        <Fill bg="#C9B8A6">
          <Svg transform="translate(70 60) scale(1.9)">
            <Croissant x={100} y={110} s={1} body="#D8A86B" line="#A97C47" />
          </Svg>
        </Fill>
      );
    case 4:
      return (
        <Fill bg="#9C9A6E">
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SERIF, fontSize: 52, color: '#F7F3E2'}}>Open daily</div>
        </Fill>
      );
    case 5:
      return (
        <Fill bg="#BDBDBD">
          <Svg>
            <CupTop x={250} y={260} r={58} cup="#fff" coffee="#8D6E57" foam="#EDE3D6" saucer="#E6E6E6" />
          </Svg>
        </Fill>
      );
    case 6:
      return (
        <Fill bg="#D8C3C3">
          <div style={{position: 'absolute', left: 30, bottom: 40, fontFamily: FONT_APP, fontWeight: 700, fontSize: 44, color: '#6B4F4F', lineHeight: 1.05}}>
            Happy
            <br />
            Friday :)
          </div>
        </Fill>
      );
    case 7:
      return (
        <Fill bg="#A9B2A0">
          <Svg>
            <Storefront awning="#B07A6A" wall="#D8D0C2" trim="#6C665E" yOff={-90} />
          </Svg>
        </Fill>
      );
    default:
      return (
        <Fill bg="#B9B4AE">
          <Svg transform="translate(-30 20)">
            <Beans bg="#B9B4AE" bean="#8F8279" line="#B0A69C" />
          </Svg>
        </Fill>
      );
  }
};

const H: React.CSSProperties = {fontFamily: FONT, fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.02em'};

// AFTER: one font, one loud palette (cobalt / butter / pink on espresso), laid out as a checkerboard.
export const AfterTile: React.FC<{i: number; reelT?: number}> = ({i, reelT = 40}) => {
  switch (i) {
    case 0:
      return (
        <Fill bg={C.butter}>
          <Svg>
            <CupTop x={179} y={179} r={92} cup="#FFFFFF" coffee="#7A4A2C" foam="#FFF1DC" saucer={C.cobalt} />
          </Svg>
        </Fill>
      );
    case 1:
      return (
        <Fill bg={C.cobalt}>
          <LatteReel t={reelT} width={S} height={S} />
          <ReelBadge color={C.butter} />
        </Fill>
      );
    case 2:
      return (
        <Fill bg={C.pink}>
          <div style={{position: 'absolute', left: 28, bottom: 34, ...H, fontSize: 54, color: C.espresso}}>
            slow
            <br />
            mornings.
          </div>
        </Fill>
      );
    case 3:
      return (
        <Fill bg={C.cobalt}>
          <div style={{position: 'absolute', left: 30, top: 36, fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: '0.18em', color: C.butter}}>NEW</div>
          <div style={{position: 'absolute', left: 30, bottom: 34, ...H, fontSize: 58, color: C.white}}>
            oat flat
            <br />
            white
          </div>
        </Fill>
      );
    case 4:
      return (
        <Fill bg={C.pink}>
          <Svg>
            <ellipse cx={179} cy={214} rx={140} ry={50} fill={C.white} />
            <Croissant x={179} y={190} s={1.05} body="#FFB547" line={C.espresso} />
          </Svg>
        </Fill>
      );
    case 5:
      return (
        <Fill bg={C.butter}>
          <Svg>
            <ToGo x={179} y={150} cup={C.white} lid={C.cobalt} sleeve={C.cobalt} />
          </Svg>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 28, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: '0.14em', color: C.espresso}}>ORDER AHEAD</div>
        </Fill>
      );
    case 6:
      return (
        <Fill bg={C.oat}>
          <div style={{position: 'absolute', left: 30, top: 60, ...H, fontSize: 118, color: C.cobalt}}>7AM</div>
          <div style={{position: 'absolute', left: 32, top: 178, fontFamily: FONT, fontWeight: 800, fontSize: 52, letterSpacing: '0.12em', color: C.pink}}>CLUB</div>
        </Fill>
      );
    case 7:
      return (
        <Fill bg={C.cobalt}>
          <Svg>
            <Beans bg={C.cobalt} bean={C.butter} line={C.cobalt} />
          </Svg>
        </Fill>
      );
    default:
      return (
        <Fill bg={C.pink}>
          <Svg>
            <Storefront awning={C.cobalt} wall={C.oat} trim={C.espresso} sign="bean & bloom" signColor={C.butter} />
          </Svg>
        </Fill>
      );
  }
};
