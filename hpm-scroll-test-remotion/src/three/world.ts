// Builds the 3D world imperatively (so the renderer can re-pose it for every motion-blur
// sample within a frame): the studio cyclorama, the phone and the lights.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {BRAND} from '../data';
import {PHONE} from '../lib/layout';
import {drawBlandAtlas, drawChrome, drawHero} from './feedTextures';
import {screenFrag, screenVert, studioFrag, studioVert} from './shaders';

const roundedRectShape = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};

/** A flat rounded rectangle with UVs spanning its bounds. */
const roundedPlane = (w: number, h: number, r: number) => {
  const g = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 24);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
};

const canvasTexture = (c: HTMLCanvasElement, gl: THREE.WebGLRenderer) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
};

/** Cyclorama profile: floor from the front, a curved sweep, then the back wall. */
const cyclorama = () => {
  const zFront = 16;
  const zWall = -7;
  const rad = 3.2;
  const top = 16;
  const halfW = 18;
  const profile: [number, number, number, number][] = []; // z, y, nz, ny
  for (let i = 0; i <= 40; i++) profile.push([zFront + ((zWall + rad - zFront) * i) / 40, 0, 0, 1]);
  for (let i = 1; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    profile.push([zWall + rad - Math.sin(a) * rad, rad - Math.cos(a) * rad, Math.sin(a), Math.cos(a)]);
  }
  for (let i = 1; i <= 20; i++) profile.push([zWall, rad + ((top - rad) * i) / 20, 1, 0]);
  const nx = 40;
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  profile.forEach(([z, y, nz, ny]) => {
    for (let j = 0; j <= nx; j++) {
      pos.push(-halfW + (2 * halfW * j) / nx, y, z);
      nor.push(0, ny, nz);
    }
  });
  for (let i = 0; i < profile.length - 1; i++) {
    for (let j = 0; j < nx; j++) {
      const a = i * (nx + 1) + j;
      const b = a + nx + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
};

export type World = {
  scene: THREE.Scene;
  phone: THREE.Group;
  screen: THREE.ShaderMaterial;
  studio: THREE.ShaderMaterial;
  /** Phone-local centres of the contact-shadow spheres. */
  sphereLocal: THREE.Vector3[];
};

export const buildWorld = (gl: THREE.WebGLRenderer): World => {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environmentIntensity = 0.9;
  pmrem.dispose();

  // Lights: a warm soft key from the front-left, a cool rim from behind-right.
  const key = new THREE.DirectionalLight('#FFF1E2', 2.2);
  key.position.set(-3.5, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#F2F6FF', 3.2);
  rim.position.set(4, 3, -5);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight('#FFE6D6', 1.4);
  rim2.position.set(-5, 1.5, -3);
  scene.add(rim2);

  // The studio.
  const sphereLocal: THREE.Vector3[] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 6; j++) {
      sphereLocal.push(new THREE.Vector3((i - 1) * 0.24, (j - 2.5) * 0.27, 0));
    }
  }
  const studio = new THREE.ShaderMaterial({
    vertexShader: studioVert,
    fragmentShader: studioFrag,
    uniforms: {
      uBase: {value: new THREE.Color(BRAND.offWhite)},
      uSpheres: {value: sphereLocal.map((v) => v.clone())},
      uR: {value: 0.25},
      uShadow: {value: 0.62},
      uPhoneC: {value: new THREE.Vector3()},
    },
  });
  const cyc = new THREE.Mesh(cyclorama(), studio);
  cyc.frustumCulled = false;
  scene.add(cyc);

  // The phone.
  const phone = new THREE.Group();
  phone.matrixAutoUpdate = false;
  scene.add(phone);

  const bevel = 0.026;
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(PHONE.w - 2 * bevel, PHONE.h - 2 * bevel, PHONE.corner - bevel), {
    depth: PHONE.depth - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 8,
    curveSegments: 28,
  });
  bodyGeo.deleteAttribute('uv');
  const body = mergeVertices(bodyGeo, 1e-5);
  body.computeVertexNormals();
  body.translate(0, 0, -(PHONE.depth - 2 * bevel) / 2);
  const aluminium = new THREE.MeshStandardMaterial({
    color: '#CFCCC8',
    metalness: 1,
    roughness: 0.3,
    envMapIntensity: 1.1,
  });
  phone.add(new THREE.Mesh(body, aluminium));

  // Front glass: one surface for the black bezel, the screen and the reflections.
  const front = PHONE.depth / 2;
  const glassGeo = roundedPlane(PHONE.w - 0.014, PHONE.h - 0.014, PHONE.corner - 0.007);
  const atlas = canvasTexture(drawBlandAtlas(), gl);
  const heroTex = canvasTexture(drawHero(), gl);
  const chrome = canvasTexture(drawChrome(), gl);
  const screen = new THREE.ShaderMaterial({
    vertexShader: screenVert,
    fragmentShader: screenFrag,
    glslVersion: THREE.GLSL3,
    uniforms: {
      tAtlas: {value: atlas},
      tHero: {value: heroTex},
      tChrome: {value: chrome},
      uScroll: {value: 0},
      uHeroTop: {value: 0},
      uLift: {value: 0},
      uBlur: {value: 0},
      uHeroBlur: {value: 0},
      uDesat: {value: 0},
      uTouch: {value: new THREE.Vector4()},
      uNeon: {value: 0},
      uBright: {value: 1},
      uScreen: {value: new THREE.Vector3(PHONE.screenW, PHONE.screenH, PHONE.screenCorner)},
      uRefl: {value: 1},
    },
  });
  const glass = new THREE.Mesh(glassGeo, screen);
  glass.position.z = front + 0.001;
  phone.add(glass);

  // Earpiece slit at the top edge of the glass.
  const slit = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.006, 0.004, 2, 0.002), new THREE.MeshBasicMaterial({color: '#0B0B0B'}));
  slit.position.set(0, PHONE.h / 2 - 0.009, front + 0.0016);
  phone.add(slit);

  // Side buttons and antenna lines.
  const btnMat = aluminium;
  const addButton = (x: number, y: number, len: number) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.014, len, 0.032, 3, 0.006), btnMat);
    b.position.set(x, y, 0);
    phone.add(b);
  };
  addButton(PHONE.w / 2 + 0.004, 0.34, 0.2);
  addButton(-PHONE.w / 2 - 0.004, 0.42, 0.11);
  addButton(-PHONE.w / 2 - 0.004, 0.25, 0.11);
  const antMat = new THREE.MeshStandardMaterial({color: '#8C8A87', roughness: 0.55, metalness: 0.2});
  for (const [x, y, w, h] of [
    [PHONE.w / 2 - 0.001, 0.62, 0.006, 0.012],
    [-PHONE.w / 2 + 0.001, -0.62, 0.006, 0.012],
    [0.22, PHONE.h / 2 - 0.001, 0.012, 0.006],
    [-0.22, -PHONE.h / 2 + 0.001, 0.012, 0.006],
  ]) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(w, h, PHONE.depth * 0.62), antMat);
    a.position.set(x, y, 0);
    phone.add(a);
  }

  return {scene, phone, screen, studio, sphereLocal};
};
