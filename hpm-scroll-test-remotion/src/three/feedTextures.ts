// Draws the phone's screen content into high-resolution canvases (CanvasTexture sources):
//  - the bland-post atlas (2 × 4 cells of 1024 × 1700 px),
//  - the hero post (1024 × 1700), twice side by side: neon off | neon on,
//  - the app chrome (status bar, top bar, bottom nav) at the full 1024 × 2224 screen size.
// Everything is drawn with vectors and text: sharp at any zoom, no photos, no real brands.
import {BLAND_POSTS, BRAND, FEED_COLORS, HERO_POST, BlandPost} from '../data';
import {DISPLAY, TEXT} from '../fonts';
import {ATLAS, POST, SCREEN} from '../lib/layout';

type Ctx = CanvasRenderingContext2D;

const makeCanvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.textBaseline = 'alphabetic';
  return {c, ctx};
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/* ----------------------------------------------------------------- icons */

const heart = (ctx: Ctx, x: number, y: number, s: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.32);
  ctx.bezierCurveTo(x, y + s * 0.02, x - s * 0.5, y - s * 0.02, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.58, x - s * 0.12, y + s * 0.78, x, y + s * 0.92);
  ctx.bezierCurveTo(x + s * 0.12, y + s * 0.78, x + s * 0.5, y + s * 0.58, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.02, x, y + s * 0.02, x, y + s * 0.32);
  ctx.closePath();
};

const strokeIcon = (ctx: Ctx, color: string, w = 3.6) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
};

const commentIcon = (ctx: Ctx, x: number, y: number, s: number, color: string) => {
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.45, s * 0.46, s * 0.4, 0, Math.PI * 0.62, Math.PI * 2.5);
  ctx.lineTo(x - s * 0.5, y + s * 0.92);
  ctx.closePath();
  strokeIcon(ctx, color);
};

const shareIcon = (ctx: Ctx, x: number, y: number, s: number, color: string) => {
  ctx.beginPath();
  ctx.moveTo(x - s * 0.18, y + s * 0.38);
  ctx.lineTo(x - s * 0.42, y + s * 0.38);
  ctx.lineTo(x - s * 0.42, y + s * 0.92);
  ctx.lineTo(x + s * 0.42, y + s * 0.92);
  ctx.lineTo(x + s * 0.42, y + s * 0.38);
  ctx.lineTo(x + s * 0.18, y + s * 0.38);
  strokeIcon(ctx, color);
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.62);
  ctx.lineTo(x, y + s * 0.02);
  ctx.moveTo(x - s * 0.2, y + s * 0.2);
  ctx.lineTo(x, y + s * 0.02);
  ctx.lineTo(x + s * 0.2, y + s * 0.2);
  strokeIcon(ctx, color);
};

const bookmarkIcon = (ctx: Ctx, x: number, y: number, s: number, color: string) => {
  ctx.beginPath();
  ctx.moveTo(x - s * 0.34, y + s * 0.04);
  ctx.lineTo(x + s * 0.34, y + s * 0.04);
  ctx.lineTo(x + s * 0.34, y + s * 0.94);
  ctx.lineTo(x, y + s * 0.66);
  ctx.lineTo(x - s * 0.34, y + s * 0.94);
  ctx.closePath();
  strokeIcon(ctx, color);
};

