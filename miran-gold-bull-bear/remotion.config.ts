import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(20);
Config.setX264Preset('slow'); // smaller file at the same quality; the film grain is costly to encode
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');

// Optional: point Remotion at an existing Chromium/headless shell instead of downloading one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
