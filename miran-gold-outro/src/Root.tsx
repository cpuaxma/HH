import React from 'react';
import {Composition, cancelRender, continueRender, delayRender} from 'remotion';
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import {Outro} from './Outro';
import {VIDEO} from './theme';

// The font ships with the bundle (@fontsource), so nothing is fetched at render time.
const fontHandle = delayRender('Loading IBM Plex Sans Arabic');
const SAMPLE = 'ميران جولد تيليجرام Miran Gold Telegram';
Promise.all([document.fonts.load(`300 40px "IBM Plex Sans Arabic"`, SAMPLE), document.fonts.load(`600 40px "IBM Plex Sans Arabic"`, SAMPLE)])
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

const common = {component: Outro, fps: VIDEO.fps, durationInFrames: VIDEO.durationInFrames};
const en = {lang: 'en' as const};
const ar = {lang: 'ar' as const};

export const RemotionRoot: React.FC = () => (
  <>
    {/* English. Vertical: Reels, Shorts, TikTok, Stories. Wide: YouTube. Square: feed posts. */}
    <Composition id="MiranGoldOutroEN" width={1080} height={1920} {...common} defaultProps={en} />
    <Composition id="MiranGoldOutroWideEN" width={1920} height={1080} {...common} defaultProps={en} />
    <Composition id="MiranGoldOutroSquareEN" width={1080} height={1080} {...common} defaultProps={en} />
    {/* Arabic */}
    <Composition id="MiranGoldOutroAR" width={1080} height={1920} {...common} defaultProps={ar} />
    <Composition id="MiranGoldOutroWideAR" width={1920} height={1080} {...common} defaultProps={ar} />
    <Composition id="MiranGoldOutroSquareAR" width={1080} height={1080} {...common} defaultProps={ar} />
  </>
);
