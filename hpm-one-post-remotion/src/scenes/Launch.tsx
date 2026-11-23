import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT, MOTION, SCENES, SIZES} from '../config';
import {clamp, mix, rand, spr} from '../lib/anim';
import {CX, INNER, INNER_W} from '../lib/layout';
import {fitSize} from '../lib/text';
import {Caption} from '../components/Caption';
import {PostCard} from '../components/Art';
import {Icon, IconName} from '../components/Icons';
import {useSceneFrame} from '../components/SceneShell';
import {Sfx} from '../components/Sound';

const C = SCENES.launch;
const POST_W = 380;
const POST_TOP = 340;
const BTN = {w: INNER_W - 40, h: 150, top: 930};
const TIP = {x: CX + BTN.w / 2 - 70, y: BTN.top + 92}; // right end of the button, clear of the label

const Finger: React.FC<{x: number; y: number; press: number}> = ({x, y, press}) => (
  // (x, y) = fingertip; hand points up-left, arm off to the right
  <svg
    width={170}
    height={300}
    viewBox="0 0 170 300"
    style={{position: 'absolute', left: x - 62, top: y - 8, transform: `rotate(-80deg) scale(${(0.85 - 0.07 * press).toFixed(3)})`, transformOrigin: '62px 8px', overflow: 'visible', zIndex: 30}}
  >
    <g stroke={COLORS.ink} strokeWidth={5} strokeLinejoin="round" fill={COLORS.card}>
      <path d="M 40 150 C 30 175, 30 215, 50 250 L 60 300 H 150 L 160 240 C 172 205, 170 170, 160 145 C 150 125, 130 125, 125 140 C 122 122, 100 118, 96 136 C 92 118, 72 118, 70 135 Z" />
      <path d="M 44 160 V 24 C 44 6, 80 6, 80 24 V 140 Z" />
    </g>
  </svg>
);

