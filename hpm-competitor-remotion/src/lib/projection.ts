// Projects 3D points to screen pixels with exactly the camera the renderer uses,
// so HTML labels stay pinned to the phones.
import * as THREE from 'three';
import {FormatId, LAYOUT} from '../data';
import {computeCamera} from './camera';
import {PhonePose, V3} from './story';

const cam = new THREE.PerspectiveCamera();

export const applyCamera = (camera: THREE.PerspectiveCamera, t: number, fmt: FormatId, width: number, height: number) => {
  const c = computeCamera(t, fmt);
  camera.aspect = width / height;
  camera.fov = c.fov;
  camera.near = Math.max(0.03, c.dist * 0.04);
  camera.far = 60;
  camera.position.set(...c.position);
  camera.up.set(...c.up);
  camera.lookAt(...c.target);
  // Put the target where the layout wants it (centred horizontally).
  camera.setViewOffset(width, height, width / 2 - c.focusPx[0], height / 2 - c.focusPx[1], width, height);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return c;
};

/** Screen position (px) of a point given in a phone's local space, posed at time t. */
export const projectOnPhone = (t: number, fmt: FormatId, pose: PhonePose, local: V3) => {
  const {width, height} = LAYOUT[fmt];
  applyCamera(cam, t, fmt, width, height);
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pose.pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.rot[0], pose.rot[1], pose.rot[2], 'YXZ')),
    new THREE.Vector3(pose.scale, pose.scale, pose.scale),
  );
  const v = new THREE.Vector3(...local).applyMatrix4(m).project(cam);
  return {x: (v.x * 0.5 + 0.5) * width, y: (0.5 - v.y * 0.5) * height, behind: v.z > 1};
};
