// Everything drawn in HTML on top of the 3D: the kinetic lines, the pillar splits, the phone
// labels, the impact burst, the end card, and the finish (grain, vignette).
import {measureText} from '@remotion/layout-utils';
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLUMN, COPY, FormatId, GOLD_GRADIENT, LAYOUT, LEFT, Lang, RIGHT, SAFE, TIMING, UPDATE} from '../data';
import {FAMILY} from '../fonts';
import {clamp01, easeIn, easeInOut, easeOut, hash, ramp, springAt} from '../lib/ease';
import {projectOnPhone} from '../lib/projection';
import {PHONE, focus, impact, leftPose, rightPose} from '../lib/story';
import {Kinetic, KineticProps, glass} from './Kinetic';

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
// big enough to read without looking at the screens at all. Frosted glass; when a balance
// changes, only the digits that change roll over (each one rises, blurs and swaps).

const money0 = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const pctStr = (p: number) => `${p > 0.05 ? '+' : p < -0.05 ? '−' : ''}${Math.abs(p).toFixed(Math.abs(p) >= 10 ? 0 : 1)}%`;

const widthCache = new Map<string, number>();
const charW = (ch: string, size: number, weight: number) => {
  if (!ch) return 0;
  const k = `${ch}|${size}|${weight}`;
  let w = widthCache.get(k);
  if (w === undefined) {
    w = measureText({text: ch, fontFamily: FAMILY, fontSize: size, fontWeight: String(weight)}).width;
    widthCache.set(k, w);
  }
  return w;
};

/** A number that swaps from `from` to `to` at frame `at`: changed digits roll, right to left. */
export const NumberSwap: React.FC<{from: string; to: string; at: number; size: number; weight?: number; lineH: number}> = ({from, to, at, size, weight = 700, lineH}) => {
  const f = useCurrentFrame();
  const n = Math.max(from.length, to.length);
  const A = Array.from({length: n}, (_, i) => from[i - (n - from.length)] ?? '');
  const B = Array.from({length: n}, (_, i) => to[i - (n - to.length)] ?? '');
  return (
    <span style={{display: 'inline-flex', direction: 'ltr', fontSize: size, fontWeight: weight, lineHeight: `${lineH}px`, height: lineH}}>
      {A.map((a, i) => {
        const b = B[i];
        if (a === b) return <span key={i}>{a}</span>;
        const fromRight = n - 1 - i;
        const p = Math.min(1.08, Math.max(0, springAt(f - (at + fromRight * 2.2), {freq: 1.8, damping: 0.78})));
        const k = clamp01(p);
        const w = charW(a, size, weight) + (charW(b, size, weight) - charW(a, size, weight)) * k;
        const em = size * 0.62;
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', width: w, height: lineH}}>
            {k < 1 && a ? (
              <span style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', opacity: 1 - k, transform: `translateY(${-k * em}px)`, filter: k > 0.02 ? `blur(${(k * 7).toFixed(2)}px)` : undefined}}>{a}</span>
            ) : null}
            {k > 0 && b ? (
              <span style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', opacity: k, transform: `translateY(${(1 - p) * em}px)`, filter: k < 0.98 ? `blur(${((1 - k) * 7).toFixed(2)}px)` : undefined}}>{b}</span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
};

const Mark: React.FC<{good: boolean; size: number}> = ({good, size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{flex: 'none'}}>
    <defs>
      <linearGradient id="mk-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={BRAND.goldB} />
        <stop offset="1" stopColor={BRAND.goldA} />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="19" fill={good ? 'url(#mk-gold)' : BRAND.red} />
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
  start: number;
  final: number;
  changeAt: number;
  x: number;
  y: number;
  alpha: number;
  enter: number;
  scale: number;
  rtl: boolean;
  illustrative: string;
  dim: number;
};

const Board: React.FC<BoardProps> = ({label, good, start, final, changeAt, x, y, alpha, enter, scale, rtl, illustrative, dim}) => {
  const f = useCurrentFrame();
  const changed = ramp(f, changeAt, changeAt + 16, easeOut);
  const pct = ((final - start) / start) * 100;
  const up = pct > 0;
  const tone = up ? BRAND.up : BRAND.red;
  const flash = f >= changeAt ? Math.exp(-(f - changeAt) / 16) : 0;
  const badge = clamp01(springAt(f - (changeAt + 8), {freq: 2.0, damping: 0.62}));
  const pop = 1 + 0.05 * Math.sin(Math.PI * clamp01((f - changeAt) / 18));
  const numColor = mix(BRAND.text, tone, changed);
  const edge = good ? 'rgba(243,210,122,0.55)' : 'rgba(255,107,107,0.5)';
  const glow = good ? `rgba(212,162,76,${0.22 + 0.4 * flash})` : `rgba(255,77,77,${0.18 + 0.5 * flash})`;
  const tagSide: React.CSSProperties = rtl ? {left: 22} : {right: 22};
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 372,
        transform: `translate(-50%, ${(1 - enter) * 40}px) scale(${scale * (0.94 + 0.06 * enter) * (1 - 0.04 * (1 - dim)) * pop})`,
        transformOrigin: 'center top',
        opacity: alpha * (0.45 + 0.55 * dim),
        filter: enter < 0.98 ? `blur(${((1 - enter) * 10).toFixed(2)}px)` : undefined,
        fontFamily: FAMILY,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '14px 18px 14px',
          borderRadius: 34,
          ...glass(good ? 'rgba(40,31,14,0.5)' : 'rgba(46,12,16,0.5)', edge),
          boxShadow: `0 22px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 ${30 + 50 * flash}px ${glow}`,
        }}
      >
        <div dir={rtl ? 'rtl' : 'ltr'} style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 34, lineHeight: '50px', whiteSpace: 'nowrap'}}>
          <Mark good={good} size={36} />
          <span style={good ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {color: '#FF8080'}}>{label}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, direction: 'ltr', whiteSpace: 'nowrap', color: numColor, height: 74}}>
          <NumberSwap from={money0(start)} to={money0(final)} at={changeAt} size={60} lineH={74} />
          {badge > 0 ? (
            <span
              style={{
                fontWeight: 700,
                fontSize: 26,
                lineHeight: '38px',
                padding: '0 12px',
                borderRadius: 19,
                color: tone,
                background: up ? 'rgba(63,208,138,0.16)' : 'rgba(255,77,77,0.16)',
                border: `1.5px solid ${up ? 'rgba(63,208,138,0.45)' : 'rgba(255,77,77,0.45)'}`,
                opacity: badge,
                transform: `scale(${0.6 + 0.4 * badge})`,
                filter: badge < 0.98 ? `blur(${((1 - badge) * 6).toFixed(2)}px)` : undefined,
              }}
            >
              {pctStr(pct)}
            </span>
          ) : null}
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
            color: '#C3C8D3',
            background: 'rgba(18,24,38,0.92)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {illustrative}
        </div>
      </div>
    </div>
  );
};

