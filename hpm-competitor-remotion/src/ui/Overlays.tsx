// Everything drawn in HTML on top of the 3D: the kinetic lines, the phone labels, the
// time-lapse clock, the impact burst, the end card, and the finish (grain, vignette).
import {CameraMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, COLUMN, COPY, FormatId, LAYOUT, SAFE, TIMING} from '../data';
import {UI} from '../fonts';
import {clamp01, easeIn, easeInOut, easeOut, hash, ramp, springAt} from '../lib/ease';
import {projectOnPhone} from '../lib/projection';
import {PHONE, clockHours, competitorPose, impact, syncPulse, youPose} from '../lib/story';
import {Kinetic, KineticProps, kineticMoving} from './Kinetic';
import {Logo} from './Logo';

const useFmt = (): FormatId => (useVideoConfig().height > 1500 ? 'vertical' : 'feed');

/** All the kinetic text blocks, in order. */
export const textBlocks = (fmt: FormatId): KineticProps[] => {
  const L = LAYOUT[fmt];
  const [g1, g2, g3] = TIMING.gapLines;
  return [
    {lines: COPY.hook, accent: COPY.hookAccent, inAt: TIMING.headlineIn, outAt: TIMING.headlineOut, top: L.textTop, maxSize: L.textSize * 1.12},
    {lines: [COPY.gap[0]], inAt: g1[0], outAt: g1[1], top: L.textTop, maxSize: L.textSize, backing: true},
    {lines: [COPY.gap[1]], inAt: g2[0], outAt: g2[1], top: L.textTop, maxSize: L.textSize, backing: true},
    {lines: [COPY.gap[2]], accent: COPY.gapAccent, inAt: g3[0], outAt: g3[1], top: L.textTop, maxSize: L.textSize, backing: false},
    {lines: COPY.twist, accent: COPY.twistAccent, inAt: TIMING.twistTextIn, outAt: TIMING.twistTextOut, top: L.textTop, maxSize: L.textSize * 0.92, backing: true, stagger: 5},
    {lines: COPY.flip, accent: COPY.flipAccent, inAt: TIMING.flipTextIn, outAt: TIMING.flipTextOut, top: L.textTop, maxSize: L.textSize * 1.12, stagger: 5},
  ];
};

const TextLayer: React.FC<{fmt: FormatId}> = ({fmt}) => (
  <AbsoluteFill>
    {textBlocks(fmt).map((b, i) => (
      <Kinetic key={i} {...b} />
    ))}
  </AbsoluteFill>
);

// ─── Labels pinned under the phones ──────────────────────────────────────────

const labelWindows: [number, number][] = [
  [18, 166],
  [458, 532],
  [930, 1016],
];

