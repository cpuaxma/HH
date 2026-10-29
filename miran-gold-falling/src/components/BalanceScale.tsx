import React from 'react';

// Geometry in the scale's own 800×640 box.
export const SCALE_BOX = {w: 800, h: 640};
const PIVOT = {x: 400, y: 96};
const ARM = 270;
const STRING = 200;
const PAN_W = 210;

/** Beam ends and pan centres (pan line) for a given tilt in degrees (negative = left side down). */
export const scaleGeometry = (tiltDeg: number) => {
  const a = (tiltDeg * Math.PI) / 180;
  const left = {x: PIVOT.x - ARM * Math.cos(a), y: PIVOT.y - ARM * Math.sin(a)};
  const right = {x: PIVOT.x + ARM * Math.cos(a), y: PIVOT.y + ARM * Math.sin(a)};
  return {
    left,
    right,
    leftPan: {x: left.x, y: left.y + STRING},
    rightPan: {x: right.x, y: right.y + STRING},
  };
};

/** Balance scale drawn in thin white lines. Pans stay level while the beam tilts. */
export const BalanceScale: React.FC<{tilt: number; draw?: number; opacity?: number}> = ({tilt, draw = 1, opacity = 1}) => {
  const g = scaleGeometry(tilt);
  const pan = (cx: number, cy: number) => {
    const half = PAN_W / 2;
    return (
      <g>
        <line x1={cx} y1={cy - STRING} x2={cx - half + 18} y2={cy} />
        <line x1={cx} y1={cy - STRING} x2={cx + half - 18} y2={cy} />
        <path d={`M${cx - half},${cy} Q${cx},${cy + 46} ${cx + half},${cy}`} />
        <line x1={cx - half} y1={cy} x2={cx + half} y2={cy} strokeOpacity="0.6" />
      </g>
    );
  };
  return (
    <svg
      width={SCALE_BOX.w}
      height={SCALE_BOX.h}
      viewBox={`0 0 ${SCALE_BOX.w} ${SCALE_BOX.h}`}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}
    >
      <defs>
        <filter id="scale-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {[0, 1].map((layer) => (
        <g
          key={layer}
          fill="none"
          stroke="#F5F1E8"
          strokeWidth={layer === 0 ? 7 : 2.5}
          strokeOpacity={layer === 0 ? 0.12 : 0.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={layer === 0 ? 'url(#scale-glow)' : undefined}
        >
          {/* post + base */}
          <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={590} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          <path d={`M${PIVOT.x - 110},610 L${PIVOT.x + 110},610 M${PIVOT.x - 70},590 L${PIVOT.x + 70},590`} opacity={draw} />
          {/* beam */}
          <line x1={g.left.x} y1={g.left.y} x2={g.right.x} y2={g.right.y} opacity={draw} />
          <circle cx={PIVOT.x} cy={PIVOT.y} r="9" opacity={draw} />
          <path d={`M${PIVOT.x - 16},${PIVOT.y - 28} L${PIVOT.x},${PIVOT.y - 44} L${PIVOT.x + 16},${PIVOT.y - 28}`} opacity={draw} />
          <g opacity={draw}>
            {pan(g.leftPan.x, g.leftPan.y)}
            {pan(g.rightPan.x, g.rightPan.y)}
          </g>
        </g>
      ))}
    </svg>
  );
};
