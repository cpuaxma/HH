// The two phone screens, drawn per frame into 1200 × 2670 canvases (400 × 890 pt at 3×).
// A fictional, generic social app: a rounded post card, stat pills, a comments list,
// notification banners that stack, and (on the competitor's phone) a profile page with
// the "Managed by Hot Pepper Media" tag. No real app's UI, icons or logos.
import {
  COMPETITOR,
  COMPETITOR_COMMENTS,
  COMPETITOR_NOTIFS,
  COMPETITOR_OLD_COMMENTS,
  COPY,
  NUMBERS,
  Shop,
  TIMING,
  YOU,
  YOUR_COMMENT,
  YOUR_LONELY_NOTIF,
  YOUR_NEW_COMMENTS,
  YOUR_NOTIFS,
  competitorNotifFrames,
} from '../data';
import {clamp01, commas, compact, easeInOut, easeOut, ramp, springAt} from '../lib/ease';
import {
  clockLabel,
  commentSlide,
  competitorComments,
  competitorLikes,
  competitorNewFollowers,
  profileSlide,
  tagPop,
  trendingPop,
  yourComments,
  yourDim,
  yourLikes,
  yourScreenIsNew,
} from '../lib/story';
import {ART_SIZE, competitorArt, deadArt, gridTile, newArt, pepperBadge} from './art';
import {C, H, W, avatar, icon, layer, measure, richText, rr, smear, softShadow, text} from './kit';

type Notif = {at: number; kind: string; text: string};

// ─── Shared pieces ───────────────────────────────────────────────────────────

const statusBar = (ctx: CanvasRenderingContext2D, time: string, color = C.ink) => {
  text(ctx, time, 30, 31, {weight: 600, size: 15.5, color});
  // Punch-hole camera.
  ctx.beginPath();
  ctx.arc(W / 2, 24, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#050506';
  ctx.fill();
  // Signal bars.
  for (let i = 0; i < 4; i++) {
    rr(ctx, 300 + i * 6, 31 - 4 - i * 3, 4, 4 + i * 3, 1);
    ctx.fillStyle = color;
    ctx.fill();
  }
  // Battery.
  rr(ctx, 334, 19, 30, 14, 4);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.stroke();
  ctx.globalAlpha = 1;
  rr(ctx, 336.5, 21.5, 20, 9, 2.4);
  ctx.fillStyle = color;
  ctx.fill();
  rr(ctx, 365.5, 23.5, 2.4, 5, 1);
  ctx.fill();
};

const topBar = (ctx: CanvasRenderingContext2D, title: string) => {
  icon(ctx, 'back', 28, 70, 18, C.ink, 2.2);
  text(ctx, title, W / 2, 76, {weight: 700, size: 18, color: C.ink, align: 'center'});
  icon(ctx, 'bell', 370, 70, 22, C.ink, 2);
};

const bellBadge = (ctx: CanvasRenderingContext2D, badge: number) => {
  if (badge > 0) {
    const label = badge > 99 ? '99+' : String(badge);
    const w = Math.max(18, measure(ctx, label, 800, 11) + 10);
    rr(ctx, 378 - w / 2, 54, w, 18, 9);
    ctx.fillStyle = C.red;
    ctx.fill();
    text(ctx, label, 378, 67, {weight: 800, size: 11, color: '#fff', align: 'center'});
  }
};

const bottomNav = (ctx: CanvasRenderingContext2D, me: Shop) => {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 838, W, H - 838);
  ctx.fillStyle = C.divider;
  ctx.fillRect(0, 838, W, 1);
  const xs = [48, 124, 200, 276, 352];
  icon(ctx, 'home', xs[0], 864, 22, C.ink, 2);
  icon(ctx, 'search', xs[1], 864, 22, C.ink, 2);
  icon(ctx, 'plus', xs[2] + 2, 866, 24, C.ink, 2);
  icon(ctx, 'heart', xs[3], 864, 22, C.ink, 2);
  avatar(ctx, xs[4], 864, 12, me.monogram, me.avatarBg, me.avatarInk);
};

