// Everything drawn in HTML on top of the 3D: the kinetic lines, the pillar splits, the phone
// labels, the impact burst, the end card, and the finish (grain, vignette).
import {CameraMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLUMN, COPY, FormatId, GOLD_GRADIENT, LAYOUT, LEFT, Lang, RIGHT, SAFE, TIMING, UPDATE} from '../data';
import {FAMILY} from '../fonts';
import {clamp01, easeIn, easeInOut, easeOut, hash, ramp, springAt} from '../lib/ease';
import {projectOnPhone} from '../lib/projection';
import {PHONE, impact, leftBalance, leftPose, rightBalance, rightPose} from '../lib/story';
import {Kinetic, KineticProps, kineticMoving} from './Kinetic';

const useFmt = (): FormatId => (useVideoConfig().height > 1500 ? 'vertical' : 'feed');

/** All the kinetic text blocks, in order (one short line each). */
export const textBlocks = (fmt: FormatId, lang: Lang): KineticProps[] => {
  const L = LAYOUT[fmt];
  const c = COPY[lang];
  const at = (block: KineticProps['block'], inAt: number, outAt: number, backing = true, stagger = 4): KineticProps => ({
    block,
    lang,
    inAt,
    outAt,
    top: L.textTop,
    maxSize: L.textSize,
    backing,
    stagger,
  });
  return [
    at(c.hookA, TIMING.hookAIn, TIMING.hookAOut, false),
    at(c.hookB, TIMING.hookBIn, TIMING.hookBOut, false),
    at(c.entry, TIMING.entryIn, TIMING.entryOut),
    at(c.warning, TIMING.warningIn, TIMING.warningOut),
    at(c.news, TIMING.newsIn, TIMING.newsOut),
    at(c.payoffA, TIMING.payoffAIn, TIMING.payoffAOut, true, 5),
    at(c.payoffB, TIMING.payoffBIn, TIMING.payoffBOut, true, 5),
    at(c.flip, TIMING.flipTextIn, TIMING.flipTextOut, false, 4),
  ];
};

const TextLayer: React.FC<{fmt: FormatId; lang: Lang}> = ({fmt, lang}) => (
  <AbsoluteFill>
    {textBlocks(fmt, lang).map((b, i) => (
      <Kinetic key={i} {...b} />
    ))}
  </AbsoluteFill>
);

// ─── Scoreboards under the phones ────────────────────────────────────────────
// Always on during the story: who is who (✕ no plan / ✓ with Miran Gold) and the balance,
// big enough to read without looking at the screens at all.

const money0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const pctStr = (p: number) => `${p > 0.05 ? '+' : p < -0.05 ? '−' : ''}${Math.abs(p).toFixed(Math.abs(p) >= 10 ? 0 : 1)}%`;

const Mark: React.FC<{good: boolean; size: number}> = ({good, size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{flex: 'none'}}>
    <circle cx="20" cy="20" r="19" fill={good ? BRAND.goldA : BRAND.red} />
    {good ? (
      <path d="M11 20.5 L17.5 27 L29.5 14" fill="none" stroke={BRAND.ink} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M13 13 L27 27 M27 13 L13 27" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
    )}
  </svg>
);

type BoardProps = {
  label: string;
  good: boolean;
  balance: number;
  start: number;
  x: number;
  y: number;
  alpha: number;
  scale: number;
  rtl: boolean;
  illustrative: string;
  flash: number;
};

