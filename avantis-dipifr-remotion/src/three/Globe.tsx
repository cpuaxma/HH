import {useMemo} from 'react';
import * as THREE from 'three';
import {GLOBE_COLORS} from '../data';
import {R, lonLat, norm} from '../lib/geo';
import {getLandDots} from '../lib/land';

/** Shared by every globe material: the globe's centre in view space and the haze colour. */
export const HAZE_UNIFORMS = {
  uCenterView: {value: new THREE.Vector3()},
  uHaze: {value: new THREE.Color(GLOBE_COLORS.haze)},
  uHazeAmount: {value: 0.75},
};

/**
 * Light haze toward the globe's silhouette: fades a lit material toward the haze
 * colour where the globe's surface turns away from the camera.
 */
export const addHaze = (shader: THREE.WebGLProgramParametersWithUniforms) => {
  Object.assign(shader.uniforms, HAZE_UNIFORMS);
  shader.fragmentShader = shader.fragmentShader
    .replace(
      'void main() {',
      `uniform vec3 uCenterView;
      uniform vec3 uHaze;
      uniform float uHazeAmount;
      void main() {`,
    )
    .replace(
      '#include <dithering_fragment>',
      `{
        vec3 p = -vViewPosition;
        vec3 ns = normalize(p - uCenterView);
        float facing = clamp(dot(ns, normalize(-p)), 0.0, 1.0);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uHaze, uHazeAmount * pow(1.0 - facing, 3.0));
      }
      #include <dithering_fragment>`,
    );
};

const globeMaterial = () => {
  const m = new THREE.MeshStandardMaterial({color: GLOBE_COLORS.ocean, roughness: 0.96, metalness: 0});
  m.onBeforeCompile = (shader) => {
    addHaze(shader);
    shader.uniforms.uGrid = {value: new THREE.Color(GLOBE_COLORS.graticule)};
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'varying vec3 vObj;\nvoid main() {')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
    // A faint graticule every 15°, anti-aliased with screen-space derivatives.
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'varying vec3 vObj;\nuniform vec3 uGrid;\nvoid main() {')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          vec3 d = normalize(vObj);
          float lat = degrees(asin(clamp(d.y, -1.0, 1.0))) / 15.0;
          float lon = degrees(atan(d.x, d.z)) / 15.0;
          float glat = abs(fract(lat + 0.5) - 0.5) / max(fwidth(lat), 1e-4);
          float glon = abs(fract(lon + 0.5) - 0.5) / max(fwidth(lon), 1e-4) / max(cos(radians(lat * 15.0)), 0.05);
          float line = 1.0 - smoothstep(0.4, 1.4, min(glat, glon));
          line *= 1.0 - smoothstep(70.0 / 15.0, 84.0 / 15.0, abs(lat));
          diffuseColor.rgb = mix(diffuseColor.rgb, uGrid, line);
        }`,
      );
  };
  return m;
};

/** Soft halo around the globe: a camera-facing sprite with a radial falloff. */
const haloTexture = () => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const c = new THREE.Color(GLOBE_COLORS.haze);
  const rgba = (a: number) => `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
  // The globe's edge sits at r = 1 / HALO_SCALE of the sprite's half-size.
  const edge = 1 / HALO_SCALE;
  g.addColorStop(0, rgba(1));
  g.addColorStop(edge * 0.98, rgba(1));
  for (let k = 1; k <= 8; k++) {
    const t = k / 8;
    g.addColorStop(edge + (1 - edge) * t, rgba(0.85 * (1 - t) ** 2.2));
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};
const HALO_SCALE = 1.5;

export const Globe: React.FC = () => {
  const sphere = useMemo(() => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 120), globeMaterial());
    mesh.receiveShadow = true;
    return mesh;
  }, []);

  const dots = useMemo(() => {
    const list = getLandDots();
    // A low, rounded dot: a short cylinder with a softly domed top.
    const geo = new THREE.CylinderGeometry(0.42, 0.47, 0.36, 12, 1);
    geo.translate(0, 0.18, 0);
    const mat = new THREE.MeshStandardMaterial({color: GLOBE_COLORS.land, roughness: 0.9});
    mat.onBeforeCompile = addHaze;
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    list.forEach(([lon, lat], i) => {
      const n = new THREE.Vector3(...norm(lonLat(lon, lat)));
      q.setFromUnitVectors(up, n);
      m.compose(n.clone().multiplyScalar(R - 0.1), q, new THREE.Vector3(1, 1, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return mesh;
  }, []);

  const halo = useMemo(() => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map: haloTexture(), depthWrite: false, transparent: true}));
    s.scale.setScalar(R * 2 * HALO_SCALE);
    s.renderOrder = -10;
    return s;
  }, []);

  return (
    <group>
      <primitive object={halo} />
      <primitive object={sphere} />
      <primitive object={dots} />
    </group>
  );
};

