import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND, COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX} from '../lib/layout';
import {Caption} from '../components/Caption';
import {ChiliMark} from '../components/ChiliMark';
import {DishArt} from '../components/Art';
import {Icon} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.create;
const CARD_W = 540;
const K = CARD_W / 580;
const CARD_TOP = 410;
const IMG = {x: 0, y: 96, w: 580, h: 580}; // image well inside the 580 × 800 card

const StepTag: React.FC<{t: number}> = ({t}) => {
  const steps = C.steps;
  let idx = -1;
  steps.forEach((s, i) => {
    if (t >= s.at) idx = i;
  });
  if (idx < 0) return null;
  const s = spr(t, steps[idx].at, MOTION.bouncy);
  const out = spr(t, C.doneAt, MOTION.smooth, 10);
  return (
    <div
      data-qa="text"
      style={{
        position: 'absolute',
        left: CX - 200,
        width: 400,
        top: CARD_TOP - 42,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 20,
        opacity: clamp(s * 3) * (1 - out),
        transform: `translateY(${((1 - s) * 30).toFixed(1)}px) scale(${mix(0.7, 1, s).toFixed(4)})`,
      }}
    >
      <div
        style={{
          padding: '14px 30px',
          borderRadius: 40,
          background: COLORS.ink,
          color: COLORS.offWhite,
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: SIZES.stepTag,
          letterSpacing: '0.2em',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span style={{width: 14, height: 14, borderRadius: 7, background: COLORS.red, display: 'inline-block'}} />
        {`${idx + 1}/${steps.length}  ${steps[idx].label}`}
      </div>
    </div>
  );
};

export const Create: React.FC = () => {
  const t = useSceneFrame();
  const card = spr(t, -4, MOTION.snap);
  const shoot = spr(t, C.steps[0].at, MOTION.snap);
  const flash = t >= C.flashAt ? Math.exp(-(t - C.flashAt) * 0.35) : 0;
  const photo = spr(t, C.flashAt, MOTION.bouncy);
  const head = spr(t, C.headlineAt, MOTION.slam);
  const btn = spr(t, C.buttonAt, MOTION.bouncy);
  const nChars = Math.max(0, Math.min(C.typedCaption.length, Math.floor((t - C.typeAt) / C.typeFramesPerChar)));
  const typing = t >= C.typeAt && nChars < C.typedCaption.length;
  const done = spr(t, C.doneAt, MOTION.bouncy);
  const heart = clamp((t - C.doneAt) / 14);
  const sheen = clamp((t - C.doneAt - 6) / 22);
  const vfOut = spr(t, C.headlineAt - 6, MOTION.smooth, 10); // viewfinder leaves once design starts
  const recOn = Math.floor(t / 10) % 2 === 0;

  // Cursor travels to each design element as it lands.
  const way: [number, number, number][] = [
    [C.headlineAt - 10, 470, 640],
    [C.headlineAt, 120, 160],
    [C.buttonAt, 140, 600],
    [C.typeAt, 360, 720],
  ];
  let cx = way[0][1];
  let cy = way[0][2];
  for (let i = 1; i < way.length; i++) {
    const s = spr(t, way[i][0] - 8, MOTION.snap);
    cx = mix(cx, way[i][1], s);
    cy = mix(cy, way[i][2], s);
  }
  const cursorOn = t >= C.headlineAt - 12 && t < C.doneAt;
  const click = [C.headlineAt, C.buttonAt].map((c) => clamp((t - c) / 10)).find((v) => v > 0 && v < 1) ?? 0;

  const bounce = 1 + 0.04 * Math.sin(Math.PI * clamp(done)) * (done < 1.2 ? 1 : 0);
  const typed = C.typedCaption.slice(0, nChars);

  return (
    <AbsoluteFill>
      <StepTag t={t} />
      <div
        style={{
          position: 'absolute',
          left: CX - CARD_W / 2,
          top: CARD_TOP + Math.sin(t * 0.07) * 5,
          width: CARD_W,
          height: 800 * K,
          transform: `scale(${(mix(0.6, 1, card) * bounce).toFixed(4)}) rotate(${(Math.sin(t * 0.05) * 1).toFixed(2)}deg)`,
          opacity: clamp(card * 3),
        }}
      >
        <div
          style={{
            width: 580,
            height: 800,
            transform: `scale(${K})`,
            transformOrigin: 'top left',
            borderRadius: 34,
            background: COLORS.card,
            border: `3px solid ${COLORS.ink}`,
            overflow: 'hidden',
            fontFamily: FONT.family,
            color: COLORS.ink,
            boxShadow: `0 30px 70px ${COLORS.shadow}`,
            position: 'relative',
          }}
        >
          {/* header */}
          <div style={{height: 96, display: 'flex', alignItems: 'center', padding: '0 26px', gap: 16}}>
            <div style={{width: 56, height: 56, borderRadius: 28, border: `3px solid ${COLORS.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <ChiliMark width={36} stroke={40} color={COLORS.red} />
            </div>
            <div style={{fontWeight: FONT.bold, fontSize: SIZES.postHandle}}>{BRAND.handle.replace('@', '')}</div>
          </div>
          {/* image well */}
          <div style={{position: 'absolute', left: IMG.x, top: IMG.y, width: IMG.w, height: IMG.h, background: 'linear-gradient(160deg, #FFF7E6 0%, #F4EAD6 100%)', overflow: 'hidden'}}>
            {photo <= 0 ? (
              <div style={{position: 'absolute', inset: 40, border: `4px dashed ${COLORS.line}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, fontWeight: FONT.bold, color: COLORS.line}}>
                +
              </div>
            ) : null}
            <div style={{position: 'absolute', right: 10, bottom: 30, transform: `scale(${mix(1.3, 1, photo).toFixed(4)})`, opacity: clamp(photo * 2), transformOrigin: 'center'}}>
              <DishArt size={380} t={t} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: 40,
                top: 44,
                fontWeight: FONT.bold,
                fontSize: SIZES.postHeadline * 1.15,
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
                opacity: clamp(head * 3),
                transform: `scale(${mix(2.2, 1, head).toFixed(4)})`,
                transformOrigin: 'left top',
              }}
            >
              {C.postHeadline.map((l, i) => (
                <div key={i} style={{color: i === C.postHeadline.length - 1 ? COLORS.red : COLORS.ink}}>
                  {l}
                </div>
              ))}
              <div style={{width: 130 * clamp(head), height: 12, borderRadius: 6, background: COLORS.orange, marginTop: 16}} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: 40,
                bottom: 44,
                padding: '16px 32px',
                borderRadius: 40,
                background: COLORS.red,
                color: COLORS.offWhite,
                fontWeight: FONT.bold,
                fontSize: 28,
                opacity: clamp(btn * 3),
                transform: `scale(${btn.toFixed(4)})`,
                transformOrigin: 'left center',
              }}
            >
              {C.postButton}
            </div>
            {/* viewfinder overlay while shooting */}
            {shoot > 0 && vfOut < 1 ? (
              <div style={{position: 'absolute', inset: 0, opacity: clamp(shoot * 2) * (1 - vfOut)}}>
                <svg width={IMG.w} height={IMG.h} style={{position: 'absolute', inset: 0}}>
                  {[
                    [30, 30, 0],
                    [IMG.w - 30, 30, 90],
                    [IMG.w - 30, IMG.h - 30, 180],
                    [30, IMG.h - 30, 270],
                  ].map(([x, y, r], i) => (
                    <path key={i} d="M 0 60 V 0 H 60" transform={`translate(${x} ${y}) rotate(${r})`} stroke={COLORS.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
                  ))}
                </svg>
                <div style={{position: 'absolute', left: 56, top: 54, display: 'flex', alignItems: 'center', gap: 12, fontWeight: FONT.bold, fontSize: 32}}>
                  <div style={{width: 24, height: 24, borderRadius: 12, background: COLORS.red, opacity: recOn ? 1 : 0.2}} />
                  REC
                </div>
              </div>
            ) : null}
            <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', opacity: flash * 0.95}} />
          </div>
          {/* footer */}
          <div style={{position: 'absolute', left: 0, right: 0, top: IMG.y + IMG.h, height: 124, padding: '18px 26px 0', display: 'flex', flexDirection: 'column', gap: 12}}>
            <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
              <div style={{transform: `scale(${(1 + 0.6 * Math.sin(Math.PI * heart)).toFixed(3)})`}}>
                <Icon name="heart" size={40} fill={heart > 0.2} accent={COLORS.red} color={heart > 0.2 ? COLORS.red : COLORS.ink} />
              </div>
              <Icon name="comment" size={40} />
              <Icon name="dm" size={40} />
            </div>
            <div style={{fontWeight: FONT.medium, fontSize: 22, color: COLORS.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden'}}>
              <span style={{color: COLORS.ink, fontWeight: FONT.bold}}>{BRAND.handle.replace('@', '')}</span> {typed}
              <span style={{display: 'inline-block', width: 3, height: 24, marginLeft: 2, verticalAlign: 'text-bottom', background: COLORS.red, opacity: typing || Math.floor(t / 8) % 2 === 0 ? (t >= C.typeAt && t < C.doneAt ? 1 : 0) : 0}} />
            </div>
          </div>
          {/* sheen once finished */}
          <div
            style={{
              position: 'absolute',
              top: -200,
              bottom: -200,
              width: 170,
              left: mix(-300, 800, sheen),
              transform: 'rotate(18deg)',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
              opacity: sheen > 0 && sheen < 1 ? 1 : 0,
            }}
          />
          {cursorOn ? (
            <svg width={580} height={800} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <circle cx={cx} cy={cy} r={10 + click * 34} fill="none" stroke={COLORS.red} strokeWidth={4} opacity={click > 0 ? 1 - click : 0} />
              <path d="M 0 0 L 0 46 L 12 35 L 22 56 L 31 52 L 21 31 L 38 31 Z" transform={`translate(${cx} ${cy})`} fill={COLORS.ink} stroke={COLORS.card} strokeWidth={3} strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
      </div>
      {/* floating hearts when the post is done */}
      {done > 0
        ? [0, 1, 2, 3, 4].map((i) => {
            const d = t - C.doneAt - i * 3;
            if (d < 0 || d > 30) return null;
            const p = d / 30;
            return (
              <div key={i} style={{position: 'absolute', left: CX - 220 + i * 26 - 24, top: CARD_TOP + 640 - p * 260, opacity: 1 - p, transform: `scale(${(0.8 + 0.5 * Math.sin(Math.PI * Math.min(1, p * 2))).toFixed(3)}) rotate(${(i - 2) * 8}deg)`}}>
                <Icon name="heart" size={48} fill accent={COLORS.red} color={COLORS.red} />
              </div>
            );
          })
        : null}
      <Caption lines={C.caption} at={C.captionAt} />
      <Sfx name="tap" at={C.flashAt} />
      <Sfx name="pop" at={C.headlineAt} />
      <Sfx name="pop" at={C.buttonAt} />
      <Sfx name="pop" at={C.doneAt} />
    </AbsoluteFill>
  );
};
