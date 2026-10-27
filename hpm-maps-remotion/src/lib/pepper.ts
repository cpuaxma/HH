/**
 * The pepper pin: a map pin shaped like a chilli, its tip the pin point.
 * Drawn in a 120 × 170 box with the tip at (60, 166). Shared by the SVG
 * (hook, end card) and the canvas texture of the 3D pins.
 */
export const PIN_BOX = {w: 120, h: 170, tipX: 60, tipY: 166};

export const PIN_BODY =
  'M60 30 C89 27 110 46 108 74 C106 106 84 128 66 158 C63 164 61 167 59 166 C56 165 55 160 54 156 C46 126 12 106 12 74 C12 45 32 27 60 30 Z';
export const PIN_CALYX = 'M36 38 C44 24 76 24 84 38 C74 33 68 37 60 33 C52 37 46 33 36 38 Z';
export const PIN_STEM = 'M60 31 C60 20 64 12 74 8';
export const PIN_DOT = {cx: 60, cy: 76, r: 21};

let pinCanvas: HTMLCanvasElement | null = null;

/** Canvas with the pin and a soft glow, tip at TEXTURE_TIP. */
export const PIN_TEXTURE = {w: 360, h: 480, scale: 2.4, padX: 36, padY: 40};
export const PIN_TEXTURE_CENTER = {
  x: (PIN_TEXTURE.padX + PIN_BOX.tipX * PIN_TEXTURE.scale) / PIN_TEXTURE.w,
  y: 1 - (PIN_TEXTURE.padY + PIN_BOX.tipY * PIN_TEXTURE.scale) / PIN_TEXTURE.h,
};

export const drawPinCanvas = (colors: {red: string; glow: string; orange: string; dark: string}) => {
  if (pinCanvas) return pinCanvas;
  const c = document.createElement('canvas');
  c.width = PIN_TEXTURE.w;
  c.height = PIN_TEXTURE.h;
  const ctx = c.getContext('2d')!;
  ctx.translate(PIN_TEXTURE.padX, PIN_TEXTURE.padY);
  ctx.scale(PIN_TEXTURE.scale, PIN_TEXTURE.scale);

  const body = new Path2D(PIN_BODY);
  // Soft red glow behind the pin.
  ctx.save();
  ctx.shadowColor = 'rgba(255, 77, 46, 0.55)';
  ctx.shadowBlur = 26;
  ctx.fillStyle = colors.red;
  ctx.fill(body);
  ctx.restore();

  const grad = ctx.createLinearGradient(0, 28, 0, 166);
  grad.addColorStop(0, colors.glow);
  grad.addColorStop(0.55, colors.red);
  grad.addColorStop(1, '#C92E19');
  ctx.fillStyle = grad;
  ctx.fill(body);

  // Highlight on the left shoulder for a little volume.
  ctx.save();
  ctx.clip(body);
  const hl = ctx.createRadialGradient(40, 52, 2, 40, 52, 40);
  hl.addColorStop(0, 'rgba(255,255,255,0.28)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, 120, 170);
  ctx.restore();

  ctx.fillStyle = colors.dark;
  ctx.fill(new Path2D(PIN_CALYX));
  ctx.strokeStyle = colors.dark;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke(new Path2D(PIN_STEM));

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(PIN_DOT.cx, PIN_DOT.cy, PIN_DOT.r, 0, Math.PI * 2);
  ctx.fill();

  pinCanvas = c;
  return c;
};

let haloCanvas: HTMLCanvasElement | null = null;

export const drawHaloCanvas = () => {
  if (haloCanvas) return haloCanvas;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  haloCanvas = c;
  return c;
};
