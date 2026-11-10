// One sculpted metal animal: its rig (a group per joint) posed by the story each (sub)frame
// through the pipeline's animator. Polished gold or silver: fully metallic physical
// materials lit by the shared studio (key, rim strips, softbox, room reflections), with the
// baked cavity shading in the vertex colours.
import {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {useAnimator, useProbe} from '../three/Pipeline';
import {ANIMAL_FIGURES, FigureDef, Metal} from './figures';
import {bakeFigure, decodePart} from './bake';
import {COLORS} from './data';

export type FigurePose = {
  pos: [number, number, number];
  /** Yaw, pitch, roll (radians), applied in that order. */
  rot: [number, number, number];
  scale: number;
  /** Joint rotations (Euler XYZ, radians) by joint name. */
  joints?: Record<string, [number, number, number]>;
  /** Hide the whole figure (skips drawing it). */
  visible?: boolean;
};

const materials = new Map<string, THREE.Material>();
export const metalMaterial = (metal: Metal) => {
  let m = materials.get(metal);
  if (m) return m;
  const c = metal === 'gold' ? COLORS.gold : COLORS.silver;
  m = new THREE.MeshPhysicalMaterial({
    color: c.base,
    metalness: 1,
    roughness: c.roughness,
    envMapIntensity: c.env,
    vertexColors: true,
  });
  materials.set(metal, m);
  return m;
};

/**
 * Every figure's meshes, loaded once per page from public/animals/ (baked by
 * scripts/bake-animals.ts). If they haven't been baked, the figures are meshed here instead
 * (the same result, about a minute and a half slower).
 */
let loading: Promise<Map<string, Map<string, THREE.BufferGeometry>>> | null = null;
const loadFigures = () => {
  if (loading) return loading;
  loading = (async () => {
    const out = new Map<string, Map<string, THREE.BufferGeometry>>();
    let manifest: {files: Record<string, Record<string, string>>} | null = null;
    try {
      const r = await fetch(staticFile('animals/manifest.json'));
      if (r.ok) manifest = await r.json();
    } catch {
      manifest = null;
    }
    for (const def of ANIMAL_FIGURES) {
      const files = manifest?.files[def.id];
      if (files && def.joints.every((j) => files[j.name])) {
        const parts = new Map<string, THREE.BufferGeometry>();
        await Promise.all(
          def.joints.map(async (j) => {
            const r = await fetch(staticFile(`animals/${files[j.name]}`));
            parts.set(j.name, decodePart(await r.arrayBuffer()));
          }),
        );
        out.set(def.id, parts);
      } else {
        console.log(`[animals] ${def.id}: no baked meshes, meshing in the page`);
        out.set(def.id, bakeFigure(def));
      }
    }
    return out;
  })();
  return loading;
};

/** The figure meshes, holding the render until they are in. */
const useFigureMeshes = () => {
  const [meshes, setMeshes] = useState<Map<string, Map<string, THREE.BufferGeometry>> | null>(null);
  const [handle] = useState(() => delayRender('Loading the animal meshes', {timeoutInMilliseconds: 240000}));
  useEffect(() => {
    loadFigures().then((m) => {
      setMeshes(m);
      continueRender(handle);
    });
  }, [handle]);
  return meshes;
};

/** Probe points riding on one joint, so its own fast moves (a swipe, a head toss) get motion blur. */
const JointProbe: React.FC<{geo: THREE.BufferGeometry}> = ({geo}) => {
  const ref = useRef<THREE.Group>(null);
  const pts = useMemo(() => {
    geo.computeBoundingBox();
    const b = geo.boundingBox!;
    const out: THREE.Vector3[] = [];
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) out.push(new THREE.Vector3(x, y, z));
    return out;
  }, [geo]);
  useProbe(ref, pts);
  return <group ref={ref} />;
};

const MeshesContext = createContext<Map<string, Map<string, THREE.BufferGeometry>> | null>(null);

/** Loads the animals' meshes, then renders its children (the figures). */
export const FigureMeshes: React.FC<{children: React.ReactNode}> = ({children}) => {
  const meshes = useFigureMeshes();
  return meshes ? <MeshesContext.Provider value={meshes}>{children}</MeshesContext.Provider> : null;
};

export const Figure: React.FC<{def: FigureDef; pose: (t: number) => FigurePose}> = ({def, pose}) => {
  const meshes = useContext(MeshesContext)!;
  const root = useRef<THREE.Group>(null);
  const groups = useRef<Record<string, THREE.Group | null>>({});
  const mat = metalMaterial(def.metal);

  const parts = useMemo(
    () =>
      def.joints.map((j) => {
        const g = meshes.get(def.id)!.get(j.name)!;
        // Geometry in the joint's own frame (centred on its pivot).
        const local = g.clone();
        local.translate(-j.pivot[0], -j.pivot[1], -j.pivot[2]);
        const parent = j.parent ? def.joints.find((p) => p.name === j.parent)! : null;
        const offset: [number, number, number] = parent ? [j.pivot[0] - parent.pivot[0], j.pivot[1] - parent.pivot[1], j.pivot[2] - parent.pivot[2]] : j.pivot;
        return {j, geo: local, offset};
      }),
    [def, meshes],
  );

  // Probe points: a box around the figure, for the motion-blur sample count.
  const probes = useMemo(() => {
    const box = new THREE.Box3();
    for (const p of parts) {
      p.geo.computeBoundingBox();
      const b = p.geo.boundingBox!.clone().translate(new THREE.Vector3(...p.j.pivot));
      box.union(b);
    }
    const pts: THREE.Vector3[] = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, y, z));
    return pts;
  }, [parts]);
  useProbe(root, probes);

  useAnimator((t) => {
    const p = pose(t);
    const r = root.current;
    if (!r) return;
    r.visible = p.visible !== false;
    // Hidden figures are parked far below the floor, so they never count for motion blur.
    if (r.visible) r.position.set(...p.pos);
    else r.position.set(0, -60, 0);
    r.rotation.set(p.rot[1], p.rot[0], p.rot[2], 'YXZ');
    r.scale.setScalar(p.scale);
    for (const {j} of parts) {
      const g = groups.current[j.name];
      if (!g) continue;
      const q = p.joints?.[j.name];
      if (q) g.rotation.set(q[0], q[1], q[2]);
      else g.rotation.set(0, 0, 0);
    }
  });

  // Nest the groups by parent.
  const render = (parent: string | undefined): React.ReactNode =>
    parts
      .filter((p) => p.j.parent === parent)
      .map((p) => (
        <group
          key={p.j.name}
          ref={(g) => {
            groups.current[p.j.name] = g;
          }}
          position={p.offset}
        >
          <mesh geometry={p.geo} material={mat} />
          {def.blurJoints?.includes(p.j.name) ? <JointProbe geo={p.geo} /> : null}
          {render(p.j.name)}
        </group>
      ));

  return <group ref={root}>{render(undefined)}</group>;
};