const Board: React.FC<BoardProps> = ({label, good, balance, start, x, y, alpha, scale, rtl, illustrative, flash}) => {
  const pct = ((balance - start) / start) * 100;
  const col = pct > 0.05 ? BRAND.up : pct < -0.05 ? BRAND.red : BRAND.text;
  const border = good ? 'rgba(212,162,76,0.75)' : 'rgba(255,77,77,0.7)';
  const glow = good ? 'rgba(200,150,62,0.35)' : `rgba(255,77,77,${0.3 + 0.4 * flash})`;
  const tagSide: React.CSSProperties = rtl ? {left: 20} : {right: 20};
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 370,
        transform: `translate(-50%, 0) scale(${scale * (0.92 + 0.08 * alpha)})`,
        transformOrigin: 'center top',
        opacity: alpha,
        fontFamily: FAMILY,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          padding: '12px 18px 14px',
          borderRadius: 30,
          background: good ? 'linear-gradient(180deg, rgba(38,30,14,0.94), rgba(14,17,28,0.94))' : 'linear-gradient(180deg, rgba(48,12,16,0.94), rgba(16,12,18,0.94))',
          border: `2px solid ${border}`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.45), 0 0 ${24 + 40 * flash}px ${glow}`,
        }}
      >
        <div dir={rtl ? 'rtl' : 'ltr'} style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 36, lineHeight: '54px', whiteSpace: 'nowrap'}}>
          <Mark good={good} size={38} />
          <span style={good ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {color: '#FF7A7A'}}>{label}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12, direction: 'ltr', whiteSpace: 'nowrap'}}>
          <span style={{fontWeight: 700, fontSize: 58, lineHeight: '72px', color: col}}>{money0(balance)}</span>
          <span style={{fontWeight: 700, fontSize: 30, lineHeight: '40px', color: col, opacity: Math.abs(pct) > 0.05 ? 1 : 0}}>{pctStr(pct)}</span>
        </div>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          style={{
            position: 'absolute',
            top: -13,
            ...tagSide,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '24px',
            padding: '0 10px',
            borderRadius: 12,
            color: '#B8BECB',
            background: '#121826',
            border: '1px solid rgba(140,147,163,0.5)',
          }}
        >
          {illustrative}
        </div>
      </div>
    </div>
  );
};

const Boards: React.FC<{fmt: FormatId; lang: Lang}> = ({fmt, lang}) => {
  const f = useCurrentFrame();
  if (f < TIMING.boardsIn - 2 || f > TIMING.boardsOut + 16) return null;
  const alpha = ramp(f, TIMING.boardsIn, TIMING.boardsIn + 18, easeOut) * (1 - ramp(f, TIMING.boardsOut - 4, TIMING.boardsOut + 12, easeIn));
  if (alpha <= 0) return null;
  const c = COPY[lang];
  const L = LAYOUT[fmt];
  const below: [number, number, number] = [0, -PHONE.height / 2, 0];
  const a = projectOnPhone(f, fmt, leftPose(f), below);
  const b = projectOnPhone(f, fmt, rightPose(f), below);
  const since = (at: number) => (f >= at ? Math.exp(-(f - at) / 14) : 0);
  const half = 185 * L.boardScale;
  const clampX = (x: number, lo: number, hi: number) => Math.min(hi - half, Math.max(lo + half, x));
  return (
    <>
      <Board
        label={c.labelLeft}
        good={false}
        balance={leftBalance(f)}
        start={LEFT.startBalance}
        x={clampX(a.x, COLUMN.x - 40, 534)}
        y={L.boardTop}
        alpha={alpha}
        scale={L.boardScale}
        rtl={lang === 'ar'}
        illustrative={c.illustrative}
        flash={since(LEFT.marginCallAt)}
      />
      <Board
        label={c.labelRight}
        good
        balance={rightBalance(f)}
        start={RIGHT.startBalance}
        x={clampX(b.x, 546, COLUMN.x + COLUMN.width + 10)}
        y={L.boardTop}
        alpha={alpha}
        scale={L.boardScale}
        rtl={lang === 'ar'}
        illustrative={c.illustrative}
        flash={since(UPDATE.closedAt)}
      />
    </>
  );
};

// ─── Impact burst ────────────────────────────────────────────────────────────

const ImpactBurst: React.FC<{fmt: FormatId}> = ({fmt}) => {
  const f = useCurrentFrame();
  const k = impact(f);
  if (k <= 0) return null;
  const {width, height} = LAYOUT[fmt];
  const c = projectOnPhone(TIMING.impactAt, fmt, leftPose(TIMING.impactAt), [0, 0, 0]);
  const lines = Array.from({length: 42}, (_, i) => {
    const a = (i / 42) * Math.PI * 2 + hash(i) * 0.12;
    const r0 = 260 + hash(i + 50) * 220;
    const r1 = r0 + 500 + hash(i + 99) * 900;
    const w = 4 + hash(i + 7) * 12;
    return {a, r0, r1, w};
  });
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity: k}}>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={c.x + Math.cos(l.a) * l.r0}
          y1={c.y + Math.sin(l.a) * l.r0}
          x2={c.x + Math.cos(l.a) * l.r1}
          y2={c.y + Math.sin(l.a) * l.r1}
          stroke={i % 3 === 0 ? BRAND.bgTop : BRAND.goldB}
          strokeWidth={l.w}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

// ─── End card ────────────────────────────────────────────────────────────────

export const endFade = (f: number) => ramp(f, TIMING.endCardStart, TIMING.endCardStart + 50, easeInOut);

/** Drifting gold particles (deterministic; frozen in the held last second). */
const Particles: React.FC<{f: number; width: number; height: number; alpha: number}> = ({f, width, height, alpha}) => (
  <>
    {Array.from({length: 26}, (_, i) => {
      const x = hash(i * 3.1) * width;
      const y0 = hash(i * 7.7) * height;
      const speed = 0.25 + hash(i * 1.3) * 0.5;
      const y = ((y0 - f * speed) % height + height) % height;
      const r = 2 + hash(i * 5.5) * 4;
      const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(f / (14 + hash(i) * 20) + i));
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + 18 * Math.sin(f / 60 + i),
            top: y,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            background: BRAND.goldB,
            opacity: alpha * tw * 0.55,
            boxShadow: `0 0 ${r * 4}px ${BRAND.goldA}`,
          }}
        />
      );
    })}
  </>
);

const EndCard: React.FC<{fmt: FormatId; lang: Lang}> = ({fmt, lang}) => {
  const raw = useCurrentFrame();
  const f = Math.min(raw, TIMING.holdFrom);
  if (f < TIMING.endCardStart) return null;
  const c = COPY[lang];
  const rtl = lang === 'ar';
  const fade = endFade(f);
  const L = LAYOUT[fmt];
  const {width, height} = LAYOUT[fmt];
  const logo = springAt(f - TIMING.logoAt, {freq: 1.5, damping: 0.55});
  const word = springAt(f - (TIMING.logoAt + 16), {freq: 1.8, damping: 0.7});
  const cta = springAt(f - TIMING.ctaAt, {freq: 2.0, damping: 0.5});
  const press = Math.sin(Math.PI * clamp01((f - TIMING.tapAt) / 12));
  const ring = ramp(f, TIMING.tapAt + 4, TIMING.tapAt + 40, easeOut);
  const shine = ramp(f, TIMING.ctaAt + 16, TIMING.ctaAt + 46, easeInOut);
  const disc = ramp(f, TIMING.disclaimerAt, TIMING.disclaimerAt + 20, easeOut);
  const S = L.endLogoSize;
  const vertical = fmt === 'vertical';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${BRAND.bgTop} 0%, ${BRAND.bgBottom} 100%)`, opacity: fade}} />
      <AbsoluteFill style={{opacity: fade}}>
        <Particles f={f} width={width} height={height} alpha={fade} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: L.endLogoTop, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FAMILY}}>
        <div style={{position: 'relative', width: S, height: S}}>
          <div
            style={{
              position: 'absolute',
              inset: -S * 0.35,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,150,62,0.34) 0%, rgba(200,150,62,0) 62%)',
              opacity: clamp01(logo),
            }}
          />
          <div
            style={{
              width: S,
              height: S,
              opacity: clamp01(logo * 2.2),
              transform: `perspective(1400px) rotateY(${(1 - logo) * 28}deg) scale(${0.72 + 0.28 * logo})`,
            }}
          >
            <Img src={staticFile('logo.png')} style={{width: S, height: S, borderRadius: '50%'}} />
          </div>
        </div>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          style={{
            marginTop: vertical ? 26 : 16,
            fontSize: vertical ? 64 : 54,
            fontWeight: 700,
            lineHeight: 1.5,
            opacity: clamp01(word * 2),
            transform: `translateY(${(1 - word) * 30}px)`,
            backgroundImage: GOLD_GRADIENT,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {lang === 'ar' ? 'ميران جولد' : 'Miran Gold'}
        </div>
        <div style={{position: 'relative', marginTop: vertical ? 44 : 26}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `4px solid ${BRAND.goldB}`,
              transform: `scale(${1 + ring * 0.16}, ${1 + ring * 0.5})`,
              opacity: (1 - ring) * 0.7 * (ring > 0 ? 1 : 0),
            }}
          />
          <div
            dir={rtl ? 'rtl' : 'ltr'}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: GOLD_GRADIENT,
              color: BRAND.ink,
              fontSize: fmt === 'vertical' ? 44 : 40,
              fontWeight: 700,
              lineHeight: 1.5,
              padding: '20px 56px 22px',
              borderRadius: 999,
              opacity: clamp01(cta * 2),
              transform: `scale(${Math.max(0, cta) * (1 - 0.06 * press)})`,
              boxShadow: `0 ${20 - 8 * press}px ${50 - 14 * press}px rgba(200,150,62,0.4)`,
              whiteSpace: 'nowrap',
            }}
          >
            {c.cta}
            <div
              style={{
                position: 'absolute',
                top: -20,
                bottom: -20,
                width: 90,
                left: `${-30 + shine * 140}%`,
                opacity: shine > 0 && shine < 1 ? 1 : 0,
                transform: 'skewX(-20deg)',
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
              }}
            />
          </div>
        </div>
      </div>
      {/* Risk disclaimer: inside the safe area, readable on mute, on screen for well over 2 seconds. */}
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          position: 'absolute',
          left: COLUMN.x,
          width: COLUMN.width,
          top: L.disclaimerTop,
          textAlign: 'center',
          fontFamily: FAMILY,
          fontWeight: 500,
          fontSize: vertical ? 31 : 28,
          lineHeight: 1.6,
          color: 'rgba(245,241,232,0.9)',
          opacity: disc,
          transform: `translateY(${(1 - disc) * 14}px)`,
        }}
      >
        {c.disclaimer}
      </div>
    </AbsoluteFill>
  );
};

