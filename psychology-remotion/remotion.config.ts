import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setOverwriteOutput(true);
// WebGL on machines without a GPU: SwiftShader through ANGLE. Deterministic, works headless.
// On a machine with a GPU you can switch to 'angle' (or pass --gl=angle) for faster renders.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'swangle' | 'angle' | 'egl' | undefined) ?? 'swangle');
// Optional: point Remotion at an existing Chrome Headless Shell instead of downloading one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
if (process.env.REMOTION_CHROME_MODE === 'chrome-for-testing') {
  Config.setChromeMode('chrome-for-testing');
}
