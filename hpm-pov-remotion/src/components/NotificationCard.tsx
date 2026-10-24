import React from 'react';
import {Copy} from '../notifications';
import {CARD, FONT, HPM, NOTIF_STYLE, TYPE, WEIGHT} from '../theme';

type Props = {
  notif: Copy;
  label?: string; // overrides the type label (e.g. the system alert)
  icon?: React.ReactNode; // overrides the type icon tile
  glass?: string; // card fill
  contentOpacity?: number; // grouped cards fade their contents, leaving the glass plate
  style?: React.CSSProperties;
};

// Frosted-glass notification: icon tile, type label + "now", title, 1–2 line body.
// Generic by design: no real app names, logos or OS branding.
export const NotificationCard: React.FC<Props> = ({notif, label, icon, glass = 'rgba(255,255,255,0.72)', contentOpacity = 1, style}) => {
  const s = NOTIF_STYLE[notif.type];
  const Icon = s.icon;
  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.left,
        width: CARD.width,
        boxSizing: 'border-box',
        padding: `${CARD.padY}px ${CARD.padX}px`,
        borderRadius: CARD.radius,
        background: glass,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(15,15,15,0.06)',
        boxShadow: '0 10px 30px rgba(15,15,15,0.08)',
        display: 'flex',
        gap: CARD.gap,
        fontFamily: FONT,
        color: HPM.charcoal,
        ...style,
      }}
    >
      {icon ?? (
        <div
          style={{
            opacity: contentOpacity,
            flex: 'none',
            width: CARD.tile,
            height: CARD.tile,
            borderRadius: CARD.tileRadius,
            background: s.tile,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={38} color={s.ink} strokeWidth={2.2} fill={notif.type === 'COMMENTS' ? s.ink : 'none'} />
        </div>
      )}
      <div style={{flex: 1, minWidth: 0, opacity: contentOpacity}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: WEIGHT.label, fontSize: CARD.labelSize, lineHeight: 1.2, letterSpacing: TYPE.labelTracking, opacity: 0.5}}>
          <span>{label ?? notif.type}</span>
          <span style={{letterSpacing: 0, textTransform: 'none'}}>now</span>
        </div>
        <div style={{marginTop: 6, fontWeight: WEIGHT.title, fontSize: CARD.titleSize, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {notif.title}
        </div>
        <div
          style={{
            marginTop: 2,
            fontWeight: WEIGHT.body,
            fontSize: CARD.bodySize,
            lineHeight: `${CARD.bodyLine}px`,
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
};
