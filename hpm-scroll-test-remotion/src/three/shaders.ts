// GLSL for the screen, the studio cyclorama and the post passes.

export const fullscreenVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export const screenVert = /* glsl */ `
varying vec2 vLocal;
varying vec3 vWorld;
varying vec3 vN;
void main() {
  vLocal = position.xy;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vN = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/**
 * The phone's front glass in one pass: the black bezel, the rounded screen, and the
 * glass reflection of an analytic studio (Fresnel + two soft boxes), cheap enough for
 * software rendering. The screen composites the scrolling bland feed (atlas), the hero post
 * (neon off/on), the fixed app chrome and the touch indicator. Motion blur of the
 * scroll is a box filter along the feed over this sample's slice of the shutter.
 */
export const screenFrag = /* glsl */ `
uniform sampler2D tAtlas;
uniform sampler2D tHero;
uniform sampler2D tChrome;
uniform float uScroll;
uniform float uHeroTop;
uniform float uLift;
uniform float uBlur;
uniform float uHeroBlur;
uniform float uDesat;
uniform vec4 uTouch;
uniform float uNeon;
uniform float uBright;
uniform vec3 uScreen; // screen width, height, corner radius (world units)
uniform float uRefl;
varying vec2 vLocal;
varying vec3 vWorld;
varying vec3 vN;
layout(location = 0) out highp vec4 outColor;

const float SW = 1024.0;
const float SH = 2224.0;
const float VT = 200.0;
const float VH = 1874.0;
const float PH = 1700.0;
const float CH = 1640.0;

vec3 bland(float x, float fy, vec2 gx, vec2 gy) {
  float k = floor(fy / PH);
  float ly = fy - k * PH;
  float idx = mod(k * 3.0 + floor(k / 8.0), 8.0);
  float col = mod(idx, 2.0);
  float row = floor(idx / 2.0);
  vec2 uv = vec2((col * SW + clamp(x, 0.5, SW - 0.5)) / (SW * 2.0), (row * PH + clamp(ly, 0.5, PH - 0.5)) / (PH * 4.0));
  return textureGrad(tAtlas, uv, gx, gy).rgb;
}