const statPill = (ctx: CanvasRenderingContext2D, x: number, y: number, kind: 'heartFill' | 'heart' | 'comment' | 'save', value: string, accent: boolean) => {
  const w = 30 + measure(ctx, value, 700, 16) + 14;
  rr(ctx, x, y, w, 36, 18);
  ctx.fillStyle = accent ? '#FDECE8' : C.pill;
  ctx.fill();
  icon(ctx, kind, x + 19, y + 18, 17, accent ? C.red : C.text, 1.9);
  text(ctx, value, x + 33, y + 24, {weight: 700, size: 16, color: C.ink});
  return w;
};

const exampleTag = (ctx: CanvasRenderingContext2D, rightX: number, y: number) => {
  const label = COPY.example;
  const w = measure(ctx, label, 600, 10.5) + 14;
  rr(ctx, rightX - w, y, w, 19, 9.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#CFCCC6';
  ctx.stroke();
  text(ctx, label, rightX - w / 2, y + 13.2, {weight: 600, size: 10.5, color: C.meta, align: 'center'});
};

const commentRow = (ctx: CanvasRenderingContext2D, y: number, user: string, body: string, alpha: number, dx: number) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(dx, 0);
  avatar(ctx, 44, y + 16, 14, user);
  richText(ctx, [{s: user, bold: true}, {s: '  ' + body}], 68, y + 21, 280, {size: 14, maxLines: 1});
  icon(ctx, 'heart', 362, y + 16, 13, '#9A9A9A', 1.5);
  ctx.restore();
};

// ─── Notification banners (stacked, newest on top, smeared while moving) ─────

const BANNER_H = 62;
const BANNER_GAP = 70;

const bannerY = (n: Notif, all: Notif[], t: number) => {
  // Slide down into place with a little spring.
  const drop = springAt(t - n.at, {freq: 2.6, damping: 0.62});
  let rank = 0;
  for (const m of all) if (m.at > n.at && m.at <= t) rank += easeOut(clamp01((t - m.at) / 12));
  return {y: 12 + rank * BANNER_GAP - (1 - drop) * 92, rank, drop};
};

const banner = (ctx: CanvasRenderingContext2D, n: Notif, y: number, alpha: number, scale: number) => {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(W / 2, y + BANNER_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-W / 2, -BANNER_H / 2);
  softShadow(ctx, 16, 2, W - 32, BANNER_H - 4, 0.22, 7);
  rr(ctx, 12, 0, W - 24, BANNER_H, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.98)';
  ctx.fill();
  const tint = n.kind === 'like' ? '#FDECE8' : n.kind === 'follow' ? '#FFF1E2' : n.kind === 'chart' ? '#EEF0F2' : '#F1F0EE';
  ctx.beginPath();
  ctx.arc(46, BANNER_H / 2, 18, 0, Math.PI * 2);
  ctx.fillStyle = tint;
  ctx.fill();
  const ic = n.kind === 'like' ? 'heartFill' : n.kind === 'comment' ? 'comment' : n.kind === 'follow' ? 'follow' : n.kind === 'save' ? 'save' : 'chart';
  icon(ctx, ic as 'heartFill', 46, BANNER_H / 2, 17, n.kind === 'like' ? C.red : n.kind === 'follow' ? C.orange : C.text, 1.9);
  const [first, ...rest] = n.text.split(' ');
  const bold = !/^(\+|Your)/.test(first);
  richText(ctx, bold ? [{s: first, bold: true}, {s: ' ' + rest.join(' ')}] : [{s: n.text, color: C.ink}], 74, 37, 262, {size: 14, maxLines: 1});
  text(ctx, 'now', W - 30, 37, {weight: 500, size: 12, color: C.meta, align: 'right'});
  ctx.restore();
};

