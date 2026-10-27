import {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BRAND} from '../data';
import {computeCamera} from '../lib/camera';
import {ROUTE_STEP, getRoute} from '../lib/route';
import {headS} from '../lib/timeline';

const RADIAL = 12;
const TUBE_RADIUS = 1.7;
const TUBE_Y = 1.8;
const RIBBON_WIDTH = 15;

/** Linear curve through the evenly resampled route, so t maps linearly to arc length. */
class SampledCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private xs: Float64Array,
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
      TUBE_Y,
      this.zs[i] + (this.zs[i + 1] - this.zs[i]) * u,
    );
  }
}

const gradientUniforms = () => ({
  uHead: {value: 0},
  uWidth: {value: 1},
  uRed: {value: new THREE.Color(BRAND.red)},
  uOrange: {value: new THREE.Color(BRAND.orange)},
});

const GRADIENT_GLSL = /* glsl */ `
  uniform float uHead;
  uniform vec3 uRed;
  uniform vec3 uOrange;
  vec3 routeColor(float arc) {
    float t = clamp(arc / max(uHead, 1.0), 0.0, 1.0);
    return mix(uRed, uOrange, pow(t, 1.8));
  }
`;

const tubeMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, gradientUniforms()]),
    fog: true,
    vertexShader: /* glsl */ `
      attribute float arc;
      uniform float uWidth;
      varying float vArc;
      varying vec3 vNormalV;
      #include <fog_pars_vertex>
      void main() {
        vArc = arc;
        vNormalV = normalize(normalMatrix * normal);
        // Thicken the tube when the camera is far away so it still reads.
        vec3 p = position + normal * ${TUBE_RADIUS.toFixed(3)} * (uWidth - 1.0) + vec3(0.0, ${TUBE_Y.toFixed(3)} * (uWidth - 1.0), 0.0);
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      ${GRADIENT_GLSL}
      varying float vArc;
      varying vec3 vNormalV;
      #include <fog_pars_fragment>
      void main() {
        vec3 c = routeColor(vArc);
        // Soft round shading: lit from above-front, a gentle rim highlight.
        float facing = clamp(vNormalV.z, 0.0, 1.0);
        float top = clamp(vNormalV.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = c * (0.78 + 0.22 * facing) + vec3(0.10, 0.06, 0.04) * pow(top, 6.0);
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }
    `,
  });

const ribbonMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, gradientUniforms()]),
    fog: true,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    polygonOffsetUnits: -40,
    vertexShader: /* glsl */ `
      attribute float arc;
      attribute float across;
      attribute vec3 offset;
      uniform float uWidth;
      varying float vArc;
      varying float vAcross;
      #include <fog_pars_vertex>
      void main() {
        vArc = arc;
        vAcross = across;
        vec4 mvPosition = modelViewMatrix * vec4(position + offset * uWidth, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      ${GRADIENT_GLSL}
      varying float vArc;
      varying float vAcross;
      #include <fog_pars_fragment>
      void main() {
        float a = 1.0 - abs(vAcross);
        a = a * a * 0.42;
        gl_FragColor = vec4(mix(routeColor(vArc), vec3(1.0, 0.30, 0.18), 0.35), a);
        #include <fog_fragment>
      }
    `,
  });

export const RouteLine: React.FC = () => {
  const frame = useCurrentFrame();
  const route = getRoute();
  const segments = route.xs.length - 1;

  const tube = useMemo(() => {
    const geo = new THREE.TubeGeometry(new SampledCurve(route.xs, route.zs), segments, TUBE_RADIUS, RADIAL, false);
    const count = geo.getAttribute('position').count;
    const arc = new Float32Array(count);
    for (let v = 0; v < count; v++) arc[v] = Math.floor(v / (RADIAL + 1)) * ROUTE_STEP;
    geo.setAttribute('arc', new THREE.BufferAttribute(arc, 1));
    const mesh = new THREE.Mesh(geo, tubeMaterial());
    mesh.frustumCulled = false;
    mesh.renderOrder = 20;
    return mesh;
  }, [route, segments]);

  const ribbon = useMemo(() => {
    const n = route.xs.length;
    const pos = new Float32Array(n * 3 * 3);
    const offset = new Float32Array(n * 3 * 3);
    const arc = new Float32Array(n * 3);
    const across = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 2);
      const b = Math.min(n - 1, i + 2);
      const dx = route.xs[b] - route.xs[a];
      const dz = route.zs[b] - route.zs[a];
      const len = Math.hypot(dx, dz) || 1;
      const nx = (-dz / len) * (RIBBON_WIDTH / 2);
      const nz = (dx / len) * (RIBBON_WIDTH / 2);
      for (let k = 0; k < 3; k++) {
        const side = k - 1;
        pos.set([route.xs[i], 0.05, route.zs[i]], (i * 3 + k) * 3);
        offset.set([nx * side, 0, nz * side], (i * 3 + k) * 3);
        arc[i * 3 + k] = i * ROUTE_STEP;
        across[i * 3 + k] = side;
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      for (let k = 0; k < 2; k++) {
        const a = i * 3 + k;
        const b = (i + 1) * 3 + k;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('offset', new THREE.BufferAttribute(offset, 3));
    geo.setAttribute('arc', new THREE.BufferAttribute(arc, 1));
    geo.setAttribute('across', new THREE.BufferAttribute(across, 1));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, ribbonMaterial());
    mesh.frustumCulled = false;
    mesh.renderOrder = 15;
    return mesh;
  }, [route]);

  const startCap = useMemo(() => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(TUBE_RADIUS * 1.9, 24, 16),
      new THREE.MeshBasicMaterial({color: BRAND.red}),
    );
    mesh.position.set(route.xs[0], TUBE_Y, route.zs[0]);
    return mesh;
  }, [route]);

  const s = headS(frame);
  const width = Math.pow(Math.max(1, computeCamera(frame).dist / 300), 0.75);
  useLayoutEffect(() => {
    const drawn = Math.floor(s / ROUTE_STEP);
    tube.geometry.setDrawRange(0, drawn * RADIAL * 6);
    ribbon.geometry.setDrawRange(0, drawn * 12);
    (tube.material as THREE.ShaderMaterial).uniforms.uHead.value = s;
    (ribbon.material as THREE.ShaderMaterial).uniforms.uHead.value = s;
    (tube.material as THREE.ShaderMaterial).uniforms.uWidth.value = width;
    (ribbon.material as THREE.ShaderMaterial).uniforms.uWidth.value = width;
    startCap.scale.setScalar(width);
    startCap.position.y = TUBE_Y * width;
  }, [s, width, tube, ribbon, startCap]);

  return (
    <group>
      <primitive object={ribbon} />
      <primitive object={tube} />
      <primitive object={startCap} visible={s > 0.01} />
    </group>
  );
};

export const ROUTE_TUBE = {radius: TUBE_RADIUS, y: TUBE_Y};
