import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, spr} from '../lib/anim';
import {CX, INNER} from '../lib/layout';
import {Caption} from '../components/Caption';
import {Phone, PostCard} from '../components/Art';
import {Icon, IconName} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.launch;
const PHONE_W = 420;
const K = PHONE_W / 440;
const PHONE_LEFT = CX - PHONE_W / 2;
const PHONE_TOP = 300;
// Boost button (screen coords inside the 412 × 872 phone screen)
const BTN = {x: 20, y: 752, w: 372, h: 80};
const toScene = (x: number, y: number) => ({x: PHONE_LEFT + (14 + x) * K, y: PHONE_TOP + (14 + y) * K});

const Finger: React.FC<{x: number; y: number; press: number; opacity: number}> = ({x, y, press, opacity}) => (
  // (x, y) = fingertip
  <svg
    width={170}
    height={300}
    viewBox="0 0 170 300"
    style={{position: 'absolute', left: x - 62, top: y - 8, opacity, transform: `rotate(-68deg) scale(${(1 - 0.08 * press).toFixed(3)})`, transformOrigin: '62px 8px', overflow: 'visible'}}
  >
    <g stroke={COLORS.charcoal} strokeWidth={5} strokeLinejoin="round" fill={COLORS.offWhite}>
      <path d="M 40 150 C 30 175, 30 215, 50 250 L 60 300 H 150 L 160 240 C 172 205, 170 170, 160 145 C 150 125, 130 125, 125 140 C 122 122, 100 118, 96 136 C 92 118, 72 118, 70 135 Z" />
      <path d="M 44 160 V 24 C 44 6, 80 6, 80 24 V 140 Z" />
    </g>
    <path d="M 52 26 C 54 16, 70 16, 72 26" stroke={COLORS.dim} strokeWidth={3} fill="none" strokeLinecap="round" />
  </svg>
);

