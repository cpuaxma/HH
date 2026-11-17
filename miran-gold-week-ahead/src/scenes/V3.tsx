import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FONT, LAYOUT, NUM, SPRING} from '../brand';
import type {Edition} from '../edition';
import {ArText, Bdi} from '../components/ArabicWordReveal';
import {Coin} from '../components/CauseChain';
import {CountUp, LineChartDraw} from '../components/Charts';
import {HalfClock} from '../components/DayStrip';
import {Seesaw, Tank, Thermometer, thermoY} from '../components/Explainers';
import {Icon} from '../components/Icons';
import {enter, lin} from '../components/motion';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EN = FONT.en;

/* ───────────── shared pieces ───────────── */

/** Flat card on the grid: x 100–980, thin periwinkle border, soft shadow. Rises in. */
export const Card: React.FC<{children: React.ReactNode; top?: number; height?: number; style?: React.CSSProperties}> = ({children, top = 440, height = 520, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: f, fps, config: SPRING.card});
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        left: LAYOUT.marginX,
        top,
        width: LAYOUT.contentW,
        height,
        borderRadius: 30,
        background: C.glassFill,
        border: `1.5px solid ${C.glassBorder}`,
        boxShadow: `inset 0 1px 0 ${C.glassHi}, 0 30px 70px rgba(3,10,40,0.45)`,
        backdropFilter: 'blur(10px)',
        opacity: Math.min(1, t * 1.6),
        transform: `translateY(${(1 - t) * 50}px)`,
        fontFamily: FONT.ar,
        color: C.text,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Small uppercase-style label inside cards (periwinkle). */
const CardLabel: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div style={{fontSize: 26, fontWeight: 700, color: C.peri, letterSpacing: 0.5, ...style}}>
    <ArText text={text} />
  </div>
);

const Chip: React.FC<{text: string; color: string; t: number; filled?: boolean; icon?: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({text, color, t, filled, icon, size = 28, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: `${size * 0.22}px ${size * 0.7}px`,
      borderRadius: 999,
      border: `2px solid ${color}`,
      background: filled ? color : `${color}1A`,
      color: filled ? C.bg0 : color,
      fontSize: size,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      opacity: Math.min(1, t * 1.5),
      transform: `scale(${0.7 + 0.3 * t})`,
      ...style,
    }}
  >
    {icon}
    <ArText text={text} />
  </div>
);

const Arrow: React.FC<{dir: 'up' | 'down'; color: string; size?: number}> = ({dir, color, size = 34}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: dir === 'down' ? 'rotate(180deg)' : undefined, display: 'block'}}>
    <path d="M12 3 L21 13 H15.5 V21 H8.5 V13 H3 Z" fill={color} />
  </svg>
);