const notifStack = (ctx: CanvasRenderingContext2D, list: Notif[], t: number, fade = 1) => {
  if (fade <= 0) return;
  const live = list.filter((n) => n.at <= t + 0.5 && t - n.at < 400);
  if (!live.length) return;
  // Samples for the in-canvas motion blur: how far does the fastest banner move this frame?
  let travel = 0;
  for (const n of live) travel = Math.max(travel, Math.abs(bannerY(n, list, t + 0.25).y - bannerY(n, list, t - 0.25).y));
  const samples = Math.min(8, Math.max(1, Math.ceil((travel * 3) / 3)));
  smear(ctx, samples, (c, i) => {
    const ts = samples === 1 ? t : t + 0.5 * ((i + 0.5) / samples - 0.5);
    for (const n of [...live].reverse()) {
      if (n.at > ts) continue;
      const {y, rank} = bannerY(n, list, ts);
      const alpha = clamp01(2.6 - rank) * clamp01((ts - n.at) / 3 + 0.4) * fade;
      banner(c, n, y, alpha, 1 - Math.min(rank, 3) * 0.035);
    }
  }, -100, 12 + 3 * BANNER_GAP + BANNER_H + 30);
};

// ─── The post view ───────────────────────────────────────────────────────────

type PostModel = {
  shop: Shop;
  art: HTMLCanvasElement;
  caption: string;
  likes: number;
  comments: number;
  saves: number;
  hot: boolean;
  /** Comment rows: user, text, slide-in progress (0–1), newest first. */
  rows: {user: string; text: string; p: number}[];
  postedAgo: string;
};

/** The parts of the post view that never change for a given post: drawn once, reused. */
const postBase = (m: PostModel) =>
  layer(`post:${m.shop.name}:${m.caption}:${m.postedAgo}:${m.hot}`, W, H, 3, (ctx) => {
    ctx.fillStyle = C.appBg;
    ctx.fillRect(0, 0, W, H);
    topBar(ctx, 'Your post');
    softShadow(ctx, 16, 104, W - 32, 720, 0.14, 6);
    rr(ctx, 12, 98, W - 24, 732, 24);
    ctx.fillStyle = C.card;
    ctx.fill();
    avatar(ctx, 46, 132, 21, m.shop.monogram, m.shop.avatarBg, m.shop.avatarInk);
    text(ctx, m.shop.name, 78, 128, {weight: 700, size: 16, color: C.ink});
    text(ctx, `${m.shop.location} · ${m.postedAgo}`, 78, 147, {weight: 500, size: 12.5, color: C.meta});
    icon(ctx, 'more', 362, 132, 20, C.meta);
    ctx.save();
    rr(ctx, 24, 166, ART_SIZE, ART_SIZE, 18);
    ctx.clip();
    ctx.drawImage(m.art, 24, 166, ART_SIZE, ART_SIZE);
    ctx.restore();
    exampleTag(ctx, W - 24, 501 + 40);
    richText(ctx, [{s: m.shop.name, bold: true}, {s: '  ' + m.caption}], 26, 598, W - 52, {size: 14.5, lineH: 20, maxLines: 2});
    ctx.fillStyle = C.divider;
    ctx.fillRect(26, 640, W - 52, 1);
    bottomNav(ctx, m.shop);
  });

const postView = (ctx: CanvasRenderingContext2D, m: PostModel, badge: number) => {
  ctx.drawImage(postBase(m), 0, 0, W, H);
  bellBadge(ctx, badge);
  // Stats.
  let x = 24;
  x += statPill(ctx, x, 532, m.hot ? 'heartFill' : 'heart', commas(m.likes), m.hot) + 8;
  x += statPill(ctx, x, 532, 'comment', commas(m.comments), false) + 8;
  statPill(ctx, x, 532, 'save', commas(m.saves), false);
  text(ctx, `Comments · ${commas(m.comments)}`, 26, 666, {weight: 600, size: 13.5, color: C.meta});
  // Comment rows, newest pushing in at the top.
  ctx.save();
  rr(ctx, 12, 676, W - 24, 150, 0);
  ctx.clip();
  let y = 680;
  for (const r of m.rows) {
    const h = 38 * easeOut(r.p);
    commentRow(ctx, y - 38 + h, r.user, r.text, r.p, (1 - easeOut(r.p)) * 60);
    y += h;
    if (y > 830) break;
  }
  ctx.restore();
};

// ─── Competitor ──────────────────────────────────────────────────────────────

