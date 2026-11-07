import React from 'react';
import {Composition, cancelRender, continueRender, delayRender} from 'remotion';
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import {Outro} from './Outro';
import {VIDEO} from './theme';

// The font ships with the bundle (@fontsource), so nothing is fetched at render time.
const fontHandle = delayRender('Loading IBM Plex Sans Arabic');
const SAMPLE = 'ميران جولد تيليجرام';
Promise.all([document.fonts.load(`300 40px "IBM Plex Sans Arabic"`, SAMPLE), document.fonts.load(`600 40px "IBM Plex Sans Arabic"`, SAMPLE)])
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

const common = {component: Outro, fps: VIDEO.fps, durationInFrames: VIDEO.durationInFrames};

export const RemotionRoot: React.FC = () => (
  <>
    {/* Reels, Shorts, TikTok, Stories */}
    <Composition id="MiranGoldOutro" width={1080} height={1920} {...common} />
    {/* YouTube, landscape */}
    <Composition id="MiranGoldOutroWide" width={1920} height={1080} {...common} />
    {/* Feed posts */}
    <Composition id="MiranGoldOutroSquare" width={1080} height={1080} {...common} />
  </>
);
