import React from 'react';
import {useCurrentFrame} from 'remotion';
import {AnimatedText} from '../components/AnimatedText';
import {SceneFrame} from '../components/SceneFrame';
import {COLORS, CUES, SCENES, TEXT} from '../config';
import landDots from '../data/land-dots.json';
import {EASE, ease} from '../lib/motion';
import {useTextOnly} from '../components/Debug';

const C = CUES.world;
const FROM = SCENES.world.from;
const DOTS = landDots as [number, number][];

const HUB = {lat: 40.7, lon: -74}; // New York
const CITIES = [
  {lat: 51.5, lon: -0.1}, // London
  {lat: 43.7, lon: -79.4}, // Toronto
  {lat: -23.5, lon: -46.6}, // São Paulo
  {lat: 50.1, lon: 8.7}, // Frankfurt
  {lat: 19.4, lon: -99.1}, // Mexico City
  {lat: 30.0, lon: 31.2}, // Cairo
  {lat: 24.7, lon: 46.7}, // Riyadh
  {lat: -26.2, lon: 28.0}, // Johannesburg
  {lat: 25.2, lon: 55.3}, // Dubai
];

const RAD = Math.PI / 180;
type V3 = [number, number, number];
const toVec = (lat: number, lon: number): V3 => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];

/** Orthographic projection of a unit vector for a view centered on (lat0, lon0). Returns x, y in -1..1 and depth z. */
const project = (v: V3, lat0: number, lon0: number) => {
  const cl = Math.cos(lon0 * RAD);
  const sl = Math.sin(lon0 * RAD);
  // rotate around z so lon0 faces the camera
  const x1 = v[0] * cl + v[1] * sl;
  const y1 = -v[0] * sl + v[1] * cl;
  const z1 = v[2];
  const ct = Math.cos(lat0 * RAD);
  const st = Math.sin(lat0 * RAD);
  // tilt around the east axis
  const depth = x1 * ct + z1 * st;
  const up = -x1 * st + z1 * ct;
  return {x: y1, y: -up, z: depth};
};

const slerp = (a: V3, b: V3, t: number): V3 => {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  const so = Math.sin(om) || 1;
  const wa = Math.sin((1 - t) * om) / so;
  const wb = Math.sin(t * om) / so;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
};

const CX = 540;
const CY = 900;
const R = 400;

