// Everything drawn in HTML on top of the 3D: the kinetic lines, the pillar splits, the phone
// labels, the impact burst, the end card, and the finish (grain, vignette).
import {CameraMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLUMN, COPY, FormatId, GOLD_GRADIENT, LAYOUT, Lang, SAFE, TIMING} from '../data';
import {FAMILY} from '../fonts';
import {clamp01, easeIn, easeInOut, easeOut, hash, ramp, springAt} from '../lib/ease';
import {projectOnPhone} from '../lib/projection';
import {PHONE, impact, leftBalance, leftEquity, leftIsMiran, leftPose, rightBalance, rightPose, syncPulse} from '../lib/story';
import {Kinetic, KineticProps, SplitPair, kineticMoving} from './Kinetic';

const useFmt = (): FormatId => (useVideoConfig().height > 1500 ? 'vertical' : 'feed');

/** All the kinetic text blocks, in order. */
export const textBlocks = (fmt: FormatId, lang: Lang): KineticProps[] => {
  const L = LAYOUT[fmt];
  const c = COPY[lang];
  return [
    {block: c.hookA, lang, inAt: TIMING.hookAIn, outAt: TIMING.hookAOut, top: L.textTop, maxSize: L.textSize},
    {block: c.hookB, lang, inAt: TIMING.hookBIn, outAt: TIMING.hookBOut, top: L.textTop + L.textSize * 0.4, maxSize: L.textSize},
    {block: c.twistA, lang, inAt: TIMING.twistAIn, outAt: TIMING.twistAOut, top: L.textTop, maxSize: L.textSize * 0.84, backing: true, stagger: 5},
    {block: c.twistB, lang, inAt: TIMING.twistBIn, outAt: TIMING.twistBOut, top: L.textTop, maxSize: L.textSize * 0.9, backing: true, stagger: 5},
    {block: c.flip, lang, inAt: TIMING.flipTextIn, outAt: TIMING.flipTextOut, top: L.textTop, maxSize: L.textSize * 0.95, stagger: 5},
  ];
};

const splitMoving = (f: number) =>
  TIMING.pillars.some((p) => (f >= p.redIn - 8 && f <= p.redIn + 36) || (f >= p.goldIn - 8 && f <= p.goldIn + 40) || (f >= p.out - 14 && f <= p.out + 12) || (f >= p.from - 4 && f <= p.from + 30));

const TextLayer: React.FC<{fmt: FormatId; lang: Lang}> = ({fmt, lang}) => {
  const L = LAYOUT[fmt];
  const c = COPY[lang];
  return (
    <AbsoluteFill>
      {textBlocks(fmt, lang).map((b, i) => (
        <Kinetic key={i} {...b} />
      ))}
      {TIMING.pillars.map((p, i) => (
        <SplitPair
          key={i}
          lang={lang}
          index={i}
          name={c.pillars[i].name}
          word={c.pillarWord}
          without={c.pillars[i].without}
          withText={c.pillars[i].with}
          chipIn={p.from + 4}
          redIn={p.redIn}
          goldIn={p.goldIn}
          out={p.out}
          top={L.textTop}
          size={L.splitSize}
        />
      ))}
    </AbsoluteFill>
  );
};

// ─── Labels pinned under the phones ──────────────────────────────────────────

const labelWindows: [number, number][] = [
  [20, 166],
  [900, 1014],
];

const money0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