vec3 hero(float hx, float hy, vec2 gx, vec2 gy) {
  vec2 uv = vec2(clamp(hx, 0.5, SW - 0.5) / (SW * 2.0), clamp(hy, 0.5, PH - 0.5) / PH);
  if (uNeon <= 0.0) return textureGrad(tHero, uv, gx, gy).rgb;
  if (uNeon >= 1.0) return textureGrad(tHero, uv + vec2(0.5, 0.0), gx, gy).rgb;
  vec3 off = textureGrad(tHero, uv, gx, gy).rgb;
  vec3 on = textureGrad(tHero, uv + vec2(0.5, 0.0), gx, gy).rgb;
  return mix(off, on, uNeon);
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float softbox(vec3 r, vec3 c, vec2 half_) {
  float d = dot(r, c);
  if (d <= 0.0) return 0.0;
  vec3 u = normalize(cross(vec3(0.0, 1.0, 0.0), c));
  vec3 v = cross(c, u);
  vec2 q = abs(vec2(dot(r, u), dot(r, v)) / d) - half_;
  float e = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return 1.0 - smoothstep(-0.05, 0.12, e);
}

vec3 studioEnv(vec3 r) {
  float base = mix(0.32, 0.92, smoothstep(-0.35, 0.75, r.y));
  float key = softbox(r, normalize(vec3(-0.55, 0.5, 0.67)), vec2(0.42, 0.26));
  float top = softbox(r, normalize(vec3(0.15, 1.0, 0.2)), vec2(0.55, 0.4));
  float side = softbox(r, normalize(vec3(0.9, 0.25, 0.35)), vec2(0.12, 0.6));
  return vec3(1.0, 0.985, 0.96) * base + vec3(1.0, 0.97, 0.93) * (5.0 * key + 3.0 * top + 3.5 * side);
}

void main() {
  vec2 px = vec2((vLocal.x / uScreen.x + 0.5) * SW, (0.5 - vLocal.y / uScreen.y) * SH);
  float sdS = sdRoundBox(vLocal, uScreen.xy * 0.5, uScreen.z);
  float aaS = fwidth(sdS);
  float inScreen = 1.0 - smoothstep(-aaS, aaS, sdS);
  vec2 dx = dFdx(px);
  vec2 dy = dFdy(px);
  float aa = max(length(vec2(dx.x, dy.x)), length(vec2(dx.y, dy.y)));
  vec2 gxA = vec2(dx.x / (SW * 2.0), dx.y / (PH * 4.0));
  vec2 gyA = vec2(dy.x / (SW * 2.0), dy.y / (PH * 4.0));
  float s = 1.0 - 0.13 * uLift;
  vec2 gxH = vec2(dx.x / (SW * 2.0), dx.y / PH) / s;
  vec2 gyH = vec2(dy.x / (SW * 2.0), dy.y / PH) / s;

  vec3 col = vec3(1.0);
  float vy = px.y - VT;
  if (inScreen > 0.0 && vy >= 0.0 && vy < VH) {
    // The hero: in the feed (s = 1) or lifted off it (smaller, rounded, glowing).
    float cy = uHeroTop + CH * 0.5;
    float hx = (px.x - SW * 0.5) / s + SW * 0.5;
    float hy = (vy - cy) / s + CH * 0.5;
    float hEnd = mix(PH, CH, step(0.001, uLift));
    float r = 46.0 * uLift;
    float d = sdRoundBox(vec2(hx - SW * 0.5, hy - hEnd * 0.5), vec2(SW * 0.5, hEnd * 0.5), r) * s;
    float inside = 1.0 - smoothstep(-aa, aa, d);

    vec3 b = vec3(1.0);
    if (inside < 1.0) {
      // The bland feed (blurred along the scroll).
      float fy = vy + uScroll;
      if (uBlur > 0.75) {
        b = vec3(0.0);
        for (int i = 0; i < 8; i++) {
          float o = ((float(i) + 0.5) / 8.0 - 0.5) * uBlur;
          b += bland(px.x, fy + o, gxA, gyA);
        }
        b /= 8.0;
      } else {
        b = bland(px.x, fy, gxA, gyA);
      }
      // Everything but the hero drains of colour after the stop.
      float l = dot(b, vec3(0.2126, 0.7152, 0.0722));
      b = mix(b, vec3(l) * 0.94, uDesat);
      // Lifted: a soft shadow and a warm glow around the card.
      float outD = max(d, 0.0);
      b *= 1.0 - 0.45 * uLift * exp(-outD / 70.0);
      b += vec3(1.0, 0.30, 0.18) * 0.55 * uLift * exp(-outD / 34.0) * (1.0 - inside);
    }
    vec3 h = vec3(0.0);
    if (inside > 0.0) {
      if (uHeroBlur > 0.75) {
        for (int i = 0; i < 8; i++) {
          float o = ((float(i) + 0.5) / 8.0 - 0.5) * uHeroBlur / s;
          h += hero(hx, hy + o, gxH, gyH);
        }
        h /= 8.0;
      } else {
        h = hero(hx, hy, gxH, gyH);
      }
    }
    col = mix(b, h, inside);

    // The thumb.
    float td = length(px - uTouch.xy);
    float tr = 64.0 - 8.0 * uTouch.w;
    float dotA = (1.0 - smoothstep(tr - 2.0, tr + 2.0, td)) * uTouch.z;
    col = mix(col, vec3(0.42), 0.34 * dotA);
    float ring = exp(-pow((td - (tr + 26.0 * uTouch.w)) / 5.0, 2.0)) * uTouch.z * uTouch.w * (1.0 - 0.6 * uTouch.w);
    col = mix(col, vec3(1.0), 0.6 * ring);
  }
  // Fixed chrome (status bar, top bar, bottom nav): only outside the feed viewport.
  if (inScreen > 0.0 && (vy < 2.0 || vy > VH - 2.0)) {
    vec4 ch = textureGrad(tChrome, vec2(px.x / SW, px.y / SH), dx / vec2(SW, SH), dy / vec2(SW, SH));
    vec3 chc = mix(ch.rgb, vec3(dot(ch.rgb, vec3(0.2126, 0.7152, 0.0722))), uDesat);
    col = mix(col, chc, ch.a);
  }
  // Front camera punch hole.
  float hole = 1.0 - smoothstep(16.0 - aa, 16.0 + aa, length(px - vec2(SW * 0.5, 44.0)));
  col = mix(col, vec3(0.004), hole);
  col = mix(vec3(0.004), col * uBright, inScreen);
  // The glass.
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vWorld);
  float f = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
  col += f * uRefl * studioEnv(reflect(-v, n));
  outColor = vec4(col, 1.0);
}`;

export const studioVert = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormalW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/**
 * The off-white cyclorama, unlit so the brand off-white stays exact, with a soft
 * light falloff and a contact shadow: ambient occlusion from a grid of spheres
 * that follows the phone (cheap, soft, and correct for any pose).
 */
export const studioFrag = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uSpheres[18];
uniform float uR;
uniform float uShadow;
uniform vec3 uPhoneC;
varying vec3 vWorld;
varying vec3 vNormalW;
void main() {
  vec3 p = vWorld;
  vec3 n = normalize(vNormalW);
  float occ = 0.0;
  if (distance(p, uPhoneC) < 3.2) for (int i = 0; i < 18; i++) {
    vec3 v = uSpheres[i] - p;
    float d2 = dot(v, v);
    float d = sqrt(d2);
    occ += max(dot(n, v / d), 0.0) * (uR * uR) / d2;
  }
  float sh = 1.0 - uShadow * (1.0 - exp(-occ * 0.9));
  // Soft studio falloff: a pool of light around the phone, darker far away and up the wall.
  float far = smoothstep(2.0, 11.0, length(p.xz - vec2(0.0, -0.5)));
  float up = smoothstep(1.5, 9.0, p.y);
  float light = 1.015 - 0.08 * far - 0.1 * up;
  vec3 warm = mix(vec3(1.0), vec3(1.0, 0.975, 0.94), 0.5 * far + 0.4 * up);
  gl_FragColor = vec4(uBase * light * warm * sh, 1.0);
}`;

