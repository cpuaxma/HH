import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, SAFE, TIMING} from './data';
import './fonts';
import {easeInOut, ramp} from './lib/timeline';
import {Scene} from './three/Scene';
import {Benefits} from './ui/Benefits';
import {CourseBanner, ModuleCards} from './ui/Course';
import {EndCard} from './ui/EndCard';
import {HubTags, Pins, Traveller} from './ui/Markers';
import {GlobalTitle, Hook} from './ui/Titles';

export type ReelProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
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

export const Reel: React.FC<ReelProps> = ({showSafeZones}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const blur = 20 * ramp(frame, TIMING.endCardStart, TIMING.endCardStart + 46, easeInOut);

  return (
    <AbsoluteFill style={{background: BRAND.background}}>
      {/* The globe and everything pinned to it blur together into the end card. */}
      <AbsoluteFill style={{filter: blur > 0.01 ? `blur(${blur}px)` : undefined}}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows="soft"
          flat
          gl={{antialias: false, powerPreference: 'high-performance'}}
          camera={{fov: 30, near: 1, far: 3000, position: [0, 0, 1000]}}
        >
          <Scene />
        </ThreeCanvas>
        <Traveller />
        <Pins />
        <HubTags />
      </AbsoluteFill>
      {/* Very slight vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 62%, rgba(40,40,60,0.09) 100%)'}} />
      <Hook />
      <GlobalTitle />
      <CourseBanner />
      <ModuleCards />
      <Benefits />
      <EndCard />
      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
