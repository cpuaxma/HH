import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');

// Optional: point Remotion at an existing Chromium / headless shell instead of downloading one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
// A full Chrome for Testing binary needs this mode instead of the default headless shell.
if (process.env.REMOTION_CHROME_MODE === 'chrome-for-testing') {
  Config.setChromeMode('chrome-for-testing');
}
