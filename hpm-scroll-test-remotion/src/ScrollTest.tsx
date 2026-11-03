import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, SAFE} from './data';
import './fonts';
import {SoundTrack} from './sound';
import {Renderer} from './three/Renderer';
import {Callouts} from './ui/Callouts';
import {EndCard, endBlurAt} from './ui/EndCard';
import {Finish} from './ui/Finish';
import {KineticType} from './ui/Type';

export type ScrollTestProps = {
  /** Draw Instagram's UI zones on top, for checking layouts. */
  showSafeZones?: boolean;
  /** Include the sound effects (render with --muted for a silent file). */
  sfx?: boolean;
  /** Draw the HTML overlays (type, callouts, end card). */
  overlays?: boolean;
  /** One sample per frame (no motion blur or anti-aliasing): fast drafts only. */
  draft?: boolean;
};

const SafeZones: React.FC = () => {
  const zone = {position: 'absolute', background: 'rgba(0,120,255,0.18)', outline: '2px dashed rgba(0,90,220,0.8)'} as const;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{...zone, left: 0, top: 0, right: 0, height: SAFE.top}} />
      <div style={{...zone, left: 0, bottom: 0, right: 0, height: SAFE.bottom}} />
      <div style={{...zone, right: 0, top: SAFE.top, width: SAFE.right, bottom: SAFE.bottom}} />
      <div style={{position: 'absolute', left: 140, top: 0, bottom: 0, width: 800, outline: '2px dashed rgba(220,0,90,0.7)'}} />
    </AbsoluteFill>
  );
};

export const ScrollTest: React.FC<ScrollTestProps> = ({showSafeZones, sfx = true, overlays = true, draft = false}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const blur = endBlurAt(frame);
  return (
    <AbsoluteFill style={{background: BRAND.offWhite}}>
      <AbsoluteFill style={{filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
        <ThreeCanvas
          width={width}
          height={height}
          flat
          dpr={typeof window === 'undefined' ? 1 : window.devicePixelRatio}
          gl={{antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'}}
        >
          <Renderer draft={draft} />
        </ThreeCanvas>
      </AbsoluteFill>
      {overlays ? (
        <>
          <KineticType />
          <Callouts />
          <EndCard />
        </>
      ) : null}
      <Finish />
      {showSafeZones ? <SafeZones /> : null}
      {sfx ? <SoundTrack /> : null}
    </AbsoluteFill>
  );
};
