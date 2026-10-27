import {useMemo} from 'react';
import * as THREE from 'three';
import {CITY_COLORS} from '../data';
import {EDGE_LINE_WIDTH, Rect, Segment, getCity} from '../lib/city';

type Quad = [number, number][]; // 4 corners in (x, z), counter-clockwise seen from above

const rectQuad = (r: Rect): Quad => [
  [r.x0, r.z1],
  [r.x1, r.z1],
  [r.x1, r.z0],
  [r.x0, r.z0],
];

const segmentQuad = (s: Segment, width: number): Quad => {
  const dx = s.bx - s.ax;
  const dz = s.bz - s.az;
  const len = Math.hypot(dx, dz) || 1;
  const nx = (-dz / len) * (width / 2);
  const nz = (dx / len) * (width / 2);
  return [
    [s.ax - nx, s.az - nz],
    [s.bx - nx, s.bz - nz],
    [s.bx + nx, s.bz + nz],
    [s.ax + nx, s.az + nz],
  ];
};

/** One flat, merged mesh per ground layer (all at y = 0). */
const flatGeometry = (quads: Quad[]) => {
  const pos = new Float32Array(quads.length * 4 * 3);
  const idx: number[] = [];
  quads.forEach((q, i) => {
    q.forEach(([x, z], k) => {
      pos.set([x, 0, z], (i * 4 + k) * 3);
    });
    const b = i * 4;
    // Make both triangles face up regardless of corner winding.
    const [a0, a1, a2] = [q[0], q[1], q[2]];
    const cross = (a1[0] - a0[0]) * (a2[1] - a0[1]) - (a1[1] - a0[1]) * (a2[0] - a0[0]);
    if (cross < 0) idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    else idx.push(b, b + 2, b + 1, b, b + 3, b + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const normals = new Float32Array(pos.length);
  for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
  g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  g.setIndex(idx);
  return g;
};

/** Ground layers are coplanar; polygon offset orders them without z-fighting. */
const flatMaterial = (color: string, layer: number) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -layer,
    polygonOffsetUnits: -layer * 4,
  });

/** Building material: matte white with procedural window rows and a soft base occlusion. */
const buildingMaterial = () => {
  const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.9, metalness: 0});
  const win = new THREE.Color(CITY_COLORS.window);
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uWindow = {value: win};
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vHpWorld;\nvarying vec3 vHpNormal;')
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vec4 hpW = vec4(transformed, 1.0);
        vec3 hpN = objectNormal;
        #ifdef USE_INSTANCING
          hpW = instanceMatrix * hpW;
          hpN = mat3(instanceMatrix) * hpN;
        #endif
        vHpWorld = (modelMatrix * hpW).xyz;
        vHpNormal = normalize(mat3(modelMatrix) * hpN);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vHpWorld;\nvarying vec3 vHpNormal;\nuniform vec3 uWindow;',
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          float wall = 1.0 - step(0.5, abs(vHpNormal.y));
          float u = abs(vHpNormal.x) > 0.5 ? vHpWorld.z : vHpWorld.x;
          float fy = fract(vHpWorld.y / 3.2);
          float fx = fract(u / 3.1);
          float aa = fwidth(vHpWorld.y / 3.2) + fwidth(u / 3.1);
          float rows = smoothstep(0.34, 0.40, fy) * (1.0 - smoothstep(0.74, 0.80, fy));
          float cols = smoothstep(0.16, 0.24, fx) * (1.0 - smoothstep(0.76, 0.84, fx));
          float win = rows * cols * wall * step(2.6, vHpWorld.y) * (1.0 - smoothstep(0.18, 0.45, aa));
          diffuseColor.rgb = mix(diffuseColor.rgb, uWindow, win * 0.75);
          // Soft occlusion where walls meet the ground.
          diffuseColor.rgb *= mix(0.84, 1.0, smoothstep(0.0, 4.5, vHpWorld.y));
        }`,
      );
  };
  m.customProgramCacheKey = () => 'hp-building';
  return m;
};

export const City: React.FC = () => {
  const city = getCity();

  const layers = useMemo(() => {
    const {minX, maxX, minZ, maxZ} = {
      minX: city.xRoads[0].pos - city.xRoads[0].width / 2,
      maxX: city.xRoads[city.xRoads.length - 1].pos + city.xRoads[city.xRoads.length - 1].width / 2,
      minZ: city.zRoads[0].pos - city.zRoads[0].width / 2,
      maxZ: city.zRoads[city.zRoads.length - 1].pos + city.zRoads[city.zRoads.length - 1].width / 2,
    };
    // Pieces that don't overlap, so each pixel of ground is shaded about once.
    const roadArea = flatGeometry([
      ...city.xRoads.map((r) => rectQuad({x0: r.pos - r.width / 2, x1: r.pos + r.width / 2, z0: minZ, z1: maxZ})),
      ...city.zRoads.map((r) => rectQuad({x0: minX, x1: maxX, z0: r.pos - r.width / 2, z1: r.pos + r.width / 2})),
    ]);
    const blocks = flatGeometry(city.blocks.filter((b) => !city.parks.includes(b)).map(rectQuad));
    const parks = flatGeometry(city.parks.map(rectQuad));
    const avenues = flatGeometry(
      city.avenues.map((a) => segmentQuad({ax: a.ax, az: a.az, bx: a.bx, bz: a.bz}, a.width)),
    );
    const lines = flatGeometry(city.edgeLines.map((s) => segmentQuad(s, EDGE_LINE_WIDTH)));
    const water = flatGeometry([rectQuad({x0: -6000, x1: 6000, z0: -6000, z1: city.shoreZ})]);
    const shore = flatGeometry([rectQuad({x0: -6000, x1: 6000, z0: city.shoreZ - 2.2, z1: city.shoreZ})]);
    // Ground outside the city: a frame around it, from the shore southwards.
    const ground = flatGeometry([
      rectQuad({x0: -6000, x1: 6000, z0: city.shoreZ, z1: minZ}),
      rectQuad({x0: -6000, x1: 6000, z0: maxZ, z1: 6000}),
      rectQuad({x0: -6000, x1: minX, z0: minZ, z1: maxZ}),
      rectQuad({x0: maxX, x1: 6000, z0: minZ, z1: maxZ}),
    ]);
    // Park paths: a light cross through each park.
    const paths = flatGeometry(
      city.parks.flatMap((p) => {
        const cx = (p.x0 + p.x1) / 2;
        const cz = (p.z0 + p.z1) / 2;
        return [
          rectQuad({x0: cx - 1.6, x1: cx + 1.6, z0: p.z0, z1: p.z1}),
          rectQuad({x0: p.x0, x1: p.x1, z0: cz - 1.6, z1: cz + 1.6}),
        ];
      }),
    );
    // Avenue strips are drawn over blocks, but must stop at the shore.
    return [
      {g: ground, m: flatMaterial(CITY_COLORS.ground, 0)},
      {g: roadArea, m: flatMaterial(CITY_COLORS.road, 1)},
      {g: blocks, m: flatMaterial(CITY_COLORS.ground, 2)},
      {g: parks, m: flatMaterial(CITY_COLORS.park, 3)},
      {g: paths, m: flatMaterial(CITY_COLORS.road, 4)},
      {g: avenues, m: flatMaterial(CITY_COLORS.road, 5)},
      {g: lines, m: flatMaterial(CITY_COLORS.roadEdge, 6)},
      {g: water, m: flatMaterial(CITY_COLORS.water, 7)},
      {g: shore, m: flatMaterial(CITY_COLORS.waterEdge, 8)},
    ];
  }, [city]);

  const buildings = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mesh = new THREE.InstancedMesh(geo, buildingMaterial(), city.boxes.length);
    const m = new THREE.Matrix4();
    const palette = CITY_COLORS.buildings.map((c) => new THREE.Color(c));
    city.boxes.forEach((b, i) => {
      m.makeScale(b.sx, b.h, b.sz);
      m.setPosition(b.cx, b.y0, b.cz);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, b.color === 0xffffff ? new THREE.Color('#ffffff') : palette[b.color]);
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return mesh;
  }, [city]);

  const roofFrames = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: CITY_COLORS.roofHighlight,
      roughness: 0.8,
      emissive: CITY_COLORS.roofHighlight,
      emissiveIntensity: 0.25,
    });
    const t = 0.75;
    const hgt = 0.7;
    const mesh = new THREE.InstancedMesh(geo, mat, city.featured.length * 4);
    const m = new THREE.Matrix4();
    let k = 0;
    for (const f of city.featured) {
      const {cx, cz, sx, sz, h} = f.box;
      const bars: [number, number, number, number][] = [
        [cx, cz - sz / 2 + t / 2, sx, t],
        [cx, cz + sz / 2 - t / 2, sx, t],
        [cx - sx / 2 + t / 2, cz, t, sz - 2 * t],
        [cx + sx / 2 - t / 2, cz, t, sz - 2 * t],
      ];
      for (const [x, z, w, d] of bars) {
        m.makeScale(w + 0.06, hgt, d + 0.06);
        m.setPosition(x, h - 0.02, z);
        mesh.setMatrixAt(k++, m);
      }
    }
    mesh.castShadow = true;
    mesh.frustumCulled = false;
    return mesh;
  }, [city]);

  const trees = useMemo(() => {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.28, 1, 6);
    trunkGeo.translate(0, 0.5, 0);
    const crownGeo = new THREE.IcosahedronGeometry(1, 1);
    const trunks = new THREE.InstancedMesh(
      trunkGeo,
      new THREE.MeshStandardMaterial({color: CITY_COLORS.trunk, roughness: 0.9}),
      city.trees.length,
    );
    const crowns = new THREE.InstancedMesh(
      crownGeo,
      new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.9, flatShading: true}),
      city.trees.length,
    );
    const light = new THREE.Color(CITY_COLORS.treeLight);
    const dark = new THREE.Color(CITY_COLORS.treeDark);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    city.trees.forEach((t, i) => {
      m.makeScale(1, t.trunk, 1);
      m.setPosition(t.x, 0, t.z);
      trunks.setMatrixAt(i, m);
      e.set(0, t.color * Math.PI * 2, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(t.x, t.trunk + t.r * 0.72, t.z), q, new THREE.Vector3(t.r, t.r * 0.92, t.r));
      crowns.setMatrixAt(i, m);
      crowns.setColorAt(i, light.clone().lerp(dark, t.color));
    });
    for (const mesh of [trunks, crowns]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
    }
    return [trunks, crowns];
  }, [city]);

  return (
    <group>
      {layers.map((l, i) => (
        <mesh key={i} geometry={l.g} material={l.m} receiveShadow renderOrder={i} />
      ))}
      <primitive object={buildings} />
      <primitive object={roofFrames} />
      <primitive object={trees[0]} />
      <primitive object={trees[1]} />
    </group>
  );
};
