import React from 'react';
import {COLORS} from '../constants';
import {draw} from '../lib';

/**
 * Clean gold-outline silhouettes (viewBox 400×260, feet on y≈248).
 * The bull faces left, the bear faces right; pass `flip` to mirror.
 */
const BULL_BODY =
  'M30 162 C34 140 50 118 68 106 ' +
  // near horn: sweeps up and forward
  'C58 84 50 60 60 34 C68 58 80 80 94 94 ' +
  // ear
  'L104 96 L124 90 L110 104 ' +
  // neck and shoulder hump
  'C132 74 170 52 206 56 ' +
  // back
  'C252 62 302 68 340 74 ' +
  // rump
  'C360 78 370 92 368 112 ' +
  // tail
  'C380 126 386 160 382 192 L392 208 L372 206 C376 176 372 142 366 128 ' +
  // hind legs
  'C368 160 360 182 362 208 L364 248 L344 248 L342 212 C340 200 336 194 332 194 ' +
  'L330 248 L312 248 L314 206 C310 190 296 184 280 184 ' +
  // belly
  'C240 192 192 194 160 188 ' +
  // front legs
  'L158 248 L140 248 L138 200 L132 200 L130 248 L112 248 L110 192 ' +
  // dewlap, jaw and muzzle
  'C104 178 94 172 84 178 C70 188 52 192 42 186 C34 182 28 174 30 162 Z';

const BULL_FAR_HORN = 'M100 92 C94 72 98 54 114 40 C108 58 108 76 112 92';
const BULL_DETAILS = [
  'M206 60 C196 96 190 140 164 186', // shoulder
  'M330 82 C318 118 322 160 330 192', // haunch
];

const BEAR_BODY =
  // snout → forehead
  'M388 168 C378 160 362 152 348 146 C340 140 334 132 330 126 ' +
  // round ear
  'C330 114 318 108 312 116 C308 122 310 128 312 130 ' +
  // neck up to the shoulder hump, then the back
  'C298 118 282 92 252 82 C214 72 160 84 112 92 ' +
  // rump and stub tail
  'C70 98 40 120 38 158 C32 160 30 168 38 172 ' +
  // far hind leg
  'C40 196 50 214 52 232 C52 242 56 248 66 248 L100 248 C104 242 98 236 90 234 C90 222 94 208 100 200 ' +
  // near hind leg
  'L110 212 L112 236 C112 244 118 248 126 248 L150 248 C154 242 148 236 142 234 C142 222 146 212 152 206 ' +
  // belly
  'C176 212 204 212 222 204 ' +
  // far front leg
  'L222 236 C222 244 228 248 236 248 L268 248 C274 242 268 236 260 234 L262 212 ' +
  // near front leg
  'L280 208 L282 236 C282 244 288 248 296 248 L328 248 C334 242 328 236 318 234 C316 214 318 196 322 186 ' +
  // chest, jaw, nose
  'C330 182 346 180 360 180 C372 180 384 176 388 168 Z';

const BEAR_CLAWS = ['M318 248 C324 247 328 250 330 256', 'M326 247 C332 246 336 249 338 255', 'M260 248 C266 247 270 250 272 256'];
const BEAR_DETAILS = ['M252 86 C262 120 268 160 266 206', 'M112 96 C122 140 116 176 100 200', 'M316 122 C318 120 320 120 322 122'];

type Props = {
  /** 0..1 outline draw-on progress. */
  drawn?: number;
  /** 0..1 dark fill + gold glow. */
  fill?: number;
  width: number;
  flip?: boolean;
  stroke?: string;
  glow?: number;
  style?: React.CSSProperties;
};

const Frame: React.FC<Props & {children: (common: React.SVGProps<SVGPathElement>) => React.ReactNode; id: string}> = ({
  drawn = 1,
  width,
  flip,
  stroke = COLORS.gold,
  glow = 1,
  style,
  children,
  id,
}) => {
  const common: React.SVGProps<SVGPathElement> = {
    fill: 'none',
    stroke,
    strokeWidth: 3.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    pathLength: 1,
    style: draw(drawn),
  };
  return (
    <svg
      viewBox="0 0 400 260"
      width={width}
      height={(width * 260) / 400}
      style={{
        overflow: 'visible',
        transform: flip ? 'scaleX(-1)' : undefined,
        filter: `drop-shadow(0 0 ${10 * glow}px rgba(212,175,55,${0.55 * glow})) drop-shadow(0 0 ${30 * glow}px rgba(212,175,55,${0.25 * glow}))`,
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2210" />
          <stop offset="1" stopColor="#0C0B08" />
        </linearGradient>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COLORS.goldLight} />
          <stop offset="0.5" stopColor={stroke} />
          <stop offset="1" stopColor={COLORS.goldDeep} />
        </linearGradient>
      </defs>
      {children({...common, stroke: stroke === COLORS.gold ? `url(#${id}-stroke)` : stroke})}
    </svg>
  );
};

export const BullSilhouette: React.FC<Props> = (props) => (
  <Frame {...props} id="bull">
    {(c) => (
      <>
        <path d={BULL_BODY} fill="url(#bull-fill)" stroke="none" style={{opacity: props.fill ?? 1}} />
        <path d={BULL_FAR_HORN} {...c} strokeWidth={2.6} />
        <path d={BULL_BODY} {...c} />
        {BULL_DETAILS.map((d) => (
          <path key={d} d={d} {...c} strokeWidth={1.6} style={{...draw(props.drawn ?? 1), opacity: 0.55 * (props.drawn ?? 1)}} />
        ))}
        <circle cx={70} cy={136} r={4} fill={COLORS.goldLight} opacity={props.fill ?? 1} />
      </>
    )}
  </Frame>
);

export const BearSilhouette: React.FC<Props & {claws?: string}> = (props) => (
  <Frame {...props} id="bear">
    {(c) => (
      <>
        <path d={BEAR_BODY} fill="url(#bear-fill)" stroke="none" style={{opacity: props.fill ?? 1}} />
        <path d={BEAR_BODY} {...c} />
        {BEAR_DETAILS.map((d) => (
          <path key={d} d={d} {...c} strokeWidth={1.6} style={{...draw(props.drawn ?? 1), opacity: 0.55 * (props.drawn ?? 1)}} />
        ))}
        {BEAR_CLAWS.map((d) => (
          <path key={d} d={d} {...c} stroke={props.claws ?? c.stroke} strokeWidth={2.6} />
        ))}
        <circle cx={344} cy={148} r={4} fill={COLORS.goldLight} opacity={props.fill ?? 1} />
        <circle cx={386} cy={168} r={5} fill={COLORS.goldLight} opacity={props.fill ?? 1} />
      </>
    )}
  </Frame>
);
