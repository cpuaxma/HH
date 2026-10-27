import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CITY_COLORS, SAFE, TIMING} from './data';
import './fonts';
import {easeInOut, ramp} from './lib/timeline';
import {SoundTrack} from './sound';
import {Scene} from './three/Scene';
import {EndCard, FinaleText} from './ui/Finale';
import {Hook} from './ui/Hook';
import {NavBanner} from './ui/NavBanner';
import {PlaceCards} from './ui/PlaceCard';

export type HpmMapsProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
  /** Include the sound effects (render with --muted for a silent file). */
  sfx?: boolean;
};

const SafeZones: React.FC = () => {
  const zone = {position: 'absolute', background: 'rgba(0,120,255,0.18)', outline: '2px dashed rgba(0,90,220,0.8)'} as const;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...zone, left: 0, top: 0, right: 0, height: SAFE.top}} />
      <div style={{...zone, left: 0, bottom: 0, right: 0, height: SAFE.bottom}} />
      <div style={{...zone, right: 0, top: SAFE.top, width: SAFE.right, bottom: SAFE.bottom}} />
    </AbsoluteFill>
  );
};

export const HpmMaps: React.FC<HpmMapsProps> = ({showSafeZones, sfx = true}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const blur = 22 * ramp(frame, TIMING.endCardStart, TIMING.endCardStart + 46, easeInOut);

  return (
    <AbsoluteFill style={{background: CITY_COLORS.ground}}>
      <AbsoluteFill style={{filter: blur > 0.01 ? `blur(${blur}px)` : undefined}}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows="soft"
          flat
          gl={{antialias: false, powerPreference: 'high-performance'}}
          camera={{fov: 46, near: 2, far: 9000, position: [0, 1500, 0]}}
        >
          <Scene />
        </ThreeCanvas>
      </AbsoluteFill>
      <Hook />
      {/* Very slight vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 62%, rgba(70,45,25,0.11) 100%)',
        }}
      />
      <NavBanner />
      <PlaceCards />
      <FinaleText />
      <EndCard />
      {showSafeZones ? <SafeZones /> : null}
      {sfx ? <SoundTrack /> : null}
    </AbsoluteFill>
  );
};
