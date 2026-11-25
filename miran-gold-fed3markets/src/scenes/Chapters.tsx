// S3 Nasdaq (discount timeline), S4 S&P 500 (sector mosaic), S5 Gold (balance scale + real data).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, LANES} from '../brand';
import {HIT, SCENES} from '../timeline';
import {clamp, hexA, push, springAt} from '../motion';
import {ChapterNumeral} from '../components/Charts';
import {GlassCard, IllustrativeTag, SourceLine} from '../components/Chrome';
import {BalanceScale, DiscountTimeline, SectorMosaic} from '../components/Mechanisms';
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

export const SpxChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.spx;
  const cam = push(frame, from, to, 0.04);
  const net = springAt(frame, HIT.netArrow, {damping: 14, stiffness: 160});
  const exitOut = interpolate(frame, [to - 20, to], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sceneFade(frame, from, to), transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
      <Numeral frame={frame} text="02" at={HIT.numeral2} recede={HIT.tilesIn - 10} lane="spx" />
      <div style={{position: 'absolute', left: 140, top: CONTENT_TOP + 44, transform: `scale(${1 - exitOut * 0.1})`, opacity: (1 - exitOut) * (1 - 0.45 * Math.min(1, net))}}>
        <SectorMosaic frame={frame} tilesIn={HIT.tilesIn} redAt={HIT.tilesRed} greenAt={HIT.tilesGreen} />
      </div>
      <IllustrativeTag style={{left: 140, top: CONTENT_TOP}} opacity={interpolate(frame, [HIT.tilesIn + 20, HIT.tilesIn + 32], [0, 1], clamp)} />
      {/* net effect */}
      <div style={{position: 'absolute', left: 0, right: 0, top: CONTENT_TOP + 270, display: 'flex', justifyContent: 'center', opacity: Math.min(1, net * 1.5), transform: `scale(${0.7 + 0.3 * net})`}}>
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

export const GoldChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.gold;
  const cam = push(frame, from, to, 0.04);
  const appear = springAt(frame, HIT.scaleIn, {damping: 18, stiffness: 110});
  // scale rests tipped toward gold, then the bond lands and it swings toward the bond
  const settle = springAt(frame, HIT.scaleIn + 10, {damping: 9, stiffness: 60});
  const swing = springAt(frame, HIT.bondDrop, {damping: 8, stiffness: 70});
  const angle = 7 * Math.min(1, settle) - 17 * swing;
  const bondFall = interpolate(frame, [HIT.bondDrop - 14, HIT.bondDrop], [-420, 0], {...clamp, easing: (t) => t * t});
  const bondOpacity = interpolate(frame, [HIT.bondDrop - 14, HIT.bondDrop - 8], [0, 1], clamp);
  const dxy = springAt(frame, HIT.dxyRise, {damping: 15, stiffness: 90});
  const scaleOut = interpolate(frame, [HIT.chartIn - 16, HIT.chartIn], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: sceneFade(frame, from, to), transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
      <Numeral frame={frame} text="03" at={HIT.numeral3} recede={HIT.scaleIn - 6} lane="gold" />
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
      <div style={{position: 'absolute', left: 140, top: CONTENT_TOP + 90, opacity: 1 - scaleOut}}>
        <BalanceScale frame={frame} angle={angle} bondY={bondFall} bondOpacity={bondOpacity} appear={Math.min(1, appear)} />
      </div>
      <div dir="rtl" style={{position: 'absolute', right: 160, top: CONTENT_TOP + 4, textAlign: 'right', opacity: Math.min(1, dxy * 1.4) * (1 - scaleOut)}}>
        <div style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 30, color: C.text, whiteSpace: 'nowrap'}}>
          <bdi dir="ltr">{data.dxy.label}</bdi> · <span style={{color: '#B9C8F5'}}>{data.dxy.noteAr}</span>
        </div>
        <SourceLine text={data.dxy.source} style={{marginTop: 4}} />
      </div>
      <IllustrativeTag style={{left: 140, top: CONTENT_TOP + 8}} opacity={interpolate(frame, [HIT.scaleIn, HIT.scaleIn + 12], [0, 1], clamp) * (1 - scaleOut)} />
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
