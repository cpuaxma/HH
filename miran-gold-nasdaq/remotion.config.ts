import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
// Cap the peaks (grain is expensive to encode) so the upload stays well under 100 MB.
Config.setEncodingMaxRate('16M');
Config.setEncodingBufferSize('32M');
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
// Silent by design, but keep an (empty) AAC track so the mp4 has an audio slot.
Config.setEnforceAudioTrack(true);

// Optional: point Remotion at an existing Chromium/headless shell instead of downloading one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