const Bubble: React.FC<{icon: IconName; text: string; at: number; i: number; t: number}> = ({icon, text, at, i, t}) => {
  const s = spr(t, at, MOTION.bouncy);
  if (s <= 0.001) return null;
  const right = i % 2 === 1;
  const y = 380 + i * 190 - Math.max(0, t - at) * 0.5;
  return (
    <div
      data-qa="text"
      style={{
        position: 'absolute',
        top: y,
        ...(right ? {right: 1080 - INNER.right + 22} : {left: INNER.left + 22}),
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 30px 14px 14px',
        borderRadius: 50,
        background: COLORS.card,
        border: `3px solid ${COLORS.ink}`,
        boxShadow: `0 14px 30px ${COLORS.shadow}`,
        transform: `scale(${s.toFixed(4)}) rotate(${((1 - s) * (right ? 12 : -12) + (right ? 2 : -2)).toFixed(2)}deg)`,
        transformOrigin: right ? 'right center' : 'left center',
        opacity: clamp(s * 3),
        fontFamily: FONT.family,
        fontWeight: FONT.bold,
        fontSize: SIZES.bubble,
        color: COLORS.ink,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{width: 62, height: 62, borderRadius: 31, background: COLORS.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name={icon} size={36} fill={icon === 'heart'} accent={COLORS.offWhite} color={COLORS.offWhite} stroke={4} />
      </div>
      {text}
    </div>
  );
};

const BURST: IconName[] = ['heart', 'heart', 'comment', 'heart', 'user', 'heart', 'dm'];

export const Launch: React.FC = () => {
  const t = useSceneFrame();
  const post = spr(t, C.postAt, MOTION.snap);
  const stamp = spr(t, C.postedAt, MOTION.slam);
  const btnIn = spr(t, C.adButtonAt, MOTION.bouncy);
  const tapped = t >= C.tapAt;
  const press = clamp(1 - Math.abs(t - C.tapAt) / 4);
  const live = spr(t, C.tapAt + 1, MOTION.bouncy);
  const since = t - C.tapAt;
  const ring = clamp(since / 16);

  // finger: in from the right, press, leave to the right
  const fin = spr(t, C.tapAt - 16, MOTION.snap);
  const fout = spr(t, C.tapAt + 8, MOTION.smooth, 14);
  const fx = mix(TIP.x + 560, TIP.x, fin) + fout * 640;
  const fy = TIP.y + press * 6;
  const fingerOn = fin > 0.001 && fout < 0.999;

  const label = tapped ? C.adLiveLabel : C.adButtonLabel;
  const labelSize = fitSize([C.adButtonLabel, C.adLiveLabel], SIZES.adButton, BTN.w - 150);
  const pulse = tapped ? 0.5 + 0.5 * Math.sin(since * 0.35) : 0;

  return (
    <AbsoluteFill>
      {/* the finished post goes live */}
      <div
        style={{
          position: 'absolute',
          left: CX - POST_W / 2,
          top: POST_TOP + Math.sin(t * 0.07) * 5,
          transform: `translateY(${((1 - post) * 200).toFixed(1)}px) scale(${mix(0.7, 1, post).toFixed(4)}) rotate(${(-2 + Math.sin(t * 0.05)).toFixed(2)}deg)`,
          opacity: clamp(post * 3),
        }}
      >
        <PostCard width={POST_W} t={t} liked={clamp((t - C.tapAt - 4) / 10)} />
        {stamp > 0 ? (
          <div
            data-qa="text"
            style={{
              position: 'absolute',
              right: -30,
              top: -26,
              padding: '10px 22px',
              border: `5px solid ${COLORS.red}`,
              borderRadius: 14,
              background: COLORS.card,
              color: COLORS.red,
              fontFamily: FONT.family,
              fontWeight: FONT.bold,
              fontSize: 34,
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: clamp(stamp * 3),
              transform: `rotate(10deg) scale(${mix(2.4, 1, stamp).toFixed(4)})`,
            }}
          >
            <Icon name="check" size={34} color={COLORS.red} stroke={7} />
            {C.postedLabel.toUpperCase()}
          </div>
        ) : null}
      </div>

      {/* the big button */}
      {tapped && ring < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: CX - BTN.w / 2 - ring * 60,
            top: BTN.top - ring * 60,
            width: BTN.w + ring * 120,
            height: BTN.h + ring * 120,
            borderRadius: BTN.h,
            border: `${(10 * (1 - ring) + 1).toFixed(1)}px solid ${COLORS.orange}`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <div
        data-qa="text"
        style={{
          position: 'absolute',
          left: CX - BTN.w / 2,
          top: BTN.top,
          width: BTN.w,
          height: BTN.h,
          borderRadius: BTN.h / 2,
          background: COLORS.red,
          boxShadow: `0 ${(18 - press * 12).toFixed(1)}px 0 #B5222F, 0 30px 60px rgba(230,57,70,${(0.25 + pulse * 0.2).toFixed(3)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: labelSize,
          color: COLORS.offWhite,
          whiteSpace: 'nowrap',
          opacity: clamp(btnIn * 3),
          transform: `translateY(${((1 - btnIn) * 200 + press * 12).toFixed(1)}px) scale(${(mix(0.6, 1, btnIn) * (tapped ? 1 + 0.05 * Math.sin(Math.PI * clamp(live)) : 1)).toFixed(4)})`,
        }}
      >
        <div style={{transform: tapped ? `scale(${mix(0.4, 1, clamp(live)).toFixed(3)})` : undefined}}>
          <Icon name={tapped ? 'check' : 'megaphone'} size={60} color={COLORS.offWhite} accent={COLORS.offWhite} stroke={tapped ? 6 : 4} />
        </div>
        {label}
      </div>

      {/* burst of reactions out of the button */}
      {tapped
        ? Array.from({length: 26}).map((_, i) => {
            const d = since - (i % 5);
            if (d < 0 || d > 42) return null;
            const ang = (-90 + (rand(i * 7.1) - 0.5) * 150) * (Math.PI / 180);
            const speed = 22 + rand(i * 3.3) * 22;
            const x = CX + Math.cos(ang) * speed * d;
            const y = BTN.top + BTN.h / 2 + Math.sin(ang) * speed * d + 0.55 * d * d;
            const size = 40 + rand(i + 2) * 40;
            const life = 1 - d / 42;
            const pop = Math.min(1, d / 4);
            const icon = BURST[i % BURST.length];
            const red = icon === 'heart';
            return (
              <div key={i} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, opacity: life, zIndex: 22, transform: `scale(${pop.toFixed(3)}) rotate(${((rand(i) - 0.5) * 60).toFixed(1)}deg)`}}>
                <Icon name={icon} size={size} fill={red} accent={i % 3 === 0 ? COLORS.orange : COLORS.red} color={red ? (i % 3 === 0 ? COLORS.orange : COLORS.red) : COLORS.ink} stroke={4} />
              </div>
            );
          })
        : null}

      {fingerOn ? <Finger x={fx} y={fy} press={press} /> : null}
      {C.notifications.map((n, i) => (
        <Bubble key={i} icon={n.icon as IconName} text={n.text} at={n.at} i={i} t={t} />
      ))}
      <Caption lines={C.caption} at={C.captionAt} />
      <Sfx name="pop" at={C.postedAt} />
      <Sfx name="tap" at={C.tapAt} />
      <Sfx name="bass-hit" at={C.tapAt} />
      {C.notifications.map((n, i) => (
        <Sfx key={i} name="pop" at={n.at} />
      ))}
    </AbsoluteFill>
  );
};
