# Hot Pepper Media — brand intro

`index.html` is a 20-second, 9:16 (1080×1920) hook-first kinetic-typography intro. Words slam in one at a time, the frame shakes on each impact, cuts get a one-frame color flash, and key words get a 108% zoom punch. It scales to fit any screen, auto-plays, and replays on tap (or Enter/Space). No audio.

Open it with any local web server or straight from disk. Add `?t=12.5` to the URL to freeze on a single frame.

## Editing

- **Timing:** the `TIMELINE` array at the top of the script. Each beat has `start`/`end` in seconds and `cues` (offsets inside the beat). Consecutive beats can share a `scene`. Add `flash: 'red'` (or `null`) to a beat to override the color of its cut flash.
- **Feel:** `SLAM`, `SHAKE`, `PUNCH` and `WHIP` set the slam scale and speed, the shake strength, the zoom amount and the red-line speed.
- **Colors:** CSS variables in `:root` (`--cream`, `--red`, `--charcoal`, `--peach`, `--gray`).
- **Placeholder numbers:** the `DATA` object (follower counter, bar heights).
- **Logos:** the `LOGOS` object, which holds each file path and the crop box of the artwork inside the PNG.

## Logo files

- `assets/logo-primary.png`: the supplied primary logo, byte-for-byte.
- `assets/logo-reversed.png`: a **stand-in**. It was derived from the primary file by keying out the cream background and turning the artwork white. Nothing was redrawn. Replace it with the official reversed logo, and update `LOGOS.reversed.crop` if that file is framed differently.