// ─── Finish: grain and vignette ──────────────────────────────────────────────

let grainUrl: string | null = null;
const grainTile = () => {
  if (grainUrl) return grainUrl;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(256, 256);
  let s = 12345;
  for (let i = 0; i < 256 * 256; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const v = 128 + ((s >> 8) % 96) - 48;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainUrl = c.toDataURL();
  return grainUrl;
};

const Finish: React.FC = () => {
  const raw = useCurrentFrame();
  const f = Math.min(raw, TIMING.holdFrom);
  const ox = Math.floor(hash(f) * 256);
  const oy = Math.floor(hash(f + 0.5) * 256);
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 92% 76% at 50% 48%, rgba(0,0,0,0) 56%, rgba(3,5,10,0.42) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${grainTile()})`, backgroundPosition: `${ox}px ${oy}px`, mixBlendMode: 'overlay', opacity: 0.06}} />
    </>
  );
};

const SafeZones: React.FC<{fmt: FormatId}> = ({fmt}) => {
  const zone = {position: 'absolute', background: 'rgba(0,120,255,0.18)', outline: '2px dashed rgba(0,90,220,0.8)'} as const;
  const vertical = fmt === 'vertical';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {vertical ? (
        <>
          <div style={{...zone, left: 0, top: 0, right: 0, height: SAFE.top}} />
          <div style={{...zone, left: 0, bottom: 0, right: 0, height: SAFE.bottom}} />
          <div style={{...zone, right: 0, top: SAFE.top, width: SAFE.right, bottom: SAFE.bottom}} />
        </>
      ) : null}
      <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: 0, bottom: 0, outline: '2px dotted rgba(220,0,120,0.6)'}} />
    </AbsoluteFill>
  );
};

/** Motion blur on the type only while it is moving (samples = 1 means a sharp single copy). */
const BlurredText: React.FC<{fmt: FormatId; lang: Lang}> = ({fmt, lang}) => {
  const f = useCurrentFrame();
  const moving = textBlocks(fmt, lang).some((b) => kineticMoving(f, b));
  return (
    <CameraMotionBlur samples={moving ? 8 : 1} shutterAngle={180}>
      <TextLayer fmt={fmt} lang={lang} />
    </CameraMotionBlur>
  );
};

export const Overlays: React.FC<{showSafeZones?: boolean; lang: Lang}> = ({showSafeZones, lang}) => {
  const fmt = useFmt();
  const f = useCurrentFrame();
  const hideForImpact = impact(f) > 0;
  return (
    <>
      {hideForImpact ? null : <Boards fmt={fmt} lang={lang} />}
      {hideForImpact ? null : <BlurredText fmt={fmt} lang={lang} />}
      <ImpactBurst fmt={fmt} />
      <EndCard fmt={fmt} lang={lang} />
      <Finish />
      {showSafeZones ? <SafeZones fmt={fmt} /> : null}
    </>
  );
};