/** 0:23-0:28 — the camera pulls back from New York to a globe of gold dots with glowing connection lines. */
export const Scene5World: React.FC = () => {
  const frame = useCurrentFrame();
  const textOnly = useTextOnly();

  // slow eastward spin, slower still once the globe has settled behind the outro (keeps New York in view)
  const lon0 = -78 + Math.min(frame, 150) * 0.34 + Math.max(0, frame - 150) * 0.12;
  const lat0 = 24;
  const pull = ease(frame, [0, C.pullBackEnd], [0, 1], EASE.inOut);
  // settle: the globe shrinks and dims into a faint backdrop behind the CTA
  const settle = ease(frame, [C.exit - 4, C.exit + 26], [0, 1], EASE.inOut);
  const scale = 2.7 - 1.7 * pull - settle * 0.18;
  const fadeIn = ease(frame, [0, 14], [0, 1]);
  const opacity = fadeIn * (1 - 0.84 * settle);

  const hubP = project(toVec(HUB.lat, HUB.lon), lat0, lon0);
  // focus moves from New York to the globe center while pulling back
  const fx = CX + hubP.x * R * (1 - pull);
  const fy = CY + hubP.y * R * (1 - pull);

  const sx = (p: {x: number; y: number}) => CX + p.x * R;
  const sy = (p: {x: number; y: number}) => CY + p.y * R;

  const hubV = toVec(HUB.lat, HUB.lon);

  return (
    <SceneFrame from={FROM} range={[FROM + C.pullBackEnd, FROM + SCENES.world.duration + 60]}>
      {!textOnly ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity, filter: `blur(${settle * 3}px)`}}>
          <defs>
            <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor={COLORS.gold} stopOpacity={0} />
              <stop offset="92%" stopColor={COLORS.gold} stopOpacity={0.22} />
              <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
            </radialGradient>
            <radialGradient id="sphere" cx="42%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#2A2210" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0A0A0A" stopOpacity={0.9} />
            </radialGradient>
          </defs>
          <g transform={`translate(${CX} ${CY}) scale(${scale}) translate(${-fx} ${-fy})`}>
            <circle cx={CX} cy={CY} r={R * 1.12} fill="url(#atmo)" />
            <circle cx={CX} cy={CY} r={R} fill="url(#sphere)" stroke={COLORS.gold} strokeOpacity={0.35} strokeWidth={1.5 / scale} />
            {DOTS.map(([lat, lon], i) => {
              const p = project(toVec(lat, lon), lat0, lon0);
              if (p.z <= 0.02) return null;
              return <circle key={i} cx={sx(p)} cy={sy(p)} r={2.6 * (0.55 + 0.45 * p.z)} fill={p.z > 0.6 ? COLORS.goldLight : COLORS.gold} opacity={0.25 + 0.7 * p.z} />;
            })}
            {CITIES.map((city, k) => {
              const start = C.arcsStart + k * C.arcEvery;
              const t = ease(frame, [start, start + C.arcDuration], [0, 1], EASE.inOut);
              if (t <= 0) return null;
              const cityV = toVec(city.lat, city.lon);
              const dot = hubV[0] * cityV[0] + hubV[1] * cityV[1] + hubV[2] * cityV[2];
              const lift = 0.1 + 0.22 * (Math.acos(dot) / Math.PI);
              const steps = 40;
              const pts: string[] = [];
              let last: {x: number; y: number; z: number} | null = null;
              for (let s = 0; s <= Math.ceil(steps * t); s++) {
                const u = Math.min(t, s / steps);
                const v = slerp(hubV, cityV, u);
                const h = 1 + lift * Math.sin(Math.PI * u);
                const p = project([v[0] * h, v[1] * h, v[2] * h], lat0, lon0);
                if (p.z < -0.15) break; // stop at the far side of the globe
                pts.push(`${s ? 'L' : 'M'}${sx(p).toFixed(1)},${sy(p).toFixed(1)}`);
                last = p;
              }
              const d = pts.join(' ');
              const cityP = project(cityV, lat0, lon0);
              const arrived = frame - (start + C.arcDuration);
              // a light packet runs along each finished arc
              const packetU = arrived > 0 ? ((arrived / 34) % 1) : -1;
              let packet: {x: number; y: number} | null = null;
              if (packetU >= 0) {
                const v = slerp(hubV, cityV, packetU);
                const h = 1 + lift * Math.sin(Math.PI * packetU);
                const p = project([v[0] * h, v[1] * h, v[2] * h], lat0, lon0);
                if (p.z > -0.1) packet = p;
              }
              return (
                <g key={k}>
                  <path d={d} fill="none" stroke={COLORS.gold} strokeOpacity={0.25} strokeWidth={9 / scale} strokeLinecap="round" />
                  <path d={d} fill="none" stroke={COLORS.goldLight} strokeWidth={2.6 / scale} strokeLinecap="round" />
                  {last && t < 1 ? <circle cx={sx(last)} cy={sy(last)} r={6 / scale} fill="#FFF6D8" /> : null}
                  {packet ? <circle cx={sx(packet)} cy={sy(packet)} r={5 / scale} fill="#FFF6D8" opacity={0.9} /> : null}
                  {arrived >= 0 && cityP.z > 0 ? (
                    <>
                      <circle cx={sx(cityP)} cy={sy(cityP)} r={(6 + Math.min(1, arrived / 18) * 22) / scale} fill="none" stroke={COLORS.goldLight} strokeWidth={2 / scale} opacity={1 - Math.min(1, arrived / 18)} />
                      <circle cx={sx(cityP)} cy={sy(cityP)} r={5.5 / scale} fill={COLORS.goldLight} />
                    </>
                  ) : null}
                </g>
              );
            })}
            {hubP.z > 0 ? (
              <>
                {[0, 1].map((ring) => {
                  const rt = ((frame + ring * 20) % 40) / 40;
                  return <circle key={ring} cx={sx(hubP)} cy={sy(hubP)} r={(8 + rt * 40) / scale} fill="none" stroke={COLORS.goldLight} strokeWidth={2.5 / scale} opacity={(1 - rt) * 0.8} />;
                })}
                <circle cx={sx(hubP)} cy={sy(hubP)} r={16 / scale} fill={COLORS.gold} opacity={0.35} />
                <circle cx={sx(hubP)} cy={sy(hubP)} r={7.5 / scale} fill="#FFF6D8" />
              </>
            ) : null}
          </g>
        </svg>
      ) : null}
      <AnimatedText {...TEXT.world.line} enter={C.text} exit={C.exit} shineAt={C.textShine} size={74} y={1500} anchor="bottom" />
    </SceneFrame>
  );
};