/* ───────────── 0 · INTRO ───────────── */
export const V3Intro: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const CX = 540;
  const CY = 690;
  const coin = spring({frame: f + 8, fps, config: {damping: 13, stiffness: 120}});
  const spin = 0.35 + 0.65 * Math.abs(Math.cos(f / 22));
  const ring = interpolate(f, [56, 120], [0, 1], {...CLAMP, easing: EASE.move});
  const R = 300;
  const circ = 2 * Math.PI * R;
  const pos = [
    [330, -120],
    [250, 150],
    [0, -235],
    [-250, 150],
    [-330, -120],
  ];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: CX - 360, top: CY - 360, width: 720, height: 720, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,120,255,0.35) 0%, rgba(70,120,255,0) 65%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.peri} strokeOpacity={0.35} strokeWidth={2} strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform={`rotate(-90 ${CX} ${CY})`} />
        {pos.map(([dx, dy], i) => {
          const at = 14 + i * 8;
          const d = lin(f, at, at + 20);
          const ex = CX + dx * d;
          const ey = CY + dy * d;
          const p = ((f - at - 20) % 50) / 50;
          return (
            <g key={i}>
              <line x1={CX} y1={CY} x2={ex} y2={ey} stroke={C.peri} strokeOpacity={0.45} strokeWidth={2} />
              {[0.33, 0.66].map((k) => (
                <circle key={k} cx={CX + dx * k * d} cy={CY + dy * k * d} r={4} fill={C.peri} opacity={d > k ? 0.8 : 0} />
              ))}
              {f > at + 20 ? <circle cx={CX + dx * (1 - p)} cy={CY + dy * (1 - p)} r={5} fill={C.gold0} opacity={0.9 - p * 0.5} /> : null}
            </g>
          );
        })}
      </svg>
      {e.days.map((d, i) => {
        const t = spring({frame: f - (30 + i * 8), fps, config: SPRING.pill});
        return (
          <div
            key={d.key}
            dir="rtl"
            style={{
              position: 'absolute',
              left: CX + pos[i][0],
              top: CY + pos[i][1],
              transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * t})`,
              opacity: Math.min(1, t * 1.5),
              padding: '8px 22px',
              borderRadius: 999,
              background: 'rgba(12,30,95,0.9)',
              border: `1.5px solid rgba(167,188,254,0.5)`,
              color: C.text,
              fontFamily: FONT.ar,
              fontWeight: 700,
              fontSize: 28,
              whiteSpace: 'nowrap',
            }}
          >
            {d.ar}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: CX - 120, top: CY - 120, transform: `scale(${0.4 + 0.6 * coin}) scaleX(${spin})`, filter: 'drop-shadow(0 0 30px rgba(245,196,81,0.45))'}}>
        <Coin size={240} f={0} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 1 · PRICE ───────────── */
export const V3Price: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = e.price;
  const pct = Math.round(((p.record - p.latest) / p.record) * 100);
  const chip = spring({frame: f - 118, fps, config: SPRING.pill});
  const draw = interpolate(f, [12, 112], [0, 1], {...CLAMP, easing: EASE.move});
  return (
    <AbsoluteFill>
      <Card>
        <div style={{position: 'absolute', top: 34, right: 40, left: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <CardLabel text="الذهب · 2026" />
            <div style={{fontFamily: EN, fontWeight: 800, fontSize: 104, lineHeight: 1.05, color: C.text, ...NUM}}>
              <CountUp from={p.record} to={p.latest} start={56} end={118} prefix="$" />
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10}}>
            <div dir="ltr" style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: EN, fontWeight: 800, fontSize: 84, color: C.red, lineHeight: 1}}>
              <Arrow dir="down" color={C.red} size={56} />
              <CountUp from={0} to={-pct} start={56} end={118} suffix="%" />
            </div>
            <Chip text="من القمة القياسية" color={C.red} t={chip} size={24} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 40, top: 250, direction: 'ltr'}}>
          <LineChartDraw id="v3hook" values={p.path} min={3500} max={5800} width={800} height={230} color={C.red} progress={draw} area={lin(f, 96, 140)} refLine={{value: 4000, label: '$4,000', anchor: 'start'}} strokeWidth={5} />
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ───────────── 2 · THE WEEK ───────────── */
export const V3Week: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const colW = LAYOUT.contentW / 5;
  const ev = (at: number) => spring({frame: f - at, fps, config: SPRING.pill});
  const next = ev(80);
  const slots: Record<string, React.ReactNode> = {
    wed: <Chip text="التضخم" color={C.gold1} t={ev(14)} filled size={26} icon={<Icon name="gauge" size={26} color={C.bg0} t={f} stroke={3} />} />,
    thu: <Chip text="عطلة" color={C.red} t={ev(34)} size={26} />,
    fri: <Chip text="يوم قصير" color={C.peri} t={ev(54)} size={24} />,
  };
  return (
    <AbsoluteFill>
      <Card height={520}>
        <div style={{position: 'absolute', top: 30, right: 40}}>
          <CardLabel text="23 – 27 نوفمبر" />
        </div>
        <div style={{position: 'absolute', top: 96, right: 0, width: LAYOUT.contentW, display: 'flex'}}>
          {e.days.map((d, i) => {
            const hi = d.key === 'wed' ? lin(f, 14, 24) : 0;
            return (
              <div key={d.key} style={{width: colW, height: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderLeft: i < 4 ? `1px solid rgba(167,188,254,0.15)` : undefined, position: 'relative'}}>
                <span style={{fontSize: 34, fontWeight: 700, color: d.holiday && f > 40 ? C.peri : C.text}}>{d.ar}</span>
                <span style={{fontFamily: EN, fontSize: 30, fontWeight: 600, color: C.peri}}>{d.date}</span>
                <div style={{position: 'absolute', top: 128}}>{slots[d.key] ?? <span style={{color: 'rgba(167,188,254,0.35)', fontSize: 30}}>—</span>}</div>
                <div style={{position: 'absolute', bottom: 0, width: '60%', height: 4, borderRadius: 2, background: C.gold1, opacity: hi, transform: `scaleX(${hi})`}} />
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', bottom: 34, left: 40, right: 40, display: 'flex', alignItems: 'center', gap: 16, opacity: Math.min(1, next * 1.5), transform: `translateX(${(1 - next) * -30}px)`}}>
          <span style={{fontSize: 30, fontWeight: 700, color: C.peri}}>وبعدها</span>
          <svg width={70} height={20} style={{display: 'block'}}>
            <line x1={66} y1={10} x2={8} y2={10} stroke={C.peri} strokeWidth={3} strokeLinecap="round" />
            <path d="M18 2 L6 10 L18 18" fill="none" stroke={C.peri} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Chip text="الجمعة 4 ديسمبر: الوظائف" color={C.text} t={next} size={26} icon={<Icon name="briefcase" size={28} color={C.text} t={f} />} />
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ───────────── chapter numerals (thin outline, on the right edge) ───────────── */
export const V3Chapter: React.FC<{n: string}> = ({n}) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 34], [0, 1], {...CLAMP, easing: EASE.move});
  const DASH = 2200;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1000} style={{position: 'absolute', top: 0, left: 0, overflow: 'visible'}}>
        <text
          x={1080 - LAYOUT.marginX}
          y={900}
          textAnchor="end"
          fontFamily={EN}
          fontWeight={500}
          fontSize={430}
          letterSpacing={-10}
          fill="none"
          stroke={C.text}
          strokeWidth={3}
          strokeDasharray={DASH}
          strokeDashoffset={DASH * (1 - draw)}
        >
          {n}
        </text>
        <text x={1080 - LAYOUT.marginX} y={900} textAnchor="end" fontFamily={EN} fontWeight={500} fontSize={430} letterSpacing={-10} fill={C.gold1} opacity={0.12 * lin(f, 30, 50)}>
          {n}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/* ───────────── 4 · WEDNESDAY: thermometer card that evolves ───────────── */
export const V3Wednesday: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const w = e.wednesday;
  const MAX = 5;
  const TH = 440;
  const rise = spring({frame: f - 40, fps, config: {damping: 15, stiffness: 70, mass: 1}});
  const wobbleAmp = 0.6 * lin(f, 196, 220);
  const level = w.value * rise + wobbleAmp * Math.sin((f - 196) / 8);
  const above = spring({frame: f - 132, fps, config: SPRING.pill}) * (1 - lin(f, 190, 200));
  const phaseB = lin(f, 192, 206);
  const also = spring({frame: f - 268, fps, config: SPRING.pill});
  const thermoLeft = 70;
  const thermoTop = 34;
  return (
    <AbsoluteFill>
      <Card>
        {/* thermometer on the left */}
        <div style={{position: 'absolute', left: thermoLeft, top: thermoTop}}>
          <Thermometer level={level} max={MAX} target={w.target} height={TH} f={f} targetIn={enter(f, 18, 30)} hot={lin(f, 118, 140)} />
        </div>
        <div style={{position: 'absolute', left: thermoLeft + 190, top: thermoTop + thermoY(w.target, MAX, TH) - 20, display: 'flex', alignItems: 'center', gap: 10, opacity: enter(f, 22, 20), whiteSpace: 'nowrap'}} dir="rtl">
          <span style={{fontSize: 26, color: C.peri, fontWeight: 700}}>{w.targetLabel}</span>
          <Bdi style={{fontFamily: EN, fontSize: 30, fontWeight: 700}}>{w.target}%</Bdi>
        </div>
        {/* the number on the right: September → October ? */}
        <div style={{position: 'absolute', top: 40, right: 40, width: 420}}>
          <CardLabel text={w.title} />
          <div style={{position: 'relative', height: 200, marginTop: 6}}>
            <div style={{position: 'absolute', inset: 0, opacity: 1 - phaseB}}>
              <div style={{fontFamily: EN, fontWeight: 800, fontSize: 150, lineHeight: 1, color: C.text, ...NUM}}>
                <CountUp from={0} to={w.value} start={40} end={110} decimals={1} suffix="%" />
              </div>
              <div style={{fontSize: 32, fontWeight: 700, color: C.peri, marginTop: 6}}>{w.valueMonth}</div>
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: phaseB, transform: `translateY(${(1 - phaseB) * 20}px)`}}>
              <div style={{fontWeight: 700, fontSize: 160, lineHeight: 1, color: C.gold1, transform: `scale(${1 + 0.04 * Math.sin(f / 6)})`, transformOrigin: 'right center', display: 'inline-block'}}>؟</div>
              <div style={{fontSize: 32, fontWeight: 700, color: C.gold1, marginTop: 6}}>{w.nextMonth}</div>
            </div>
          </div>
          <div style={{marginTop: 36}}>
            <Chip text={w.aboveLabel} color={C.red} t={above} size={30} />
          </div>
        </div>
        <div style={{position: 'absolute', bottom: 32, right: 40}}>
          <Chip text={w.alsoChip} color={C.peri} t={also} size={24} />
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ───────────── 5 · SEESAW card ───────────── */
const DriverChip: React.FC<{label: string; flip: number; inT: number}> = ({label, flip, inT}) => {
  const rot = flip < 0.5 ? flip * 180 : (1 - flip) * 180;
  const up = flip < 0.5;
  const col = up ? C.red : C.gold1;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 24px',
        borderRadius: 999,
        border: `2px solid ${col}`,
        background: `${col}1A`,
        fontSize: 34,
        fontWeight: 700,
        color: C.text,
        opacity: Math.min(1, inT * 1.5),
        transform: `perspective(600px) rotateX(${rot}deg) scale(${0.7 + 0.3 * inT})`,
      }}
    >
      <span>{label}</span>
      <Arrow dir={up ? 'up' : 'down'} color={col} size={30} />
    </div>
  );
};

export const V3Seesaw: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = e.seesaw;
  const chip1 = spring({frame: f - 20, fps, config: SPRING.pill});
  const chip2 = spring({frame: f - 50, fps, config: SPRING.pill});
  const link = enter(f, 36, 16);
  const flip = interpolate(f, [180, 200], [0, 1], {...CLAMP, easing: EASE.move});
  const tiltA = spring({frame: f - 90, fps, config: {damping: 9, stiffness: 80, mass: 1.2}});
  const tiltB = spring({frame: f - 208, fps, config: {damping: 9, stiffness: 80, mass: 1.2}});
  const angle = -13 * tiltA + 26 * tiltB + Math.sin(f / 18) * 0.5;
  const aOp = lin(f, 104, 116) * (1 - lin(f, 182, 192));
  const bOp = lin(f, 222, 234);
  const B = f >= 200;
  return (
    <AbsoluteFill>
      <Card>
        <div style={{position: 'absolute', top: 32, right: 40, display: 'flex', alignItems: 'center', gap: 14}}>
          <DriverChip label={s.driver} flip={flip} inT={chip1} />
          <svg width={60} height={20} style={{opacity: link}}>
            <line x1={56} y1={10} x2={56 - 48 * link} y2={10} stroke={C.peri} strokeWidth={3} strokeLinecap="round" />
            {link > 0.9 ? <path d="M16 2 L4 10 L16 18" fill="none" stroke={C.peri} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </svg>
          <DriverChip label={s.rates} flip={lin(f, 188, 208)} inT={chip2} />
        </div>
        <div style={{position: 'absolute', top: 132, left: 60, transform: 'scale(0.98)', transformOrigin: 'top left'}}>
          <Seesaw
            angle={angle}
            f={f}
            dollarLabel={s.dollar}
            goldLabel={s.gold}
            dollarArrow={{dir: B ? 'down' : 'up', op: B ? bOp : aOp}}
            goldArrow={{dir: B ? 'up' : 'down', color: B ? C.gold1 : C.red, op: B ? bOp : aOp}}
            goldGlow={{color: B ? C.gold1 : C.red, op: B ? bOp : aOp}}
          />
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ───────────── 7 · HOLIDAY card: calendar + clock → liquidity ───────────── */
export const V3Holiday: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = e.holiday;
  const stamp = spring({frame: f - 30, fps, config: {damping: 12, stiffness: 220, mass: 0.7}});
  const friIn = spring({frame: f - 112, fps, config: SPRING.card});
  const clock = interpolate(f, [122, 150], [0, 0.5], {...CLAMP, easing: EASE.move});
  const chip = spring({frame: f - 140, fps, config: SPRING.pill});
  const outA = interpolate(f, [166, 182], [0, 1], {...CLAMP, easing: EASE.exit});
  const inB = interpolate(f, [178, 198], [0, 1], {...CLAMP, easing: EASE.enter});
  const drain = interpolate(f, [205, 262], [0.88, 0.28], {...CLAMP, easing: EASE.move});
  const link = enter(f, 258, 18);
  const lineDraw = interpolate(f, [268, 346], [0, 1], {...CLAMP, easing: EASE.move});
  const vals = Array.from({length: 36}, (_, i) => {
    const amp = i < 12 ? 5 : 5 + (i - 12) * 2.6;
    return 50 + Math.sin(i * 1.9) * amp + Math.sin(i * 0.7) * amp * 0.5;
  });
  const half: React.CSSProperties = {position: 'absolute', top: 0, bottom: 0, width: LAYOUT.contentW / 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18};
  return (
    <AbsoluteFill>
      <Card>
        {f < 186 ? (
          <div style={{position: 'absolute', inset: 0, opacity: 1 - outA, transform: `translateY(${-outA * 40}px)`}}>
            <div style={{...half, right: 0}}>
              <Icon name="calendar" size={170} color={C.peri} t={f} stroke={1.8} />
              <span style={{fontSize: 52, fontWeight: 700}}>{h.thu.day}</span>
              <div
                style={{
                  position: 'absolute',
                  top: 150,
                  padding: '10px 24px',
                  border: `4px solid ${C.red}`,
                  borderRadius: 14,
                  color: C.red,
                  fontSize: 40,
                  fontWeight: 700,
                  background: 'rgba(9,25,73,0.85)',
                  transform: `rotate(-9deg) scale(${2.2 - 1.2 * stamp})`,
                  opacity: Math.min(1, stamp * 2),
                  whiteSpace: 'nowrap',
                }}
              >
                {h.thu.stamp}
              </div>
            </div>
            <div style={{position: 'absolute', top: 60, bottom: 60, left: LAYOUT.contentW / 2, width: 1, background: 'rgba(167,188,254,0.2)'}} />
            <div style={{...half, left: 0, opacity: Math.min(1, friIn * 1.5), transform: `translateY(${(1 - friIn) * 40}px)`}}>
              <HalfClock size={170} color={C.gold1} fill={clock} />
              <span style={{fontSize: 52, fontWeight: 700}}>{h.fri.day}</span>
              <Chip text={h.fri.chip} color={C.gold1} t={chip} size={28} />
            </div>
          </div>
        ) : null}
        {f >= 176 ? (
          <div style={{position: 'absolute', inset: 0, opacity: inB, transform: `translateY(${(1 - inB) * 40}px)`}}>
            <div style={{position: 'absolute', top: 36, right: 70, width: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 34, fontWeight: 700}}>
              <span>{h.liquidityLabel}</span>
              <span style={{opacity: lin(f, 210, 222)}}>
                <Arrow dir="down" color={C.red} size={28} />
              </span>
            </div>
            <div style={{position: 'absolute', top: 96, right: 80}}>
              <Tank level={drain} f={f} width={190} height={380} />
            </div>
            <svg width={110} height={40} style={{position: 'absolute', right: 290, top: 270, overflow: 'visible'}}>
              <line x1={104} y1={20} x2={104 - 90 * link} y2={20} stroke={C.peri} strokeWidth={4} strokeLinecap="round" />
              {link > 0.9 ? <path d="M22 8 L6 20 L22 32" fill="none" stroke={C.peri} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /> : null}
            </svg>
            <div style={{position: 'absolute', top: 36, left: 50, width: 400, textAlign: 'center', fontSize: 34, fontWeight: 700, opacity: lin(f, 262, 276)}}>{h.priceLabel}</div>
            <div style={{position: 'absolute', top: 150, left: 50, direction: 'ltr', opacity: lin(f, 262, 272)}}>
              <LineChartDraw id="v3liq" values={vals} min={0} max={100} width={400} height={260} color={C.gold1} progress={lineDraw} area={0.4 * lin(f, 330, 350)} strokeWidth={5} />
            </div>
          </div>
        ) : null}
      </Card>
    </AbsoluteFill>
  );
};

/* ───────────── 9 · JOBS card ───────────── */
export const V3Jobs: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = e.nfp;
  const q = spring({frame: f - 75, fps, config: {damping: 10, stiffness: 160}});
  const wob = 10 * Math.sin((f - 40) / 15) * lin(f, 40, 80);
  const glowQ = f > 150 ? 0.5 + 0.5 * Math.sin((f - 150) / 6) : 0;
  return (
    <AbsoluteFill>
      <Card>
        <div style={{position: 'absolute', top: 34, right: 40, display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{width: 92, height: 92, borderRadius: 24, border: `1.5px solid ${C.glassBorder}`, background: 'rgba(167,188,254,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="briefcase" size={58} color={C.text} t={f} />
          </div>
          <div>
            <div style={{fontSize: 44, fontWeight: 700, lineHeight: 1.2}}>{n.title}</div>
            <div style={{fontFamily: EN, fontSize: 28, fontWeight: 600, color: C.peri, letterSpacing: 2}}>NFP · NOV</div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 160, left: 60, transform: 'scale(0.95)', transformOrigin: 'top left'}}>
          <Seesaw angle={wob} f={f} dollarLabel={e.seesaw.dollar} goldLabel={e.seesaw.gold} />
          <div
            style={{
              position: 'absolute',
              left: 380 - 56,
              top: 40,
              width: 112,
              height: 112,
              borderRadius: '50%',
              background: 'rgba(9,25,73,0.95)',
              border: `2px solid ${C.gold1}`,
              boxShadow: `0 0 ${18 + glowQ * 26}px rgba(245,196,81,${0.25 + glowQ * 0.3})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT.ar,
              fontWeight: 700,
              fontSize: 72,
              color: C.gold1,
              opacity: Math.min(1, q * 1.5),
              transform: `scale(${q})`,
            }}
          >
            ؟
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

/* ───────────── 10 · COLLAPSE → LOGO ───────────── */
export const V3Collapse: React.FC = () => {
  const f = useCurrentFrame();
  const CY = 700;
  const lineW = interpolate(f, [0, 14, 24, 42], [0, 880, 880, 0], {...CLAMP, easing: EASE.move});
  const lineOp = interpolate(f, [0, 4, 40, 46], [0, 1, 1, 0], CLAMP);
  const ring = interpolate(f, [30, 86], [0, 1], {...CLAMP, easing: EASE.move});
  const logoIn = interpolate(f, [78, 96], [0, 1], {...CLAMP, easing: EASE.enter});
  const r = 150;
  const circ = 2 * Math.PI * r;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - lineW / 2, top: CY + r - 2, width: lineW, height: 4, borderRadius: 2, background: C.gold1, opacity: lineOp}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={540} cy={CY} r={r} fill="none" stroke={C.gold1} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform={`rotate(90 540 ${CY})`} opacity={1 - logoIn * 0.7} />
      </svg>
      <div style={{position: 'absolute', left: 540 - 140, top: CY - 140, width: 280, height: 280, borderRadius: '50%', overflow: 'hidden', opacity: logoIn, transform: `scale(${0.92 + 0.08 * logoIn})`}}>
        <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 11 · OUTRO (EN, left-aligned like the reference) ───────────── */
export const V3Outro: React.FC<{e: Edition}> = ({e}) => {
  const f = useCurrentFrame();
  const o = e.outro;
  const arrow = interpolate(f, [0, 60], [0, 1], {...CLAMP, easing: EASE.move});
  const rise = (at: number) => interpolate(f, [at, at + 20], [0, 1], {...CLAMP, easing: EASE.enter});
  const line = (at: number): React.CSSProperties => ({transform: `translateY(${(1 - rise(at)) * 110}%)`, display: 'inline-block'});
  const mask: React.CSSProperties = {overflow: 'hidden', paddingBottom: 12, marginBottom: -12};
  return (
    <AbsoluteFill>
      {/* Miran Gold ring (from the logo's circle), drawing behind the copy */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={860} cy={980} r={430} fill="none" stroke={C.gold1} strokeOpacity={0.22} strokeWidth={46} strokeDasharray={2 * Math.PI * 430} strokeDashoffset={2 * Math.PI * 430 * (1 - arrow)} transform={`rotate(${-120 + f * 0.15} 860 980)`} strokeLinecap="round" />
        <circle cx={860} cy={980} r={330} fill="none" stroke={C.peri} strokeOpacity={0.14} strokeWidth={3} strokeDasharray={2 * Math.PI * 330} strokeDashoffset={2 * Math.PI * 330 * (1 - arrow)} transform={`rotate(${60 - f * 0.1} 860 980)`} />
      </svg>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 760, fontFamily: EN, color: C.text}}>
        <div style={{...mask}}>
          <div style={{...line(4), alignItems: 'center', gap: 22, display: 'flex'}}>
            <div style={{width: 96, height: 96, borderRadius: '50%', overflow: 'hidden'}}>
              <Img src={staticFile('logo.png')} style={{width: '100%', height: '100%'}} />
            </div>
            <span style={{fontWeight: 600, fontSize: 66, letterSpacing: 1}}>Miran Gold</span>
          </div>
        </div>
        <div style={{...mask, marginTop: 40}}>
          <div style={{...line(20), fontWeight: 700, fontSize: 92, lineHeight: 1.12}}>{o.l1}</div>
        </div>
        <div style={mask}>
          <div style={{...line(34), fontWeight: 700, fontSize: 92, lineHeight: 1.12, color: C.gold1}}>{o.l2}</div>
        </div>
        <div style={{...mask, marginTop: 34}}>
          <div style={{...line(56), display: 'flex', alignItems: 'center', gap: 14, fontWeight: 600, fontSize: 40}}>
            <Icon name="plane" size={42} color={C.text} stroke={2.6} />
            {o.cta}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: LAYOUT.disclaimerY, left: LAYOUT.marginX, fontFamily: EN, fontSize: 27, fontWeight: 500, color: C.peri, opacity: 0.9 * lin(f, 70, 90)}}>{o.disclaimer}</div>
    </AbsoluteFill>
  );
};
