// S3 Nasdaq (discount timeline), S4 S&P 500 (sector mosaic), S5 Gold (balance scale + real data).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, LANES} from '../brand';
import {HIT, SCENES} from '../timeline';
import {clamp, hexA, push, springAt} from '../motion';
import {ChapterNumeral, CountUp, LineChartDraw} from '../components/Charts';
import {GlassCard, IllustrativeTag, SourceLine} from '../components/Chrome';
import {BalanceScale, Coin, DiscountTimeline, SectorMosaic, TILES} from '../components/Mechanisms';
import {GoldParticles} from '../components/Particles';
import data from '../data.json';

const CONTENT_TOP = 676;

/** Numeral: draws on centre-stage, fills, then recedes into the depth behind the chapter's content. */
const Numeral: React.FC<{frame: number; text: string; at: number; recede: number; lane: 'nasdaq' | 'spx' | 'gold'}> = ({frame, text, at, recede, lane}) => {
  const draw = interpolate(frame, [at, at + 54], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 2)});
  const fill = interpolate(frame, [at + 44, at + 70], [0, 1], clamp);
  const back = interpolate(frame, [recede, recede + 30], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const drift = Math.sin(frame / 40) * 6;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 690 - back * 40,
        display: 'flex',
        justifyContent: 'center',
        opacity: 1 - back * 0.86,
        transform: `translateY(${drift}px) scale(${1 - back * 0.25})`,
        filter: back > 0.02 ? `blur(${back * 4}px)` : undefined,
      }}
    >
      <ChapterNumeral id={text} text={text} color={LANES[lane].color} gradient={lane === 'gold'} draw={draw} fill={fill} />
    </div>
  );
};

const sceneFade = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, from + 12, to - 14, to], [0, 1, 1, 0], clamp);

export const NasdaqChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.nasdaq;
  const cam = push(frame, from, to, 0.04);
  const tl = springAt(frame, HIT.coinsIn - 6, {damping: 18, stiffness: 120});
  // match-cut out: the camera flies into the far (2035) coin
  const fly = interpolate(frame, [to - 22, to], [0, 1], {...clamp, easing: (t) => t * t * t});
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sceneFade(frame, from + 10, to), transform: `scale(${cam * (1 + fly * 5)})`, transformOrigin: `184px ${CONTENT_TOP + 110 + 236}px`, filter: fly > 0.05 ? `blur(${fly * 8}px)` : undefined}}>
      <Numeral frame={frame} text="01" at={HIT.numeral1} recede={HIT.coinsIn - 20} lane="nasdaq" />
      <div style={{position: 'absolute', left: 140, top: CONTENT_TOP + 110, opacity: Math.min(1, tl * 1.5), transform: `translateY(${(1 - tl) * 50}px)`}}>
        <DiscountTimeline frame={frame} coinsIn={HIT.coinsIn} discountAt={HIT.discount} />
      </div>
      <IllustrativeTag style={{left: 140, top: CONTENT_TOP}} opacity={interpolate(frame, [HIT.coinsIn, HIT.coinsIn + 12], [0, 1], clamp)} />
    </div>
  );
};

