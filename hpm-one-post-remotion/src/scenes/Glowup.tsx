import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAPTION, COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX} from '../lib/layout';
import {formatStat} from '../lib/text';
import {Caption} from '../components/Caption';
import {ChiliMark} from '../components/ChiliMark';
import {DishArt} from '../components/Art';
import {Icon} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.glowup;
const CARD_W = 780;
const PAD = 30;
const HEADER_H = 200;
const GAP = 10;
const TILE = (CARD_W - PAD * 2 - GAP * 2) / 3;
const CARD_H = PAD + HEADER_H + 20 + TILE * 2 + GAP + PAD;
const CARD_TOP = 350;
const GREY = '#ECE6D8';
const GREY_DARK = '#D3CAB8';

/** The six branded posts the empty grid turns into. */
const AfterTile: React.FC<{i: number; t: number}> = ({i, t}) => {
  const base: React.CSSProperties = {position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.family, fontWeight: FONT.bold};
  switch (i) {
    case 0:
      return (
        <div style={{...base, background: COLORS.red}}>
          <ChiliMark width={TILE * 0.72} color={COLORS.offWhite} stroke={34} />
        </div>
      );
    case 1:
      return (
        <div style={{...base, background: '#FFF1C9'}}>
          <DishArt size={TILE * 0.85} t={t} />
        </div>
      );
    case 2:
      return (
        <div style={{...base, background: COLORS.ink, flexDirection: 'column', fontSize: 46, lineHeight: 0.95, letterSpacing: '-0.02em'}}>
          <span style={{color: COLORS.offWhite}}>NEW</span>
          <span style={{color: COLORS.red}}>DROP</span>
        </div>
      );
    case 3:
      return (
        <div style={{...base, background: COLORS.card}}>
          <div style={{width: TILE * 0.6, height: TILE * 0.6, borderRadius: '50%', border: `8px solid ${COLORS.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="flame" size={TILE * 0.34} fill accent={COLORS.orange} color={COLORS.orange} />
          </div>
        </div>
      );
    case 4:
      return (
        <div style={{...base, background: COLORS.red, flexDirection: 'column', fontSize: 40, lineHeight: 1, color: COLORS.offWhite}}>
          <span>HOT</span>
          <span style={{fontSize: 22, fontWeight: FONT.medium, letterSpacing: '0.2em', marginTop: 8}}>TAKES</span>
        </div>
      );
    default:
      return (
        <div style={{...base, background: COLORS.ink}}>
          <div style={{width: TILE * 0.42, height: TILE * 0.42, borderRadius: '50%', background: COLORS.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={TILE * 0.18} height={TILE * 0.18} viewBox="0 0 10 10">
              <path d="M 2.5 1.5 L 8.5 5 L 2.5 8.5 Z" fill={COLORS.offWhite} />
            </svg>
          </div>
        </div>
      );
  }
};

/** Empty placeholder tile, with a skeleton shimmer passing over it. */
const BeforeTile: React.FC<{i: number; t: number}> = ({i, t}) => {
  const sweep = ((t * 1.6 + i * 18) % 120) / 120;
  return (
    <div style={{position: 'absolute', inset: 0, background: GREY, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={TILE * 0.36} height={TILE * 0.3} viewBox="0 0 36 30">
        <rect x={1.5} y={1.5} width={33} height={27} rx={4} fill="none" stroke={GREY_DARK} strokeWidth={3} />
        <circle cx={11} cy={10} r={3.2} fill={GREY_DARK} />
        <path d="M 3 26 L 13 16 L 19 22 L 25 15 L 33 24" fill="none" stroke={GREY_DARK} strokeWidth={3} strokeLinejoin="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: TILE * 0.6,
          left: mix(-TILE * 0.7, TILE * 1.1, sweep),
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
};

const Stat: React.FC<{value: string; label: string; hot: boolean; up: number}> = ({value, label, hot, up}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 6, fontWeight: FONT.bold, fontSize: 44, color: hot ? COLORS.ink : COLORS.inkFaint, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>
      {value}
      {up > 0 ? (
        <span style={{display: 'inline-block', transform: `scale(${up.toFixed(3)})`, opacity: clamp(up * 2)}}>
          <Icon name="arrowUp" size={30} color={COLORS.red} stroke={6} />
        </span>
      ) : null}
    </div>
    <div style={{fontWeight: FONT.medium, fontSize: 24, color: COLORS.inkSoft}}>{label}</div>
  </div>
);

export const Glowup: React.FC = () => {
  const t = useSceneFrame();
  const card = spr(t, C.cardAt, MOTION.snap);
  const after = t >= C.flipAt;
  const count = clamp(spr(t, C.flipAt + 4, MOTION.smooth, C.countFrames));
  const pulse = after ? 1 + 0.045 * Math.sin(Math.PI * clamp((t - C.flipAt) / 14)) : 1;
  const burst = clamp((t - C.flipAt - 4) / 20);
  const avatar = spr(t, C.flipAt - 2, MOTION.bouncy);

  const n = (a: number, b: number, fmt: string) => formatStat(after ? mix(a, b, count) : a, fmt);
  const cardX = CX - CARD_W / 2;

  return (
    <AbsoluteFill>
      {/* burst lines around the card at the flip */}
      {burst > 0 && burst < 1 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 14}).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const cx = CX;
            const cy = CARD_TOP + CARD_H / 2;
            const r0 = 330 + burst * 140;
            const r1 = r0 + 60 * (1 - burst);
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r0 * 1.05}
                y1={cy + Math.sin(a) * r0 * 1.12}
                x2={cx + Math.cos(a) * r1 * 1.05}
                y2={cy + Math.sin(a) * r1 * 1.12}
                stroke={i % 2 ? COLORS.orange : COLORS.red}
                strokeWidth={10}
                strokeLinecap="round"
                opacity={1 - burst}
              />
            );
          })}
        </svg>
      ) : null}

      <div
        style={{
          position: 'absolute',
          left: cardX,
          top: CARD_TOP + Math.sin(t * 0.07) * 5,
          width: CARD_W,
          height: CARD_H,
          borderRadius: 36,
          background: COLORS.card,
          border: `3px solid ${after ? COLORS.ink : COLORS.line}`,
          boxShadow: after ? `0 34px 80px ${COLORS.shadow}` : `0 16px 40px ${COLORS.shadow}`,
          transform: `translateY(${((1 - card) * 160).toFixed(1)}px) scale(${(mix(0.7, 1, card) * pulse).toFixed(4)})`,
          opacity: clamp(card * 3),
          fontFamily: FONT.family,
          color: COLORS.ink,
        }}
      >
        {/* header: avatar, handle, stats */}
        <div style={{position: 'absolute', left: PAD, top: PAD, right: PAD, height: HEADER_H, display: 'flex', alignItems: 'center', gap: 34}}>
          <div style={{width: 150, height: 150, flex: '0 0 150px', position: 'relative'}}>
            {after ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `6px solid ${COLORS.red}`,
                  background: COLORS.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${mix(0.4, 1, avatar).toFixed(4)})`,
                }}
              >
                <ChiliMark width={96} color={COLORS.red} stroke={40} />
              </div>
            ) : (
              <svg width={150} height={150} viewBox="0 0 150 150" style={{position: 'absolute', inset: 0}}>
                <circle cx={75} cy={75} r={72} fill={GREY} />
                <circle cx={75} cy={60} r={24} fill={GREY_DARK} />
                <path d="M 30 125 C 36 95, 114 95, 120 125 Z" fill={GREY_DARK} />
              </svg>
            )}
          </div>
          <div data-qa="text" style={{display: 'flex', flexDirection: 'column', gap: 18, flex: 1}}>
            <div style={{fontWeight: FONT.bold, fontSize: 40, letterSpacing: '-0.01em', color: after ? COLORS.ink : COLORS.inkFaint}}>{C.handle}</div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <Stat value={n(C.before.posts, C.after.posts, 'comma')} label="posts" hot={after} up={0} />
              <Stat value={n(C.before.followers, C.after.followers, 'compact')} label="followers" hot={after} up={after ? spr(t, C.flipAt + C.countFrames, MOTION.bouncy) : 0} />
              <Stat value={n(C.before.following, C.after.following, 'comma')} label="following" hot={after} up={0} />
            </div>
          </div>
        </div>

        {/* 3 × 2 grid: empty placeholders flip, one by one, into branded posts */}
        {Array.from({length: 6}).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const p = clamp(spr(t, C.flipAt + i * C.flipStagger, MOTION.snap));
          const showAfter = p >= 0.5;
          const sx = Math.abs(Math.cos(Math.PI * p));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: PAD + col * (TILE + GAP),
                top: PAD + HEADER_H + 20 + row * (TILE + GAP),
                width: TILE,
                height: TILE,
                borderRadius: 14,
                overflow: 'hidden',
                transform: `scaleX(${Math.max(0.02, sx).toFixed(4)}) scale(${(1 + 0.08 * Math.sin(Math.PI * p)).toFixed(4)})`,
              }}
            >
              {showAfter ? <AfterTile i={i} t={t} /> : <BeforeTile i={i} t={t} />}
            </div>
          );
        })}
      </div>

      <Caption lines={C.beforeCaption} at={C.beforeCaptionAt} />
      <Caption lines={C.afterCaption} at={C.flipAt} top={CAPTION.top + Math.round(SIZES.caption * CAPTION.lineHeight)} />
      <Sfx name="whoosh" at={C.flipAt - 4} />
      <Sfx name="bass-hit" at={C.flipAt} />
      {Array.from({length: 6}).map((_, i) => (
        <Sfx key={i} name="pop" at={C.flipAt + i * C.flipStagger + 3} />
      ))}
    </AbsoluteFill>
  );
};
