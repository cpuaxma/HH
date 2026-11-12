import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EASE, ERA_TINT, FONT, LAYOUT, SCENES, VIDEO} from '../theme';
import {S10_CUBE, S10_SCALE, S10_TONNES, S11_TODAY, S6_RUSH, S7_SEAL, S7_STAMP, S7_STANDARD, S8_BREAK, S9_MODERN, S9_NOTE, S9_PILLS} from '../strings';
import {Layer, SceneText} from '../components/SceneText';
import {DollyLayer} from '../components/World';
import {LightStreak} from '../components/LightStreak';
import {Pill} from '../components/Pill';
import {At} from '../components/Layout';
import {heroState, toScreen} from '../heroTrack';
import {CHART, drawProgress, headAt, LINE_D, MODERN_T, priceY, ptAt} from '../modernChart';
import {ease, enter, hero, hexA, noise, rand} from '../motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 6 · Gold rush: a river of light flows behind the pan; the water drains to reveal the nuggets. */
export const Rush: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  const copper = ERA_TINT.rush;
  if (layer === 'back') {
    const flow = enter(frame, 14, 50);
    return (
      <DollyLayer k="rush">
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="river-glow" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          {new Array(7).fill(0).map((_, i) => {
            const y0 = 1070 + i * 46;
            const pts: string[] = [];
            for (let x = -40; x <= VIDEO.width + 40; x += 40) {
              const y = y0 + Math.sin(x * 0.006 + i * 0.9 + frame * 0.03) * 22 + noise(i + 2, x * 0.004 + frame * 0.01) * 10;
              pts.push(`${x === -40 ? 'M' : 'L'}${x},${y.toFixed(1)}`);
            }
            const d = pts.join(' ');
            const col = i % 2 ? '#BFE3F2' : copper;
            return (
              <g key={i} opacity={flow * (0.25 + 0.1 * (i % 3))}>
                <path d={d} fill="none" stroke={col} strokeWidth={10} opacity={0.4} filter="url(#river-glow)" />
                <path d={d} fill="none" stroke={col} strokeWidth={1.6} strokeDasharray="60 40" strokeDashoffset={-frame * (3 + (i % 3))} />
              </g>
            );
          })}
        </svg>
      </DollyLayer>
    );
  }
  // Front: the water over the pan drains away, then glints pop on the nuggets.
  const st = heroState(frame + SCENES.rush[0]);
  const p = toScreen(st.pos[0], st.pos[1]);
  const water = interpolate(frame, [60, 130, 190], [0, 0.55, 0], clamp);
  const glints = [
    [-30, -20],
    [40, -4],
    [-70, 18],
    [16, 26],
    [70, 20],
  ];
  return (
    <AbsoluteFill>
      <DollyLayer k="rush">
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          {water > 0.01 ? (
            <ellipse cx={p.x} cy={p.y + 6} rx={230 * (0.6 + 0.4 * water / 0.55)} ry={72 * (0.6 + 0.4 * water / 0.55)} fill="#9FD2E8" opacity={water * 0.55} />
          ) : null}
          {glints.map(([dx, dy], i) => {
            const t = frame - (196 + i * 10);
            if (t < 0 || t > 30) return null;
            const o = Math.sin((t / 30) * Math.PI);
            const s = 10 + 14 * o;
            const x = p.x + dx;
            const y = p.y + dy;
            return (
              <g key={i} opacity={o}>
                <path d={`M${x},${y - s} L${x + 2},${y - 2} L${x + s},${y} L${x + 2},${y + 2} L${x},${y + s} L${x - 2},${y + 2} L${x - s},${y} L${x - 2},${y - 2} Z`} fill="#FFFFFF" />
              </g>
            );
          })}
        </svg>
      </DollyLayer>
      <SceneText k="rush" block={S6_RUSH} />
    </AbsoluteFill>
  );
};

const NOTE = {x: 300, y: 1120, w: 280, h: 156};
const CHAIN = {x0: NOTE.x + NOTE.w / 2 + 6, x1: 640, y: 1120, links: 7};
// The chain snaps as the voiceover says «انفصل» (after the spoken year).
const SNAP = SCENES.break1971[0] + 140;

/**
 * 7–8 · The gold standard and its end (absolute frames, mounted from the standard scene to the
 * end of 1971): a green glass banknote joined to the 3D bar by a chain of light, which snaps in 1971.
 */