/** Match-cut: the far coin from chapter 01 flips into the first sector tile, which settles into the mosaic. */
const SeedTile: React.FC<{frame: number}> = ({frame}) => {
  const f0 = HIT.dive2;
  if (frame >= HIT.tilesIn + 2) return null;
  const tech = TILES.find((t) => t.key === 'tech')!;
  const end = {x: 140 + tech.x, y: CONTENT_TOP + 44 + tech.y, w: tech.w, h: tech.h};
  const move = interpolate(frame, [f0, f0 + 14], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const flip = interpolate(frame, [f0 + 4, f0 + 22], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
  const settle = interpolate(frame, [HIT.tilesIn - 30, HIT.tilesIn], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
  const size = 190 + (240 - 190) * move;
  const cx = 184 + (540 - 184) * move;
  const cy = 1022 + (950 - 1022) * move;
  const rot = flip < 0.5 ? flip * 180 : (flip - 1) * 180;
  const box = {
    x: cx - size / 2 + (end.x - (cx - size / 2)) * settle,
    y: cy - size / 2 + (end.y - (cy - size / 2)) * settle,
    w: size + (end.w - size) * settle,
    h: size + (end.h - size) * settle,
  };
  return (
    <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, perspective: 900}}>
      <div style={{position: 'absolute', inset: 0, transform: `rotateY(${rot}deg)`}}>
        {flip < 0.5 ? (
          <Coin size={box.w} />
        ) : (
          <div dir="rtl" style={{position: 'absolute', inset: 0, borderRadius: 18, background: hexA('#13234F', 0.85), border: '1.5px solid #3A4C7A', boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 ${40 * (1 - settle)}px ${hexA(C.spx, 0.5)}`, padding: '16px 20px', boxSizing: 'border-box'}}>
            <div style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 40, color: C.text}}>تقنية</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SpxChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.spx;
  const cam = push(frame, from, to, 0.04);
  const net = springAt(frame, HIT.netArrow, {damping: 14, stiffness: 160});
  const netOut = interpolate(frame, [FALL_AT - 10, FALL_AT + 4], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sceneFade(frame, from - 6, to), transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
      <Numeral frame={frame} text="02" at={HIT.numeral2} recede={HIT.tilesIn - 10} lane="spx" />
      <div style={{position: 'absolute', left: 140, top: CONTENT_TOP + 44, opacity: 1 - 0.45 * Math.min(1, net) * (1 - netOut)}}>
        <SectorMosaic frame={frame} tilesIn={HIT.tilesIn} redAt={HIT.tilesRed} greenAt={HIT.tilesGreen} seedKey="tech" seedUntil={HIT.tilesIn} fallAt={FALL_AT} />
      </div>
      <SeedTile frame={frame} />
      <IllustrativeTag style={{left: 140, top: CONTENT_TOP}} opacity={interpolate(frame, [HIT.tilesIn + 20, HIT.tilesIn + 32], [0, 1], clamp) * (1 - netOut)} />
      {/* net effect */}
      <div style={{position: 'absolute', left: 0, right: 0, top: CONTENT_TOP + 270, display: 'flex', justifyContent: 'center', opacity: Math.min(1, net * 1.5) * (1 - netOut), transform: `scale(${0.7 + 0.3 * net})`}}>
        <GlassCard style={{position: 'relative', padding: '18px 34px', display: 'flex', alignItems: 'center', gap: 18, border: `1px solid ${hexA(C.spx, 0.5)}`}}>
          <div dir="rtl" style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 34, color: C.text, whiteSpace: 'nowrap'}}>
            المحصلة: <span style={{color: C.spx}}>هبوط أهدأ</span>
          </div>
          <div style={{fontFamily: FONT.en, fontWeight: 700, fontSize: 36, color: C.red}}>↓</div>
        </GlassCard>
      </div>
    </div>
  );
};

/** Tiles fall like weights; their gold particles stream into the gold bar on the scale's right pan. */
const FALL_AT = 1440;
export const BAR_CENTER = {x: 810, y: 998};
export const TileToGold: React.FC = () => {
  const frame = useCurrentFrame();
  const sources = TILES.map((t) => ({x: 140 + t.x + t.w / 2, y: CONTENT_TOP + 44 + t.y + t.h / 2 + 120}));
  return <GoldParticles frame={frame} count={70} start={FALL_AT + 6} dur={42} sources={sources} target={{x: BAR_CENTER.x, y: BAR_CENTER.y, w: 170, h: 60}} seed={7} />;
};

const SCALE_IN = 1486;
const DAYS = 27; // 29 Oct → 25 Nov
const dayOf = (d: string) => (Date.parse(d) - Date.parse('2026-10-29')) / 864e5;
const LABELLED = new Set(['2026-10-29', '2026-11-18', '2026-11-25']);

const GoldChart: React.FC<{frame: number}> = ({frame}) => {
  const inP = springAt(frame, HIT.chartIn, {damping: 17, stiffness: 120});
  const [d0, d1] = HIT.chartDraw;
  const draw = interpolate(frame, [d0, d1], [0, 1], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
  const area = interpolate(frame, [d1 - 20, d1 + 10], [0, 1], clamp);
  const landed = frame >= HIT.chartLand;
  const pop = landed && frame < HIT.chartLand + 2 ? 1.14 : landed && frame < HIT.chartLand + 4 ? 1.06 : 1;
  const pts = data.goldPath.points.map((p) => ({label: LABELLED.has(p.date) ? p.label : '', value: p.value, t: dayOf(p.date) / DAYS}));
  const out = interpolate(frame, [SCENES.gold[1] - 18, SCENES.gold[1]], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 140, top: 680, width: 800, height: 570, perspective: 1600, opacity: Math.min(1, inP * 1.5) * (1 - out)}}>
      <GlassCard style={{inset: 0, transform: `translateY(${(1 - inP) * 80}px) rotateX(${4 + (1 - inP) * 14}deg)`}}>
        <div dir="rtl" style={{position: 'absolute', top: 30, right: 40, left: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <div style={{fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 26, color: C.slate}}>الذهب · السعر الفوري</div>
            <div style={{marginTop: 4, transform: `scale(${pop})`, transformOrigin: '100% 50%'}}>
              {landed ? (
                <bdi dir="ltr" style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 84, color: C.red, textShadow: `0 0 28px ${hexA(C.red, 0.5)}`}}>
                  {data.goldPath.headline}
                </bdi>
              ) : (
                <CountUp frame={frame} from={data.goldPath.points[0].value} to={data.goldPath.points[data.goldPath.points.length - 1].value} start={d0} dur={d1 - d0} prefix="$" size={84} color={C.text} />
              )}
            </div>
          </div>
          <div style={{fontFamily: FONT.en, fontWeight: 600, fontSize: 22, color: C.slate, marginTop: 8}}>
            <bdi dir="ltr">XAU/USD</bdi>
          </div>
        </div>
        <div style={{position: 'absolute', left: 60, top: 200}}>
          <LineChartDraw points={pts} w={680} h={260} min={3350} max={4150} draw={draw} area={area} color={C.gold2} refLine={{value: 3500, label: '$3,500', opacity: interpolate(frame, [d1 - 30, d1 - 10], [0, 1], clamp)}} />
        </div>
        <SourceLine text={data.goldPath.source} style={{position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center'}} opacity={interpolate(frame, [HIT.chartLand, HIT.chartLand + 14], [0, 1], clamp)} />
      </GlassCard>
    </div>
  );
};

export const GoldChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.gold;
  const cam = push(frame, from, to, 0.04);
  const appear = springAt(frame, SCALE_IN, {damping: 18, stiffness: 110});
  // scale rests tipped toward gold, then the bond lands and it swings toward the bond
  const settle = springAt(frame, SCALE_IN + 14, {damping: 9, stiffness: 60});
  const swing = springAt(frame, HIT.bondDrop, {damping: 8, stiffness: 70});
  const angle = 7 * Math.min(1, settle) - 17 * swing;
  const bondFall = interpolate(frame, [HIT.bondDrop - 14, HIT.bondDrop], [-420, 0], {...clamp, easing: (t) => t * t});
  const bondOpacity = interpolate(frame, [HIT.bondDrop - 14, HIT.bondDrop - 8], [0, 1], clamp);
  const barOpacity = interpolate(frame, [1478, 1492], [0, 1], clamp);
  const dxy = springAt(frame, HIT.dxyRise, {damping: 15, stiffness: 90});
  const scaleOut = interpolate(frame, [HIT.chartIn - 16, HIT.chartIn], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sceneFade(frame, from, to + 40), transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
      <Numeral frame={frame} text="03" at={HIT.numeral3} recede={1500} lane="gold" />
      {/* DXY arrow rising behind the bar */}
      <div style={{position: 'absolute', left: 640, top: CONTENT_TOP + 40 + (1 - dxy) * 260, opacity: Math.min(0.9, dxy) * (1 - scaleOut)}}>
        <svg width={220} height={420} viewBox="0 0 220 420">
          <defs>
            <linearGradient id="dxyArrow" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#9FB4F0" stopOpacity={0} />
              <stop offset="100%" stopColor="#9FB4F0" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <path d="M110 0 L210 120 L150 120 L150 420 L70 420 L70 120 L10 120 Z" fill="url(#dxyArrow)" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 140, top: CONTENT_TOP + 90, opacity: 1 - scaleOut, transform: `scale(${1 - scaleOut * 0.08})`}}>
        <BalanceScale frame={frame} angle={angle} bondY={bondFall} bondOpacity={bondOpacity} appear={Math.min(1, appear)} barOpacity={barOpacity} />
      </div>
      <div dir="rtl" style={{position: 'absolute', right: 160, top: CONTENT_TOP + 4, textAlign: 'right', opacity: Math.min(1, dxy * 1.4) * (1 - scaleOut)}}>
        <div style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 30, color: C.text, whiteSpace: 'nowrap'}}>
          <bdi dir="ltr">{data.dxy.label}</bdi> · <span style={{color: '#B9C8F5'}}>{data.dxy.noteAr}</span>
        </div>
        <SourceLine text={data.dxy.source} style={{marginTop: 4}} />
      </div>
      <IllustrativeTag style={{left: 140, top: CONTENT_TOP + 8}} opacity={interpolate(frame, [SCALE_IN, SCALE_IN + 12], [0, 1], clamp) * (1 - scaleOut)} />
      {frame >= HIT.chartIn - 4 && <GoldChart frame={frame} />}
    </div>
  );
};

export const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.recap;
  const tag = springAt(frame, from + 20, {damping: 16, stiffness: 150});
  const src = interpolate(frame, [HIT.recapRows[2] + 10, HIT.recapRows[2] + 24], [0, 1], clamp);
  const o = interpolate(frame, [to - 14, to], [1, 0], clamp);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 628, display: 'flex', justifyContent: 'center', opacity: Math.min(1, tag * 1.5) * o, transform: `translateY(${(1 - tag) * -20}px)`}}>
        <div dir="rtl" style={{padding: '8px 26px', borderRadius: 999, border: `1px solid ${hexA(C.gold2, 0.45)}`, background: hexA(C.bg1, 0.7), fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 28, color: C.gold1}}>
          رد الفعل المعتاد — ليس قاعدة
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1172, display: 'flex', justifyContent: 'center', opacity: src * o}}>
        <SourceLine text={data.board.source} />
      </div>
    </>
  );
};
