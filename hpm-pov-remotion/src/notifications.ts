// Every notification as data. Edit copy or timing here; the stack lays itself out.
// All names and handles are fictional; types map to icons/colours in theme.NOTIF_STYLE.
import {NotifType} from './theme';

export type Notif = {frame: number; type: NotifType; title: string; body: string};
export type Copy = Omit<Notif, 'frame'>;

const n = (type: NotifType, title: string, body: string): Copy => ({type, title, body});

// Scene 1: the only notification on the quiet phone (not part of the stack).
export const MOM: Copy = n('COMMENTS', 'mom', 'liked your post ❤️');

// ── Time jumps: the clock, date and chip after each jump ──
export type Moment = {weekday: string; date: string; hour: number; minute: number; chip: string};
export const MOMENTS: Moment[] = [
  {weekday: 'Monday', date: 'March 3', hour: 9, minute: 0, chip: 'DAY 1'},
  {weekday: 'Sunday', date: 'March 9', hour: 10, minute: 24, chip: 'WEEK 1'},
  {weekday: 'Saturday', date: 'March 29', hour: 6, minute: 47, chip: 'WEEK 4'},
  {weekday: 'Tuesday', date: 'June 3', hour: 8, minute: 15, chip: 'MONTH 3'},
];

// Frames spaced with a gap that tightens from `from` to `to`: the beat building up.
const cadence = (start: number, count: number, from: number, to: number) => {
  const out: number[] = [];
  let f = start;
  for (let i = 0; i < count; i++) {
    out.push(Math.round(f));
    f += from + (to - from) * (count > 1 ? i / (count - 1) : 0);
  }
  return out;
};

const place = (frames: number[], copy: Copy[]): Notif[] => frames.map((frame, i) => ({frame, ...copy[i % copy.length]}));

// 3a · Week 1: slow and hopeful, ~one every 40 frames.
const WEEK1: Notif[] = [
  {frame: 440, ...n('FOLLOWERS', 'sara.eats', 'started following you')},
  {frame: 480, ...n('COMMENTS', 'jules.k commented', 'where is this?? 😍 need to go')},
  {frame: 520, ...n('INSIGHTS', 'Weekly insights', 'your post is performing better than 90% of your recent posts')},
  {frame: 560, ...n('MESSAGES', 'nina.m', 'hi! are you open on sundays?')},
];

// 3b · Week 4: picking up, gap 22 → 16 frames.
const WEEK4 = place(cadence(676, 12, 22, 16), [
  n('BOOKINGS', 'New booking request', 'Saturday, 4 guests'),
  n('ORDERS', 'New order received', '#1043'),
  n('MESSAGES', 'tom.rivera', 'do you deliver? 🙏'),
  n('FOLLOWERS', '+86 new followers', 'this week'),
  n('COMMENTS', 'maya.lou commented', 'omg this reel 😂 sent it to everyone'),
  n('INSIGHTS', 'Reel insights', 'your reel reached 48K accounts'),
  n('ORDERS', 'New order received', '#1061'),
  n('COMMENTS', 'dani.b commented', 'the vibes here 🙌'),
  n('ORDERS', 'New order received', '#1064'),
  n('BOOKINGS', 'New booking request', 'Friday, 2 guests'),
  n('MESSAGES', 'leo.park', 'can I book for a birthday?'),
  n('FOLLOWERS', 'lena.bakes', 'started following you'),
]);

// 3c · Month 3: the flood, gap 8 → 6 frames. Listed copy first, then variants.
const FLOOD_COPY: Copy[] = [
  n('ORDERS', 'New order received', '#1187'),
  n('ORDERS', 'New order received', '#1188'),
  n('ORDERS', 'New order received', '#1192'),
  n('BOOKINGS', 'Bookings', 'fully booked this weekend 🔥'),
  n('MESSAGES', 'Messages', 'collab request from a local creator'),
  n('FOLLOWERS', '+1,240 new followers', 'this month'),
  n('COMMENTS', 'rosa.v commented', 'best in town, no debate'),
  n('INSIGHTS', 'Account insights', 'your account is trending in your area'),
  n('MESSAGES', 'Messages', '12 new messages'),
  n('ORDERS', 'New order received', '#1203'),
  n('BOOKINGS', 'Bookings', 'new event inquiry'),
];
const VARIANTS = (startOrder: number): Copy[] => [
  n('ORDERS', 'New order received', `#${startOrder}`),
  n('FOLLOWERS', 'ben.ortiz', 'started following you'),
  n('COMMENTS', 'ari.food commented', 'came back twice this week 😅'),
  n('ORDERS', 'New order received', `#${startOrder + 3}`),
  n('MESSAGES', 'Messages', 'is there parking nearby?'),
  n('BOOKINGS', 'New booking request', 'Sunday, 6 guests'),
  n('INSIGHTS', 'Account insights', 'profile visits up 312% this month'),
  n('ORDERS', 'New order received', `#${startOrder + 7}`),
  n('COMMENTS', 'kim.eats commented', 'need this every day 🤤'),
  n('FOLLOWERS', '+64 new followers', 'today'),
];
const MONTH3 = place(cadence(932, 44, 8, 6), [...FLOOD_COPY, ...VARIANTS(1206), ...VARIANTS(1219), ...VARIANTS(1234)]);

// 4 · Overheat: so fast the cards blur together, gap 5 → 4 frames.
const OVERHEAT = place(cadence(1228, 44, 5, 4), [...VARIANTS(1251), ...VARIANTS(1266), ...FLOOD_COPY]);

export const NOTIFICATIONS: Notif[] = [...WEEK1, ...WEEK4, ...MONTH3, ...OVERHEAT];

// The "+N more" counter: the real hidden count until the flood, then these keyframes
// (the flood implies more arrivals than we draw). 99 or more reads "99+".
export const COUNTER_FROM_FLOOD = 936;
export const COUNTER_KEYS: [number, number][] = [
  [960, 12],
  [1060, 47],
  [1180, 99],
];
