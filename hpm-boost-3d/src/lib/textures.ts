// Procedural canvas textures. Everything is drawn in code: no text, letters or logos.
import * as THREE from 'three';
import {makeRandom} from './math';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};

const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const tex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
  return t;
};

const WARM = '255, 240, 226';

/** A plain social post in dark mode. The Boost button itself is a separate mesh. */
export const SCREEN_PX = {w: 1024, h: 2206};
export const makeScreenTexture = () => {
  const {w: W, h: H} = SCREEN_PX;
  const [c, ctx] = canvas(W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#14100f');
  bg.addColorStop(1, '#0d0b0a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const fill = (a: number) => `rgba(${WARM}, ${a})`;
  // Status bar: shapes only.
  ctx.fillStyle = fill(0.85);
  rr(ctx, 70, 52, 92, 26, 13);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    rr(ctx, 790 + i * 17, 74 - (i + 1) * 6, 11, (i + 1) * 6 + 4, 3);
    ctx.fill();
  }
  ctx.strokeStyle = fill(0.85);
  ctx.lineWidth = 4;
  rr(ctx, 872, 50, 62, 30, 9);
  ctx.stroke();
  rr(ctx, 878, 56, 40, 18, 5);
  ctx.fill();
  // Dynamic island.
  ctx.fillStyle = '#000';
  rr(ctx, 402, 34, 220, 64, 32);
  ctx.fill();

  // App bar.
  ctx.fillStyle = fill(0.9);
  rr(ctx, 60, 150, 170, 30, 15);
  ctx.fill();
  ctx.strokeStyle = fill(0.8);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(905, 165, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(812, 150);
  ctx.lineTo(842, 165);
  ctx.lineTo(812, 180);
  ctx.closePath();
  ctx.stroke();

  // Post header.
  const av = ctx.createLinearGradient(44, 234, 136, 326);
  av.addColorStop(0, '#ff7a2e');
  av.addColorStop(1, '#c4210f');
  ctx.fillStyle = av;
  ctx.beginPath();
  ctx.arc(90, 280, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#14100f';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(90, 280, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = fill(0.9);
  rr(ctx, 160, 252, 250, 24, 12);
  ctx.fill();
  ctx.fillStyle = fill(0.38);
  rr(ctx, 160, 292, 160, 18, 9);
  ctx.fill();
  ctx.fillStyle = fill(0.7);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(900 + i * 22, 280, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Post image: a moody, abstract product shot.
  const ix = 40;
  const iy = 352;
  const iw = 944;
  const ih = 980;
  ctx.save();
  rr(ctx, ix, iy, iw, ih, 30);
  ctx.clip();
  const ig = ctx.createLinearGradient(0, iy, 0, iy + ih);
  ig.addColorStop(0, '#2a1e1a');
  ig.addColorStop(0.62, '#3a2620');
  ig.addColorStop(0.63, '#1d1513');
  ig.addColorStop(1, '#120e0d');
  ctx.fillStyle = ig;
  ctx.fillRect(ix, iy, iw, ih);
  const sun = ctx.createRadialGradient(560, 820, 10, 560, 820, 420);
  sun.addColorStop(0, 'rgba(255, 150, 80, 0.55)');
  sun.addColorStop(0.35, 'rgba(232, 70, 30, 0.22)');
  sun.addColorStop(1, 'rgba(232, 70, 30, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(ix, iy, iw, ih);
  // A simple vase/bottle silhouette on the table line.
  ctx.fillStyle = '#0f0b0a';
  ctx.beginPath();
  ctx.moveTo(470, 970);
  ctx.bezierCurveTo(430, 900, 430, 790, 500, 740);
  ctx.lineTo(500, 640);
  ctx.lineTo(560, 640);
  ctx.lineTo(560, 740);
  ctx.bezierCurveTo(630, 790, 630, 900, 590, 970);
  ctx.closePath();
  ctx.fill();
  const rim = ctx.createLinearGradient(430, 0, 630, 0);
  rim.addColorStop(0, 'rgba(255,140,80,0)');
  rim.addColorStop(0.85, 'rgba(255,140,80,0)');
  rim.addColorStop(1, 'rgba(255,160,100,0.5)');
  ctx.fillStyle = rim;
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(530, 975, 140, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Action row: heart, comment, share, bookmark (outline icons).
  ctx.strokeStyle = fill(0.88);
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const hy = 1418;
  ctx.beginPath();
  ctx.moveTo(90, hy + 26);
  ctx.bezierCurveTo(40, hy - 6, 62, hy - 34, 90, hy - 12);
  ctx.bezierCurveTo(118, hy - 34, 140, hy - 6, 90, hy + 26);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(205, hy - 2, 26, 0.25 * Math.PI, 2.15 * Math.PI);
  ctx.lineTo(178, hy + 30);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(290, hy - 26);
  ctx.lineTo(350, hy - 4);
  ctx.lineTo(296, hy + 26);
  ctx.lineTo(306, hy - 2);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(918, hy - 28);
  ctx.lineTo(958, hy - 28);
  ctx.lineTo(958, hy + 28);
  ctx.lineTo(938, hy + 12);
  ctx.lineTo(918, hy + 28);
  ctx.closePath();
  ctx.stroke();

  // Likes and caption as bars.
  ctx.fillStyle = fill(0.85);
  rr(ctx, 62, 1490, 220, 24, 12);
  ctx.fill();
  ctx.fillStyle = fill(0.42);
  [860, 760, 430].forEach((w, i) => {
    rr(ctx, 62, 1544 + i * 46, w, 20, 10);
    ctx.fill();
  });
  ctx.fillStyle = fill(0.22);
  rr(ctx, 62, 1700, 150, 16, 8);
  ctx.fill();
  // Divider above the boost bar.
  ctx.fillStyle = fill(0.08);
  ctx.fillRect(40, 1752, 944, 3);
  // Small reach graph next to nothing: a flat, sad line.
  ctx.strokeStyle = fill(0.25);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(62, 2010);
  for (let i = 0; i <= 30; i++) ctx.lineTo(62 + i * 30, 2016 - Math.sin(i * 1.7) * 3 - i * 0.3);
  ctx.stroke();
  // Home indicator.
  ctx.fillStyle = fill(0.6);
  rr(ctx, 362, 2168, 300, 10, 5);
  ctx.fill();
  return tex(c);
};

/** The "Boost Post" pill: glowing gradient with an up-trend arrow (no text). */
export const makeButtonTexture = () => {
  const W = 1024;
  const H = 176;
  const [c, ctx] = canvas(W, H);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#ff8a3a');
  g.addColorStop(1, '#e8341c');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, H / 2);
  ctx.fill();
  const top = ctx.createLinearGradient(0, 0, 0, H);
  top.addColorStop(0, 'rgba(255,255,255,0.32)');
  top.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = top;
  rr(ctx, 0, 0, W, H, H / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 246, 236, 0.96)';
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(422, 120);
  ctx.lineTo(482, 74);
  ctx.lineTo(530, 104);
  ctx.lineTo(600, 52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(562, 50);
  ctx.lineTo(604, 48);
  ctx.lineTo(602, 90);
  ctx.stroke();
  return tex(c);
};

/** Banknote: warm paper, fibres, guilloche medallions, frame and thread. No text or numbers. */
export const NOTE_PX = {w: 1024, h: 448};
export const makeNoteTextures = () => {
  const {w: W, h: H} = NOTE_PX;
  const [c, ctx] = canvas(W, H);
  const rnd = makeRandom(91);
  const base = ctx.createLinearGradient(0, 0, W, 0);
  base.addColorStop(0, '#e9d8c4');
  base.addColorStop(0.45, '#f1e7d8');
  base.addColorStop(1, '#e8cfba');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Fine horizontal guilloche wave field.
  ctx.lineWidth = 1.1;
  for (let k = 0; k < 46; k++) {
    ctx.strokeStyle = `rgba(150, 52, 30, ${0.1 + 0.05 * (k % 3)})`;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 4) {
      const y = 40 + k * 8.2 + 7 * Math.sin(x * 0.021 + k * 0.5) + 4 * Math.sin(x * 0.057 - k);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Watermark window (lighter oval, no portrait).
  const wm = ctx.createRadialGradient(780, 224, 10, 780, 224, 150);
  wm.addColorStop(0, 'rgba(250, 244, 234, 0.95)');
  wm.addColorStop(0.7, 'rgba(250, 244, 234, 0.75)');
  wm.addColorStop(1, 'rgba(250, 244, 234, 0)');
  ctx.fillStyle = wm;
  ctx.beginPath();
  ctx.ellipse(780, 224, 130, 160, 0, 0, Math.PI * 2);
  ctx.fill();

  // Guilloche rosette.
  const rosette = (cx: number, cy: number, R: number, n: number, color: string, lw: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    for (let k = 0; k < n; k++) {
      ctx.beginPath();
      for (let i = 0; i <= 360; i++) {
        const a = (i / 360) * Math.PI * 2;
        const r = R * (0.62 + 0.24 * Math.sin(9 * a + k * 0.42) + 0.1 * Math.cos(23 * a - k * 0.3));
        const x = cx + r * Math.cos(a + k * 0.07);
        const y = cy + r * Math.sin(a + k * 0.07);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };
  rosette(270, 224, 150, 16, 'rgba(176, 38, 20, 0.42)', 1.3);
  rosette(270, 224, 90, 10, 'rgba(60, 30, 24, 0.35)', 1);
  [
    [70, 66],
    [W - 70, 66],
    [70, H - 66],
    [W - 70, H - 66],
  ].forEach(([x, y]) => rosette(x, y, 46, 7, 'rgba(176, 38, 20, 0.45)', 1));

  // Frame.
  ctx.strokeStyle = 'rgba(120, 36, 22, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.strokeStyle = 'rgba(176, 38, 20, 0.4)';
  ctx.beginPath();
  for (let x = 28; x <= W - 28; x += 3) {
    const y = 23 + 3 * Math.sin(x * 0.25);
    x === 28 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  for (let x = W - 28; x >= 28; x -= 3) ctx.lineTo(x, H - 23 + 3 * Math.sin(x * 0.25));
  ctx.stroke();

  // Security thread.
  ctx.fillStyle = 'rgba(40, 26, 22, 0.55)';
  for (let y = 0; y < H; y += 22) ctx.fillRect(598, y, 7, 13);
  // Abstract value block: stacked bars bottom right (not digits).
  ctx.fillStyle = 'rgba(150, 40, 22, 0.55)';
  rr(ctx, 860, 300, 96, 56, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(241, 231, 216, 0.9)';
  rr(ctx, 874, 314, 68, 28, 6);
  ctx.fill();

  // Paper fibres.
  for (let i = 0; i < 2600; i++) {
    const x = rnd.next() * W;
    const y = rnd.next() * H;
    const a = rnd.next() * Math.PI;
    const l = 4 + rnd.next() * 14;
    ctx.strokeStyle = `rgba(110, 80, 60, ${0.04 + rnd.next() * 0.06})`;
    ctx.lineWidth = 0.6 + rnd.next() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + rnd.range(-3, 3), y + Math.sin(a) * l * 0.5 + rnd.range(-3, 3), x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  for (let i = 0; i < 70; i++) {
    const x = rnd.next() * W;
    const y = rnd.next() * H;
    const a = rnd.next() * Math.PI;
    ctx.strokeStyle = rnd.next() < 0.5 ? 'rgba(214, 50, 26, 0.5)' : 'rgba(240, 120, 50, 0.45)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + rnd.range(-6, 6), y + rnd.range(-6, 6), x + Math.cos(a) * 12, y + Math.sin(a) * 12);
    ctx.stroke();
  }
  // Grain.
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd.next() - 0.5) * 12;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const map = tex(c);

  // Bump: the print is raised (intaglio) and the paper has a soft fibrous tooth.
  const [b, bctx] = canvas(W, H);
  bctx.drawImage(c, 0, 0);
  const bi = bctx.getImageData(0, 0, W, H);
  for (let i = 0; i < bi.data.length; i += 4) {
    const l = 255 - (bi.data[i] * 0.3 + bi.data[i + 1] * 0.59 + bi.data[i + 2] * 0.11);
    const v = Math.min(255, l * 1.6 + (rnd.next() - 0.5) * 30);
    bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = v;
  }
  bctx.putImageData(bi, 0, 0);
  return {map, bump: tex(b, false)};
};

/** Periodic value noise on a w×h grid of cells. */
const periodicNoise = (seed: number, gx: number, gy: number) => {
  const rnd = makeRandom(seed);
  const g = new Float32Array(gx * gy).map(() => rnd.next());
  return (x: number, y: number) => {
    const fx = x * gx;
    const fy = y * gy;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const tx = fx - ix;
    const ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const at = (i: number, j: number) => g[(((j % gy) + gy) % gy) * gx + (((i % gx) + gx) % gx)];
    const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * sx;
    const c = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * sx;
    return a + (c - a) * sy;
  };
};

/**
 * Normal + roughness maps for the chili skin: long soft folds running along the pod,
 * finer wrinkles and tiny pores. u runs along the pod, v around it.
 */
export const makeChiliMaps = () => {
  const W = 1024;
  const H = 512;
  const folds = periodicNoise(3, 5, 18);
  const wrinkles = periodicNoise(5, 22, 70);
  const pores = periodicNoise(8, 160, 120);
  const blotch = periodicNoise(13, 6, 6);
  const hgt = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      hgt[y * W + x] = 0.6 * folds(u, v) + 0.28 * wrinkles(u, v) + 0.08 * pores(u, v);
    }
  const [c, ctx] = canvas(W, H);
  const img = ctx.createImageData(W, H);
  const [rc, rctx] = canvas(W, H);
  const rimg = rctx.createImageData(W, H);
  const k = 5.5;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const h = (xx: number, yy: number) => hgt[((yy + H) % H) * W + ((xx + W) % W)];
      const dx = (h(x + 1, y) - h(x - 1, y)) * k;
      const dy = (h(x, y + 1) - h(x, y - 1)) * k;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * W + x) * 4;
      img.data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((-dy / l) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
      const r = 0.55 + 0.35 * blotch(x / W, y / H) + 0.25 * (pores(x / W, y / H) - 0.5);
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.max(0, Math.min(255, r * 255));
      rimg.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  rctx.putImageData(rimg, 0, 0);
  const normal = tex(c, false);
  const rough = tex(rc, false);
  [normal, rough].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  });
  return {normal, rough};
};

/** Fine brushed-metal streaks for the aluminium frame (used as a roughness map). */
export const makeBrushedTexture = () => {
  const W = 512;
  const H = 512;
  const [c, ctx] = canvas(W, H);
  const rnd = makeRandom(21);
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 1800; i++) {
    const y = rnd.next() * H;
    const v = 100 + rnd.next() * 60;
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fillRect(0, y, W, 0.6 + rnd.next() * 1.2);
  }
  const t = tex(c, false);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
};