const NOTIF_FRAMES = competitorNotifFrames();
const COMP_NOTIFS: Notif[] = NOTIF_FRAMES.map((at, i) => ({at, ...COMPETITOR_NOTIFS[i % COMPETITOR_NOTIFS.length]}));

const competitorPost = (ctx: CanvasRenderingContext2D, t: number) => {
  const slides = commentSlide(t);
  const rows = [
    ...COMPETITOR_COMMENTS.map((c, i) => ({user: c.user, text: c.text, p: slides[i]})).filter((r) => r.p > 0).reverse(),
    ...COMPETITOR_OLD_COMMENTS.map((c) => ({...c, p: 1})),
  ];
  const likes = competitorLikes(t);
  const badge = NOTIF_FRAMES.filter((a) => a <= t).length + 12;
  postView(
    ctx,
    {
      shop: COMPETITOR,
      art: competitorArt(),
      caption: COMPETITOR.post.caption,
      likes,
      comments: competitorComments(t),
      saves: likes * 0.11,
      hot: true,
      rows,
      postedAgo: '2h',
    },
    badge,
  );
  // "Trending in Beirut" pill over the image.
  const tp = trendingPop(t);
  if (tp > 0.001) {
    ctx.save();
    ctx.translate(36, 180);
    ctx.scale(tp, tp);
    const w = measure(ctx, COPY.trending, 700, 13.5) + 46;
    softShadow(ctx, 4, 2, w - 8, 30, 0.35, 5);
    rr(ctx, 0, 0, w, 34, 17);
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.fill();
    icon(ctx, 'flame', 20, 17, 16, C.orange);
    text(ctx, COPY.trending, 34, 22, {weight: 700, size: 13.5, color: C.ink});
    ctx.restore();
  }
  // "+1,236 new followers" toast near the bottom of the card.
  const fa = springAt(t - NUMBERS.competitorNewFollowers[0][0], {freq: 2.2, damping: 0.55});
  const fOut = ramp(t, TIMING.profileAt - 10, TIMING.profileAt + 6);
  if (fa > 0.001 && fOut < 1) {
    const label = `+${commas(competitorNewFollowers(t))} ${COPY.newFollowers}`;
    const w = measure(ctx, label, 700, 15) + 56;
    ctx.save();
    ctx.globalAlpha = 1 - fOut;
    ctx.translate(W / 2, 790);
    ctx.scale(0.6 + 0.4 * fa, 0.6 + 0.4 * fa);
    ctx.globalAlpha *= clamp01(fa * 1.4);
    softShadow(ctx, -w / 2 + 6, -18, w - 12, 38, 0.4, 7);
    rr(ctx, -w / 2, -21, w, 42, 21);
    ctx.fillStyle = '#141210';
    ctx.fill();
    icon(ctx, 'follow', -w / 2 + 25, 0, 17, C.orange, 2);
    text(ctx, label, -w / 2 + 42, 5.5, {weight: 700, size: 15, color: '#FFFFFF'});
    ctx.restore();
  }
};

const profileBase = () =>
  layer('profile', W, H, 3, (ctx) => {
    profileStatic(ctx);
  });

