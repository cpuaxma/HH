import {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {BRAND, BUSINESSES, TIMING, arrivalFrame} from '../data';
import {finaleCenter} from '../lib/camera';
import {getCity} from '../lib/city';
import {makeRandom} from '../lib/random';
import {PIN_BOX, PIN_TEXTURE, PIN_TEXTURE_CENTER, drawHaloCanvas, drawPinCanvas} from '../lib/pepper';
import {routePoint} from '../lib/route';
import {easeOut, headS, ramp} from '../lib/timeline';
import {ROUTE_TUBE} from './Route';

const FOV_TAN = Math.tan((46 / 2) * (Math.PI / 180));
/** Sprite scale (sizeAttenuation off) for a sprite that is `px` tall on a 1920px frame. */
const pxToScale = (px: number) => (px * FOV_TAN) / 960;
/** The pin artwork fills this share of its texture's height. */
const PIN_FILL = (PIN_BOX.h * PIN_TEXTURE.scale) / PIN_TEXTURE.h;
const PIN_ASPECT = PIN_TEXTURE.w / PIN_TEXTURE.h;

const usePinTexture = () =>
  useMemo(() => {
    const t = new THREE.CanvasTexture(drawPinCanvas({red: BRAND.red, glow: BRAND.glow, orange: BRAND.orange, dark: '#B32A16'}));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

const useHaloTexture = () =>
  useMemo(() => {
    const t = new THREE.CanvasTexture(drawHaloCanvas());
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

const ringGeometry = new THREE.RingGeometry(0.92, 1, 96).rotateX(-Math.PI / 2);

/** An expanding, fading ring on the ground. */
const Ripple: React.FC<{x: number; z: number; start: number; r0: number; r1: number; life: number; frame: number}> = ({
  x,
  z,
  start,
  r0,
  r1,
  life,
  frame,
}) => {
  const t = (frame - start) / life;
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(BRAND.glow).multiplyScalar(1.15),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  if (t <= 0 || t >= 1) return null;
  const e = easeOut(t);
  const r = r0 + (r1 - r0) * e;
  material.opacity = 0.75 * (1 - t) * (1 - t);
  return <mesh geometry={ringGeometry} material={material} position={[x, 0.35, z]} scale={[r, 1, r]} renderOrder={25} />;
};

const Pin: React.FC<{position: [number, number, number]; px: number; pop: number; texture: THREE.Texture}> = ({
  position,
  px,
  pop,
  texture,
}) => {
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: false,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        color: new THREE.Color(1.08, 1.08, 1.08),
        toneMapped: false,
      }),
    [texture],
  );
  if (pop <= 0.001) return null;
  const h = pxToScale(px / PIN_FILL) * pop;
  return (
    <sprite
      material={material}
      position={position}
      scale={[h * PIN_ASPECT, h, 1]}
      center={new THREE.Vector2(PIN_TEXTURE_CENTER.x, PIN_TEXTURE_CENTER.y)}
      renderOrder={40}
    />
  );
};

type FinalePin = {x: number; y: number; z: number; start: number};

const useFinalePins = (): FinalePin[] =>
  useMemo(() => {
    const city = getCity();
    const c = finaleCenter();
    const rnd = makeRandom(4242);
    const featured = city.featured.map((f) => f.roof);
    const candidates = city.roofs.filter(
      (r) =>
        Math.abs(r.x - c.x) < 300 &&
        r.z - c.z > -225 &&
        r.z - c.z < 430 &&
        !featured.some((f) => Math.hypot(f.x - r.x, f.z - r.z) < 70),
    );
    const chosen: {x: number; y: number; z: number}[] = [];
    for (let attempt = 0; attempt < 4000 && chosen.length < 48; attempt++) {
      const r = rnd.pick(candidates);
      if (chosen.some((p) => Math.hypot(p.x - r.x, p.z - r.z) < 62)) continue;
      if (featured.some((p) => Math.hypot(p.x - r.x, p.z - r.z) < 62)) continue;
      chosen.push(r);
    }
    const sorted = chosen
      .map((p) => ({...p, d: Math.hypot(p.x - c.x, p.z - c.z)}))
      .sort((a, b) => a.d - b.d);
    return sorted.map((p, i) => ({x: p.x, y: p.y, z: p.z, start: TIMING.finalePinsStart + i * 1.45 + rnd.range(0, 3)}));
  }, []);

export const Markers: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const city = getCity();
  const pinTexture = usePinTexture();
  const haloTexture = useHaloTexture();
  const finalePins = useFinalePins();

  const pop = (start: number) =>
    frame < start ? 0 : spring({frame: frame - start, fps, config: {damping: 10, stiffness: 170, mass: 0.7}});

  // Route head: a glowing puck that stays the same size on screen.
  const s = headS(frame);
  const head = routePoint(s);
  const headIn = ramp(frame, 150, 182, easeOut);
  const headOut = 1 - ramp(frame, TIMING.finaleStart + 40, TIMING.finaleSettled, easeOut) * 0.35;
  const pulse = 1 + 0.08 * Math.sin((frame / fps) * Math.PI * 2 * 1.4);
  const headMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: haloTexture,
        sizeAttenuation: false,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        toneMapped: false,
      }),
    [haloTexture],
  );
  const coreMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: haloTexture,
        sizeAttenuation: false,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        toneMapped: false,
        color: new THREE.Color(2.4, 1.35, 0.95),
      }),
    [haloTexture],
  );
  headMaterial.color.set(BRAND.glow);
  headMaterial.opacity = 0.75 * headIn;
  coreMaterial.opacity = headIn;

  const fin = ramp(frame, TIMING.finaleStart, TIMING.finaleSettled);

  return (
    <group>
      {/* Head glow and hot core */}
      <sprite
        material={headMaterial}
        position={[head.x, ROUTE_TUBE.y, head.z]}
        scale={[pxToScale(150 * pulse * headOut), pxToScale(150 * pulse * headOut), 1]}
        renderOrder={35}
      />
      <sprite
        material={coreMaterial}
        position={[head.x, ROUTE_TUBE.y, head.z]}
        scale={[pxToScale(44 * headOut * headIn), pxToScale(44 * headOut * headIn), 1]}
        renderOrder={36}
      />

      {/* Stop pins with ripples */}
      {BUSINESSES.map((_, i) => {
        const f = city.featured[i];
        const start = arrivalFrame(i) - 10;
        const near = ramp(frame, arrivalFrame(i) + 100, arrivalFrame(i) + 160);
        const px = 150 - 48 * near - 10 * fin;
        const r = Math.hypot(f.box.sx, f.box.sz) / 2;
        return (
          <group key={i}>
            <Ripple x={f.box.cx} z={f.box.cz} start={start + 4} r0={r * 0.8} r1={r * 2.3} life={56} frame={frame} />
            <Ripple x={f.box.cx} z={f.box.cz} start={start + 20} r0={r * 0.8} r1={r * 2.3} life={56} frame={frame} />
            <Pin position={[f.roof.x, f.roof.y + 0.4, f.roof.z]} px={px} pop={pop(start)} texture={pinTexture} />
          </group>
        );
      })}

      {/* Finale cascade */}
      {finalePins.map((p, i) => (
        <group key={`f${i}`}>
          <Ripple x={p.x} z={p.z} start={p.start + 2} r0={3} r1={30} life={44} frame={frame} />
          <Pin position={[p.x, p.y + 0.4, p.z]} px={58} pop={pop(p.start)} texture={pinTexture} />
        </group>
      ))}
    </group>
  );
};
