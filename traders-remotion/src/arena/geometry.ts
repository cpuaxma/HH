import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {PILLAR_H, PILLAR_R, TILE, TILE_T} from './grid';

/** A faceted hexagonal gold token: a foot ring, the body and a bevelled glowing top. Origin at the base centre. */
export const makePillarGeometry = () => {
  const footH = PILLAR_H * 0.05;
  const bodyH = PILLAR_H * 0.89;
  const capH = PILLAR_H * 0.06;
  const foot = new THREE.CylinderGeometry(PILLAR_R * 1.08, PILLAR_R * 1.12, footH, 6, 1).translate(0, footH / 2, 0);
  const body = new THREE.CylinderGeometry(PILLAR_R, PILLAR_R, bodyH, 6, 1).translate(0, footH + bodyH / 2, 0);
  const cap = new THREE.CylinderGeometry(PILLAR_R * 0.8, PILLAR_R, capH, 6, 1).translate(0, footH + bodyH + capH / 2, 0);
  const parts = [foot, body, cap].map((g) => {
    const n = g.toNonIndexed();
    n.deleteAttribute('uv');
    n.computeVertexNormals(); // flat facets catch the light like cut metal
    return n;
  });
  const g = mergeGeometries(parts)!;
  g.rotateY(Math.PI / 6);
  return g;
};

/**
 * One half of a tile (tiles split in two so they can open like trapdoors). The bottom face and the
 * inner seam face are dropped so the semi-transparent glass never shows an internal edge.
 * side = -1 → left half (seam on +x), +1 → right half (seam on −x).
 */
export const makeHalfTileGeometry = (side: -1 | 1) => {
  const box = new THREE.BoxGeometry(TILE / 2, TILE_T, TILE, 1, 1, 1);
  const index = box.getIndex()!;
  const keep: number[] = [];
  // BoxGeometry groups: 0:+x 1:−x 2:+y 3:−y 4:+z 5:−z
  const drop = new Set([3, side === -1 ? 0 : 1]);
  box.groups.forEach((gr, gi) => {
    if (drop.has(gi)) return;
    for (let j = gr.start; j < gr.start + gr.count; j++) keep.push(index.getX(j));
  });
  box.setIndex(keep);
  box.clearGroups();
  return box;
};