const dots = (ctx: Ctx, x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(x + i * 14, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

/* ------------------------------------------------------- post furniture */

const header = (ctx: Ctx, handle: string, initials: string, sub: string | null, avatar: (ctx: Ctx) => void) => {
  ctx.fillStyle = FEED_COLORS.bg;
  ctx.fillRect(0, 0, SCREEN.w, POST.headerH);
  ctx.save();
  avatar(ctx);
  ctx.restore();
  ctx.fillStyle = FEED_COLORS.ink;
  ctx.font = `600 31px ${TEXT}`;
  ctx.fillText(handle, 128, sub ? 54 : 70);
  if (sub) {
    ctx.fillStyle = FEED_COLORS.meta;
    ctx.font = `500 23px ${TEXT}`;
    ctx.fillText(sub, 128, 86);
  }
  dots(ctx, 960, 62, FEED_COLORS.ink);
  void initials;
};

const greyAvatar = (initials: string, shade: string) => (ctx: Ctx) => {
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.arc(70, 60, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 26px ${TEXT}`;
  ctx.textAlign = 'center';
  ctx.fillText(initials, 70, 69);
  ctx.textAlign = 'left';
};

const actions = (ctx: Ctx, y0: number, liked: boolean, carousel: number | null) => {
  ctx.fillStyle = FEED_COLORS.bg;
  ctx.fillRect(0, y0, SCREEN.w, POST.actionsH);
  const s = 46;
  const y = y0 + 28;
  heart(ctx, 62, y, s);
  if (liked) {
    ctx.fillStyle = BRAND.red;
    ctx.fill();
  } else strokeIcon(ctx, FEED_COLORS.ink);
  commentIcon(ctx, 140, y, s, FEED_COLORS.ink);
  shareIcon(ctx, 218, y, s, FEED_COLORS.ink);
  bookmarkIcon(ctx, 966, y, s, FEED_COLORS.ink);
  if (carousel) {
    for (let i = 0; i < carousel; i++) {
      ctx.fillStyle = i === 0 ? BRAND.orange : '#D0D0D0';
      ctx.beginPath();
      ctx.arc(512 + (i - (carousel - 1) / 2) * 22, y + 22, 6.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const wrap = (ctx: Ctx, text: string, maxW: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};

const caption = (ctx: Ctx, y0: number, likes: string, handle: string, text: string, meta: string) => {
  ctx.fillStyle = FEED_COLORS.bg;
  ctx.fillRect(0, y0, SCREEN.w, POST.h - y0);
  ctx.fillStyle = FEED_COLORS.ink;
  ctx.font = `700 29px ${TEXT}`;
  ctx.fillText(likes, 40, y0 + 34);
  ctx.font = `700 29px ${TEXT}`;
  const hw = ctx.measureText(handle + ' ').width;
  ctx.fillText(handle, 40, y0 + 78);
  ctx.font = `400 29px ${TEXT}`;
  const lines = wrap(ctx, text, 944 - hw);
  ctx.fillText(lines[0] ?? '', 40 + hw, y0 + 78);
  if (lines.length > 1) {
    const rest = wrap(ctx, lines.slice(1).join(' '), 944);
    ctx.fillText(rest[0] + (rest.length > 1 ? '…' : ''), 40, y0 + 116);
  }
  ctx.fillStyle = FEED_COLORS.meta;
  ctx.font = `400 24px ${TEXT}`;
  ctx.fillText(meta, 40, y0 + (lines.length > 1 ? 156 : 118));
};

/* ------------------------------------------------- the bland "photos" */

/** Grey, low-contrast, soft-focus stock-photo-like scenes: forgettable on purpose. */
const blandScene = (ctx: Ctx, scene: number) => {
  const W = 1024;
  const H = POST.imageH;
  const g = (a: string, b: string, y0 = 0, y1 = H) => {
    const gr = ctx.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, a);
    gr.addColorStop(1, b);
    return gr;
  };
  const blob = (x: number, y: number, rx: number, ry: number, color: string, blur = 0) => {
    ctx.save();
    if (blur) ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  const rect = (x: number, y: number, w: number, h: number, color: string | CanvasGradient, r = 0, blur = 0) => {
    ctx.save();
    if (blur) ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
    ctx.restore();
  };
  switch (scene) {
    case 0: {
      // A coffee cup on a table by a window.
      rect(0, 0, W, H, g('#D3CEC6', '#BDB7AE'));
      rect(90, 70, 420, 520, 'rgba(255,255,255,0.45)', 10, 24);
      rect(0, 780, W, 500, g('#ABA59C', '#9C968D', 780, H));
      blob(512, 980, 260, 64, '#8F8981', 14);
      blob(512, 960, 250, 56, '#D9D5CF');
      rect(392, 720, 240, 250, g('#E6E3DE', '#C9C5BF', 720, 970), 34);
      blob(512, 722, 120, 30, '#B5AFA6');
      blob(512, 726, 102, 22, '#8A847C');
      ctx.save();
      ctx.strokeStyle = '#CFCBC5';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(650, 830, 56, -Math.PI / 2.4, Math.PI / 2.4);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 1: {
      // A clothing rail.
      rect(0, 0, W, H, g('#CFCBC5', '#C2BDB6'));
      rect(0, 1050, W, 230, '#B1ACA4');
      rect(80, 250, 864, 14, '#8E8981', 7);
      const shades = ['#B8B3AC', '#A39E97', '#C9C5BF', '#9A958E', '#B0ABA4'];
      shades.forEach((c, i) => {
        const x = 150 + i * 165;
        ctx.save();
        ctx.strokeStyle = '#8E8981';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, 262);
        ctx.lineTo(x, 300);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(x - 60, 310);
        ctx.lineTo(x + 60, 310);
        ctx.lineTo(x + 78, 860 + (i % 2) * 60);
        ctx.lineTo(x - 78, 860 + (i % 2) * 60);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `300 64px ${TEXT}`;
      ctx.textAlign = 'center';
      ctx.fillText('NEW IN', 512, 1180);
      ctx.restore();
      break;
    }
    case 2: {
      // A plate of food from above.
      rect(0, 0, W, H, g('#C2BCB3', '#B3ADA4'));
      blob(512, 660, 380, 380, '#A49E95', 18);
      blob(512, 640, 370, 370, '#E2DFDA');
      blob(512, 640, 290, 290, '#D6D2CC');
      blob(440, 590, 110, 90, '#A9A39B', 6);
      blob(590, 610, 95, 105, '#BDB7AF', 6);
      blob(500, 730, 120, 70, '#9F998F', 6);
      rect(70, 300, 26, 700, '#D0CCC6', 13);
      rect(930, 300, 26, 700, '#D0CCC6', 13);
      break;
    }
    case 3: {
      // A plain storefront.
      rect(0, 0, W, H, g('#C8C4BE', '#B9B4AD'));
      rect(110, 300, 804, 880, '#AEA9A2');
      rect(150, 470, 470, 560, g('#8F8A84', '#A19C95', 470, 1030), 6);
      rect(190, 500, 120, 500, 'rgba(255,255,255,0.18)', 4, 8);
      rect(670, 470, 200, 710, '#8A857F', 6);
      for (let i = 0; i < 8; i++) rect(110 + i * 100.5, 330, 100.5, 100, i % 2 ? '#D8D4CF' : '#A6A19A');
      rect(330, 230, 364, 70, '#D6D2CC', 8);
      break;
    }
    case 4: {
      // A hazy landscape.
      rect(0, 0, W, H, g('#DAD7D2', '#C7C3BD'));
      blob(700, 420, 90, 90, '#E8E6E2', 10);
      ctx.save();
      const layers = ['#B9B5AF', '#A9A59F', '#9A968F'];
      layers.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 32) ctx.lineTo(x, 760 + i * 130 + Math.sin(x / (180 - i * 30) + i) * (60 - i * 12));
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
      break;
    }
    case 5: {
      // A salon corner: mirror, chair, plant.
      rect(0, 0, W, H, g('#CDC7C0', '#BFB9B2'));
      rect(0, 1000, W, 280, '#ADA79F');
      blob(512, 470, 250, 250, '#B3ADA6');
      blob(512, 470, 226, 226, '#DEDAD5');
      rect(370, 760, 284, 220, '#9C968F', 40);
      rect(400, 960, 30, 140, '#8B857E', 10);
      rect(594, 960, 30, 140, '#8B857E', 10);
      blob(160, 760, 110, 190, '#A7A79F', 12);
      rect(110, 900, 100, 140, '#B9B3AB', 10);
      break;
    }
    case 6: {
      // Dumbbells on a floor.
      rect(0, 0, W, H, g('#C6C3BE', '#ADA9A3'));
      const bell = (y: number, s: number) => {
        rect(512 - 230 * s, y - 14 * s, 460 * s, 28 * s, '#8D8984', 14 * s);
        rect(512 - 290 * s, y - 90 * s, 90 * s, 180 * s, '#A09C97', 20 * s);
        rect(512 + 200 * s, y - 90 * s, 90 * s, 180 * s, '#A09C97', 20 * s);
      };
      bell(560, 1);
      bell(860, 1.1);
      rect(140, 1080, 360, 90, '#D3D0CB', 20, 4);
      break;
    }
    default: {
      // A sandwich on a board.
      rect(0, 0, W, H, g('#CEC9C2', '#BAB4AC'));
      rect(140, 560, 744, 420, '#A9A299', 60, 4);
      rect(250, 640, 524, 90, '#D9D3CA', 45);
      rect(240, 720, 544, 40, '#B4ADA4', 20);
      rect(250, 755, 524, 34, '#C4BEB6', 17);
      rect(250, 785, 524, 90, '#D6D0C7', 45);
      break;
    }
  }
};

const drawBlandPost = (ctx: Ctx, p: BlandPost, i: number) => {
  ctx.fillStyle = FEED_COLORS.bg;
  ctx.fillRect(0, 0, SCREEN.w, POST.h);
  header(ctx, p.handle, p.initials, null, greyAvatar(p.initials, ['#B5B1AB', '#A8A49E', '#C0BCB6', '#9F9B95'][i % 4]));
  ctx.save();
  ctx.translate(0, POST.headerH);
  ctx.beginPath();
  ctx.rect(0, 0, SCREEN.w, POST.imageH);
  ctx.clip();
  blandScene(ctx, p.scene);
  ctx.restore();
  actions(ctx, POST.headerH + POST.imageH, false, null);
  caption(ctx, POST.headerH + POST.imageH + POST.actionsH, p.likes, p.handle, p.caption, `${2 + (i % 5)} hours ago`);
};

export const drawBlandAtlas = () => {
  const {c, ctx} = makeCanvas(SCREEN.w * ATLAS.cols, POST.h * ATLAS.rows);
  BLAND_POSTS.slice(0, ATLAS.cols * ATLAS.rows).forEach((p, i) => {
    ctx.save();
    ctx.translate((i % ATLAS.cols) * SCREEN.w, Math.floor(i / ATLAS.cols) * POST.h);
    ctx.beginPath();
    ctx.rect(0, 0, SCREEN.w, POST.h);
    ctx.clip();
    drawBlandPost(ctx, p, i);
    ctx.restore();
  });
  return c;
};

/* -------------------------------------------------------------- the hero */

/** Where things sit on the hero post (hero-post px). The callouts point at these. */
export const HERO_LAYOUT = {
  headline: {top: POST.headerH + 70, bottom: POST.headerH + 590},
  neon: {x: 132, y: POST.headerH + 650, w: 760, h: 380},
  promise: {x: 72, y: POST.headerH + 1112, w: 880, h: 100},
};
export const HERO_TARGETS: [number, number][] = [
  [512, (HERO_LAYOUT.headline.top + HERO_LAYOUT.headline.bottom) / 2],
  [512, HERO_LAYOUT.neon.y + HERO_LAYOUT.neon.h / 2],
  [512, HERO_LAYOUT.promise.y + HERO_LAYOUT.promise.h / 2],
];

const neonStroke = (ctx: Ctx, draw: () => void, glow: string, on: boolean) => {
  if (on) {
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 70;
    ctx.strokeStyle = glow;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 16;
    draw();
    ctx.restore();
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 26;
    ctx.strokeStyle = '#FFB98A';
    ctx.lineWidth = 9;
    draw();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#FFF6EC';
    ctx.lineWidth = 3.5;
    draw();
    ctx.restore();
  } else {
    ctx.save();
    ctx.strokeStyle = '#3B2620';
    ctx.lineWidth = 10;
    draw();
    ctx.strokeStyle = '#5A3A30';
    ctx.lineWidth = 3.5;
    draw();
    ctx.restore();
  }
};

const drawHeroPost = (ctx: Ctx, on: boolean) => {
  const P = HERO_POST;
  ctx.fillStyle = FEED_COLORS.bg;
  ctx.fillRect(0, 0, SCREEN.w, POST.h);
  header(ctx, P.handle, P.initials, P.subtitle, (c) => {
    const gr = c.createLinearGradient(32, 22, 108, 98);
    gr.addColorStop(0, BRAND.orange);
    gr.addColorStop(1, BRAND.red);
    c.fillStyle = gr;
    c.beginPath();
    c.arc(70, 60, 38, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#FFFFFF';
    c.font = `400 30px ${DISPLAY}`;
    c.textAlign = 'center';
    c.fillText(P.initials, 70, 71);
  });

  // The image: deep charcoal with warm light.
  ctx.save();
  ctx.translate(0, POST.headerH);
  const W = SCREEN.w;
  const H = POST.imageH;
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  ctx.fillStyle = FEED_COLORS.heroBg;
  ctx.fillRect(0, 0, W, H);
  const glow1 = ctx.createRadialGradient(820, 120, 0, 820, 120, 900);
  glow1.addColorStop(0, 'rgba(230,57,34,0.42)');
  glow1.addColorStop(1, 'rgba(230,57,34,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);
  const glow2 = ctx.createRadialGradient(140, 1200, 0, 140, 1200, 760);
  glow2.addColorStop(0, 'rgba(255,122,26,0.22)');
  glow2.addColorStop(1, 'rgba(255,122,26,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);
  if (on) {
    const n = HERO_LAYOUT.neon;
    const cy = n.y - POST.headerH + n.h / 2;
    const wall = ctx.createRadialGradient(512, cy, 0, 512, cy, 620);
    wall.addColorStop(0, 'rgba(255,77,46,0.34)');
    wall.addColorStop(0.5, 'rgba(255,77,46,0.12)');
    wall.addColorStop(1, 'rgba(255,77,46,0)');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);
  }
  // Fine grain on the wall (seeded, so identical every run).
  const r = rng(7);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect(r() * W, r() * H, 2, 2);
  }

  // Headline: as big as the width allows.
  const lines = [...P.headlineWhite, ...P.headlineHot];
  let size = 200;
  ctx.font = `400 ${size}px ${DISPLAY}`;
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  size = Math.floor((size * 884) / widest);
  ctx.font = `400 ${size}px ${DISPLAY}`;
  const lh = size * 0.98;
  const top = HERO_LAYOUT.headline.top - POST.headerH;
  const blockH = lh * lines.length;
  const y0 = top + (HERO_LAYOUT.headline.bottom - HERO_LAYOUT.headline.top - blockH) / 2 + size * 0.86;
  const hot = ctx.createLinearGradient(70, 0, 954, 0);
  hot.addColorStop(0, BRAND.orange);
  hot.addColorStop(0.55, BRAND.glow);
  hot.addColorStop(1, BRAND.red);
  lines.forEach((l, i) => {
    const isHot = i >= P.headlineWhite.length;
    ctx.save();
    if (isHot) {
      ctx.shadowColor = 'rgba(255,77,46,0.45)';
      ctx.shadowBlur = 30;
    }
    ctx.fillStyle = isHot ? hot : '#FFFFFF';
    ctx.fillText(l, 70, y0 + i * lh);
    ctx.restore();
  });

  // The neon sign.
  const n = HERO_LAYOUT.neon;
  const ny = n.y - POST.headerH;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  neonStroke(
    ctx,
    () => {
      ctx.beginPath();
      ctx.roundRect(n.x, ny, n.w, n.h, 64);
      ctx.stroke();
    },
    BRAND.red,
    on,
  );
  ctx.font = `400 214px ${DISPLAY}`;
  ctx.textAlign = 'center';
  neonStroke(ctx, () => ctx.strokeText(P.neon, 512, ny + 262), BRAND.orange, on);
  ctx.font = `800 50px ${TEXT}`;
  ctx.letterSpacing = '18px';
  neonStroke(ctx, () => ctx.strokeText(`TILL ${P.neonSub}`, 521, ny + 340), BRAND.glow, on);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';

  // The promise.
  const pr = HERO_LAYOUT.promise;
  const py = pr.y - POST.headerH;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.strokeStyle = BRAND.orange;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(pr.x, py, pr.w, pr.h, pr.h / 2);
  ctx.fill();
  ctx.stroke();
  let ps = 36;
  ctx.font = `700 ${ps}px ${TEXT}`;
  const tw = ctx.measureText(P.promise).width;
  if (tw > pr.w - 150) ps = Math.floor((ps * (pr.w - 150)) / tw);
  ctx.font = `700 ${ps}px ${TEXT}`;
  const tw2 = ctx.measureText(P.promise).width;
  const tx = pr.x + (pr.w - tw2 - 56) / 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(P.promise, tx, py + pr.h / 2 + ps * 0.36);
  ctx.fillStyle = BRAND.orange;
  ctx.font = `800 ${ps + 4}px ${TEXT}`;
  ctx.fillText('→', tx + tw2 + 18, py + pr.h / 2 + ps * 0.38);
  ctx.restore();

  // Carousel chip.
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(892, 30, 102, 52, 26);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `600 26px ${TEXT}`;
  ctx.textAlign = 'center';
  ctx.fillText('1/4', 943, 65);
  ctx.restore();
  ctx.restore();

  actions(ctx, POST.headerH + POST.imageH, true, 4);
  caption(ctx, POST.headerH + POST.imageH + POST.actionsH, P.likes, P.handle, P.caption, P.comments);
};

/** The hero post, neon off (left half) and neon on (right half). */
export const drawHero = () => {
  const {c, ctx} = makeCanvas(SCREEN.w * 2, POST.h);
  drawHeroPost(ctx, false);
  ctx.save();
  ctx.translate(SCREEN.w, 0);
  drawHeroPost(ctx, true);
  ctx.restore();
  return c;
};

/* ------------------------------------------------------------ app chrome */

export const drawChrome = () => {
  const {c, ctx} = makeCanvas(SCREEN.w, SCREEN.h);
  const ink = FEED_COLORS.ink;
  // Status bar.
  ctx.fillStyle = FEED_COLORS.bg;
  ctx.fillRect(0, 0, SCREEN.w, SCREEN.statusH + SCREEN.topBarH);
  ctx.fillStyle = ink;
  ctx.font = `600 32px ${TEXT}`;
  ctx.fillText('10:24', 74, 58);
  // Signal bars, wifi, battery (generic).
  for (let i = 0; i < 4; i++) ctx.fillRect(790 + i * 12, 56 - 8 - i * 6, 8, 8 + i * 6);
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(866, 58, 8 + i * 9, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(900, 36, 56, 26, 8);
  ctx.stroke();
  ctx.fillRect(904, 40, 38, 18);
  ctx.fillRect(958, 44, 4, 10);
  ctx.restore();
  // Top bar: a generic wordmark and two icons.
  ctx.fillStyle = ink;
  ctx.font = `400 50px ${DISPLAY}`;
  ctx.fillText('feed', 40, SCREEN.statusH + 76);
  ctx.save();
  // Bell.
  ctx.beginPath();
  const bx = 880;
  const by = SCREEN.statusH + 30;
  ctx.moveTo(bx - 20, by + 40);
  ctx.quadraticCurveTo(bx - 20, by + 4, bx, by + 2);
  ctx.quadraticCurveTo(bx + 20, by + 4, bx + 20, by + 40);
  ctx.lineTo(bx + 26, by + 46);
  ctx.lineTo(bx - 26, by + 46);
  ctx.closePath();
  strokeIcon(ctx, ink);
  ctx.beginPath();
  ctx.arc(bx, by + 52, 6, 0, Math.PI);
  strokeIcon(ctx, ink);
  // Chat bubble.
  commentIcon(ctx, 962, SCREEN.statusH + 30, 46, ink);
  ctx.restore();
  ctx.fillStyle = FEED_COLORS.line;
  ctx.fillRect(0, SCREEN.statusH + SCREEN.topBarH - 2, SCREEN.w, 2);

  // Bottom nav.
  const y0 = SCREEN.h - SCREEN.bottomH;
  ctx.fillStyle = FEED_COLORS.bg;
  ctx.fillRect(0, y0, SCREEN.w, SCREEN.bottomH);
  ctx.fillStyle = FEED_COLORS.line;
  ctx.fillRect(0, y0, SCREEN.w, 2);
  const iy = y0 + 34;
  const xs = [102, 307, 512, 717, 922];
  // Home (filled).
  ctx.save();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(xs[0], iy);
  ctx.lineTo(xs[0] + 26, iy + 22);
  ctx.lineTo(xs[0] + 26, iy + 50);
  ctx.lineTo(xs[0] - 26, iy + 50);
  ctx.lineTo(xs[0] - 26, iy + 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Search.
  ctx.beginPath();
  ctx.arc(xs[1] - 4, iy + 21, 18, 0, Math.PI * 2);
  strokeIcon(ctx, ink, 4);
  ctx.beginPath();
  ctx.moveTo(xs[1] + 9, iy + 34);
  ctx.lineTo(xs[1] + 24, iy + 49);
  strokeIcon(ctx, ink, 4);
  // Plus.
  ctx.beginPath();
  ctx.roundRect(xs[2] - 25, iy, 50, 50, 14);
  strokeIcon(ctx, ink, 4);
  ctx.beginPath();
  ctx.moveTo(xs[2], iy + 13);
  ctx.lineTo(xs[2], iy + 37);
  ctx.moveTo(xs[2] - 12, iy + 25);
  ctx.lineTo(xs[2] + 12, iy + 25);
  strokeIcon(ctx, ink, 4);
  // Heart.
  heart(ctx, xs[3], iy + 2, 48);
  strokeIcon(ctx, ink, 4);
  // Profile.
  ctx.fillStyle = '#C9C6C1';
  ctx.beginPath();
  ctx.arc(xs[4], iy + 25, 25, 0, Math.PI * 2);
  ctx.fill();
  // Home indicator bar.
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.roundRect(512 - 120, SCREEN.h - 22, 240, 9, 5);
  ctx.fill();
  return c;
};
