import {Effect, EffectAttribute} from 'postprocessing';
import * as THREE from 'three';

/**
 * The world's color grade in one pass, after bloom:
 *  - radial (zoom) motion blur driven by the camera speed (the plunge and the rewind)
 *  - RGB split that grows toward the edges (panic)
 *  - tint toward the emotion color, saturation, exposure, a haze "lift" in the blacks
 *  - vignette (black, or dark red while afraid)
 *  - seeded film grain (the seed is the frame number, so every render is identical)
 *  - impact flashes
 */
const fragment = /* glsl */ `
uniform vec3 uTint;
uniform float uTintAmt;
uniform float uSat;
uniform float uExposure;
uniform float uSplit;
uniform float uRadial;
uniform vec2 uCenter;
uniform float uVignette;
uniform vec3 uVigColor;
uniform float uGrain;
uniform float uSeed;
uniform float uFlash;
uniform vec3 uFlashColor;
uniform float uLift;
uniform float uAspect;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed * 0.6180339);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 dir = uv - uCenter;
  vec3 col;
  if (uRadial > 0.0005 || uSplit > 0.0002) {
    vec3 acc = vec3(0.0);
    float wsum = 0.0;
    vec2 off = dir * uSplit * 6.0;
    for (int i = 0; i < 10; i++) {
      float t = float(i) / 9.0;
      vec2 base = uCenter + dir * (1.0 - uRadial * t);
      float w = 1.0 - t * 0.55;
      acc.r += texture2D(inputBuffer, base + off).r * w;
      acc.g += texture2D(inputBuffer, base).g * w;
      acc.b += texture2D(inputBuffer, base - off).b * w;
      wsum += w;
      if (uRadial <= 0.0005) break;
    }
    col = acc / wsum;
  } else {
    col = inputColor.rgb;
  }

  col *= uExposure;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSat);
  // grade toward the emotion color (keeps luminance)
  vec3 tinted = uTint * (luma / max(dot(uTint, vec3(0.2126, 0.7152, 0.0722)), 1e-3));
  col = mix(col, tinted, uTintAmt);
  // haze in the blacks
  col += uTint * uLift * (1.0 - smoothstep(0.0, 0.25, luma));

  // vignette
  vec2 q = dir * vec2(uAspect, 1.0) * 1.15;
  float r = length(q);
  float vig = smoothstep(0.25, 0.95, r) * uVignette;
  col = mix(col, uVigColor, clamp(vig, 0.0, 1.0));

  col += uFlashColor * uFlash;

  // film grain: ~2 px grains, mostly in the mids (sRGB would blow up noise in the blacks)
  float g = hash(floor(uv * vec2(1080.0, 1920.0) * 0.4)) - 0.5;
  col += g * uGrain * (0.04 + 0.9 * smoothstep(0.0, 0.35, luma));

  outputColor = vec4(max(col, 0.0), inputColor.a);
}
`;

export class GradeEffect extends Effect {
  constructor() {
    super('GradeEffect', fragment, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, THREE.Uniform>([
        ['uTint', new THREE.Uniform(new THREE.Color(1, 1, 1))],
        ['uTintAmt', new THREE.Uniform(0)],
        ['uSat', new THREE.Uniform(1)],
        ['uExposure', new THREE.Uniform(1)],
        ['uSplit', new THREE.Uniform(0)],
        ['uRadial', new THREE.Uniform(0)],
        ['uCenter', new THREE.Uniform(new THREE.Vector2(0.5, 0.5))],
        ['uVignette', new THREE.Uniform(0.4)],
        ['uVigColor', new THREE.Uniform(new THREE.Color(0, 0, 0))],
        ['uGrain', new THREE.Uniform(0.05)],
        ['uSeed', new THREE.Uniform(0)],
        ['uFlash', new THREE.Uniform(0)],
        ['uFlashColor', new THREE.Uniform(new THREE.Color(1, 1, 1))],
        ['uLift', new THREE.Uniform(0.02)],
        ['uAspect', new THREE.Uniform(1080 / 1920)],
      ]),
    });
  }

  set(name: string, value: unknown) {
    const u = this.uniforms.get(name);
    if (!u) return;
    if (u.value instanceof THREE.Color && value instanceof THREE.Color) u.value.copy(value);
    else if (u.value instanceof THREE.Vector2 && value instanceof THREE.Vector2) u.value.copy(value);
    else u.value = value;
  }
}
