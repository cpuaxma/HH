// One iPhone-style phone (no logos or brand marks): a satin natural-titanium frame with
// antenna bands, flat sides with the real button layout (action button and volume on the
// left; side button and a flush sapphire camera control on the right), a thin black border
// around the screen, the screen under a glass shader (so the studio reflects in it), and a
// matte glass back with a square camera plateau: three lenses, flash and a LiDAR dot.
// The Dynamic Island, status bar and home indicator are drawn on the screen texture.
// All motion comes from `pose(t)` through the pipeline's animator.
import {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {STUDIO} from '../data';
import {PHONE, PhonePose} from '../lib/story';
import {useAnimator, useProbe} from './Pipeline';
import {glassMaterial} from './glass';
import {ScreenTextures} from './useScreenTexture';
import {GLASS, SCREEN_RADIUS, frameGeometry, plateGeometry, sweepGeometry} from './phoneGeometry';
import {SCREEN} from '../lib/story';

const Z = PHONE.depth / 2;
const HH = PHONE.height / 2;
const HW = PHONE.width / 2;

/** Mirror through the floor plane (y = 0). */
const REFLECT = new THREE.Matrix4().makeScale(1, -1, 1);

/**
 * The screen as seen in the glossy floor: additive, faint, fading with depth below the floor,
 * and blurred (mip bias on the half-res texture). Drawn after the floor and before the phones
 * (no depth test), so it only ever shows on the floor.
 */
const floorMirrorMaterial = (map: THREE.Texture) =>
  new THREE.ShaderMaterial({
    uniforms: {map: {value: map}, brightness: {value: 1}, strength: {value: 0.3}},
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vY;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vY = w.y; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map; uniform float brightness; uniform float strength; varying vec2 vUv; varying float vY;
      void main() {
        if (!gl_FrontFacing) discard;
        vec3 c = texture2D(map, vUv, 2.5).rgb * brightness;
        float fade = strength * exp(vY * 1.5) * smoothstep(0.0, -0.05, vY);
        gl_FragColor = vec4(c * fade, 1.0);
      }`,
    blending: THREE.AdditiveBlending,
    transparent: false,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

/** Button positions (phone-local y of the centre, length), from the real layout. */
const BUTTONS = {
  action: {y: HH - 0.32, len: 0.07},
  volUp: {y: HH - 0.47, len: 0.1},
  volDown: {y: HH - 0.61, len: 0.1},
  side: {y: HH - 0.48, len: 0.17},
  cameraControl: {y: HH - 1.06, len: 0.18},
};

/** Camera plateau (back, top-left as seen from behind). */
const PLATEAU = {size: 0.355, radius: 0.088, inset: 0.034, height: 0.011};

/** Shared geometry and the materials that do not change per phone. */
const useShared = () =>
  useMemo(() => {
    const frame = frameGeometry();
    const glass = plateGeometry(GLASS.width, GLASS.height, GLASS.radius);
    const screen = plateGeometry(SCREEN.width, SCREEN.height, SCREEN_RADIUS);
    const plateauSide = sweepGeometry({width: PLATEAU.size, height: PLATEAU.size, radius: PLATEAU.radius, depth: PLATEAU.height, bulge: 0.005, n: 3});
    const plateauCap = plateGeometry(PLATEAU.size - 0.01, PLATEAU.size - 0.01, PLATEAU.radius - 0.005);
    const ringOuter = new THREE.CylinderGeometry(0.066, 0.066, 0.014, 64, 1);
    const ringLip = new THREE.TorusGeometry(0.0615, 0.0045, 12, 64);
    const lensBlack = new THREE.CircleGeometry(0.057, 48);
    const lensGlass = new THREE.CircleGeometry(0.036, 48);
    const lensIris = new THREE.RingGeometry(0.02, 0.03, 48);
    const flash = new THREE.CircleGeometry(0.018, 32);
    const lidar = new THREE.CircleGeometry(0.015, 32);
    const mic = new THREE.CircleGeometry(0.005, 16);
    const button = (len: number) => new THREE.CapsuleGeometry(0.009, len, 8, 24);

    // Natural titanium: satin, warm, with clear highlights from the softbox and gold rims.
    const titanium = new THREE.MeshPhysicalMaterial({
      color: STUDIO.titanium,
      metalness: 1,
      roughness: 0.3,
      envMapIntensity: 1.35,
      clearcoat: 0.25,
      clearcoatRoughness: 0.3,
      vertexColors: true,
    });
    const titaniumPlain = titanium.clone();
    titaniumPlain.vertexColors = false;
    const blackGlass = glassMaterial({base: '#040405', reflStrength: 1.1});
    // Matte (frosted) colour-matched back glass.
    const backGlass = new THREE.MeshPhysicalMaterial({
      color: STUDIO.backGlass,
      metalness: 0,
      roughness: 0.55,
      clearcoat: 0.35,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.9,
    });
    // The plateau is glossy glass, a touch darker.
    const plateauGlass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(STUDIO.backGlass).multiplyScalar(0.82),
      metalness: 0,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.1,
    });
    const black = new THREE.MeshStandardMaterial({color: '#050506', roughness: 0.35, metalness: 0.2});
    const lensCoat = new THREE.MeshPhysicalMaterial({
      color: '#0a0c18',
      metalness: 0.3,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
      sheen: 1,
      sheenColor: new THREE.Color('#3a2c6a'),
    });
    const iris = new THREE.MeshStandardMaterial({color: '#151826', roughness: 0.3, metalness: 0.6});
    const flashMat = new THREE.MeshStandardMaterial({color: '#efe6cf', roughness: 0.45, emissive: '#2a2418'});
    // Camera control: a flush sapphire crystal set in a titanium surround.
    const sapphire = new THREE.MeshPhysicalMaterial({color: '#1d1b1a', metalness: 0.2, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4});
    return {
      frame,
      glass,
      screen,
      plateauSide,
      plateauCap,
      ringOuter,
      ringLip,
      lensBlack,
      lensGlass,
      lensIris,
      flash,
      lidar,
      mic,
      buttons: {
        action: button(BUTTONS.action.len),
        volUp: button(BUTTONS.volUp.len),
        volDown: button(BUTTONS.volDown.len),
        side: button(BUTTONS.side.len),
        cameraControl: button(BUTTONS.cameraControl.len),
      },
      titanium,
      titaniumPlain,
      blackGlass,
      backGlass,
      plateauGlass,
      black,
      lensCoat,
      iris,
      flashMat,
      sapphire,
    };
  }, []);

export type PhoneProps = {
  texture: ScreenTextures;
  pose: (t: number) => PhonePose;
  /** Screen brightness (emissive intensity) at time t. */
  brightness: (t: number) => number;
};

/** One camera lens: titanium ring, black surround, coated glass and an iris ring. */
const Lens: React.FC<{s: ReturnType<typeof useShared>; x: number; y: number}> = ({s, x, y}) => (
  <group position={[x, y, PLATEAU.height / 2]}>
    <mesh geometry={s.ringOuter} material={s.titaniumPlain} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.007]} />
    <mesh geometry={s.ringLip} material={s.titaniumPlain} position={[0, 0, 0.014]} />
    <mesh geometry={s.lensBlack} material={s.black} position={[0, 0, 0.0142]} />
    <mesh geometry={s.lensGlass} material={s.lensCoat} position={[0, 0, 0.0146]} />
    <mesh geometry={s.lensIris} material={s.iris} position={[0, 0, 0.0144]} />
  </group>
);

export const Phone: React.FC<PhoneProps> = ({texture, pose, brightness}) => {
  const s = useShared();
  const group = useRef<THREE.Group>(null);

  const screenMat = useMemo(() => glassMaterial({map: texture.lo, reflStrength: 0.8}), [texture]);
  const mirror = useRef<THREE.Group>(null);
  const mirrorMat = useMemo(() => floorMirrorMaterial(texture.lo), [texture]);

  // Probe points: the eight corners of the phone, for the motion-blur sample count.
  const probes = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (const x of [-HW, HW]) for (const y of [-HH, HH]) for (const z of [-Z, Z]) pts.push(new THREE.Vector3(x, y, z));
    return pts;
  }, []);
  useProbe(group, probes);

  useAnimator((t) => {
    const g = group.current;
    if (!g) return;
    const p = pose(t);
    g.position.set(...p.pos);
    g.rotation.set(p.rot[0], p.rot[1], p.rot[2], 'YXZ');
    g.scale.setScalar(p.scale);
    screenMat.uniforms.brightness.value = brightness(t);
    screenMat.uniforms.map.value = texture.active.current;
    // The screen's reflection in the glossy floor: the same pose mirrored through y = 0.
    const m = mirror.current;
    if (m) {
      g.updateMatrix();
      m.matrix.multiplyMatrices(REFLECT, g.matrix);
      m.matrixWorldNeedsUpdate = true;
      mirrorMat.uniforms.brightness.value = brightness(t);
    }
  });

  // Plateau centre in the back group's frame (its +x is the phone's −x): top-left seen from behind.
  const px = -GLASS.width / 2 + PLATEAU.inset + PLATEAU.size / 2;
  const py = GLASS.height / 2 - PLATEAU.inset - PLATEAU.size / 2;
  const sideBtn = (b: {y: number; len: number}, g: THREE.BufferGeometry, side: 1 | -1, mat: THREE.Material, out = 0.0035) => (
    <mesh geometry={g} material={mat} position={[side * (HW - 0.009 + out), b.y, 0]} scale={[0.75, 1, 1.45]} />
  );

  return (
    <>
      <group ref={mirror} matrixAutoUpdate={false}>
        <mesh geometry={s.screen} material={mirrorMat} position={[0, 0, Z + 0.0009]} renderOrder={-1} frustumCulled={false} />
      </group>
      <group ref={group}>
        <mesh geometry={s.frame} material={s.titanium} />
        {/* Front: black glass with the screen set into it (a thin, even black border). */}
        <mesh geometry={s.glass} material={s.blackGlass} position={[0, 0, Z + 0.0004]} />
        <mesh geometry={s.screen} material={screenMat} position={[0, 0, Z + 0.0009]} />
        {/* Back: matte glass with the square camera plateau. */}
        <group rotation={[0, Math.PI, 0]}>
          <mesh geometry={s.glass} material={s.backGlass} position={[0, 0, Z + 0.0004]} />
          <group position={[px, py, Z + 0.0004 + PLATEAU.height / 2]}>
            <mesh geometry={s.plateauSide} material={s.plateauGlass} />
            <mesh geometry={s.plateauCap} material={s.plateauGlass} position={[0, 0, PLATEAU.height / 2 + 0.0002]} />
            {/* Three lenses: two stacked on the outer side, one in the middle of the inner side. */}
            <Lens s={s} x={-0.078} y={0.084} />
            <Lens s={s} x={-0.078} y={-0.084} />
            <Lens s={s} x={0.086} y={0} />
            <mesh geometry={s.flash} material={s.flashMat} position={[0.1, 0.122, PLATEAU.height / 2 + 0.0008]} />
            <mesh geometry={s.lidar} material={s.black} position={[0.1, -0.122, PLATEAU.height / 2 + 0.0008]} />
            <mesh geometry={s.mic} material={s.black} position={[0.142, 0.06, PLATEAU.height / 2 + 0.0008]} />
          </group>
        </group>
        {/* Left side: action button and volume. Right side: side button and camera control. */}
        {sideBtn(BUTTONS.action, s.buttons.action, -1, s.titaniumPlain)}
        {sideBtn(BUTTONS.volUp, s.buttons.volUp, -1, s.titaniumPlain)}
        {sideBtn(BUTTONS.volDown, s.buttons.volDown, -1, s.titaniumPlain)}
        {sideBtn(BUTTONS.side, s.buttons.side, 1, s.titaniumPlain)}
        {sideBtn(BUTTONS.cameraControl, s.buttons.cameraControl, 1, s.sapphire, -0.002)}
      </group>
    </>
  );
};
