import {
  BarChart3,
  CalendarCheck,
  Clapperboard,
  Compass,
  Handshake,
  LucideIcon,
  Megaphone,
  MessageCircle,
  MonitorSmartphone,
} from 'lucide-react';
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {IconName} from '../copy';
import {enterProgress} from '../lib/anim';
import {COLORS, STROKE} from '../theme';

const ICONS: Record<IconName, LucideIcon> = {
  Compass,
  CalendarCheck,
  Clapperboard,
  Megaphone,
  Handshake,
  MonitorSmartphone,
  MessageCircle,
  BarChart3,
};

// Longer than any single stroke in these 24px icons (the longest is ~70),
// so every stroke grows from its start at the same speed and ends fully drawn.
export const ICON_DASH = 100;

// Lucide line icon drawn in with a stroke-dash animation.
// The dash itself is applied by the `.hpm-icon` rule in HpmServices.
export const LineIcon: React.FC<{name: IconName; start: number; duration?: number; size?: number}> = ({
  name,
  start,
  duration = 36,
  size = 72,
}) => {
  const frame = useCurrentFrame();
  const p = enterProgress(frame, start, duration);
  const Icon = ICONS[name];
  return (
    <div
      className="hpm-icon"
      style={{width: size, height: size, ['--dash' as string]: ICON_DASH * (1 - p), opacity: p > 0 ? 1 : 0}}
    >
      <Icon size={size} color={COLORS.red} strokeWidth={STROKE.icon} />
    </div>
  );
};