const Label: React.FC<{text: string; x: number; y: number; alpha: number; hot: boolean; pulse: number}> = ({text, x, y, alpha, hot, pulse}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, 0) scale(${0.9 + 0.1 * alpha})`,
      opacity: alpha,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 22px 12px 18px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.94)',
      boxShadow: '0 10px 26px rgba(40,25,10,0.12)',
      fontFamily: UI,
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: -0.4,
      color: BRAND.ink,
      whiteSpace: 'nowrap',
    }}
  >
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        background: hot ? BRAND.glow : '#A9AEB3',
        boxShadow: hot ? `0 0 ${10 + 14 * pulse}px ${BRAND.glow}` : undefined,
      }}
    />
    {text}
  </div>
);

const Labels: React.FC<{fmt: FormatId}> = ({fmt}) => {
  const f = useCurrentFrame();
  const w = labelWindows.find(([a, b]) => f >= a - 2 && f <= b + 14);
  if (!w) return null;
  const alpha = ramp(f, w[0], w[0] + 16, easeOut) * (1 - ramp(f, w[1] - 4, w[1] + 10, easeIn));
  if (alpha <= 0) return null;
  const below: [number, number, number] = [0, -PHONE.height / 2 - 0.12, 0];
  const a = projectOnPhone(f, fmt, youPose(f), below);
  const b = projectOnPhone(f, fmt, competitorPose(f), below);
  const maxY = LAYOUT[fmt].textBottom - 64;
  const y = Math.min(maxY, Math.max(a.y, b.y));
  const afterFlip = f > TIMING.flipEnd;
  const pulse = afterFlip ? syncPulse(f) : 0.5 + 0.5 * Math.sin(f / 5);
  return (
    <>
      <Label text={COPY.labelYou} x={clampX(a.x, COPY.labelYou)} y={y} alpha={alpha} hot={afterFlip} pulse={pulse} />
      <Label text={COPY.labelCompetitor} x={clampX(b.x, COPY.labelCompetitor)} y={y} alpha={alpha} hot pulse={pulse} />
    </>
  );
};

/** Keep a label's pill inside the centred column. */
const clampX = (x: number, label: string) => {
  const half = (label.length * 17 + 60) / 2;
  return Math.min(COLUMN.x + COLUMN.width - half, Math.max(COLUMN.x + half, x));
};

// ─── Time-lapse clock chip ───────────────────────────────────────────────────

const ClockChip: React.FC<{fmt: FormatId}> = ({fmt}) => {
  const f = useCurrentFrame();
  const a = TIMING.clockStart - 14;
  const b = TIMING.gapLines[1][1];
  if (f < a - 2 || f > b + 12) return null;
  const inP = springAt(f - a, {freq: 2.2, damping: 0.6});
  const out = ramp(f, b - 6, b + 8, easeIn);
  const h = clockHours(f);
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const minuteAngle = (h % 1) * 360;
  const hourAngle = ((h % 12) / 12) * 360;
  const L = LAYOUT[fmt];
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: L.textTop + L.textSize * 1.35 + 36,
        transform: `translate(-50%, ${(1 - inP) * 30 - out * 20}px) scale(${0.85 + 0.15 * inP})`,
        opacity: clamp01(inP * 2) * (1 - out),
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '18px 34px 18px 22px',
        borderRadius: 999,
        background: '#141210',
        boxShadow: '0 18px 40px rgba(20,12,6,0.3)',
        fontFamily: UI,
        color: '#fff',
      }}
    >
      <svg width={64} height={64} viewBox="-32 -32 64 64">
        <circle r={29} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
        <line x1={0} y1={0} x2={0} y2={-14} stroke="#fff" strokeWidth={4.5} strokeLinecap="round" transform={`rotate(${hourAngle})`} />
        <line x1={0} y1={0} x2={0} y2={-22} stroke={BRAND.orange} strokeWidth={3} strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
        <circle r={3.5} fill="#fff" />
      </svg>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{fontWeight: 800, fontSize: 58, lineHeight: '60px', fontVariantNumeric: 'tabular-nums', letterSpacing: -1}}>
          {`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`}
        </div>
        <div style={{fontWeight: 600, fontSize: 24, color: 'rgba(255,255,255,0.62)'}}>{`${COPY.clockLabel} · 0 new likes`}</div>
      </div>
    </div>
  );
};

// ─── Impact burst ────────────────────────────────────────────────────────────

const ImpactBurst: React.FC<{fmt: FormatId}> = ({fmt}) => {
  const f = useCurrentFrame();
  const k = impact(f);
  if (k <= 0) return null;
  const {width, height} = LAYOUT[fmt];
  const c = projectOnPhone(TIMING.impactAt, fmt, youPose(TIMING.impactAt), [0, 0, 0]);
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
          stroke={i % 3 === 0 ? BRAND.ink : '#FFF8F0'}
          strokeWidth={l.w}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

// ─── End card ────────────────────────────────────────────────────────────────

export const endFade = (f: number) => ramp(f, TIMING.endCardStart, TIMING.endCardStart + 50, easeInOut);

const EndCard: React.FC<{fmt: FormatId}> = ({fmt}) => {
  const raw = useCurrentFrame();
  // Hold: nothing moves in the last second.
  const f = Math.min(raw, TIMING.holdFrom);
  const start = TIMING.endCardStart;
  if (f < start) return null;
  const fade = endFade(f);
  const pepperP = springAt(f - TIMING.logoAt, {freq: 1.6, damping: 0.5});
  const letters = ramp(f, TIMING.logoAt + 10, TIMING.logoAt + 44, easeInOut);
  const logoRise = 1 - easeOut(clamp01((f - TIMING.logoAt) / 30));
  const cta = springAt(f - TIMING.ctaAt, {freq: 2.0, damping: 0.48});
  // A tap on the button: press in, release, a ripple.
  const tapAt = TIMING.ctaAt + 30;
  const press = Math.sin(Math.PI * clamp01((f - tapAt) / 12));
  const ring = ramp(f, tapAt + 4, tapAt + 40, easeOut);
  const L = LAYOUT[fmt];
  const LOGO_W = fmt === 'vertical' ? 780 : 700;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: BRAND.offWhite, opacity: fade}} />
      <div
        style={{
          position: 'absolute',
          left: COLUMN.x + COLUMN.width / 2 - LOGO_W / 2,
          width: LOGO_W,
          top: L.endLogoTop,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: UI,
        }}
      >
        <div style={{transform: `translateY(${logoRise * 40}px)`, opacity: clamp01((f - TIMING.logoAt) / 10)}}>
          <Logo width={LOGO_W} pepper={Math.max(0, pepperP)} letters={letters} red={BRAND.red} ink={BRAND.ink} />
        </div>
        <div style={{position: 'relative', marginTop: fmt === 'vertical' ? 96 : 60}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `4px solid ${BRAND.glow}`,
              transform: `scale(${1 + ring * 0.22}, ${1 + ring * 0.55})`,
              opacity: (1 - ring) * 0.7 * (ring > 0 ? 1 : 0),
            }}
          />
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND.glow}, ${BRAND.red})`,
              color: '#fff',
              fontSize: 62,
              fontWeight: 800,
              letterSpacing: 3,
              padding: '28px 84px',
              borderRadius: 999,
              transform: `scale(${Math.max(0, cta) * (1 - 0.06 * press)})`,
              boxShadow: `0 ${20 - 8 * press}px ${44 - 14 * press}px rgba(230,57,34,0.38)`,
              whiteSpace: 'nowrap',
            }}
          >
            {COPY.cta}
          </div>
        </div>
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
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 90% 75% at 50% 48%, rgba(0,0,0,0) 58%, rgba(60,36,18,0.16) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${grainTile()})`,
          backgroundPosition: `${ox}px ${oy}px`,
          mixBlendMode: 'overlay',
          opacity: 0.075,
        }}
      />
    </>
  );
};

const SafeZones: React.FC = () => {
  const zone = {position: 'absolute', background: 'rgba(0,120,255,0.18)', outline: '2px dashed rgba(0,90,220,0.8)'} as const;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...zone, left: 0, top: 0, right: 0, height: SAFE.top}} />
      <div style={{...zone, left: 0, bottom: 0, right: 0, height: SAFE.bottom}} />
      <div style={{...zone, right: 0, top: SAFE.top, width: SAFE.right, bottom: SAFE.bottom}} />
      <div style={{position: 'absolute', left: COLUMN.x, width: COLUMN.width, top: 0, bottom: 0, outline: '2px dotted rgba(220,0,120,0.6)'}} />
    </AbsoluteFill>
  );
};

/** Motion blur on the type only while it is moving (samples = 1 means a sharp single copy). */
const BlurredText: React.FC<{fmt: FormatId}> = ({fmt}) => {
  const f = useCurrentFrame();
  const moving = textBlocks(fmt).some((b) => kineticMoving(f, b));
  return (
    <CameraMotionBlur samples={moving ? 8 : 1} shutterAngle={180}>
      <TextLayer fmt={fmt} />
    </CameraMotionBlur>
  );
};

export const Overlays: React.FC<{showSafeZones?: boolean}> = ({showSafeZones}) => {
  const fmt = useFmt();
  const f = useCurrentFrame();
  const hideForImpact = impact(f) > 0;
  return (
    <>
      {hideForImpact ? null : <Labels fmt={fmt} />}
      {hideForImpact ? null : <ClockChip fmt={fmt} />}
      {hideForImpact ? null : <BlurredText fmt={fmt} />}
      <ImpactBurst fmt={fmt} />
      <EndCard fmt={fmt} />
      <Finish />
      {showSafeZones && fmt === 'vertical' ? <SafeZones /> : null}
    </>
  );
};
