import {CameraMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {smoothSpring} from '../anim';
import {Cam, rayCam, samCam} from '../camera';
import {Ray} from '../characters/Ray';
import {Sam} from '../characters/Sam';
import {EVENTS, marketTime} from '../data/price';
import {COPY, Lang} from '../i18n';
import {colors, ease, layout} from '../theme';
import {BEAT, RAY, SAM} from '../timeline';
import {ChartLine, Level, Marker} from './ChartLine';
import {LightStreak} from './LightStreak';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const P = layout.panel;

// Screens power on as both traders turn to them
const screenOn = (f: number) => interpolate(f, [BEAT.turnToScreens - 4, BEAT.turnToScreens + 14], [0.12, 1], {...clamp, easing: ease.enter});

const RayScreen: React.FC<{f: number; lang: Lang}> = ({f, lang}) => {
  const c = COPY[lang];
  // Ray's chart: red-tinted, no levels, a single BUY marker (and where he closed)
  const markers: Marker[] = [
    {t: EVENTS.buy.m, price: EVENTS.buy.price, label: 'BUY', color: '#2F9E6E', kind: 'buy', appear: smoothSpring(f, BEAT.slamImpact, 14)},
    {t: EVENTS.close.m, price: EVENTS.close.price, label: c.closed, color: colors.red, kind: 'closed', appear: smoothSpring(f, EVENTS.close.frame + 8, 16)},
  ];
  return <ChartLine uid="rayChart" m={marketTime(f)} tint="ray" on={screenOn(f)} markers={markers} rtl={lang === 'ar'} />;
};

const SamScreen: React.FC<{f: number; lang: Lang}> = ({f, lang}) => {
  const c = COPY[lang];
  const t1 = EVENTS.trade1;
  const t2 = EVENTS.trade2;
  const draw = (at: number) => smoothSpring(f, at, 18);
  const t1Dim = (1 - 0.6 * smoothSpring(f, t1.slHit + 6, 20)) * (1 - smoothSpring(f, 1570, 30));
  const t2Dim = 1 - 0.45 * smoothSpring(f, t2.tpHit + 60, 30);
  const levels: Level[] = [];
  if (f >= t1.frame - 30 && f < 1620) {
    levels.push(
      {price: t1.entry, color: colors.text, label: c.chartEntry, dashed: true, draw: draw(420), dim: t1Dim},
      {price: t1.tp, color: colors.green, label: 'TP', draw: draw(432), dim: t1Dim},
      {price: t1.sl, color: colors.red, label: 'SL', draw: draw(444), dim: t1Dim},
    );
  }
  if (f >= t2.frame) {
    levels.push(
      {price: t2.entry, color: colors.text, label: c.chartEntry, dashed: true, draw: draw(t2.frame + 10), dim: t2Dim},
      {price: t2.tp, color: colors.green, label: 'TP', draw: draw(t2.frame + 22), dim: t2Dim},
      {price: t2.sl, color: colors.red, label: 'SL', draw: draw(t2.frame + 34), dim: t2Dim},
    );
  }
  const markers: Marker[] = [
    {t: marketTime(t1.slHit), price: t1.sl, color: colors.red, kind: 'x', appear: f < 1600 ? smoothSpring(f, t1.slHit, 12) : 0},
    {t: marketTime(t2.tpHit), price: t2.tp, color: colors.green, kind: 'check', appear: smoothSpring(f, t2.tpHit, 12)},
  ];
  return <ChartLine uid="samChart" m={marketTime(f)} tint="sam" on={screenOn(f)} levels={levels} markers={markers} rtl={lang === 'ar'} />;
};

const panelMask = 'linear-gradient(180deg, rgba(0,0,0,0) 0px, #000 56px, #000 960px, rgba(0,0,0,0) 1040px)';

const CamSvg: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <svg
    width={540}
    height={P.height}
    viewBox={`0 0 540 ${P.height}`}
    style={{
      position: 'absolute',
      inset: 0,
      transform: `translate(${cam.tx}px, ${cam.ty}px) rotate(${cam.rot}deg) scale(${cam.scale})`,
      transformOrigin: `${cam.ox}px ${cam.oy}px`,
      filter: cam.filter,
    }}
  >
    {children}
  </svg>
);