const Label: React.FC<{text: string; sub: string; subColor: string; x: number; y: number; alpha: number; gold: boolean; pulse: number; rtl: boolean; illustrative: string}> = ({
  text,
  sub,
  subColor,
  x,
  y,
  alpha,
  gold,
  pulse,
  rtl,
  illustrative,
}) => (
  <div
    dir={rtl ? 'rtl' : 'ltr'}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, 0) scale(${0.9 + 0.1 * alpha})`,
      opacity: alpha,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      padding: '8px 24px 10px',
      borderRadius: 26,
      background: 'rgba(14,19,32,0.9)',
      border: `1.5px solid ${gold ? 'rgba(212,162,76,0.55)' : 'rgba(217,83,79,0.55)'}`,
      boxShadow: `0 12px 30px rgba(0,0,0,0.4), 0 0 ${18 + 20 * pulse}px ${gold ? 'rgba(200,150,62,0.28)' : 'rgba(217,83,79,0.28)'}`,
      fontFamily: FAMILY,
      whiteSpace: 'nowrap',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 30, lineHeight: '46px', color: BRAND.text}}>
      <div style={{width: 13, height: 13, borderRadius: 7, background: gold ? BRAND.goldA : BRAND.red, boxShadow: `0 0 ${8 + 12 * pulse}px ${gold ? BRAND.goldB : BRAND.red}`}} />
      <span style={gold ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : undefined}>{text}</span>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 24, lineHeight: '34px'}}>
      <bdi style={{color: subColor}}>{sub}</bdi>
      <span style={{fontSize: 15, fontWeight: 600, color: BRAND.meta, border: '1px solid rgba(140,147,163,0.5)', borderRadius: 10, padding: '0 8px', lineHeight: '22px'}}>{illustrative}</span>
    </div>
  </div>
);

const Labels: React.FC<{fmt: FormatId; lang: Lang}> = ({fmt, lang}) => {
  const f = useCurrentFrame();
  const w = labelWindows.find(([a, b]) => f >= a - 2 && f <= b + 14);
  if (!w) return null;
  const alpha = ramp(f, w[0], w[0] + 16, easeOut) * (1 - ramp(f, w[1] - 4, w[1] + 10, easeIn));
  if (alpha <= 0) return null;
  const c = COPY[lang];
  const below: [number, number, number] = [0, -PHONE.height / 2 - 0.1, 0];
  const a = projectOnPhone(f, fmt, leftPose(f), below);
  const b = projectOnPhone(f, fmt, rightPose(f), below);
  const maxY = LAYOUT[fmt].textBottom - 94;
  const y = Math.min(maxY, Math.max(a.y, b.y));
  const miran = leftIsMiran(f);
  const pulse = f > TIMING.flipEnd ? syncPulse(f) : 0.5 + 0.5 * Math.sin(f / 5);
  const lb = miran ? leftEquity(f) : leftBalance(f);
  const lPct = miran ? ((lb - 6850) / 6850) * 100 : ((lb - 10000) / 10000) * 100;
  const rb = rightBalance(f);
  const rPct = ((rb - 10000) / 10000) * 100;
  const pct = (p: number) => `${p >= 0 ? '+' : '−'}${Math.abs(p).toFixed(1)}%`;
  const leftText = miran ? c.labelRight : c.labelLeft;
  return (
    <>
      <Label
        text={leftText}
        sub={`${money0(lb)}  ${pct(lPct)}`}
        subColor={lPct >= 0 ? BRAND.up : BRAND.red}
        x={clampX(a.x, 360)}
        y={y}
        alpha={alpha}
        gold={miran}
        pulse={pulse}
        rtl={lang === 'ar'}
        illustrative={c.illustrative}
      />
      <Label
        text={c.labelRight}
        sub={`${money0(rb)}  ${pct(rPct)}`}
        subColor={BRAND.up}
        x={clampX(b.x, 360)}
        y={y}
        alpha={alpha}
        gold
        pulse={pulse}
        rtl={lang === 'ar'}
        illustrative={c.illustrative}
      />
    </>
  );
};

/** Keep a label's pill inside the centred column. */
const clampX = (x: number, width: number) => Math.min(COLUMN.x + COLUMN.width - width / 2, Math.max(COLUMN.x + width / 2, x));

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
          top: vertical ? 1346 : 1060,
          textAlign: 'center',
          fontFamily: FAMILY,
          fontWeight: 500,
          fontSize: vertical ? 28 : 26,
          lineHeight: 1.6,
          color: 'rgba(245,241,232,0.86)',
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
  const moving = textBlocks(fmt, lang).some((b) => kineticMoving(f, b)) || splitMoving(f);
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
      {hideForImpact ? null : <Labels fmt={fmt} lang={lang} />}
      {hideForImpact ? null : <BlurredText fmt={fmt} lang={lang} />}
      <ImpactBurst fmt={fmt} />
      <EndCard fmt={fmt} lang={lang} />
      <Finish />
      {showSafeZones ? <SafeZones fmt={fmt} /> : null}
    </>
  );
};

