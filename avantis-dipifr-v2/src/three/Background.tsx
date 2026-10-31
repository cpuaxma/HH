import {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {COLORS} from '../data';

/**
 * Full-screen background: the navy gradient, a slow drifting glow so it never
 * looks flat, and a very light static grain (static, so it can't flicker).
 */
export const Background: React.FC<{glowBoost?: number}> = ({glowBoost = 0}) => {
  const frame = useCurrentFrame();
  const mesh = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTop: {value: new THREE.Color(COLORS.bgTop)},
        uBottom: {value: new THREE.Color(COLORS.bgBottom)},
        uGlow: {value: new THREE.Color('#2A56A8')},
        uGold: {value: new THREE.Color(COLORS.gold)},
        uT: {value: 0},
        uBoost: {value: 0},
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.9999, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uBottom;
        uniform vec3 uGlow;
        uniform vec3 uGold;
        uniform float uT;
        uniform float uBoost;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec2 p = vec2(vUv.x * 0.5625, vUv.y);
          vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
          // Two soft glows drifting slowly: a cool one high, a faint warm one low.
          vec2 g1 = vec2(0.28 + 0.07 * sin(uT * 0.011), 0.68 + 0.05 * cos(uT * 0.008));
          vec2 g2 = vec2(0.30 + 0.06 * cos(uT * 0.009 + 1.3), 0.22 + 0.04 * sin(uT * 0.012));
          float d1 = length(p - g1);
          float d2 = length(p - g2);
          col += uGlow * (0.30 + uBoost) * exp(-d1 * d1 * 9.0);
          col += uGlow * 0.10 * exp(-d2 * d2 * 10.0);
          // Static grain, a touch of dither against banding.
          col += (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.012;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    m.frustumCulled = false;
    m.renderOrder = -100;
    return m;
  }, []);
  useLayoutEffect(() => {
    const u = (mesh.material as THREE.ShaderMaterial).uniforms;
    u.uT.value = frame;
    u.uBoost.value = glowBoost;
  }, [frame, glowBoost, mesh]);
  return <primitive object={mesh} />;
};
