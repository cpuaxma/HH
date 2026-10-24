// Every notification as data. Edit copy or timing here; the stack lays itself out.
// All names and handles are fictional (Lebanese / Arabic first names); types map to icons/colours in theme.NOTIF_STYLE.
import {NotifType} from './theme';
import {CUE} from './timeline';

export type Notif = {frame: number; type: NotifType; title: string; body: string};
export type Copy = Omit<Notif, 'frame'>;

const n = (type: NotifType, title: string, body: string): Copy => ({type, title, body});

// Scene 3: the only notification on the quiet phone (not part of the stack).
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

// The flood copy, shared by the cold open and Month 3 (you have seen this screen before).
const FLOOD_COPY: Copy[] = [
  n('ORDERS', 'New order received', '#1187'),
  n('ORDERS', 'New order received', '#1188'),
  n('ORDERS', 'New order received', '#1192'),
  n('BOOKINGS', 'Bookings', 'fully booked this weekend 🔥'),
  n('MESSAGES', 'Messages', 'collab request from a local creator'),
  n('FOLLOWERS', '+1,240 new followers', 'this month'),
  n('COMMENTS', 'omar.k commented', 'best in town, no debate'),
  n('INSIGHTS', 'Account insights', 'your account is trending in your area'),
  n('MESSAGES', 'Messages', '12 new messages'),
  n('ORDERS', 'New order received', '#1203'),
  n('BOOKINGS', 'Bookings', 'new event inquiry'),
];
const VARIANTS = (startOrder: number): Copy[] => [
  n('ORDERS', 'New order received', `#${startOrder}`),
  n('FOLLOWERS', 'george.haddad', 'started following you'),
  n('COMMENTS', 'tatiana.eats commented', 'came back twice this week 😅'),
  n('ORDERS', 'New order received', `#${startOrder + 3}`),
  n('MESSAGES', 'Messages', 'is there parking nearby?'),
  n('BOOKINGS', 'New booking request', 'Sunday, 6 guests'),
  n('INSIGHTS', 'Account insights', 'profile visits up 312% this month'),
  n('ORDERS', 'New order received', `#${startOrder + 7}`),
  n('COMMENTS', 'joe.khoury commented', 'need this every day 🤤'),
  n('FOLLOWERS', '+64 new followers', 'today'),
];
const FLOOD = [...FLOOD_COPY, ...VARIANTS(1206), ...VARIANTS(1219), ...VARIANTS(1234)];
// 1 · Cold open: already mid-flood on frame 0. Earlier arrivals have negative frames, so the
// stack is full (and the newest cards still settling) the moment the video starts.
const OPEN = place(cadence(-150, 49, 6, 6), FLOOD);

// 5a · Week 1: slow and hopeful, ~one every 36 frames.
const WEEK1: Notif[] = [
  {frame: 572, ...n('FOLLOWERS', 'sarah.eats', 'started following you')},
  {frame: 610, ...n('COMMENTS', 'rami.n commented', 'where is this?? 😍 need to go')},
  {frame: 646, ...n('INSIGHTS', 'Weekly insights', 'your post is performing better than 90% of your recent posts')},
  {frame: 680, ...n('MESSAGES', 'nour.m', 'hi! are you open on sundays?')},
];

// 5b · Week 4: picking up, gap 20 → 15 frames.
const WEEK4 = place(cadence(734, 10, 20, 15), [
  n('BOOKINGS', 'New booking request', 'Saturday, 4 guests'),
  n('ORDERS', 'New order received', '#1043'),
  n('MESSAGES', 'karim.fares', 'do you deliver? 🙏'),
  n('FOLLOWERS', '+86 new followers', 'this week'),
  n('COMMENTS', 'lara.azar commented', 'omg this reel 😂 sent it to everyone'),
  n('INSIGHTS', 'Reel insights', 'your reel reached 48K accounts'),
  n('ORDERS', 'New order received', '#1061'),
  n('COMMENTS', 'hadi.b commented', 'the vibes here 🙌'),
  n('ORDERS', 'New order received', '#1064'),
  n('BOOKINGS', 'New booking request', 'Friday, 2 guests'),
  n('MESSAGES', 'elie.chamoun', 'can I book for a birthday?'),
  n('FOLLOWERS', 'yara.bakes', 'started following you'),
]);

// 5c · Month 3: the flood again, gap 7 → 6 frames.
const MONTH3 = place(cadence(942, 32, 7, 6), FLOOD);

// 6 · Overheat: faster than the cold open, so the ending still escalates. Gap 5 → 4.
const OVERHEAT = place(cadence(1148, 44, 5, 4), [...VARIANTS(1251), ...VARIANTS(1266), ...FLOOD_COPY]);

// The "+N more" counter: the real hidden count until `from`, then these keyframes
// (a flood implies more arrivals than we draw). 99 or more reads "99+".
export type Counter = {from: number; keys: [number, number][]};
export type Run = {list: Notif[]; counter: Counter};

export const OPEN_RUN: Run = {
  list: OPEN,
  counter: {from: -1, keys: [[0, 99], [CUE.rewind, 99], [CUE.rewind + CUE.counterDown, 0]]},
};
export const MAIN_RUN: Run = {
  list: [...WEEK1, ...WEEK4, ...MONTH3, ...OVERHEAT],
  counter: {from: 946, keys: [[966, 12], [1046, 47], [1120, 99]]},
};
export const ALL_ARRIVALS = [...OPEN, ...MAIN_RUN.list].map((x) => x.frame);