export const MoneyRig: React.FC = () => {
  const frame = useCurrentFrame() + SCENES.standard[0];
  const S = SCENES.standard[0];
  const noteIn = Math.max(0, hero(frame, S + 58));
  const seal = Math.max(0, hero(frame, S + 168));
  const fadeOut = interpolate(frame, [SCENES.break1971[1] - 30, SCENES.break1971[1]], [1, 0], clamp);
  const snapT = frame - SNAP;
  const snapped = snapT >= 0;
  const drift = interpolate(frame, [SNAP, SNAP + 90], [0, 1], {...clamp, easing: EASE.enter});
  const flash = interpolate(snapT, [0, 4, 30], [0, 1, 0], clamp);
  const stamp = enter(frame, S + 120, 30);
  const green = COLORS.green;
  const len = CHAIN.x1 - CHAIN.x0;
  const linkW = len / CHAIN.links;
  const appearIn = interpolate(frame, [S + 10, S + 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: appearIn * fadeOut}}>
      {/* banknote: drifts away and dims after the snap */}
      <div
        style={{
          position: 'absolute',
          left: NOTE.x - NOTE.w / 2,
          top: NOTE.y - NOTE.h / 2,
          width: NOTE.w,
          height: NOTE.h,
          borderRadius: 16,
          border: `1.5px solid ${hexA(green, 0.85)}`,
          background: `linear-gradient(160deg, ${hexA(green, 0.16)}, ${hexA(COLORS.ink, 0.6)})`,
          boxShadow: `0 0 26px ${hexA(green, 0.3 * (1 - drift))}`,
          opacity: Math.min(1, noteIn * 1.5) * (1 - drift * 0.6),
          transform: `translate(${-drift * 60}px, ${drift * 70}px) rotate(${-6 - drift * 10}deg) scale(${(0.75 + 0.25 * noteIn) * (1 - drift * 0.12)})`,
          filter: drift > 0 ? `saturate(${1 - drift * 0.7})` : undefined,
        }}
      >
        <div style={{position: 'absolute', inset: 12, borderRadius: 10, border: `1px solid ${hexA(green, 0.4)}`}} />
        <div
          style={{
            position: 'absolute',
            left: NOTE.w / 2 - 34,
            top: NOTE.h / 2 - 34,
            width: 68,
            height: 68,
            borderRadius: '50%',
            border: `1.5px solid ${hexA(green, 0.7)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: green,
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 40,
          }}
        >
          $
        </div>
        {/* the «$٣٥» seal */}
        <div
          dir="ltr"
          style={{
            position: 'absolute',
            right: -26,
            top: -28,
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${hexA(COLORS.goldB, 0.95)}, ${hexA(COLORS.goldA, 0.95)})`,
            boxShadow: `0 6px 18px rgba(0,0,0,0.4), 0 0 18px ${hexA(COLORS.goldA, 0.5)}`,
            border: '2px solid #FFF0C4',
            color: COLORS.ink,
            fontFamily: FONT.family,
            fontWeight: FONT.key,
            fontSize: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: Math.min(1, seal * 1.5),
            transform: `scale(${1.6 - 0.6 * Math.min(1, seal)}) rotate(-12deg)`,
          }}
        >
          {S7_SEAL}
        </div>
      </div>

      {/* the chain of light */}
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="chain-glow" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        {new Array(CHAIN.links).fill(0).map((_, i) => {
          const shown = ease(frame, S + 96 + i * 7, 16, EASE.enter);
          if (shown <= 0) return null;
          // Links near the middle break apart and fly off after the snap.
          const mid = (CHAIN.links - 1) / 2;
          const dir = i <= mid ? -1 : 1;
          const fly = snapped ? Math.min(1, snapT / 40) : 0;
          const breakAmt = snapped ? (1 - Math.abs(i - mid) / (mid + 1)) : 0;
          const cx = CHAIN.x0 + linkW * (i + 0.5) + dir * fly * (40 + breakAmt * 90) * (1 + rand(i));
          const cy = CHAIN.y + fly * (breakAmt * 160 + 30) * (0.6 + rand(i + 3)) - fly * 20;
          const rot = (i % 2 ? 90 : 0) + fly * dir * (120 + rand(i + 7) * 200);
          const o = shown * (1 - fly * 0.95);
          const col = snapped && snapT < 20 ? COLORS.red : COLORS.goldB;
          const w = i % 2 ? linkW * 0.55 : linkW * 1.05;
          const h = i % 2 ? 16 : 26;
          return (
            <g key={i} opacity={o} transform={`translate(${cx}, ${cy}) rotate(${rot})`}>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="none" stroke={col} strokeWidth={8} opacity={0.4} filter="url(#chain-glow)" />
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="none" stroke={col} strokeWidth={3} />
            </g>
          );
        })}
        {/* red flash where it snaps */}
        {flash > 0.01 ? (
          <g opacity={flash}>
            <circle cx={(CHAIN.x0 + CHAIN.x1) / 2} cy={CHAIN.y} r={90} fill={COLORS.red} opacity={0.45} filter="url(#chain-glow)" />
            <circle cx={(CHAIN.x0 + CHAIN.x1) / 2} cy={CHAIN.y} r={18 + snapT * 4} fill="none" stroke="#FFD0CE" strokeWidth={3} />
          </g>
        ) : null}
      </svg>

      {/* stamp under the bar */}
      <div
        style={{
          position: 'absolute',
          left: 760 - 80,
          width: 160,
          top: 1222 - interpolate(frame, [SNAP + 2, SNAP + 42], [0, 107], {...clamp, easing: EASE.enter}),
          textAlign: 'center',
          fontFamily: FONT.family,
          fontWeight: FONT.key,
          fontSize: 24,
          color: COLORS.goldB,
          opacity: stamp * 0.85,
        }}
      >
        <bdi>{S7_STAMP}</bdi>
      </div>
    </AbsoluteFill>
  );
};

