import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setCodec('h264');
// SwiftShader through ANGLE: deterministic software WebGL, works without a GPU.
Config.setChromiumOpenGlRenderer('swangle');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
// Use a locally installed Chrome Headless Shell if REMOTION_BROWSER is set.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
