import {CAMERA, SAFE, VIDEO} from '../config';

// Camera pushes in around the centre of the safe area.
export const ORIGIN = {x: (SAFE.left + SAFE.right) / 2, y: (SAFE.top + SAFE.bottom) / 2};

// Inner box: anything inside it stays inside SAFE even at the max push.
const k = 1 / CAMERA.pushTo;
export const INNER = {
  left: Math.ceil(ORIGIN.x - (ORIGIN.x - SAFE.left) * k),
  right: Math.floor(ORIGIN.x + (SAFE.right - ORIGIN.x) * k),
  top: Math.ceil(ORIGIN.y - (ORIGIN.y - SAFE.top) * k) + 70, // + room for the HUD row
  bottom: Math.floor(ORIGIN.y + (SAFE.bottom - ORIGIN.y) * k),
};
export const INNER_W = INNER.right - INNER.left;
export const CX = ORIGIN.x;
export const W = VIDEO.width;
export const H = VIDEO.height;
