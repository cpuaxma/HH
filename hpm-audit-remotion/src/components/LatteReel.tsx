import React from 'react';
import {C} from '../theme';

// Full-screen latte-art pour, drawn in SVG. `t` is pour time in frames; it loops every 150.
// Width/height + preserveAspectRatio let the same drawing act as a grid-tile thumbnail.
export const POUR_LOOP = 150;

const smooth = (x: number) => x * x * (3 - 2 * x);

export const LatteReel: React.FC<{t: number; width?: number | string; height?: number | string; slice?: boolean}> = ({
  t,
  width = 1080,
  height = 1920,
  slice = true,
}) => {
  const lt = ((t % POUR_LOOP) + POUR_LOOP) % POUR_LOOP;
  const grow = smooth(Math.min(1, lt / 115));
  const lift = smooth(Math.max(0, Math.min(1, (lt - 112) / 26)));
  const wiggle = Math.sin(lt * 0.55) * 26 * (1 - lift) * Math.min(1, lt / 20);
  const cx = 540;
  const cy = 1130;
  // Pitcher and stream
  const spoutX = 610 + wiggle * 0.5;
  const spoutY = 690 - lift * 240;
  const streamW = 26 * (1 - lift) + 2;
  const hitX = cx + wiggle * 0.9 - grow * 70;
  const hitY = cy - 10;
  const streamPath = `M ${spoutX} ${spoutY + 20} C ${spoutX - 10} ${spoutY + 160}, ${hitX + 12} ${hitY - 200}, ${hitX} ${hitY}`;

  // Rosetta: stacked leaves that push forward as the pour grows, then a heart cap + pull-through.
  const leaves = 7;
  const leafEls = Array.from({length: leaves}, (_, i) => {
    const appear = Math.max(0, Math.min(1, grow * leaves - i));
    const k = smooth(appear);
    const ly = cy + 120 - i * 30 - grow * 20;
    const w = (210 - i * 18) * k;
    const h = (40 - i * 2) * k;
    return (
      <path
        key={i}
        d={`M ${cx - w} ${ly} Q ${cx} ${ly - h * 2.2} ${cx + w} ${ly} Q ${cx} ${ly - h * 0.6} ${cx - w} ${ly} Z`}
        fill="#FBF3E6"
        opacity={0.96}
      />
    );
  });
  const capR = 70 * smooth(Math.max(0, Math.min(1, (grow - 0.55) / 0.45)));
  const pull = smooth(Math.max(0, Math.min(1, (lt - 118) / 18)));

  return (
    <svg width={width} height={height} viewBox="0 0 1080 1920" preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'} style={{display: 'block'}}>
      <defs>
        <linearGradient id="lr-table" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#3A281E" />
          <stop offset="1" stopColor={C.espresso} />
        </linearGradient>
        <radialGradient id="lr-crema" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#C98E5A" />
          <stop offset="0.55" stopColor="#9A5F35" />
          <stop offset="1" stopColor="#4A2C1A" />
        </radialGradient>
        <linearGradient id="lr-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8E8F92" />
          <stop offset="0.35" stopColor="#E9EAEC" />
          <stop offset="0.6" stopColor="#B4B6B9" />
          <stop offset="1" stopColor="#6E7073" />
        </linearGradient>
        <radialGradient id="lr-light" cx="0.3" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#FFE8CF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#lr-table)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M -20 ${260 + i * 290} C 300 ${220 + i * 300}, 700 ${320 + i * 280}, 1100 ${250 + i * 295}`} stroke="#4A3328" strokeWidth={5} fill="none" opacity={0.5} />
      ))}
      <rect width="1080" height="1920" fill="url(#lr-light)" />
      {/* Saucer + cup */}
      <ellipse cx={cx + 16} cy={cy + 120} rx={440} ry={280} fill="#000" opacity={0.28} />
      <ellipse cx={cx} cy={cy + 90} rx={430} ry={270} fill={C.oat} />
      <ellipse cx={cx} cy={cy + 90} rx={330} ry={200} fill="#E4D9C6" />
      <path d={`M ${cx + 300} ${cy - 40} C ${cx + 470} ${cy - 70}, ${cx + 470} ${cy + 130}, ${cx + 300} ${cy + 90}`} stroke={C.oat} strokeWidth={44} fill="none" strokeLinecap="round" />
      <ellipse cx={cx} cy={cy + 20} rx={330} ry={240} fill="#F7F0E4" />
      <ellipse cx={cx} cy={cy} rx={318} ry={226} fill={C.oat} />
      <ellipse cx={cx} cy={cy + 6} rx={286} ry={198} fill="url(#lr-crema)" />
      {/* Milk pattern */}
      <g>
        {leafEls}
        {capR > 0 && (
          <path
            d={`M ${cx} ${cy - 40 - capR * 0.2} m ${-capR} 0 a ${capR} ${capR * 0.8} 0 1 1 ${capR * 2} 0 a ${capR} ${capR * 0.8} 0 1 1 ${-capR * 2} 0`}
            fill="#FBF3E6"
          />
        )}
        {pull > 0 && (
          <line x1={cx} y1={cy - 120} x2={cx} y2={cy - 120 + pull * 290} stroke="#E7C9A5" strokeWidth={8} strokeLinecap="round" />
        )}
      </g>
      {/* Stream */}
      {lift < 1 && <path d={streamPath} stroke="#FBF3E6" strokeWidth={streamW} fill="none" strokeLinecap="round" />}
      {/* Pitcher (tilted jug, spout bottom-left) */}
      <g transform={`translate(${spoutX} ${spoutY}) rotate(${-38 + lift * 25})`}>
        <path d="M -10 0 L 60 -30 L 330 -60 Q 360 -60 360 -20 L 360 260 Q 360 300 320 300 L 70 300 Q 30 300 30 260 L 30 60 Z" fill="url(#lr-steel)" />
        <path d="M 360 40 C 470 40, 470 220, 360 220" stroke="#9A9C9F" strokeWidth={30} fill="none" />
        <path d="M 60 30 L 330 10" stroke="#fff" strokeWidth={10} opacity={0.6} strokeLinecap="round" />
      </g>
    </svg>
  );
};
