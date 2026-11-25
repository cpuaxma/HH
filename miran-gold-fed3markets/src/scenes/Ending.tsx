// S6 twist card, S8 split-flap tease, S9 English outro.
import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, GOLD_GRADIENT, LAYOUT} from '../brand';
import {HIT, SCENES} from '../timeline';
import {clamp, hexA, push, rand, springAt} from '../motion';
import {GlassCard, Sheen} from '../components/Chrome';
import {SplitFlap} from '../components/Charts';
import {GoldParticles, scatterTargets} from '../components/Particles';

export const ExpectCard: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = springAt(frame, HIT.expectCard, {damping: 13, stiffness: 170});
  const out = interpolate(frame, [HIT.flipBack - 14, HIT.flipBack], [0, 1], clamp);
  const wobble = Math.sin(frame / 18) * 1.2;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 586, display: 'flex', justifyContent: 'center', opacity: Math.min(1, inP * 1.5) * (1 - out), transform: `scale(${0.6 + 0.4 * inP}) rotate(${wobble}deg)`}}>
      <GlassCard style={{position: 'relative', padding: '14px 40px', border: `1px solid ${hexA(C.gold2, 0.55)}`}}>
        <div dir="rtl" style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 52, whiteSpace: 'nowrap', display: 'flex', gap: 22, alignItems: 'center'}}>
          <span style={{color: C.text}}>المتوقع</span>
          <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontFamily: FONT.en}}>≠</span>
          <span style={{color: C.text}}>الفعلي</span>
        </div>
      </GlassCard>
    </div>
  );
};

const MONTHS = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'يناير', 'مارس', 'ديسمبر'];
const DIGITS = ['٣', '٧', '١', '٥', '٢', '٨', '٩'];
const CODES = ['CPI', 'PCE', 'NFP', 'GDP', 'FOMC'];

export const Tease: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.tease;
  const inP = springAt(frame, from + 10, {damping: 16, stiffness: 140});
  const out = interpolate(frame, [to - 16, to], [0, 1], clamp);
  const cam = push(frame, from, to, 0.04);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, inP * 1.4) * (1 - out), transform: `scale(${cam * (1 - out * 0.1)}) translateY(${(1 - inP) * 60}px)`, filter: out > 0.02 ? `blur(${out * 8}px)` : undefined}}>
      <div dir="rtl" style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 32, color: C.slate}}>
        قرار الفيد القادم
      </div>
      {/* RTL row, as read: FOMC (right) · ٩ ديسمبر (left) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center', gap: 16, direction: 'rtl'}}>
        <SplitFlap frame={frame} sequence={CODES} start={HIT.flapStart} land={HIT.flapLand - 20} w={250} h={170} font={FONT.en} size={72} />
        <div style={{width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.en, fontWeight: 700, fontSize: 60, color: C.gold2}}>·</div>
        <SplitFlap frame={frame} sequence={DIGITS} start={HIT.flapStart + 2} land={HIT.flapLand - 10} w={130} h={170} font={FONT.ar} size={92} color={C.gold1} />
        <SplitFlap frame={frame} sequence={MONTHS} start={HIT.flapStart + 4} land={HIT.flapLand} w={300} h={170} font={FONT.ar} size={70} color={C.gold1} />
      </div>
      <div dir="rtl" style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 26, color: C.slate, opacity: interpolate(frame, [HIT.flapLand, HIT.flapLand + 14], [0, 1], clamp)}}>
        الاجتماع ٨–٩ ديسمبر · مع توقعات اقتصادية جديدة
      </div>
    </div>
  );
};

const LOGO = {x: 540, y: 700, size: 340};

/** Particles burst from the node's last pulse and gather into the logo ring. */
export const OutroParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const spread = {x: 540, y: 640, w: 900, h: 700};
  const rest = scatterTargets(90, 21, spread);
  const ring = {x: LOGO.x, y: LOGO.y, w: LOGO.size * 0.9, h: LOGO.size * 0.9};
  const handoff = HIT.outroIn;
  return frame < handoff ? (
    <GoldParticles frame={frame} count={90} start={HIT.teasePulse} dur={60} sources={[{x: 540, y: 400}]} target={spread} seed={21} fadeOnArrive={false} />
  ) : (
    <GoldParticles frame={frame} count={90} start={handoff} dur={66} sources={rest} target={ring} seed={21} jitter={0} />
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.outro;
  const cam = push(frame, from, to, 0.05);
  const logo = springAt(frame, HIT.logoLock - 10, {damping: 13, stiffness: 120});
  const flash = interpolate(frame, [HIT.logoLock, HIT.logoLock + 3, HIT.logoLock + 24], [0, 0.6, 0], clamp);
  const line = (at: number) => springAt(frame, at, {damping: 200, stiffness: 160});
  const words = (text: string, at: number, style: React.CSSProperties) => (
    <div style={{display: 'flex', justifyContent: 'center', gap: '0.28em', ...style, backgroundImage: undefined}}>
      {text.split(' ').map((w, i) => {
        const p = line(at + i * 4);
        return (
          <span key={i} style={{display: 'inline-block', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 24}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined, ...(style.backgroundImage ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {})}}>
            {w}
          </span>
        );
      })}
    </div>
  );
  const small = interpolate(frame, [HIT.outroSmall, HIT.outroSmall + 16], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: '50% 40%'}}>
      <div style={{position: 'absolute', left: LOGO.x - LOGO.size / 2, top: LOGO.y - LOGO.size / 2, width: LOGO.size, height: LOGO.size, opacity: Math.min(1, logo * 1.4), transform: `scale(${0.7 + 0.3 * logo})`}}>
        <div style={{position: 'absolute', inset: -90, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(C.gold2, 0.3 + flash * 0.5)} 0%, ${hexA(C.gold2, 0)} 65%)`}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 60px ${hexA(C.gold2, 0.45)}`}}>
          <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
          {frame >= HIT.logoLock && frame < HIT.logoLock + 60 && <Sheen frame={frame} period={130} offset={-HIT.logoLock} />}
        </div>
      </div>
      {words('One decision. Three markets.', HIT.logoLock, {position: 'absolute', left: 0, right: 0, top: 940, fontFamily: FONT.en, fontWeight: FONT.enSemi, fontSize: 58, color: C.text})}
      {words('Stay ready with Miran Gold.', HIT.outroLine2, {position: 'absolute', left: 0, right: 0, top: 1026, fontFamily: FONT.en, fontWeight: FONT.enBold, fontSize: 62, backgroundImage: GOLD_GRADIENT})}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', opacity: small, transform: `translateY(${(1 - small) * 16}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px', borderRadius: 999, border: `1px solid ${hexA(C.gold2, 0.45)}`, background: hexA(C.bg1, 0.7), fontFamily: FONT.en, fontWeight: FONT.enSemi, fontSize: 28, color: C.text}}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.gold1} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16v11H9l-5 4V5z" />
          </svg>
          Join us on Telegram · t.me/Mirangold1
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: LAYOUT.disclaimerTop, textAlign: 'center', fontFamily: FONT.en, fontWeight: 500, fontSize: 24, color: C.text, opacity: 0.6 * interpolate(frame, [from + 4, from + 22], [0, 1], clamp)}}>
        Educational content only. Not financial advice.
      </div>
    </div>
  );
};
