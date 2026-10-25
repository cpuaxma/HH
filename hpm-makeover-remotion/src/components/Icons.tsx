import React from 'react';

// Small generic line icons (no platform branding). All on a 24×24 grid.
type P = {size?: number; color?: string; stroke?: number; style?: React.CSSProperties};

const Svg: React.FC<P & {children: React.ReactNode}> = ({size = 24, color = 'currentColor', stroke = 2, style, children}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', ...style}}>
    {children}
  </svg>
);

export const IconDots: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="5" cy="12" r="0.9" fill={p.color ?? 'currentColor'} />
    <circle cx="12" cy="12" r="0.9" fill={p.color ?? 'currentColor'} />
    <circle cx="19" cy="12" r="0.9" fill={p.color ?? 'currentColor'} />
  </Svg>
);
export const IconChevronLeft: React.FC<P> = (p) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>;
export const IconChevronDown: React.FC<P> = (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
export const IconGrid: React.FC<P> = (p) => (
  <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" /></Svg>
);
export const IconPlay: React.FC<P> = (p) => (
  <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M10.5 9l4.5 3-4.5 3z" /></Svg>
);
export const IconPerson: React.FC<P> = (p) => (
  <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="12" cy="10" r="2.6" /><path d="M7.5 17.5c1-2.2 2.6-3.2 4.5-3.2s3.5 1 4.5 3.2" /></Svg>
);
export const IconHeart: React.FC<P & {filled?: boolean}> = ({filled, ...p}) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill={filled ? p.color ?? 'currentColor' : 'none'} />
  </Svg>
);
export const IconComment: React.FC<P> = (p) => <Svg {...p}><path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" /></Svg>;
export const IconSend: React.FC<P> = (p) => <Svg {...p}><path d="M20.5 3.5L10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4z" /></Svg>;
export const IconBookmark: React.FC<P> = (p) => <Svg {...p}><path d="M6 4h12v16l-6-4.5L6 20z" /></Svg>;
export const IconArrowDown: React.FC<P> = (p) => <Svg {...p}><path d="M12 4v15M6 13l6 6 6-6" /></Svg>;
export const IconArrowRight: React.FC<P> = (p) => <Svg {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Svg>;
export const IconCross: React.FC<P> = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const IconCup: React.FC<P> = (p) => (
  <Svg {...p}><path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" /><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5c-.8 1 .8 2-.1 3M12 3.5c-.8 1 .8 2-.1 3" /></Svg>
);
export const IconStar: React.FC<P> = (p) => (
  <Svg {...p}><path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" /></Svg>
);
export const IconCalendar: React.FC<P> = (p) => (
  <Svg {...p}><rect x="4" y="5.5" width="16" height="14.5" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></Svg>
);

// Generic status bar glyphs.
export const StatusIcons: React.FC<{color: string}> = ({color}) => (
  <svg width="76" height="20" viewBox="0 0 76 20" style={{display: 'block'}}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 6} y={14 - i * 3.5} width="4" height={5 + i * 3.5} rx="1" fill={color} />
    ))}
    <path d="M32 9.5a10 10 0 0 1 14 0M35 12.7a5.6 5.6 0 0 1 8 0" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="39" cy="16" r="1.6" fill={color} />
    <rect x="51" y="4" width="21" height="12" rx="3.5" stroke={color} strokeWidth="1.6" fill="none" opacity="0.6" />
    <rect x="53.4" y="6.4" width="14" height="7.2" rx="1.8" fill={color} />
    <rect x="73.2" y="8" width="2" height="4" rx="1" fill={color} opacity="0.6" />
  </svg>
);
