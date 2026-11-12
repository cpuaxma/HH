"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { LEVELS, getHeat } from "@/lib/heat";

const vert = /* glsl */ `
  uniform float uTime; uniform float uHeat; uniform float uPx;
  attribute float aSeed; attribute float aSpeed; attribute float aSize;
  varying float vLife; varying float vSeed;
  void main() {
    float life = fract(aSeed * 13.7 + uTime * aSpeed * (0.6 + uHeat * 0.8));
    vec3 p = position;
    p.y = mix(-3.2, 3.6, life);
    p.x += sin(uTime * 0.9 + aSeed * 40.0) * 0.35 * life + sin(life * 6.0 + aSeed * 9.0) * 0.18;
    p.z += cos(uTime * 0.7 + aSeed * 30.0) * 0.2;
    vLife = life; vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx * (0.6 + uHeat * 0.7) * (1.0 - life * 0.6) * (6.0 / -mv.z);
  }
`;

const frag = /* glsl */ `
  uniform vec3 uColor; uniform float uTime; uniform float uHeat;
  varying float vLife; varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float flicker = 0.65 + 0.35 * sin(uTime * 9.0 + vSeed * 80.0);
    float fade = smoothstep(0.0, 0.12, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));
    vec3 col = mix(uColor, vec3(1.0, 0.85, 0.55), core * core);
    gl_FragColor = vec4(col * (1.2 + uHeat), core * fade * flicker * (0.35 + uHeat * 0.65));
  }
`;

function Field({ lite, onLowFps }: { lite: boolean; onLowFps?: () => void }) {
  const count = lite ? 70 : 220;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const speed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
      seed[i] = Math.random();
      speed[i] = 0.05 + Math.random() * 0.09;
      size[i] = 2 + Math.random() * 5;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uHeat: { value: 0.66 }, uPx: { value: 1 }, uColor: { value: new THREE.Color("#ff5a22") } },
      }),
    [],
  );
  const fps = useRef({ warm: 0, n: 0, t: 0, done: false });
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    const L = LEVELS[getHeat()];
    const u = mat.uniforms;
    u.uTime.value += Math.min(dt, 0.05);
    u.uHeat.value += (L.heat - u.uHeat.value) * Math.min(1, dt * 2);
    u.uPx.value = state.gl.getPixelRatio() * 4;
    const [r, g, b] = L.glow.split(" ").map((n) => Number(n) / 255);
    target.setRGB(r, g, b);
    (u.uColor.value as THREE.Color).lerp(target, Math.min(1, dt * 2));

    // Frame-rate watch: after warm-up, average two seconds; under 50fps the embers bow out.
    const f = fps.current;
    if (onLowFps && !f.done && ++f.warm > 40) {
      f.n++;
      f.t += dt;
      if (f.t > 2) {
        f.done = true;
        if (f.n / f.t < 50) onLowFps();
      }
    }
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

export default function EmbersScene({ lite, active, onLowFps }: { lite: boolean; active: boolean; onLowFps?: () => void }) {
  return (
    <Canvas
      dpr={lite ? 1 : [1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Field lite={lite} onLowFps={onLowFps} />
      {!lite && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.15} luminanceSmoothing={0.3} radius={0.65} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
