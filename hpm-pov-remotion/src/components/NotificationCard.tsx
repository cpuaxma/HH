import React from 'react';
import {Copy} from '../notifications';
import {CARD, IOS, NOTIF_STYLE, NotifType, UI_FONT} from '../theme';

type Props = {
  notif: Copy;
  icon?: React.ReactNode; // overrides the avatar / app icon
  glass?: string; // card material
  contentOpacity?: number; // grouped cards fade their contents, leaving the glass plate
  style?: React.CSSProperties;
};

// App icon: a squircle in the type's brand colour (fictional apps; no real app icons).
export const AppIcon: React.FC<{type: NotifType; size: number}> = ({type, size}) => {
  const s = NOTIF_STYLE[type];
  const Icon = s.icon;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * (CARD.tileRadius / CARD.tile),
        background: `linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%), ${s.tile}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.5} color={s.ink} strokeWidth={2.2} fill={type === 'COMMENTS' ? s.ink : 'none'} />
    </div>
  );
};

const initials = (name: string) =>
  name
    .split(/[.\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

// Contact avatar: iOS-style grey monogram with the app's icon as a badge.
const ContactAvatar: React.FC<{name: string; type: NotifType}> = ({name, type}) => (
  <div style={{position: 'relative', width: CARD.tile, height: CARD.tile, flex: 'none'}}>
    <div
      style={{
        width: CARD.tile,
        height: CARD.tile,
        borderRadius: '50%',
        background: `linear-gradient(180deg, ${IOS.monoTop}, ${IOS.monoBottom})`,
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: UI_FONT,
        fontWeight: 600,
        fontSize: CARD.tile * 0.4,
        letterSpacing: '0.01em',
      }}
    >
      {initials(name)}
    </div>
    <div style={{position: 'absolute', right: -6, bottom: -6, borderRadius: CARD.badge * 0.26, boxShadow: '0 0 0 3px rgba(250,248,246,0.9)'}}>
      <AppIcon type={type} size={CARD.badge} />
    </div>
  </div>
);

// iPhone-style lock-screen notification: avatar or app icon, bold title with the time on the
// right, 1–2 lines of body, on a frosted light material.
export const NotificationCard: React.FC<Props> = ({notif, icon, glass = IOS.material, contentOpacity = 1, style}) => (
  <div
    style={{
      position: 'absolute',
      left: CARD.left,
      width: CARD.width,
      boxSizing: 'border-box',
      padding: `${CARD.padY}px ${CARD.padX}px`,
      borderRadius: CARD.radius,
      background: glass,
      backdropFilter: 'blur(30px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
      boxShadow: '0 8px 24px rgba(15,15,15,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: CARD.gap,
      fontFamily: UI_FONT,
      color: IOS.text,
      ...style,
    }}
  >
    <div style={{opacity: contentOpacity, flex: 'none'}}>
      {icon ?? (notif.person ? <ContactAvatar name={notif.title} type={notif.type} /> : <AppIcon type={notif.type} size={CARD.tile} />)}
    </div>
    <div style={{flex: 1, minWidth: 0, opacity: contentOpacity}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
        <div style={{flex: 1, minWidth: 0, fontWeight: 600, fontSize: CARD.titleSize, lineHeight: `${CARD.line}px`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {notif.title}
        </div>
        <div style={{flex: 'none', fontWeight: 400, fontSize: CARD.timeSize, color: IOS.secondary}}>now</div>
      </div>
      <div
        style={{
          fontWeight: 400,
          fontSize: CARD.bodySize,
          lineHeight: `${CARD.line}px`,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {notif.body}
      </div>
    </div>
  </div>
);
