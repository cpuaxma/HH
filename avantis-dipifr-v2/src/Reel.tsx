import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {COLORS, SAFE} from './data';
import './fonts';
import {useTextures} from './lib/textures';
import {Scene} from './three/Scene';
import {Answer} from './ui/Answer';
import {Benefits} from './ui/Benefits';
import {CourseHud, ModuleCards, Payoff} from './ui/Course';
import {EndCard, LightSweeps} from './ui/EndCard';
import {Hook} from './ui/Hook';

export type ReelProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
};

export const SafeZones: React.FC = () => {
  const zone = {position: 'absolute', background: 'rgba(255,60,60,0.16)', outline: '2px dashed rgba(255,90,90,0.8)'} as const;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...zone, left: 0, top: 0, right: 0, height: SAFE.top}} />
      <div style={{...zone, left: 0, bottom: 0, right: 0, height: SAFE.bottom}} />
      <div style={{...zone, right: 0, top: SAFE.top, width: SAFE.right, bottom: SAFE.bottom}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(3,10,32,0.5) 100%)', pointerEvents: 'none'}} />
);

export const Reel: React.FC<ReelProps> = ({showSafeZones}) => {
  const {width, height} = useVideoConfig();
  // The certificate textures are drawn before the 3D canvas mounts, so its first render includes them.
  const textures = useTextures();
  return (
    <AbsoluteFill style={{background: COLORS.bgBottom}}>
      {textures ? (
      <ThreeCanvas width={width} height={height} flat gl={{antialias: false, powerPreference: 'high-performance'}} camera={{fov: 30, near: 1, far: 200, position: [0, 0, 25]}}>
        <Scene textures={textures} />
      </ThreeCanvas>
      ) : null}
      <Vignette />
      <Answer />
      <CourseHud />
      <ModuleCards />
      <Payoff />
      <Benefits />
      <EndCard />
      <Hook />
      <LightSweeps />
      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