const profileStatic = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  // Header: handle.
  text(ctx, COMPETITOR.handle, 26, 78, {weight: 800, size: 19, color: C.ink});
  icon(ctx, 'plus', 330, 71, 22, C.ink, 2);
  icon(ctx, 'more', 370, 71, 22, C.ink);
  // Avatar with a warm ring.
  const ring = ctx.createLinearGradient(20, 100, 110, 190);
  ring.addColorStop(0, C.orange);
  ring.addColorStop(1, C.red);
  ctx.beginPath();
  ctx.arc(66, 146, 44, 0, Math.PI * 2);
  ctx.fillStyle = ring;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(66, 146, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  avatar(ctx, 66, 146, 37, COMPETITOR.monogram, COMPETITOR.avatarBg, COMPETITOR.avatarInk);
  // Name and bio.
  text(ctx, COMPETITOR.name, 26, 218, {weight: 700, size: 16, color: C.ink});
  text(ctx, 'Coffee shop', 26, 238, {weight: 500, size: 13.5, color: C.meta});
  text(ctx, COMPETITOR.bio, 26, 259, {weight: 500, size: 14, color: C.text});
  icon(ctx, 'pin', 33, 274, 13, C.meta, 1.6);
  text(ctx, COMPETITOR.location, 45, 280, {weight: 500, size: 13.5, color: C.text});
  exampleTag(ctx, W - 24, 128 + 56);

  // Buttons.
  ['Edit profile', 'Share profile'].forEach((l, i) => {
    rr(ctx, 26 + i * 178, 358, 170, 36, 12);
    ctx.fillStyle = C.pill;
    ctx.fill();
    text(ctx, l, 26 + i * 178 + 85, 381, {weight: 700, size: 14, color: C.ink, align: 'center'});
  });
  // Highlights.
  ['Menu', 'Iced', 'Beans', 'Events', 'Team'].forEach((l, i) => {
    const cx = 52 + i * 74;
    ctx.beginPath();
    ctx.arc(cx, 440, 27, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#DDDAD4';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, 440, 23, 0, Math.PI * 2);
    ctx.fillStyle = ['#2B1A12', '#FF7A1A', '#6B3B1E', '#E63922', '#F2E3CF'][i];
    ctx.fill();
    text(ctx, l, cx, 486, {weight: 500, size: 12, color: C.text, align: 'center'});
  });
  // Grid.
  ctx.fillStyle = C.divider;
  ctx.fillRect(0, 506, W, 1);
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 548, W / 2, 2);
  icon(ctx, 'plus', 100, 528, 18, C.ink, 1.8);
  icon(ctx, 'heart', 300, 528, 18, C.meta, 1.8);
  const s = (W - 4) / 3;
  for (let i = 0; i < 9; i++) {
    const gx = (i % 3) * (s + 2);
    const gy = 552 + Math.floor(i / 3) * (s + 2);
    if (gy > H) break;
    ctx.drawImage(gridTile(i), gx, gy, s, s);
  }
  bottomNav(ctx, COMPETITOR);
};

