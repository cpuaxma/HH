import {Config} from '@remotion/cli/config';

// Software WebGL (SwiftShader via ANGLE). Needed on servers / machines without a GPU.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(96);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setEntryPoint('src/index.ts');

if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