// Uses its own frame so CameraMotionBlur can sample it between frames
const RayShot: React.FC<{lang: Lang; pulse: (f: number) => number}> = ({lang, pulse}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <CamSvg cam={rayCam(f)}>
        <g transform={`translate(${layout.rayBoxX} 0)`}>
          <Ray
            expression={RAY.expression}
            pose={RAY.pose}
            look={RAY.look}
            intensity={RAY.intensity}
            clutter={RAY.clutter}
            talking={RAY.talking}
            screenPulse={pulse(f)}
            screen={<RayScreen f={f} lang={lang} />}
          />
        </g>
      </CamSvg>
    </AbsoluteFill>
  );
};

const SamShot: React.FC<{lang: Lang}> = ({lang}) => {
  const f = useCurrentFrame();
  const c = COPY[lang];
  return (
    <AbsoluteFill>
      <CamSvg cam={samCam(f)}>
        <g transform={`translate(${layout.samBoxX - layout.divider} 0)`}>
          <Sam
            mirror
            expression={SAM.expression}
            pose={SAM.pose}
            look={SAM.look}
            talking={SAM.talking}
            phoneMode={SAM.phoneMode}
            phoneText={{waiting: c.waiting, rtl: lang === 'ar'}}
            notes={f > 1090 ? 1 : 0}
            screen={<SamScreen f={f} lang={lang} />}
          />
        </g>
      </CamSvg>
    </AbsoluteFill>
  );
};

// Ray's monitor pulses red as the price drops (S3)
const rayPulse = (f: number) => {
  if (f < 925 || f > 1030) return 0;
  return Math.max(0, Math.sin(((f - 925) / 35) * Math.PI)) ** 2;
};

export const SplitScreen: React.FC<{lang: Lang}> = ({lang}) => {
  const f = useCurrentFrame();
  const blur = rayCam(f).blur;
  const divider = smoothSpring(f, 0, 30);
  const flare = interpolate(f, [BEAT.flare, BEAT.flare + 18, BEAT.flare + 60], [0, 1, 0.35], {...clamp, easing: ease.inOut});
  // after the flare, the streak hands the centre over to the logo
  const streakFade = interpolate(f, [BEAT.flare + 14, BEAT.flare + 50], [1, 0], {...clamp, easing: ease.exit});
  const panelStyle = (left: number): React.CSSProperties => ({
    position: 'absolute',
    left,
    top: P.top,
    width: 540,
    height: P.height,
    overflow: 'hidden',
    WebkitMaskImage: panelMask,
    maskImage: panelMask,
  });
  return (
    <AbsoluteFill>
      <div style={panelStyle(0)}>
        {blur ? (
          <CameraMotionBlur shutterAngle={200} samples={8}>
            <RayShot lang={lang} pulse={rayPulse} />
          </CameraMotionBlur>
        ) : (
          <RayShot lang={lang} pulse={rayPulse} />
        )}
      </div>
      <div style={panelStyle(540)}>
        <SamShot lang={lang} />
      </div>
      {/* divider: thin vertical light streak, white core + gold bloom */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <LightStreak id="divider" d={`M 540 ${P.top - 30} L 540 ${P.bottom + 30}`} progress={divider} width={3 + flare * 6} opacity={(0.75 + flare * 0.25) * streakFade} head={false} />
      </svg>
      {flare > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 700 * flare,
            top: 900 - 520,
            width: 1400 * flare,
            height: 1040,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,246,220,0.55) 0%, rgba(243,210,122,0.28) 30%, rgba(212,162,76,0) 70%)',
            opacity: flare,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
