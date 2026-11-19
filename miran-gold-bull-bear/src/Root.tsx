import React from 'react';
import {CalculateMetadataFunction, cancelRender, Composition, continueRender, delayRender, staticFile} from 'remotion';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/900.css';
import {BullVsBear, BullVsBearProps} from './BullVsBear';
import {ASSETS, VIDEO} from './constants';

// Cairo ships with the bundle (@fontsource/cairo, the Google Fonts release), so nothing is fetched at render time.
const fontHandle = delayRender('Loading Cairo');
const SAMPLE = 'ثور أم دب ٢٠٪ Bull Market t.me';
Promise.all([600, 700, 900].map((w) => document.fonts.load(`${w} 40px "Cairo"`, SAMPLE)))
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

/** True if public/<file> exists. A missing file must never crash the render. */
const exists = async (file: string) => {
  try {
    const res = await fetch(staticFile(file), {method: 'HEAD', cache: 'no-store'});
    const type = res.headers.get('content-type') ?? '';
    // The Studio dev server can answer unknown paths with its HTML page, so treat HTML as "missing".
    return res.ok && !type.includes('text/html');
  } catch {
    return false;
  }
};

const calculateMetadata: CalculateMetadataFunction<BullVsBearProps> = async ({props}) => {
  const [hasLogo, hasVoiceover, hasMusic] = await Promise.all([
    exists(ASSETS.logo),
    exists(ASSETS.voiceover),
    exists(ASSETS.music),
  ]);
  return {props: {...props, hasLogo, hasVoiceover, hasMusic}};
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BullVsBear"
    component={BullVsBear}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={VIDEO.durationInFrames}
    defaultProps={{hasLogo: false, hasVoiceover: false, hasMusic: false}}
    calculateMetadata={calculateMetadata}
  />
);
