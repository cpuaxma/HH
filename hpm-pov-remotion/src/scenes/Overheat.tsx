import {Thermometer} from 'lucide-react';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MaskReveal} from '../components/MaskReveal';
import {NotificationCard} from '../components/NotificationCard';
import {enter, exit, kick, mix} from '../lib/anim';
import {useSceneFrame} from '../lib/useSceneFrame';
import {CUE, SCENES, storyTime} from '../timeline';
import {CARD, FONT, HPM, LOCK, SAFE, TYPE, WEIGHT} from '../theme';
import {CAPTION} from './Quiet';

const BURST = 1900;

// 6 · Overheat. Cards blur together (CameraMotionBlur around the stack), the shake builds
// (Haptic), the wallpaper heats (HeatGlow + shimmer). A system alert drops in, then six
// frames of stillness, then "Clear all" sends everything flying up.
export const Overheat: React.FC = () => {
  const f = useSceneFrame(SCENES.overheat.from);
  const t = storyTime(f);
  const alert = kick(t, CUE.alert);
  const alertOut = exit(f, CUE.clearBurst + 2, 24);
  const clearIn = enter(t, 1404, 24);
  const press = f >= CUE.clearAll ? 1 - 0.1 * Math.sin(Math.PI * Math.min(1, (f - CUE.clearAll) / 8)) : 1;
  const clearOut = exit(f, CUE.clearBurst + 6, 20);

  return (
    <AbsoluteFill>
      <NotificationCard
        notif={{type: 'INSIGHTS', title: '⚠️ Things are getting spicy', body: 'Your phone may need a minute to cool down.'}}
        glass="rgba(255,255,255,0.88)"
        icon={
          <div style={{width: CARD.tile, height: CARD.tile, borderRadius: CARD.tileRadius, background: HPM.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Thermometer size={CARD.tile * 0.5} color={HPM.cream} strokeWidth={2.2} />
          </div>
        }
        style={{
          top: 104,
          zIndex: 3000,
          boxShadow: '0 18px 50px rgba(15,15,15,0.22)',
          transform: `translateY(${mix(-420, 0, alert) - BURST * alertOut}px)`,
          opacity: Math.min(1, alert * 2),
        }}
      />
      <MaskReveal
        frame={t}
        lines={['warning:', 'results may get', '*spicy.*']}
        start={CUE.overheatCaption}
        exitAt={CUE.clearBurst - CUE.freezeLength + 3}
        exitDistance={BURST}
        exitDuration={24}
        fontSize={CAPTION.size + 8}
        // Charcoal pills: a warning has to cut through the white wall of cards.
        pill={HPM.charcoal}
        color={HPM.cream}
        style={{position: 'absolute', left: CAPTION.left, top: 820, zIndex: 3000}}
      />
      {clearIn > 0 ? (
        <div
          style={{
            position: 'absolute',
            right: 1080 - SAFE.right,
            top: LOCK.areaTop - 62,
            transform: `translateY(${(1 - clearIn) * 20 - BURST * clearOut}px) scale(${press})`,
            opacity: clearIn,
            background: 'rgba(15,15,15,0.82)',
            color: HPM.cream,
            fontFamily: FONT,
            fontWeight: WEIGHT.label,
            fontSize: 22,
            letterSpacing: TYPE.labelTracking,
            padding: '8px 20px',
            borderRadius: 999,
          }}
        >
          CLEAR ALL
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
