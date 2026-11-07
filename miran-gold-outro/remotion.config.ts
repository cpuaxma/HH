import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
// CRF 18 is Remotion's H.264 default (and npm run render passes --crf=18); not set globally so audio-only renders (--codec=wav) work.
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709'); // standard tags so phones and socials show the navy and gold as designed

// Optional: point Remotion at an existing Chromium/headless shell instead of downloading one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
