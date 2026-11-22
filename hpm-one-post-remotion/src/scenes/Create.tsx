import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER} from '../lib/layout';
import {Caption} from '../components/Caption';
import {DishArt, PostCard} from '../components/Art';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.create;
const PW = 250;
const GAP = (INNER.right - INNER.left - 8 - PW * 3) / 2;
const PH = 660;
const TOP = 350;
const LEFT = INNER.left + 4;

const PanelFrame: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 26,
      background: COLORS.surface,
      border: `2px solid ${COLORS.border}`,
      overflow: 'hidden',
      boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
    }}
  >
    {children}
    <div
      data-qa="text"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 22,
        textAlign: 'center',
        fontFamily: FONT.family,
        fontWeight: FONT.bold,
        fontSize: SIZES.panelLabel,
        letterSpacing: '0.22em',
        color: COLORS.muted,
      }}
    >
      {label}
    </div>
  </div>
);

const Viewfinder: React.FC<{t: number}> = ({t}) => {
  const recOn = Math.floor(t / 12) % 2 === 0 || t < 0;
  const af = spr(t, 18, MOTION.bouncy);
  const box = mix(190, 150, af);
  const sec = Math.max(0, t) / 30;
  const tc = `00:00:${String(Math.floor(sec)).padStart(2, '0')}:${String(Math.floor((sec % 1) * 30)).padStart(2, '0')}`;
  const hx = Math.sin(t * 0.11) * 6;
  const hy = Math.cos(t * 0.09) * 5;
  const bracket = (x: number, y: number, r: number) => (
    <path d="M 0 30 V 0 H 30" transform={`translate(${x} ${y}) rotate(${r})`} stroke={COLORS.offWhite} strokeWidth={4} fill="none" strokeLinecap="round" />
  );
  return (
    <>
      <svg width={PW} height={PH} style={{position: 'absolute', inset: 0}}>
        {bracket(22, 22, 0)}
        {bracket(PW - 22, 22, 90)}
        {bracket(PW - 22, PH - 70, 180)}
        {bracket(22, PH - 70, 270)}
        <line x1={PW / 2 - 12} x2={PW / 2 + 12} y1={PH / 2 - 30} y2={PH / 2 - 30} stroke={COLORS.offWhite} strokeWidth={2} opacity={0.5} />
        <line x1={PW / 2} x2={PW / 2} y1={PH / 2 - 42} y2={PH / 2 - 18} stroke={COLORS.offWhite} strokeWidth={2} opacity={0.5} />
      </svg>
      <div style={{position: 'absolute', left: PW / 2 - 95 + hx, top: PH / 2 - 120 + hy}}>
        <DishArt size={190} t={t} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: PW / 2 - box / 2 + hx,
          top: PH / 2 - 25 - box / 2 + hy,
          width: box,
          height: box,
          border: `3px solid ${af > 0.6 ? COLORS.orange : COLORS.offWhite}`,
          borderRadius: 6,
          opacity: 0.85,
        }}
      />
      <div data-qa="text" style={{position: 'absolute', left: 40, top: 46, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 24, color: COLORS.offWhite}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: COLORS.red, opacity: recOn ? 1 : 0.25, boxShadow: recOn ? '0 0 16px rgba(230,57,70,0.8)' : 'none'}} />
        REC
      </div>
      <div data-qa="text" style={{position: 'absolute', left: 0, right: 0, top: PH - 120, textAlign: 'center', fontFamily: FONT.family, fontWeight: FONT.medium, fontSize: 20, color: COLORS.offWhite, fontVariantNumeric: 'tabular-nums'}}>
        {tc}
      </div>
    </>
  );
};