export const Standard: React.FC<{layer: Layer}> = ({layer}) => (layer === 'front' ? <SceneText k="standard" block={S7_STANDARD} /> : null);
export const Break1971: React.FC<{layer: Layer}> = ({layer}) => (layer === 'front' ? <SceneText k="break1971" block={S8_BREAK} /> : null);

/** 9 · The modern era: the molten line becomes a price chart from 1971 to 2026. */
export const Modern: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'back') return null;
  const t = drawProgress(frame);
  const head = headAt(frame);
  const base = CHART.y + CHART.h + 8;
  const fold = interpolate(frame, [SCENES.cube[0] - SCENES.modern[0] - 10, SCENES.modern[1] - SCENES.modern[0]], [0, 1], {...clamp, easing: EASE.exit});
  const pill = (at: number) => Math.max(0, hero(frame, at));
  const area = `${LINE_D} L${head.x},${base} L${CHART.x},${base} Z`;
  const labels = enter(frame, 10, 30);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 1 - fold, transform: `scaleY(${1 - fold * 0.6})`, transformOrigin: `540px ${base}px`, filter: fold > 0.01 ? `blur(${fold * 8}px)` : undefined}}>
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="mod-area" x1="0" y1={CHART.y} x2="0" y2={base} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={COLORS.goldB} stopOpacity="0.22" />
              <stop offset="1" stopColor={COLORS.goldB} stopOpacity="0" />
            </linearGradient>
            <clipPath id="mod-reveal">
              <rect x={CHART.x - 10} y={CHART.y - 100} width={Math.max(0, head.x - CHART.x + 10)} height={CHART.h + 200} />
            </clipPath>
            <filter id="mod-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          <g opacity={labels}>
            <line x1={CHART.x} x2={CHART.x + CHART.w} y1={base} y2={base} stroke="#FFFFFF" strokeOpacity={0.14} />
            {[1000, 3000, 5000].map((p) => (
              <line key={p} x1={CHART.x} x2={CHART.x + CHART.w} y1={priceY(p)} y2={priceY(p)} stroke="#FFFFFF" strokeOpacity={0.05} strokeDasharray="2 8" />
            ))}
          </g>
          {t > 0 ? <path d={area} fill="url(#mod-area)" clipPath="url(#mod-reveal)" /> : null}
          <LightStreak id="mod-line" d={LINE_D} head={t} color="white" width={3.4} from={[CHART.x, base]} to={[CHART.x + CHART.w, CHART.y]} />
          {t > 0 && t < 1 ? (
            <g transform={`translate(${head.x}, ${head.y})`}>
              <circle r={20} fill={COLORS.goldB} opacity={0.6} filter="url(#mod-glow)" />
              <circle r={5.5} fill="#FFFFFF" />
            </g>
          ) : null}
          {[
            {at: MODERN_T.p1980, yr: 1980},
            {at: MODERN_T.p2011, yr: 2011.7},
            {at: MODERN_T.p2026, yr: 2026.08},
          ].map(({at, yr}) => {
            const r = interpolate(frame, [at, at + 40], [0, 1], {...clamp, easing: EASE.enter});
            const pt = ptAt(yr);
            return r > 0 && r < 1 ? <circle key={yr} cx={pt[0]} cy={pt[1]} r={8 + r * 44} fill="none" stroke={COLORS.goldB} strokeWidth={2} opacity={(1 - r) * 0.9} /> : null;
          })}
        </svg>
        <div dir="rtl" style={{position: 'absolute', right: VIDEO.width - (CHART.x + CHART.w), top: CHART.y - 60, fontFamily: FONT.family, fontSize: 22, color: 'rgba(245,241,232,0.4)', opacity: labels}}>
          {S9_NOTE}
        </div>
        {[
          {txt: S9_PILLS.start, at: 14, pt: ptAt(1971), dx: 20, dy: -46},
          {txt: S9_PILLS.p1980, at: MODERN_T.p1980, pt: ptAt(1980), dx: 0, dy: -52},
          {txt: S9_PILLS.p2011, at: MODERN_T.p2011, pt: ptAt(2011.7), dx: -10, dy: -52},
          {txt: S9_PILLS.p2026, at: MODERN_T.p2026, pt: ptAt(2026.08), dx: -86, dy: -10},
          {txt: S9_PILLS.now, at: MODERN_T.now + 4, pt: ptAt(2026.83), dx: -20, dy: 54},
        ].map(({txt, at, pt, dx, dy}) => (
          <At key={txt} x={pt[0] + dx} y={pt[1] + dy}>
            <Pill text={txt} p={pill(at)} size={26} />
          </At>
        ))}
      </AbsoluteFill>
      <SceneText k="modern" block={S9_MODERN} />
    </AbsoluteFill>
  );
};

