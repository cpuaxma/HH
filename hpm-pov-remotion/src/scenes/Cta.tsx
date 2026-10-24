import {ArrowRight} from 'lucide-react';
import React from 'react';
import {AbsoluteFill, spring} from 'remotion';
import {LogoReversed} from '../components/Logo';
import {MaskReveal} from '../components/MaskReveal';
import {NotificationCard} from '../components/NotificationCard';
import {enter, kick, mix, progress} from '../lib/anim';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {CARD_SPRING, EASE_IN_OUT, FONT, FPS, HEIGHT, HPM, SAFE, WEIGHT, WIDTH} from '../theme';

const CENTER = (SAFE.left + SAFE.right) / 2;

const Waves: React.FC<{f: number}> = ({f}) => {
  const wave = (y: number, amp: number, len: number, phase: number) => {
    const pts: string[] = [];
    for (let x = -40; x <= WIDTH + 40; x += 20) pts.push(`${x} ${(y + Math.sin((x / len) * 2 * Math.PI + phase) * amp).toFixed(1)}`);
    return `M ${pts.join(' L ')}`;
  };
  const t = f / 60;
  return (
    <AbsoluteFill style={{opacity: 0.15 * enter(f, CUE.flood + 20, 40)}}>
      <svg width={WIDTH} height={HEIGHT}>
        <path d={wave(1712, 22, 620, t * 0.9)} stroke={HPM.cream} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={wave(1790, 16, 480, -t * 0.7 + 1.4)} stroke={HPM.cream} strokeWidth={4} fill="none" strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

const Button: React.FC<{f: number}> = ({f}) => {
  const k = kick(f, CUE.ctaButton);
  // Gentle pulse 1 → 1.04 → 1 at the start of every second.
  const cycle = f >= CUE.pulseFrom ? (f - CUE.pulseFrom) % 60 : 60;
  const pulse = cycle < 30 ? 1 + 0.04 * Math.sin((cycle / 30) * Math.PI) : 1;
  const shine = progress(f, CUE.shine, 32, EASE_IN_OUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: CENTER,
        top: 838,
        transform: `translate(-50%, 0) scale(${k * pulse})`,
        opacity: Math.min(1, k * 2),
        background: HPM.cream,
        color: HPM.red,
        borderRadius: 999,
        padding: '0 56px',
        height: 104,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: FONT,
        fontWeight: WEIGHT.headline,
        fontSize: 42,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        boxShadow: '0 18px 40px rgba(120,20,8,0.28)',
      }}
    >
      Let's Grow
      <ArrowRight size={42} color={HPM.red} strokeWidth={3} />
      {shine > 0 && shine < 1 ? (
        <div
          style={{
            position: 'absolute',
            top: -20,
            bottom: -20,
            width: 90,
            left: `${mix(-30, 130, shine)}%`,
            transform: 'skewX(-22deg)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))',
          }}
        />
      ) : null}
    </div>
  );
};

// 7 · CTA on Hot Red (the flood itself is HeatGlow). All text in Cream.
export const Cta: React.FC = () => {
  const f = useSceneFrame(SCENES.cta.from);
  const logo = kick(f, CUE.logo);
  const body = enter(f, CUE.ctaBody, 30);
  const card = spring({frame: f - CUE.ctaCard, fps: FPS, config: CARD_SPRING});
  const email = enter(f, CUE.ctaEmail, 30);
  const slogan = enter(f, CUE.ctaSlogan, 40);
  const centered: React.CSSProperties = {position: 'absolute', left: CENTER, transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: HPM.cream, fontFamily: FONT};

  return (
    <AbsoluteFill>
      <Waves f={f} />
      <div style={{position: 'absolute', left: CENTER, top: 146, transform: `translateX(-50%) scale(${mix(0.6, 1, logo)})`, opacity: Math.min(1, logo * 1.6)}}>
        <LogoReversed width={430} />
      </div>
      <MaskReveal
        frame={f}
        lines={['ready to turn', 'up the heat?']}
        start={CUE.ctaHeadline}
        fontSize={96}
        align="center"
        color={HPM.cream}
        accent={HPM.cream}
        style={{...centered, top: 520}}
      />
      <div style={{...centered, top: 756, fontWeight: WEIGHT.body, fontSize: 36, opacity: body, transform: `translate(-50%, ${(1 - body) * 24}px)`}}>
        Send us a message or book a free call.
      </div>
      <Button f={f} />
      <NotificationCard
        notif={{type: 'MESSAGES', title: 'Hot Pepper Media', body: 'Your free call is one message away 🌶️'}}
        glass="rgba(254,249,239,0.9)"
        style={{
          top: 990,
          transformOrigin: '50% 100%',
          transform: `translateY(${-80 * (1 - card)}px) scale(${mix(0.92, 1, card)})`,
          opacity: Math.min(1, Math.max(0, card)),
          boxShadow: '0 16px 40px rgba(120,20,8,0.25)',
        }}
      />
      <div style={{...centered, top: 1200, fontWeight: WEIGHT.label, fontSize: 30, opacity: 0.92 * email, transform: `translate(-50%, ${(1 - email) * 20}px)`}}>
        hotpeppermedia@outlook.com
      </div>
      <div
        style={{
          ...centered,
          top: 1470,
          fontWeight: WEIGHT.label,
          fontSize: 28,
          letterSpacing: `${mix(0.5, 0.3, slogan)}em`,
          paddingLeft: `${mix(0.5, 0.3, slogan)}em`,
          opacity: slogan,
        }}
      >
        MARKETING WITH A KICK.
      </div>
    </AbsoluteFill>
  );
};
