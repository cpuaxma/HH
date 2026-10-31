import {useLayoutEffect, useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {COLORS, MODULES, TIMING, lockFrame} from '../data';
import {CERT, Pose, STACK, TILE_H, groupPose, sealState, slotY, sweepAt, tileState} from '../lib/choreo';
import {Textures, canvasTexture} from '../lib/textures';
import {ramp} from '../lib/timeline';

/** A diagonal band of light that sweeps across the certificate face (driven by uSweep). */
const SWEEP = {uSweep: {value: -2}};
const addSweep = (m: THREE.MeshStandardMaterial) => {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uSweep = SWEEP.uSweep;
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'varying vec3 vWorld;\nvoid main() {')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'varying vec3 vWorld;\nuniform float uSweep;\nvoid main() {')
      .replace(
        '#include <dithering_fragment>',
        `{
          float d = dot(vWorld.xy, vec2(0.55, 0.83)) - uSweep * 5.0;
          float band = exp(-d * d * 1.6);
          gl_FragColor.rgb += vec3(1.0, 0.93, 0.78) * band * 0.38;
        }
        #include <dithering_fragment>`,
      );
  };
  return m;
};

const goldMaterial = () =>
  new THREE.MeshStandardMaterial({color: COLORS.gold, metalness: 0.92, roughness: 0.26, emissive: new THREE.Color(COLORS.gold), emissiveIntensity: 0});

const slabGeometry = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

const applyPose = (o: THREE.Object3D, p: Pose) => {
  o.position.set(...p.pos);
  o.rotation.set(p.rot[0], p.rot[1], p.rot[2], 'YXZ');
  o.scale.setScalar(p.scale);
};

/** Faint gold outlines of the empty slots, so you can see the certificate being built. */
const ghostMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: {uColor: {value: new THREE.Color(COLORS.gold)}, uOpacity: {value: 0}, uAspect: {value: CERT.w / TILE_H}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; uniform float uAspect; varying vec2 vUv;
      void main() {
        vec2 q = vUv * vec2(uAspect, 1.0);
        float edge = min(min(q.x, uAspect - q.x), min(q.y, 1.0 - q.y));
        float line = 1.0 - smoothstep(0.018, 0.032, edge);
        // Dashes along the outline.
        float along = (q.x + q.y) * 9.0;
        float dash = step(0.45, fract(along));
        float fill = 0.06;
        gl_FragColor = vec4(uColor, uOpacity * max(line * mix(0.35, 1.0, dash), fill));
      }
    `,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });

export const Certificate: React.FC<{textures: Textures; frameOverride?: number}> = ({textures, frameOverride}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;

  const built = useMemo(() => {
    const group = new THREE.Group();
    const tiles = MODULES.map((_, i) => {
      const geo = slabGeometry(CERT.w, TILE_H, CERT.depth);
      const edge = goldMaterial();
      const certFace = addSweep(
        new THREE.MeshStandardMaterial({map: canvasTexture(textures.cert, [i / 4, (i + 1) / 4]), color: '#E9E4DA', roughness: 0.85, metalness: 0, envMapIntensity: 0.25}),
      );
      const moduleFace = new THREE.MeshStandardMaterial({
        map: canvasTexture(textures.modules[i], undefined, true),
        roughness: 0.42,
        metalness: 0.05,
        envMapIntensity: 0.35,
      });
      // Box faces: +x, −x, +y, −y, +z (certificate side), −z (module side).
      const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, certFace, moduleFace]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return {mesh, edge};
    });
    const sealGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 64);
    sealGeo.rotateX(Math.PI / 2);
    const sealTex = canvasTexture(textures.seal);
    // The cylinder's cap maps the texture a quarter turn round; turn it back upright.
    sealTex.center.set(0.5, 0.5);
    sealTex.rotation = Math.PI / 2;
    const sealSide = goldMaterial();
    const sealFace = addSweep(new THREE.MeshStandardMaterial({map: sealTex, metalness: 0.75, roughness: 0.3}));
    const seal = new THREE.Mesh(sealGeo, [sealSide, sealFace, sealSide]);
    // The cylinder's caps face ±z after the rotation; group index 1 is the top cap (+z).
    seal.castShadow = true;
    const ghosts = MODULES.map((_, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(CERT.w, TILE_H), ghostMaterial());
      m.position.set(STACK.pos[0], STACK.pos[1] + STACK.scale * slotY(i), STACK.pos[2] - CERT.depth * 0.6);
      m.scale.setScalar(STACK.scale);
      m.renderOrder = -1;
      return m;
    });
    return {group, tiles, seal, ghosts};
  }, [textures]);

  const g = groupPose(frame);
  const states = MODULES.map((_, i) => tileState(i, frame));
  const s = sealState(frame);
  const sweep = sweepAt(frame);
  const ghostOpacity = ramp(frame, TIMING.courseStart - 10, TIMING.courseStart + 20) * (1 - ramp(frame, TIMING.morphStart - 10, TIMING.morphStart + 10));

  useLayoutEffect(() => {
    // Every tile lives at the top level; tiles that ride with the certificate get the group's transform composed in.
    applyPose(built.group, g);
    built.group.updateMatrix();
    built.tiles.forEach((t, i) => {
      const st = states[i];
      applyPose(t.mesh, st.pose);
      t.mesh.updateMatrix();
      if (!st.world) {
        t.mesh.matrix.premultiply(built.group.matrix);
        t.mesh.matrix.decompose(t.mesh.position, t.mesh.quaternion, t.mesh.scale);
      }
      t.mesh.visible = st.visible && (st.world || g.visible);
      t.edge.emissiveIntensity = st.glow;
    });
    built.seal.position.set(CERT.w / 2 - 0.85, -CERT.h / 2 + 0.95, CERT.depth / 2 + 0.05 + s.lift);
    built.seal.rotation.set(0, 0, 0);
    built.seal.scale.setScalar(Math.max(0.0001, s.scale));
    built.seal.updateMatrix();
    built.seal.matrix.premultiply(built.group.matrix);
    built.seal.matrix.decompose(built.seal.position, built.seal.quaternion, built.seal.scale);
    built.seal.visible = g.visible && s.visible && s.scale > 0.001;
    SWEEP.uSweep.value = sweep;
    built.ghosts.forEach((m, i) => {
      const filled = frame >= lockFrame(i);
      (m.material as THREE.ShaderMaterial).uniforms.uOpacity.value = filled ? 0 : ghostOpacity;
      m.visible = !filled && ghostOpacity > 0.001;
    });
  });

  return (
    <>
      {built.tiles.map((t, i) => (
        <primitive key={i} object={t.mesh} />
      ))}
      <primitive object={built.seal} />
      {built.ghosts.map((m, i) => (
        <primitive key={`g${i}`} object={m} />
      ))}
    </>
  );
};