/** 10 · All the gold ever mined: a cube (3D hero) with a tiny figure for scale and a «٢٢ م» bracket. */
export const Cube: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'back') return null;
  const scaleIn = enter(frame, 110, 40);
  const st = heroState(frame + SCENES.cube[0]);
  const c = toScreen(st.pos[0], st.pos[1]);
  const half = st.scale * 2 * 108; // ≈ half the cube's on-screen height
  const fade = interpolate(frame, [SCENES.today[0] - SCENES.cube[0], SCENES.today[0] - SCENES.cube[0] + 30], [1, 0], clamp);
  const bx = c.x - half - 70;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: scaleIn * fade}}>
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          {/* height bracket */}
          <line x1={bx} x2={bx} y1={c.y - half} y2={c.y + half} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="6 6" />
          <line x1={bx - 9} x2={bx + 9} y1={c.y - half} y2={c.y - half} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1.5} />
          <line x1={bx - 9} x2={bx + 9} y1={c.y + half} y2={c.y + half} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1.5} />
          {/* a tiny human figure at the base, for scale */}
          <g transform={`translate(${c.x + half + 40}, ${c.y + half - 34})`} fill="#F5F1E8" opacity={0.85}>
            <circle cx={0} cy={4} r={4} />
            <path d="M-4,10 h8 l2,12 h-3 l-1,12 h-4 l-1,-12 h-3 Z" />
          </g>
        </svg>
        <At x={bx - 4} y={c.y}>
          <Pill text={S10_SCALE} p={scaleIn} size={28} />
        </At>
        <At x={c.x + half + 30} y={c.y - half - 20}>
          <Pill text={S10_TONNES} p={Math.max(0, hero(frame, 130))} size={26} />
        </At>
      </AbsoluteFill>
      <SceneText k="cube" block={S10_CUBE} />
    </AbsoluteFill>
  );
};

/** 11 · Still today: the camera pulls back down the corridor; a light streak runs along its floor. */
export const Today: React.FC<{layer: Layer}> = ({layer}) => {
  const frame = useCurrentFrame();
  if (layer === 'back') {
    const run = ease(frame, 30, 150, EASE.inOut);
    const {vp} = LAYOUT;
    return (
      <AbsoluteFill>
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
          <LightStreak id="today-floor" d={`M${vp.x},${LAYOUT.floorY - 10} L${vp.x},${vp.y + 40}`} head={run} width={2.4} bloom={9} from={[vp.x, VIDEO.height]} to={[vp.x, vp.y]} />
        </svg>
      </AbsoluteFill>
    );
  }
  return <SceneText k="today" block={S11_TODAY} />;
};
