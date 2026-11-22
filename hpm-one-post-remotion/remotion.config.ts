import {Config} from '@remotion/cli/config';

// assets/ is the public dir: logo, grain, fonts, and (optional) music.mp3 + sfx/.
Config.setPublicDir('./assets');
Config.setEntryPoint('./src/index.ts');
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);

// Use a local Chrome/Chromium instead of downloading one: REMOTION_BROWSER=/path/to/chrome
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
