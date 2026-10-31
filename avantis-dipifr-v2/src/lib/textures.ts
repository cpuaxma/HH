import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import * as THREE from 'three';
import {COLORS, COPY, MODULES} from '../data';
import {SANS_FAMILY, SERIF_FAMILY} from '../fonts';
import {LAUREL_LEFT, LAUREL_RIGHT, LOGO_BOXES} from './logoTrace';

const GOLD_DARK = '#A8843E';

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};

const goldGradient = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, COLORS.goldLight);
  g.addColorStop(0.45, COLORS.gold);
  g.addColorStop(1, GOLD_DARK);
  return g;
};

/** Text with letter spacing, centred on x. */
const spaced = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) => {
  ctx.letterSpacing = `${spacing}px`;
  const w = ctx.measureText(text).width - spacing;
  ctx.textAlign = 'left';
  ctx.fillText(text, x - w / 2, y);
  ctx.letterSpacing = '0px';
};

/** Shrinks the font until the text fits the width; returns the size used. */
const fit = (ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, size: number, maxW: number) => {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 2;
  } while (s > 12);
  return s;
};

export const CERT_TEX = {w: 1024, h: 1366};

/** The certificate face: cream paper, navy frame, gold rules, the logo's laurels around the title. */
const drawCertificate = () => {
  const {w, h} = CERT_TEX;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = COLORS.navy;
  ctx.fillRect(0, 0, w, h);
  const paper = ctx.createRadialGradient(w / 2, h * 0.42, 100, w / 2, h / 2, h * 0.75);
  paper.addColorStop(0, '#FFFDF8');
  paper.addColorStop(1, '#F1EADB');
  ctx.fillStyle = paper;
  ctx.fillRect(34, 34, w - 68, h - 68);
  ctx.strokeStyle = goldGradient(ctx, 0, 0, w, h);
  ctx.lineWidth = 5;
  ctx.strokeRect(62, 62, w - 124, h - 124);
  ctx.lineWidth = 2;
  ctx.strokeRect(76, 76, w - 152, h - 152);
  // Corner diamonds.
  ctx.fillStyle = COLORS.gold;
  for (const [x, y] of [[62, 62], [w - 62, 62], [62, h - 62], [w - 62, h - 62]]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 16);
    ctx.lineTo(x + 16, y);
    ctx.lineTo(x, y + 16);
    ctx.lineTo(x - 16, y);
    ctx.closePath();
    ctx.fill();
  }

  // Eyebrow.
  ctx.fillStyle = GOLD_DARK;
  ctx.font = `700 34px ${SANS_FAMILY}`;
  spaced(ctx, COPY.certificate.eyebrow, w / 2, 236, 16);

  // Laurels from the logo, in gold, around the title.
  const lb = LOGO_BOXES.LAUREL_LEFT;
  const rb = LOGO_BOXES.LAUREL_RIGHT;
  const lh = lb[3] - lb[1];
  const k = 400 / lh;
  ctx.fillStyle = goldGradient(ctx, 0, 300, 0, 720);
  ctx.save();
  ctx.translate(w / 2 - 300 - (lb[2] - lb[0]) * k * 0.5, 300);
  ctx.scale(k, k);
  ctx.translate(-lb[0], -lb[1]);
  ctx.fill(new Path2D(LAUREL_LEFT), 'evenodd');
  ctx.restore();
  ctx.save();
  ctx.translate(w / 2 + 300 - (rb[2] - rb[0]) * k * 0.5, 300);
  ctx.scale(k, k);
  ctx.translate(-rb[0], -rb[1]);
  ctx.fill(new Path2D(LAUREL_RIGHT), 'evenodd');
  ctx.restore();

  // Title.
  ctx.fillStyle = COLORS.navy;
  ctx.textAlign = 'center';
  const ts = fit(ctx, COPY.certificate.title, SERIF_FAMILY, '400', 210, 560);
  ctx.font = `400 ${ts}px ${SERIF_FAMILY}`;
  ctx.fillText(COPY.certificate.title, w / 2, 590);
  COPY.certificate.lines.forEach((line, i) => {
    const s = fit(ctx, line, SERIF_FAMILY, '400', 64, 760);
    ctx.font = `400 ${s}px ${SERIF_FAMILY}`;
    ctx.fillText(line, w / 2, 800 + i * 78);
  });

  // Gold rule with a diamond.
  ctx.strokeStyle = goldGradient(ctx, w / 2 - 200, 0, w / 2 + 200, 0);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 200, 952);
  ctx.lineTo(w / 2 - 22, 952);
  ctx.moveTo(w / 2 + 22, 952);
  ctx.lineTo(w / 2 + 200, 952);
  ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.moveTo(w / 2, 940);
  ctx.lineTo(w / 2 + 12, 952);
  ctx.lineTo(w / 2, 964);
  ctx.lineTo(w / 2 - 12, 952);
  ctx.closePath();
  ctx.fill();

  // Guilloche band along the bottom: fine interlaced waves, like security print.
  ctx.save();
  ctx.beginPath();
  ctx.rect(110, 1040, w - 220, 120);
  ctx.clip();
  ctx.lineWidth = 1.4;
  for (let k2 = 0; k2 < 9; k2++) {
    ctx.strokeStyle = k2 % 2 ? 'rgba(168,132,62,0.55)' : 'rgba(11,35,81,0.28)';
    ctx.beginPath();
    for (let x = 100; x <= w - 100; x += 4) {
      const y = 1100 + 38 * Math.sin(x / 46 + k2 * 0.7) * Math.cos(x / 210 + k2 * 0.35);
      if (x === 100) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Footer.
  ctx.fillStyle = COLORS.navy;
  ctx.font = `700 30px ${SANS_FAMILY}`;
  spaced(ctx, COPY.certificate.footer, 300, 1236, 12);
  ctx.strokeStyle = 'rgba(11,35,81,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(170, 1196);
  ctx.lineTo(430, 1196);
  ctx.stroke();
  return c;
};

export const MODULE_TEX = {w: 1024, h: 342};

/** A module tile's face: navy, the gold number and the module name. */
const drawModule = (i: number) => {
  const {w, h} = MODULE_TEX;
  const [c, ctx] = canvas(w, h);
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#173A7C');
  bg.addColorStop(0.5, COLORS.navy);
  bg.addColorStop(1, '#071A40');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // Diagonal sheen.
  const sheen = ctx.createLinearGradient(0, 0, w, h * 0.6);
  sheen.addColorStop(0, 'rgba(255,255,255,0.10)');
  sheen.addColorStop(0.4, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  // Inner gold hairline.
  ctx.strokeStyle = 'rgba(217,178,106,0.65)';
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, w - 44, h - 44);
  // Number.
  const num = String(i + 1).padStart(2, '0');
  ctx.fillStyle = goldGradient(ctx, 0, 60, 0, 290);
  ctx.font = `400 200px ${SERIF_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.fillText(num, 190, 245);
  ctx.fillStyle = 'rgba(217,178,106,0.7)';
  ctx.fillRect(330, 70, 3, h - 140);
  // Label and name.
  ctx.fillStyle = COLORS.goldLight;
  ctx.font = `700 30px ${SANS_FAMILY}`;
  ctx.letterSpacing = '8px';
  ctx.textAlign = 'left';
  ctx.fillText(`MODULE ${num}`, 380, 112);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = '#FFFFFF';
  const words = MODULES[i].short.split(' ');
  // One or two lines, whichever fits at a larger size.
  const one = fit(ctx, MODULES[i].short, SERIF_FAMILY, '400', 76, 590);
  if (one >= 60 || words.length < 2) {
    ctx.font = `400 ${one}px ${SERIF_FAMILY}`;
    ctx.fillText(MODULES[i].short, 380, 210);
  } else {
    const mid = Math.ceil(words.length / 2);
    const l1 = words.slice(0, mid).join(' ');
    const l2 = words.slice(mid).join(' ');
    const s = Math.min(fit(ctx, l1, SERIF_FAMILY, '400', 66, 590), fit(ctx, l2, SERIF_FAMILY, '400', 66, 590));
    ctx.font = `400 ${s}px ${SERIF_FAMILY}`;
    ctx.fillText(l1, 380, 190);
    ctx.fillText(l2, 380, 190 + s * 1.05);
  }
  return c;
};

/** The seal: a gold rosette with the qualification's name. */
const drawSeal = () => {
  const n = 512;
  const [c, ctx] = canvas(n, n);
  const r = n / 2;
  ctx.translate(r, r);
  ctx.fillStyle = goldGradient(ctx, -r, -r, r, r);
  ctx.beginPath();
  const points = 48;
  for (let k = 0; k <= points * 2; k++) {
    const a = (k / (points * 2)) * Math.PI * 2;
    const rr = k % 2 ? r * 0.93 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,88,30,0.6)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = COLORS.navy;
  ctx.textAlign = 'center';
  ctx.font = `400 104px ${SERIF_FAMILY}`;
  ctx.fillText(COPY.certificate.title, 0, 34);
  ctx.font = `700 30px ${SANS_FAMILY}`;
  for (const [y, t] of [[-120, '★ ★ ★'], [140, COPY.certificate.footer]] as const) {
    ctx.letterSpacing = '10px';
    ctx.fillText(t, 5, y);
  }
  return c;
};

export type Textures = {cert: HTMLCanvasElement; modules: HTMLCanvasElement[]; seal: HTMLCanvasElement};

let cache: Textures | null = null;

/** Draws every texture once the fonts are ready (rendering waits for it). */
export const useTextures = (): Textures | null => {
  const [tex, setTex] = useState<Textures | null>(cache);
  const [handle] = useState(() => (cache ? null : delayRender('Drawing certificate textures')));
  useEffect(() => {
    if (cache) return;
    let done = false;
    Promise.all([
      document.fonts.load(`400 100px "${SERIF_FAMILY}"`),
      document.fonts.load(`700 30px "${SANS_FAMILY}"`),
    ]).then(() => {
      if (done) return;
      cache = {cert: drawCertificate(), modules: MODULES.map((_, i) => drawModule(i)), seal: drawSeal()};
      setTex(cache);
      if (handle !== null) continueRender(handle);
    });
    return () => {
      done = true;
    };
  }, [handle]);
  return tex;
};

/** A three.js texture from a canvas, optionally cropped to a band (v0..v1 from the top). */
export const canvasTexture = (c: HTMLCanvasElement, crop?: [number, number], rotate180 = false) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (crop) {
    t.repeat.set(1, crop[1] - crop[0]);
    t.offset.set(0, 1 - crop[1]);
  }
  if (rotate180) {
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI;
  }
  t.needsUpdate = true;
  return t;
};
