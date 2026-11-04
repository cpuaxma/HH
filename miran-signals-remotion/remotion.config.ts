import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

// PNG frames keep the screen text and the type crisp before H.264 encoding.
Config.setVideoImageFormat('png');
// SwiftShader through ANGLE: deterministic software WebGL, works without a GPU.
Config.setChromiumOpenGlRenderer('swangle');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
// Use a locally installed Chrome Headless Shell: REMOTION_BROWSER, or the one this
// project was built with if it exists.
const LOCAL_SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = process.env.REMOTION_BROWSER ?? (fs.existsSync(LOCAL_SHELL) ? LOCAL_SHELL : null);
if (browser) {
  Config.setBrowserExecutable(browser);
}
// Note: CRF, x264 preset and pixel format are passed on the render commands
// (package.json), not here; setting them here breaks the WAV renders.