const profileView = (ctx: CanvasRenderingContext2D, t: number) => {
  ctx.drawImage(profileBase(), 0, 0, W, H);
  // Stats.
  const followers = NUMBERS.competitorFollowers + 1236 * ramp(t, 560, 700, easeInOut);
  const stats: [string, string][] = [
    [commas(NUMBERS.competitorPosts), 'Posts'],
    [compact(followers), 'Followers'],
    [commas(NUMBERS.competitorFollowing), 'Following'],
  ];
  stats.forEach(([v, l], i) => {
    const cx = 172 + i * 84;
    text(ctx, v, cx, 144, {weight: 800, size: 18, color: C.ink, align: 'center'});
    text(ctx, l, cx, 164, {weight: 500, size: 12.5, color: C.meta, align: 'center'});
  });
  // The tag: "Managed by 🌶 Hot Pepper Media".
  const p = tagPop(t);
  if (p > 0.001) {
    const label1 = COPY.managedBy;
    const label2 = COPY.agency;
    const w = 52 + measure(ctx, label1 + ' ', 500, 14.5) + measure(ctx, label2, 800, 14.5) + 18;
    const x = 26;
    const y = 300;
    ctx.save();
    ctx.translate(x, y + 20);
    ctx.scale(Math.max(0, p), Math.max(0, p));
    ctx.translate(0, -20);
    // Highlight ring that pulses out once.
    const pulse = clamp01((t - TIMING.tagAt - 8) / 36);
    if (pulse > 0 && pulse < 1) {
      rr(ctx, -6 * pulse * 3, -6 * pulse * 3, w + 36 * pulse, 40 + 36 * pulse, 20 + 18 * pulse);
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(230,57,34,${0.7 * (1 - pulse)})`;
      ctx.stroke();
    }
    rr(ctx, 0, 0, w, 40, 20);
    ctx.fillStyle = '#FFF0EB';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = C.red;
    ctx.stroke();
    pepperBadge(ctx, 21, 20, 13);
    const tw = text(ctx, label1 + ' ', 42, 25.5, {weight: 500, size: 14.5, color: C.text});
    text(ctx, label2, 42 + tw, 25.5, {weight: 800, size: 14.5, color: C.red});
    ctx.restore();
  }
};

export const drawCompetitorScreen = (ctx: CanvasRenderingContext2D, t: number) => {
  const slide = profileSlide(t);
  if (slide < 1) {
    ctx.save();
    ctx.translate(-W * 0.35 * slide, 0);
    competitorPost(ctx, t);
    ctx.restore();
  }
  if (slide > 0) {
    ctx.save();
    ctx.translate(W * (1 - slide), 0);
    softShadow(ctx, -10, 0, 30, H, 0.5 * (1 - slide), 0);
    profileView(ctx, t);
    ctx.restore();
  }
  // Status bar over a clean strip.
  ctx.fillStyle = slide > 0.5 ? '#FFFFFF' : C.appBg;
  ctx.fillRect(0, 0, W, 44);
  statusBar(ctx, clockLabel(t));
  notifStack(ctx, COMP_NOTIFS, t, 1 - ramp(t, TIMING.profileAt - 18, TIMING.profileAt + 4));
};

// ─── You ─────────────────────────────────────────────────────────────────────

const LONELY: Notif[] = [{at: TIMING.lonelyPingAt, ...YOUR_LONELY_NOTIF}];
const YOURS_AFTER: Notif[] = YOUR_NOTIFS.map((n) => ({...n}));

export const drawYourScreen = (ctx: CanvasRenderingContext2D, t: number) => {
  const isNew = yourScreenIsNew(t);
  const rows = isNew
    ? [
        ...YOUR_NEW_COMMENTS.map((c) => ({user: c.user, text: c.text, p: ramp(t, c.at, c.at + 16, easeOut)})).filter((r) => r.p > 0).reverse(),
      ]
    : [{user: YOUR_COMMENT.user, text: YOUR_COMMENT.text, p: 1}];
  const likes = yourLikes(t);
  postView(
    ctx,
    {
      shop: YOU,
      art: isNew ? newArt() : deadArt(),
      caption: isNew ? YOU.newPost.caption : YOU.deadPost.caption,
      likes,
      comments: yourComments(t),
      saves: isNew ? likes * 0.08 : 0,
      hot: isNew && likes > 0,
      rows,
      postedAgo: isNew ? 'now' : '6h',
    },
    isNew ? YOURS_AFTER.filter((n) => n.at <= t).length : 0,
  );
  ctx.fillStyle = C.appBg;
  ctx.fillRect(0, 0, W, 44);
  statusBar(ctx, clockLabel(t));
  if (isNew) notifStack(ctx, YOURS_AFTER, t);
  else notifStack(ctx, LONELY, t, 1 - ramp(t, TIMING.lonelyPingAt + 70, TIMING.lonelyPingAt + 90));
  // The dead screen loses its colour.
  const d = yourDim(t);
  if (d > 0.001) {
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.globalAlpha = 0.85 * d;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.35 * d;
    ctx.fillStyle = '#8C949C';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
};

// ─── Content keys: a screen is only redrawn when its key changes ─────────────

const bannerKey = (list: Notif[], t: number) =>
  list
    .filter((n) => n.at <= t + 0.5 && t - n.at < 400)
    .map((n) => bannerY(n, list, t).y.toFixed(2))
    .join(',');

export const yourScreenKey = (t: number) => {
  if (yourScreenIsNew(t)) return `new|${t}`;
  const lonelyFade = 1 - ramp(t, TIMING.lonelyPingAt + 70, TIMING.lonelyPingAt + 90);
  return `dead|${clockLabel(t)}|${yourDim(t).toFixed(3)}|${bannerKey(LONELY, t)}|${lonelyFade.toFixed(3)}`;
};

export const competitorScreenKey = (t: number) => {
  if (t < TIMING.profileAt + 30) return `post|${t}`;
  const followers = Math.round(NUMBERS.competitorFollowers + 1236 * ramp(t, 560, 700, easeInOut));
  const pulse = clamp01((t - TIMING.tagAt - 8) / 36);
  return `profile|${compact(followers)}|${tagPop(t).toFixed(4)}|${pulse.toFixed(3)}|${clockLabel(t)}`;
};