const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};

const Boards: React.FC<{fmt: FormatId; lang: Lang}> = ({fmt, lang}) => {
  const f = useCurrentFrame();
  if (f < TIMING.boardsIn - 2 || f > TIMING.boardsOut + 20) return null;
  const out = 1 - ramp(f, TIMING.boardsOut - 4, TIMING.boardsOut + 14, easeIn);
  if (out <= 0) return null;
  const c = COPY[lang];
  const L = LAYOUT[fmt];
  const below: [number, number, number] = [0, -PHONE.height / 2, 0];
  const a = projectOnPhone(f, fmt, leftPose(f), below);
  const b = projectOnPhone(f, fmt, rightPose(f), below);
  const half = 186 * L.boardScale;
  const clampX = (x: number, lo: number, hi: number) => Math.min(hi - half, Math.max(lo + half, x));
  const enter = (d: number) => clamp01(springAt(f - (TIMING.boardsIn + d), {freq: 1.5, damping: 0.85}));
  return (
    <>
      <Board
        label={c.labelLeft}
        good={false}
        start={LEFT.startBalance}
        final={LEFT.finalBalance}
        changeAt={LEFT.marginCallAt}
        x={clampX(a.x, COLUMN.x - 40, 534)}
        y={L.boardTop}
        alpha={out}
        enter={enter(0)}
        scale={L.boardScale}
        rtl={lang === 'ar'}
        illustrative={c.illustrative}
        dim={focus('left', f)}
      />
      <Board
        label={c.labelRight}
        good
        start={RIGHT.startBalance}
        final={RIGHT.finalBalance}
        changeAt={UPDATE.closedAt}
        x={clampX(b.x, 546, COLUMN.x + COLUMN.width + 10)}
        y={L.boardTop}
        alpha={out}
        enter={enter(6)}
        scale={L.boardScale}
        rtl={lang === 'ar'}
        illustrative={c.illustrative}
        dim={focus('right', f)}
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
              filter: logo < 0.98 ? `blur(${(Math.max(0, 1 - logo) * 18).toFixed(2)}px)` : undefined,
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
            filter: word < 0.98 ? `blur(${(Math.max(0, 1 - word) * 12).toFixed(2)}px)` : undefined,
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
          filter: disc < 0.98 ? `blur(${((1 - disc) * 8).toFixed(2)}px)` : undefined,
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

export const Overlays: React.FC<{showSafeZones?: boolean; lang: Lang}> = ({showSafeZones, lang}) => {
  const fmt = useFmt();
  const f = useCurrentFrame();
  const hideForImpact = impact(f) > 0;
  return (
    <>
      {hideForImpact ? null : <Boards fmt={fmt} lang={lang} />}
      {hideForImpact ? null : <TextLayer fmt={fmt} lang={lang} />}
      <ImpactBurst fmt={fmt} />
      <EndCard fmt={fmt} lang={lang} />
      <Finish />
      {showSafeZones ? <SafeZones fmt={fmt} /> : null}
    </>
  );
};