const Bubble: React.FC<{icon: IconName; text: string; at: number; i: number; t: number}> = ({icon, text, at, i, t}) => {
  const s = spr(t, at, MOTION.bouncy);
  if (s <= 0.001) return null;
  const right = i % 2 === 1;
  const y = 470 + i * 168 - Math.max(0, t - at) * 0.55;
  const color = i % 2 === 0 ? COLORS.red : COLORS.orange;
  return (
    <div
      data-qa="text"
      style={{
        position: 'absolute',
        top: y,
        ...(right ? {right: 1080 - INNER.right - 6} : {left: INNER.left + 6}),
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 28px 14px 14px',
        borderRadius: 48,
        background: 'rgba(28,28,28,0.96)',
        border: `2px solid ${COLORS.border}`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
        transform: `scale(${s.toFixed(4)}) rotate(${((1 - s) * (right ? 10 : -10)).toFixed(2)}deg)`,
        transformOrigin: right ? 'right center' : 'left center',
        opacity: clamp(s * 3),
        fontFamily: FONT.family,
        fontWeight: FONT.bold,
        fontSize: SIZES.bubble,
        color: COLORS.offWhite,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{width: 60, height: 60, borderRadius: 30, background: COLORS.charcoal, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} size={34} fill={icon === 'heart'} accent={color} color={COLORS.offWhite} />
      </div>
      {text}
    </div>
  );
};

export const Launch: React.FC = () => {
  const t = useSceneFrame();
  const rise = spr(t, -4, MOTION.snap);
  const progress = clamp(spr(t, C.publishAt, MOTION.smooth, C.postedAt - C.publishAt));
  const posted = spr(t, C.postedAt, MOTION.bouncy);
  const btnIn = spr(t, C.boostButtonAt, MOTION.bouncy);
  const tapped = t >= C.tapAt;
  const tapRing = clamp((t - C.tapAt) / 14);
  const boosted = spr(t, C.tapAt + 2, MOTION.bouncy);

  // Finger: in from bottom-right, press on the button, then leave.
  const tip = toScene(BTN.x + BTN.w * 0.62, BTN.y + BTN.h * 0.55);
  const fin = spr(t, C.tapAt - 18, MOTION.snap);
  const fout = spr(t, C.tapAt + 10, MOTION.smooth, 18);
  const press = clamp(1 - Math.abs(t - C.tapAt) / 4);
  // enters from the right (hand pointing up-left) so it never crosses the caption
  const fx = mix(tip.x + 560, tip.x, fin) + fout * 600;
  const fy = mix(tip.y + 40, tip.y, fin) + press * 6 + fout * 60;

  const firstNote = C.notifications[0]?.at ?? 999;
  const liked = clamp((t - firstNote) / 10);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: PHONE_LEFT,
          top: PHONE_TOP,
          transform: `translateY(${((1 - rise) * 120).toFixed(1)}px) rotate(${(Math.sin(t * 0.06) * 1.4).toFixed(2)}deg)`,
        }}
      >
        <Phone width={PHONE_W} time={SCENES.launch.clock}>
          <div data-qa="text" style={{position: 'absolute', left: 24, top: 72, fontWeight: FONT.bold, fontSize: 26}}>
            {posted > 0.5 ? 'Your post' : 'New post'}
          </div>
          <div style={{position: 'absolute', left: 20, top: 124, opacity: mix(0.55, 1, clamp(posted))}}>
            <PostCard width={372} t={t} liked={liked} />
          </div>
          {/* publish status row */}
          <div style={{position: 'absolute', left: 20, right: 20, top: 670, height: 56, display: 'flex', alignItems: 'center', gap: 14}}>
            {posted < 0.5 ? (
              <>
                <div style={{fontWeight: FONT.medium, fontSize: SIZES.phoneUi, color: COLORS.muted, whiteSpace: 'nowrap'}}>{C.publishingLabel}</div>
                <div style={{flex: 1, height: 8, borderRadius: 4, background: COLORS.border}}>
                  <div style={{width: `${progress * 100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.red})`}} />
                </div>
              </>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${posted.toFixed(4)})`, transformOrigin: 'left center'}}>
                <div style={{width: 44, height: 44, borderRadius: 22, border: `3px solid ${COLORS.orange}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Icon name="check" size={28} color={COLORS.orange} stroke={6} />
                </div>
                <div style={{fontWeight: FONT.bold, fontSize: SIZES.phoneUi + 2}}>{C.postedLabel}</div>
              </div>
            )}
          </div>
          {/* Boost button */}
          <div
            style={{
              position: 'absolute',
              left: BTN.x,
              top: BTN.y,
              width: BTN.w,
              height: BTN.h,
              borderRadius: 40,
              background: tapped ? COLORS.surfaceHi : COLORS.red,
              border: `3px solid ${tapped ? COLORS.orange : COLORS.red}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontWeight: FONT.bold,
              fontSize: 28,
              transform: `translateY(${((1 - btnIn) * 140).toFixed(1)}px) scale(${(1 - press * 0.05 + (tapped ? 0.04 * Math.sin(Math.PI * clamp(boosted)) : 0)).toFixed(4)})`,
              opacity: clamp(btnIn * 2),
              overflow: 'hidden',
            }}
          >
            <Icon name={tapped ? 'check' : 'flame'} size={34} color={tapped ? COLORS.orange : COLORS.offWhite} fill={!tapped} accent={COLORS.offWhite} stroke={tapped ? 6 : 3.6} />
            {tapped ? C.boostedLabel : C.boostLabel}
            {tapped ? (
              <div style={{position: 'absolute', left: 0, bottom: 0, height: 5, width: `${clamp((t - C.tapAt) / 50) * 100}%`, background: COLORS.orange}} />
            ) : null}
          </div>
        </Phone>
      </div>
      {/* tap ripple */}
      {tapRing > 0 && tapRing < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: tip.x - 20 - tapRing * 90,
            top: tip.y - 20 - tapRing * 90,
            width: 40 + tapRing * 180,
            height: 40 + tapRing * 180,
            borderRadius: '50%',
            border: `5px solid ${COLORS.orange}`,
            opacity: 1 - tapRing,
          }}
        />
      ) : null}
      {fin > 0.001 && fout < 0.999 ? <Finger x={fx} y={fy} press={press} opacity={1} /> : null}
      {C.notifications.map((n, i) => (
        <Bubble key={i} icon={n.icon as IconName} text={n.text} at={n.at} i={i} t={t} />
      ))}
      <Caption lines={C.caption} at={C.captionAt} />
      <Sfx name="pop" at={C.postedAt} />
      <Sfx name="tap" at={C.tapAt} />
      {C.notifications.map((n, i) => (
        <Sfx key={i} name="pop" at={n.at} />
      ))}
    </AbsoluteFill>
  );
};
