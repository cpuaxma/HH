// S1: the rate gauge card, which flips (rotateY) to reveal the December-odds bar.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, SPRING} from '../brand';
import {HIT, SCENES} from '../timeline';
import {clamp, push, springAt} from '../motion';
import {GlassCard, SourceLine} from '../components/Chrome';
import {CountUp, ProbabilityBar, RateGauge} from '../components/Charts';
import data from '../data.json';

const CARD = {x: 140, y: 560, w: 800, h: 660};

const Title: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div dir="rtl" style={{fontFamily: FONT.ar, fontWeight: FONT.arMedium, fontSize: 30, color: C.slate, textAlign: 'center'}}>
    {children}
  </div>
);

export const Context: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = SCENES.context;
  const enter = springAt(frame, HIT.gaugeIn, SPRING.card);
  const tilt = 4 + (1 - enter) * 16; // settles to a 4° rest tilt
  const flipA = interpolate(frame, [HIT.cardFlip, HIT.cardFlip + 16], [0, 90], {...clamp, easing: (t) => t * t});
  const flipB = springAt(frame, HIT.cardFlip + 16, {damping: 15, stiffness: 150});
  const showBack = frame >= HIT.cardFlip + 16;
  const rotY = showBack ? -90 * (1 - flipB) : flipA;
  const exit = interpolate(frame, [to - 14, to], [0, 1], clamp);
  const cam = push(frame, from, to, 0.04);

  // needle: spring from 0 to the middle of the 3.75–4.00 band
  const needleP = springAt(frame, HIT.needleStart, {damping: 11, stiffness: 90});
  const needle = 3.875 * Math.min(1.08, needleP);
  const band = interpolate(frame, [HIT.needleLand - 4, HIT.needleLand + 10], [0, 1], clamp);

  const fill = interpolate(frame, [HIT.oddsFillStart, HIT.oddsLand], [0, data.decHikeOdds.value / 100], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 2.2)});
  const tickFlash = frame >= HIT.oddsFillStart && frame <= HIT.oddsLand ? ((frame - HIT.oddsFillStart) % 6 < 2 ? 1 : 0) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: '50% 45%', opacity: 1 - exit, filter: exit > 0 ? `blur(${exit * 10}px)` : undefined}}>
      <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, perspective: 1600}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: Math.min(1, enter * 1.6),
            transform: `translateY(${(1 - enter) * 120}px) rotateX(${tilt}deg) rotateY(${rotY}deg) scale(${0.9 + 0.1 * enter})`,
            transformStyle: 'preserve-3d',
          }}
        >
          <GlassCard style={{inset: 0}}>
            {!showBack ? (
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 44}}>
                <Title>نطاق سعر الفائدة الفيدرالية</Title>
                <div style={{marginTop: 30}}>
                  <RateGauge needle={needle} band={band} low={data.fedRange.low} high={data.fedRange.high} />
                </div>
                <div style={{position: 'relative', marginTop: 6}}>
                  <CountUp frame={frame} to={data.fedRange.low} start={HIT.needleStart} dur={HIT.needleLand - HIT.needleStart} decimals={2} suffix="%" size={72} gold sheenFrom={HIT.needleLand + 4} />
                  <span style={{fontFamily: FONT.ar, fontWeight: 700, fontSize: 72, color: '#D4AF37', margin: '0 10px'}}>–</span>
                  <CountUp frame={frame} to={data.fedRange.high} start={HIT.needleStart} dur={HIT.needleLand - HIT.needleStart} decimals={2} suffix="%" size={72} gold sheenFrom={HIT.needleLand + 4} />
                </div>
                <SourceLine text={data.fedRange.source} style={{position: 'absolute', bottom: 30}} opacity={interpolate(frame, [HIT.needleLand + 10, HIT.needleLand + 24], [0, 1], clamp)} />
              </div>
            ) : (
              <div dir="rtl" style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 54}}>
                <Title>
                  احتمال رفع <bdi dir="ltr">+25bp</bdi> في ديسمبر
                </Title>
                <div style={{marginTop: 70, display: 'flex', alignItems: 'baseline', gap: 18}}>
                  <span style={{fontFamily: FONT.ar, fontWeight: FONT.arBold, fontSize: 64, color: C.text}}>أكثر من</span>
                  <span style={{position: 'relative'}}>
                    <CountUp frame={frame} to={data.decHikeOdds.threshold} start={HIT.oddsFillStart} dur={HIT.oddsLand - HIT.oddsFillStart} suffix="%" size={150} gold sheenFrom={HIT.oddsLand + 4} />
                  </span>
                </div>
                <div style={{marginTop: 70}}>
                  <ProbabilityBar fill={fill} w={640} threshold={data.decHikeOdds.threshold} tickFlash={frame > HIT.oddsLand ? 0.35 + 0.35 * Math.sin((frame - HIT.oddsLand) / 7) : tickFlash} />
                </div>
                <div style={{width: 640, display: 'flex', justifyContent: 'space-between', marginTop: 18, fontFamily: FONT.en, fontWeight: 600, fontSize: 20, color: C.slate}}>
                  <bdi dir="ltr">0%</bdi>
                  <bdi dir="ltr">100%</bdi>
                </div>
                <SourceLine text={data.decHikeOdds.source} style={{position: 'absolute', bottom: 30}} opacity={interpolate(frame, [HIT.oddsLand + 6, HIT.oddsLand + 20], [0, 1], clamp)} />
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
