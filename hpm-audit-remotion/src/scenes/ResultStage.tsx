import {Check} from 'lucide-react';
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {COPY} from '../copy';
import {Odometer} from '../components/Odometer';
import {Phone3D} from '../components/Phone3D';
import {formatFollowers, Profile} from '../components/Profile';
import {RedLine, RedWander} from '../components/RedLine';
import {clamp, exitP, pop} from '../lib/anim';
import {afterPose, beforePose, reelTime} from '../lib/cameras';
import {smoothPath} from '../lib/path';
import {T} from '../timeline';
import {C, FONT} from '../theme';

const P = COPY.profile;

// Followers 212 → 12.4K, rolled in log space so every digit gets its turn.
export const followersAt = (frame: number) => {
  const t = interpolate(frame, T.odometer, [0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1)});
  return Math.exp(Math.log(P.followersBefore) + (Math.log(P.followersAfter) - Math.log(P.followersBefore)) * t);
};
const unit = (v: number) => (v < 1000 ? 1 : 100);

const WANDER = smoothPath([
  [-60, 640],
  [300, 520],
  [620, 700],
  [900, 540],
  [1160, 660],
]);

// 5 · BEFORE / AFTER: pull out to 3D, 360° spin swaps to AFTER, then side by side.
export const ResultStage: React.FC = () => {
  const frame = useCurrentFrame();
  const swapped = frame >= T.swap;
  const v = followersAt(frame);
  const wip = <Profile state="before" bio="after" grid="after" reelT={reelTime(frame)} />;
  const after = (
    <Profile
      state="after"
      reelT={reelTime(frame)}
      followers={<Odometer value={v} format={formatFollowers} unit={unit} height={60} settled={frame >= T.odometer[1]} />}
    />
  );
  const phones = [{id: 'after', pose: afterPose(frame), screen: swapped ? after : wip}];
  if (frame >= T.split[0]) phones.unshift({id: 'before', pose: beforePose(frame), screen: <Profile state="before" />});

  const statIn = pop(frame, T.odometer[0]);
  const statOut = exitP(frame, T.statExit, 8);
  return (
    <AbsoluteFill>
      <RedWander d={WANDER} at={T.odometer[0] + 10} dur={90} width={6} length={0.4} />
      <Phone3D phones={phones} />

      {/* Followers stat card */}
      {frame >= T.odometer[0] && frame < T.statExit + 8 && (
        <div style={{position: 'absolute', left: 64, top: 1270, transform: `translateX(${-700 * statOut}px) scale(${statIn})`, transformOrigin: '0 50%'}}>
          <div style={{background: C.cream, borderRadius: 24, padding: '20px 34px 22px', boxShadow: '0 18px 44px rgba(15,15,15,0.25)', border: `4px solid ${C.charcoal}`}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, letterSpacing: '0.1em', color: C.red, textTransform: 'uppercase'}}>{COPY.result.followersLabel}</div>
            <Odometer value={v} format={formatFollowers} unit={unit} height={116} settled={frame >= T.odometer[1]} style={{fontFamily: FONT, fontWeight: 900, fontSize: 116, color: C.charcoal, letterSpacing: '-0.03em'}} />
          </div>
          <div style={{marginTop: 10, marginLeft: 6, fontFamily: FONT, fontWeight: 600, fontSize: 28, color: C.charcoal, opacity: 0.4}}>{COPY.result.illustrative}</div>
        </div>
      )}

      {/* BEFORE / AFTER tags + arrow */}
      {frame >= T.tags &&
        [
          {label: COPY.result.before, x: 338, bg: C.charcoal},
          {label: COPY.result.after, x: 742, bg: C.red},
        ].map((t, i) => (
          <div
            key={t.label}
            style={{
              position: 'absolute',
              left: t.x,
              top: 690,
              transform: `translate(-50%, -50%) scale(${pop(frame, T.tags + i * 4)}) rotate(${i ? 3 : -3}deg)`,
              background: t.bg,
              color: C.cream,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 54,
              letterSpacing: '0.06em',
              padding: '10px 30px',
              borderRadius: 14,
            }}
          >
            {t.label}
          </div>
        ))}
      <RedLine type="arrow" from={[440, 640]} to={[620, 650]} curve={-0.45} at={T.tags + 4} dur={14} width={9} head={34} seed="ba" />

      {/* Recap chips */}
      {frame >= T.recap && (
        <div style={{position: 'absolute', left: 0, width: 1080 - 140, top: 1500, display: 'flex', justifyContent: 'center', gap: 20, paddingLeft: 64}}>
          {COPY.result.recap.map((r, i) => (
            <div
              key={r}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: C.cream,
                border: `4px solid ${C.charcoal}`,
                borderRadius: 40,
                padding: '8px 26px 8px 14px',
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 40,
                color: C.charcoal,
                transform: `scale(${pop(frame, T.recap + i * 4)})`,
              }}
            >
              <span style={{width: 50, height: 50, borderRadius: 25, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Check size={34} strokeWidth={4} color={C.cream} />
              </span>
              {r}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
