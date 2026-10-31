import {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BRAND, GLOBE_COLORS} from '../data';
import {computeCamera} from '../lib/camera';
import {ROUTE_STEP, getRoute, routePoint} from '../lib/geo';
import {drawS, journeyFade, journeyS} from '../lib/timeline';
import {addHaze} from './Globe';

const RADIAL = 10;

/** Route tube radius in screen pixels for a given pixels-per-unit scale (thicker as the camera nears). */
export const tubePx = (pxPerUnit: number) => 4.2 * Math.pow(pxPerUnit / 4.2, 0.42);

/** Linear curve through the evenly resampled route, so t maps linearly to arc length. */
class SampledCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private xs: Float64Array,
    private ys: Float64Array,
    private zs: Float64Array,
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const f = t * (this.xs.length - 1);
    const i = Math.min(this.xs.length - 2, Math.floor(f));
    const u = f - i;
    return target.set(
      this.xs[i] + (this.xs[i + 1] - this.xs[i]) * u,
      this.ys[i] + (this.ys[i + 1] - this.ys[i]) * u,
      this.zs[i] + (this.zs[i + 1] - this.zs[i]) * u,
    );
  }
}

const UNIFORMS = {
  uWidth: {value: 1},
  uJourney: {value: 1e9},
  uFade: {value: 0},
  uNavy: {value: new THREE.Color(BRAND.navy)},
  uFaded: {value: new THREE.Color(GLOBE_COLORS.routeFaded)},
};

/** Scales the tube about its centre line, so it keeps a steady on-screen thickness. */
const widthPatch = (shader: THREE.WebGLProgramParametersWithUniforms) => {
  Object.assign(shader.uniforms, UNIFORMS);
  shader.vertexShader = shader.vertexShader
    .replace('void main() {', 'attribute vec3 aCenter;\nattribute float aArc;\nuniform float uWidth;\nvarying float vArc;\nvoid main() {')
    .replace('#include <begin_vertex>', 'vec3 transformed = aCenter + (position - aCenter) * uWidth;\nvArc = aArc;');
};

const tubeMaterial = () => {
  const m = new THREE.MeshStandardMaterial({color: BRAND.navy, roughness: 0.45, metalness: 0});
  m.onBeforeCompile = (shader) => {
    widthPatch(shader);
    addHaze(shader);
    // Once the journey starts, the route fades back and the travelled part stays navy.
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'varying float vArc;\nuniform float uJourney;\nuniform float uFade;\nuniform vec3 uNavy;\nuniform vec3 uFaded;\nvoid main() {')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float travelled = smoothstep(uJourney - 0.6, uJourney + 0.6, vArc);
        diffuseColor.rgb = mix(uNavy, uFaded, uFade * (1.0 - travelled));`,
      );
  };
  return m;
};

const depthMaterial = () => {
  const m = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking});
  m.onBeforeCompile = widthPatch;
  return m;
};

export const RouteLine: React.FC = () => {
  const frame = useCurrentFrame();
  const route = getRoute();
  const segments = route.xs.length - 1;

  const tube = useMemo(() => {
    const curve = new SampledCurve(route.xs, route.ys, route.zs);
    const geo = new THREE.TubeGeometry(curve, segments, 1, RADIAL, false);
    const count = geo.getAttribute('position').count;
    const center = new Float32Array(count * 3);
    const arc = new Float32Array(count);
    for (let v = 0; v < count; v++) {
      const ring = Math.floor(v / (RADIAL + 1));
      center[v * 3] = route.xs[ring];
      center[v * 3 + 1] = route.ys[ring];
      center[v * 3 + 2] = route.zs[ring];
      arc[v] = ring * ROUTE_STEP;
    }
    geo.setAttribute('aCenter', new THREE.BufferAttribute(center, 3));
    geo.setAttribute('aArc', new THREE.BufferAttribute(arc, 1));
    const mesh = new THREE.Mesh(geo, tubeMaterial());
    mesh.customDepthMaterial = depthMaterial();
    mesh.castShadow = true;
    mesh.frustumCulled = false;
    return mesh;
  }, [route, segments]);

  const cap = useMemo(() => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshStandardMaterial({color: BRAND.navy, roughness: 0.45}));
    m.castShadow = true;
    return m;
  }, []);

  const s = drawS(frame);
  const head = routePoint(s);
  const px = computeCamera(frame).surfacePx;
  const width = tubePx(px) / px;
  const drawing = s > 0.01 && s < route.length - 0.01;

  useLayoutEffect(() => {
    const drawn = Math.min(segments, Math.floor(s / ROUTE_STEP));
    tube.geometry.setDrawRange(0, drawn * RADIAL * 6);
    UNIFORMS.uWidth.value = width;
    UNIFORMS.uJourney.value = journeyS(frame);
    UNIFORMS.uFade.value = journeyFade(frame);
    cap.position.set(...head);
    cap.scale.setScalar(width * 1.5);
  }, [s, segments, tube, width, frame, cap, head]);

  return (
    <group>
      <primitive object={tube} visible={s > 0.01} />
      <primitive object={cap} visible={drawing} />
    </group>
  );
};