/** Adds one motion-blur sample into the accumulation buffer, filling the gap to the next sample. */
export const accumulateFrag = /* glsl */ `
uniform sampler2D tSample;
uniform float uWeight;
uniform vec2 uDir;
uniform vec2 uC;
uniform mat2 uJac;
uniform int uTaps;
varying vec2 vUv;
void main() {
  vec3 c = vec3(0.0);
  if (uTaps <= 1) {
    c = texture2D(tSample, vUv).rgb;
  } else {
    // Affine motion field: translation + zoom + roll of the phone on screen.
    vec2 dir = uDir + uJac * (vUv - uC);
    for (int i = 0; i < 16; i++) {
      if (i >= uTaps) break;
      float o = (float(i) + 0.5) / float(uTaps) - 0.5;
      c += texture2D(tSample, vUv + dir * o).rgb;
    }
    c /= float(uTaps);
  }
  gl_FragColor = vec4(c * uWeight, 1.0);
}`;

/** Final pass: soft-knee tone curve, warm grade, vignette, impact flash, sRGB, grain. */
export const presentFrag = /* glsl */ `
uniform sampler2D tAcc;
uniform float uFlash;
uniform float uVignette;
uniform float uGrain;
uniform float uSeed;
varying vec2 vUv;

vec3 knee(vec3 x) {
  const float k = 0.93;
  vec3 over = k + (1.0 - k) * (1.0 - exp(-(x - k) / (1.0 - k)));
  return mix(x, over, step(k, x));
}
vec3 toSRGB(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
void main() {
  vec3 c = texture2D(tAcc, vUv).rgb;
  // Impact frame: a brief exposure kick.
  c = c * (1.0 + 0.16 * uFlash) + 0.02 * uFlash;
  c = knee(max(c, 0.0));
  // Warm grade: lift the shadows a touch towards amber, keep the whites.
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(c, c * vec3(1.035, 1.0, 0.95), (1.0 - l) * 0.6);
  // Vignette (warm, very soft).
  vec2 q = (vUv - 0.5) * vec2(1.0, 1.1) * 2.0;
  float v = smoothstep(0.55, 1.5, length(q));
  c *= mix(vec3(1.0), vec3(0.86, 0.82, 0.78), (uVignette + 0.25 * uFlash) * v * v * 4.0);
  vec3 s = toSRGB(c);
  // Film grain (triangular, changes every frame) and dither.
  vec2 g = gl_FragCoord.xy + uSeed * vec2(37.0, 17.0);
  float n = hash(g) + hash(g + 13.7) - 1.0;
  s += n * uGrain * (0.35 + 0.65 * (1.0 - abs(dot(s, vec3(0.333)) - 0.5) * 2.0));
  gl_FragColor = vec4(s, 1.0);
}`;
