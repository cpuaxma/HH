# Hot Pepper Media — brand intro

`index.html` is a ~25-second, 9:16 (1080×1920) hook-first kinetic-typography intro. Words slam in one at a time, the frame shakes on each impact, cuts get a one-frame color flash, and key words get a 108% zoom punch. It scales to fit any screen, auto-plays, and replays on tap (or Enter/Space). No audio.

Open it with any local web server or straight from disk. Add `?t=12.5` to the URL to freeze on a single frame.

## Editing

- **Timing:** the `TIMELINE` array at the top of the script. Each beat has `start`/`end` in seconds and `cues` (offsets inside the beat). Consecutive beats can share a `scene`. Add `flash: 'red'` (or `null`) to a beat to override the color of its cut flash.
- **Feel:** `SLAM`, `SHAKE`, `PUNCH` and `WHIP` set the slam scale and speed, the shake strength, the zoom amount and the red-line speed.
- **Colors:** CSS variables in `:root` (`--cream`, `--red`, `--charcoal`, `--peach`, `--gray`).
- **Numbers:** the `DATA` object sets the follower counter's start and end values and the bar heights.
- **Hold rule:** after its last word lands (cue + 0.15s), each beat stays on screen for at least 0.4s plus 0.3s per word. Keep to this when you retime `TIMELINE`.
- **Logos:** the `LOGOS` object, which holds each file path and the crop box of the artwork inside the PNG.

## Logo files

- `assets/logo-primary.png`: the supplied primary logo, byte-for-byte.
- `assets/logo-reversed.png`: a **stand-in**. It was derived from the primary file by keying out the cream background and turning the artwork white. Nothing was redrawn. Replace it with the official reversed logo, and update `LOGOS.reversed.crop` if that file is framed differently.

## Exporting the video

```
npm install playwright        # once; also run `npx playwright install chromium` if Chromium isn't installed
node tools/export-video.js 60 exports/hot-pepper-intro.mp4
```

The script steps the timeline frame by frame in headless Chromium at the full 1080×1920 and pipes every frame into ffmpeg, which must be on your PATH. The result is an H.264 MP4 at CRF 12 with no dropped frames or screen scaling. Pass `30` instead of `60` for 30fps. Montserrat loads from Google Fonts, so stay online while it runs.