const DesignCanvas: React.FC<{t: number}> = ({t}) => {
  const img = spr(t, 14, MOTION.bouncy);
  const head = spr(t, 28, MOTION.snap);
  const stripe = spr(t, 38, MOTION.smooth, 14);
  const btn = spr(t, 48, MOTION.bouncy);
  // Cursor waypoints (panel coords) – it travels to each element as it's placed.
  const way: [number, number, number][] = [
    [-10, 210, 540],
    [10, 150, 200],
    [24, 80, 350],
    [40, 120, 390],
    [46, 140, 458],
    [70, 190, 500],
  ];
  let cx = way[0][1];
  let cy = way[0][2];
  for (let i = 1; i < way.length; i++) {
    const s = spr(t, way[i][0] - 8, MOTION.snap);
    cx = mix(cx, way[i][1], s);
    cy = mix(cy, way[i][2], s);
  }
  const clicks = [14, 28, 48];
  const ring = clicks.map((c) => clamp((t - c) / 10)).find((v) => v > 0 && v < 1) ?? 0;
  const selected = t >= 48 ? 2 : t >= 28 ? 1 : t >= 14 ? 0 : -1;
  const sel = [
    {x: 20, y: 70, w: 210, h: 210},
    {x: 20, y: 300, w: 210, h: 110},
    {x: 20, y: 430, w: 150, h: 50},
  ][selected];
  return (
    <>
      <svg width={PW} height={PH} style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern id="canvasDots" width={18} height={18} patternUnits="userSpaceOnUse">
            <circle cx={1.5} cy={1.5} r={1.5} fill={COLORS.offWhite} opacity={0.12} />
          </pattern>
        </defs>
        <rect width={PW} height={PH} fill="url(#canvasDots)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 70,
          width: 210,
          height: 210,
          borderRadius: 14,
          background: 'linear-gradient(160deg, #2A2A2A, #181818)',
          transform: `scale(${img.toFixed(4)})`,
          opacity: clamp(img * 2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DishArt size={170} t={t} />
      </div>
      <div
        data-qa="text"
        style={{
          position: 'absolute',
          left: 20,
          top: 300,
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: 42,
          lineHeight: 0.98,
          color: COLORS.offWhite,
          transform: `translateX(${((1 - head) * -60).toFixed(1)}px)`,
          opacity: clamp(head * 2),
        }}
      >
        {C.postHeadline.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 20, top: 396, width: 90 * clamp(stripe), height: 8, borderRadius: 4, background: COLORS.orange}} />
      <div
        data-qa="text"
        style={{
          position: 'absolute',
          left: 20,
          top: 430,
          padding: '10px 18px',
          borderRadius: 30,
          border: `3px solid ${COLORS.red}`,
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: 18,
          color: COLORS.offWhite,
          transform: `scale(${btn.toFixed(4)})`,
          transformOrigin: 'left center',
          opacity: clamp(btn * 2),
        }}
      >
        {C.postButton}
      </div>
      {sel ? (
        <div style={{position: 'absolute', left: sel.x - 6, top: sel.y - 6, width: sel.w + 12, height: sel.h + 12, border: `2px dashed ${COLORS.orange}`, borderRadius: 8, opacity: 0.9}}>
          {[
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ].map(([a, b], i) => (
            <div key={i} style={{position: 'absolute', left: `calc(${a * 100}% - 6px)`, top: `calc(${b * 100}% - 6px)`, width: 10, height: 10, background: COLORS.offWhite, borderRadius: 2}} />
          ))}
        </div>
      ) : null}
      <svg width={PW} height={PH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={cx} cy={cy} r={8 + ring * 26} fill="none" stroke={COLORS.orange} strokeWidth={3} opacity={ring > 0 ? 1 - ring : 0} />
        <path
          d="M 0 0 L 0 34 L 9 26 L 16 41 L 23 38 L 16 23 L 28 23 Z"
          transform={`translate(${cx} ${cy})`}
          fill={COLORS.offWhite}
          stroke={COLORS.charcoal}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

const Typing: React.FC<{t: number}> = ({t}) => {
  const n = Math.max(0, Math.min(C.typedCaption.length, Math.floor((t - C.typeAt) / C.typeFramesPerChar)));
  const typed = C.typedCaption.slice(0, n);
  const done = n >= C.typedCaption.length;
  const blink = !done || Math.floor(t / 9) % 2 === 0;
  const words = typed.split(/(\s+)/);
  return (
    <>
      <div style={{position: 'absolute', left: 22, right: 22, top: 40, height: 4, borderRadius: 2, background: COLORS.border}}>
        <div style={{width: `${(n / C.typedCaption.length) * 100}%`, height: '100%', borderRadius: 2, background: COLORS.orange}} />
      </div>
      <div
        data-qa="text"
        style={{
          position: 'absolute',
          left: 26,
          right: 22,
          top: 74,
          fontFamily: FONT.family,
          fontWeight: FONT.medium,
          fontSize: SIZES.typing,
          lineHeight: 1.38,
          color: COLORS.offWhite,
          wordBreak: 'break-word',
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{color: w.startsWith('#') ? COLORS.orange : undefined, fontWeight: w.startsWith('#') ? FONT.bold : undefined}}>
            {w}
          </span>
        ))}
        <span style={{display: 'inline-block', width: 4, height: SIZES.typing * 1.1, marginLeft: 3, verticalAlign: 'text-bottom', background: COLORS.orange, opacity: blink ? 1 : 0}} />
      </div>
      <div data-qa="text" style={{position: 'absolute', right: 24, top: PH - 120, fontFamily: FONT.family, fontWeight: FONT.medium, fontSize: 20, color: COLORS.dim, fontVariantNumeric: 'tabular-nums'}}>
        {n}/2200
      </div>
    </>
  );
};

export const Create: React.FC = () => {
  const t = useSceneFrame();
  const m = spr(t, C.mergeAt, MOTION.snap);
  const post = spr(t, C.mergeAt + 5, MOTION.bouncy);
  const flash = clamp((t - C.mergeAt - 4) / 16);
  const sheen = clamp((t - C.mergeAt - 18) / 26);
  const liked = clamp((t - C.mergeAt - 34) / 12);
  const postW = 540;
  const postH = (postW / 580) * 800;
  const postTop = 336;

  return (
    <AbsoluteFill>
      {[0, 1, 2].map((i) => {
        const enter = spr(t, i * 4, MOTION.snap);
        const px = LEFT + i * (PW + GAP);
        const toCenter = CX - (px + PW / 2);
        const float = Math.sin(t * 0.08 + i * 2) * 5;
        const op = (1 - clamp(m * 1.4)) * clamp(enter * 2);
        if (op <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px,
              top: TOP + float,
              width: PW,
              height: PH,
              transform: `translate(${(toCenter * m).toFixed(1)}px, ${((1 - enter) * 300).toFixed(1)}px) scale(${(1 - 0.35 * m).toFixed(4)}) rotate(${((1 - enter) * (i - 1) * 6).toFixed(2)}deg)`,
              opacity: op,
            }}
          >
            <PanelFrame label={C.panelLabels[i]}>
              {i === 0 ? <Viewfinder t={t} /> : i === 1 ? <DesignCanvas t={t} /> : <Typing t={t} />}
            </PanelFrame>
          </div>
        );
      })}
      {flash > 0 && flash < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: CX - 300 * flash - 40,
            top: postTop + postH / 2 - 300 * flash - 40,
            width: 600 * flash + 80,
            height: 600 * flash + 80,
            borderRadius: '50%',
            border: `6px solid ${COLORS.orange}`,
            opacity: 1 - flash,
          }}
        />
      ) : null}
      {post > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: CX - postW / 2,
            top: postTop + Math.sin(t * 0.07) * 6,
            width: postW,
            height: postH,
            transform: `scale(${mix(0.55, 1, post).toFixed(4)}) rotate(${(Math.sin(t * 0.05) * 1.2).toFixed(2)}deg)`,
            opacity: clamp(post * 2.5),
          }}
        >
          <PostCard width={postW} t={t} liked={liked} />
          <div style={{position: 'absolute', inset: 0, borderRadius: 32, overflow: 'hidden', pointerEvents: 'none'}}>
            <div
              style={{
                position: 'absolute',
                top: -200,
                bottom: -200,
                width: 160,
                left: mix(-300, postW + 200, sheen),
                transform: 'rotate(18deg)',
                background: 'linear-gradient(90deg, rgba(250,250,250,0) 0%, rgba(250,250,250,0.16) 50%, rgba(250,250,250,0) 100%)',
                opacity: sheen > 0 && sheen < 1 ? 1 : 0,
              }}
            />
          </div>
        </div>
      ) : null}
      <Caption lines={C.caption} at={C.captionAt} />
      <Sfx name="tap" at={14} />
      <Sfx name="tap" at={28} />
      <Sfx name="tap" at={48} />
      <Sfx name="whoosh" at={C.mergeAt - 2} />
      <Sfx name="pop" at={C.mergeAt + 8} />
    </AbsoluteFill>
  );
};
