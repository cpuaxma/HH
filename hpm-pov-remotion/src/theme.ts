import {CalendarCheck, Heart, LucideIcon, MessageCircle, ShoppingBag, TrendingUp, UserPlus} from 'lucide-react';
import {Easing} from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 60;
export const DURATION = 1800;

export const HPM = {
  red: '#E23B24',
  charcoal: '#0F0F0F',
  cream: '#FEF9EF',
  peach: '#FFD7C9',
  gray: '#E7E4DF',
} as const;

export const FONT = 'Montserrat';
export const WEIGHT = {body: 500, label: 600, title: 700, headline: 800} as const;

export const TYPE = {
  headlineTracking: '-0.03em',
  labelTracking: '0.08em',
  sloganTracking: '0.3em',
} as const;

// Reels/TikTok safe area: keep the right 140px and bottom 320px free of key content.
export const SAFE = {left: 80, right: 940, bottom: 1600} as const;

// Entrances: expo-out bezier. Exits: cubic-in, ~40% shorter than the entrance.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.in(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);

// Hero moments get the "kick"; notification cards and the stack layout use CARD.
export const KICK = {damping: 14, stiffness: 160, mass: 1} as const;
export const CARD_SPRING = {damping: 15, stiffness: 180, mass: 1} as const;

export const TIMING = {charStagger: 1.2, minHold: 42} as const;

// ── Lock screen layout ──
export const LOCK = {
  statusY: 46, // status row, vertically centred on the Dynamic Island
  dateY: 168,
  clockCenterY: 330,
  clockSize: 220,
  chipY: 458,
  areaTop: 620,
  areaBottom: 1560,
} as const;

// ── Notification card: iPhone (iOS) lock-screen style ──
// Inter stands in for Apple's SF Pro, which is licensed for Apple platforms only.
export const UI_FONT = 'Inter';
export const IOS = {
  text: '#000000',
  secondary: 'rgba(60,60,67,0.6)',
  material: 'rgba(250,248,246,0.66)', // light notification material over the wallpaper
  monoTop: '#A7ACB5', // contact monogram gradient
  monoBottom: '#868B94',
} as const;

export const CARD = {
  width: 860, // x 80…940 keeps the right safe zone clear
  left: (SAFE.left + SAFE.right) / 2 - 860 / 2,
  radius: 46,
  padY: 24,
  padX: 26,
  tile: 76, // app icon / contact avatar
  tileRadius: 18, // app icon squircle
  badge: 34, // app badge on a contact avatar
  gap: 22, // avatar ↔ text
  stackGap: 12,
  titleSize: 30,
  bodySize: 29,
  line: 37,
  timeSize: 25,
  peek: 18,
} as const;

export type NotifType = 'FOLLOWERS' | 'MESSAGES' | 'ORDERS' | 'BOOKINGS' | 'COMMENTS' | 'INSIGHTS';

// Notification type → icon and tile colours (brand colours only).
export const NOTIF_STYLE: Record<NotifType, {icon: LucideIcon; tile: string; ink: string}> = {
  FOLLOWERS: {icon: UserPlus, tile: HPM.red, ink: HPM.cream},
  MESSAGES: {icon: MessageCircle, tile: HPM.charcoal, ink: HPM.cream},
  ORDERS: {icon: ShoppingBag, tile: HPM.red, ink: HPM.cream},
  BOOKINGS: {icon: CalendarCheck, tile: HPM.charcoal, ink: HPM.cream},
  COMMENTS: {icon: Heart, tile: HPM.peach, ink: HPM.red},
  INSIGHTS: {icon: TrendingUp, tile: HPM.charcoal, ink: HPM.cream},
};
