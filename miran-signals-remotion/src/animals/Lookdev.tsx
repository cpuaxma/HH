// A turntable of the five sculpted animals, for checking the figures (not a deliverable).
// Frame f shows animal floor(f / 6) from view f % 6: front three-quarters, side, front,
// back three-quarters, a close-up of the head, and from above.
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {BRAND} from '../data';
import type {CameraState} from '../lib/camera';
import type {V3} from '../lib/story';
import {ORB_COOL, OrbFn, Studio} from '../three/Studio';
import {Pipeline} from '../three/Pipeline';
import {Figure, FigureMeshes, FigurePose} from './Figure';
import {ANIMAL_FIGURES} from './figures';
import {AnimalsFormat, LAYOUT} from './data';

const VIEWS = 6;
const SETUP: Record<string, {pos: V3; target: V3; head: V3; dist: number}> = {
  bull: {pos: [0, 0, 0], target: [0.08, 0.62, 0], head: [0.86, 0.85, 0], dist: 5.2},
  bear: {pos: [0, 0, 0], target: [0.08, 0.95, 0], head: [0.25, 1.6, 0], dist: 5.6},
  whale: {pos: [0, 0.6, 0], target: [-0.1, 0.6, 0], head: [0.85, 0.6, 0], dist: 7.2},
  hawk: {pos: [0, 1, 0], target: [0, 1, 0], head: [0.36, 1.07, 0], dist: 3.6},
  dove: {pos: [0, 1, 0], target: [0, 1, 0], head: [0.3, 1.1, 0], dist: 3.4},
};
const which = (t: number) => {
  const f = Math.round(t);
  return {animal: ANIMAL_FIGURES[Math.floor(f / VIEWS) % ANIMAL_FIGURES.length], view: f % VIEWS};
};

const lookdevCamera = (t: number, fmt: AnimalsFormat): CameraState => {
  const {animal, view} = which(t);
  const s = SETUP[animal.id];
  const [az, el, k] = [
    [40, 10, 1],
    [90, 4, 1],
    [0, 6, 1],
    [140, 14, 1],
    [55, 8, 0.32],
    [70, 60, 1],
  ][view];
  const target: V3 = view === 4 ? s.head : s.target;
  const dist = s.dist * k;
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  const position: V3 = [target[0] + dist * Math.sin(a) * Math.cos(e), target[1] + dist * Math.sin(e), target[2] + dist * Math.cos(a) * Math.cos(e)];
  const {width, height} = LAYOUT[fmt];
  const fov = (2 * Math.atan(Math.tan((22 * Math.PI) / 360) / (width / height)) * 180) / Math.PI;
  return {position, target, up: [0, 1, 0], fov, focusPx: [width / 2, height / 2], dist};
};

const orbs: OrbFn = (_t, left, right) => {
  left.copy(ORB_COOL).multiplyScalar(0.06);
  right.copy(ORB_COOL).multiplyScalar(0.06);
};
const noBloom = () => false;
const noImpact = () => 0;

export const AnimalsLookdev: React.FC = () => {
  const {width, height} = useVideoConfig();
  const fmt: AnimalsFormat = height > 1500 ? 'vertical' : 'feed';
  return (
    <AbsoluteFill style={{background: BRAND.bgTop}}>
      <ThreeCanvas width={width} height={height} flat dpr={1} gl={{antialias: false, preserveDrawingBuffer: true, stencil: false}}>
        <FigureMeshes>
          <Pipeline fmt={fmt} camera={lookdevCamera} bloom={noBloom} impactAt={noImpact}>
            <Studio orbs={orbs} />
            {ANIMAL_FIGURES.map((def) => (
              <Figure
                key={def.id}
                def={def}
                pose={(t): FigurePose => {
                  const w = which(t);
                  return {pos: SETUP[def.id].pos, rot: [0, 0, 0], scale: 1, visible: w.animal.id === def.id};
                }}
              />
            ))}
          </Pipeline>
        </FigureMeshes>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
