import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COPY} from '../copy';
import {IconArrowRight} from '../components/Icons';
import {LogoReversed} from '../components/Logo';
import {MaskReveal} from '../components/MaskReveal';
import {enter, kick, mix, progress} from '../lib/anim';
import {DIVIDER_TOP, dividerX} from '../lib/sweeps';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES} from '../timeline';
import {EASE_IN_OUT, FONT, HEIGHT, HPM, LINE_WIDTH, WEIGHT, WIDTH} from '../theme';

const CENTER = 510; // centre of the safe column (80…940)

// The divider thickens and floods the frame Hot Red, with slightly bowed edges.
const Flood: React.FC<{f: number}> = ({f}) => {
  const p = progress(f, CUE.flood, CUE.floodDuration, EASE_IN_OUT);
  if (p >= 1) return <AbsoluteFill style={{background: HPM.red}} />;
  const x = dividerX(f);
  const l = mix(x - LINE_WIDTH / 2, -80, p);
  const r = mix(x + LINE_WIDTH / 2, WIDTH + 80, p);
  const top = mix(DIVIDER_TOP, -20, Math.min(1, p * 1.6));
  const bow = 70 * Math.sin(Math.PI * p);
  const mid = (top + HEIGHT) / 2;
  const d = `M ${l} ${top} L ${r} ${top} Q ${r + bow} ${mid} ${r} ${HEIGHT + 20} L ${l} ${HEIGHT + 20} Q ${l - bow} ${mid} ${l} ${top} Z`;
  return (
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT}>
        <path d={d} fill={HPM.red} />
      </svg>
    </AbsoluteFill>
  );
};

const Waves: React.FC<{f: number}> = ({f}) => {
  const wave = (y: number, amp: number, len: number, phase: number) => {
    const pts: string[] = [];
    for (let x = -40; x <= WIDTH + 40; x += 20) {
      pts.push(`${x} ${(y + Math.sin((x / len) * 2 * Math.PI + phase) * amp).toFixed(1)}`);
    }
    return `M ${pts.join(' L ')}`;
  };
  const t = f / 60;
  const o = enter(f, CUE.flood + 20, 40);
  return (
    <AbsoluteFill style={{opacity: 0.15 * o}}>
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
        top: 1046,
        transform: `translate(-50%, 0) scale(${k * pulse})`,
        opacity: Math.min(1, k * 2),
        background: HPM.cream,
        color: HPM.red,
        borderRadius: 999,
        padding: '0 58px',
        height: 108,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontFamily: FONT.brand,
        fontWeight: WEIGHT.headline,
        fontSize: 42,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        boxShadow: '0 18px 40px rgba(120,20,8,0.28)',
      }}
    >
      {COPY.cta.button}
      <IconArrowRight size={40} color={HPM.red} stroke={3.4} />
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

// 6 · CTA on Hot Red, all text in Cream.
export const Cta: React.FC = () => {
  const f = useSceneFrame(SCENES.cta.from);
  const logo = kick(f, CUE.logo);
  const body = enter(f, CUE.ctaBody, 30);
  const email = enter(f, CUE.ctaEmail, 30);
  const slogan = enter(f, CUE.ctaSlogan, 40);
  const centered: React.CSSProperties = {position: 'absolute', left: CENTER, transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: HPM.cream, fontFamily: FONT.brand};

  return (
    <AbsoluteFill>
      <Flood f={f} />
      <Waves f={f} />
      <div style={{position: 'absolute', left: CENTER, top: 250, transform: `translateX(-50%) scale(${mix(0.6, 1, logo)})`, opacity: Math.min(1, logo * 1.6)}}>
        <LogoReversed width={470} />
      </div>
      <MaskReveal
        frame={f}
        lines={COPY.cta.headline}
        start={CUE.ctaHeadline}
        fontSize={98}
        align="center"
        color={HPM.cream}
        accent={HPM.cream}
        style={{...centered, top: 656}}
      />
      <div style={{...centered, top: 904, fontWeight: WEIGHT.body, fontSize: 36, opacity: body, transform: `translate(-50%, ${(1 - body) * 24}px)`}}>
        {COPY.cta.body}
      </div>
      <Button f={f} />
      <div style={{...centered, top: 1206, fontWeight: WEIGHT.label, fontSize: 30, opacity: 0.92 * email, transform: `translate(-50%, ${(1 - email) * 20}px)`}}>
        {COPY.cta.email}
      </div>
      <div
        style={{
          ...centered,
          top: 1452,
          fontWeight: WEIGHT.label,
          fontSize: 28,
          letterSpacing: `${mix(0.5, 0.3, slogan)}em`,
          paddingLeft: `${mix(0.5, 0.3, slogan)}em`,
          opacity: slogan,
        }}
      >
        {COPY.cta.slogan}
      </div>
    </AbsoluteFill>
  );
};
