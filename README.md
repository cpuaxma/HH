# Hot Pepper Media — brand intro

`index.html` is a 38-second, 9:16 (1080×1920) kinetic-typography intro. It scales to fit any screen, auto-plays, and replays on tap (or Enter/Space). No audio.

Open it with any local web server or straight from disk. Add `?t=12.5` to the URL to freeze on a single frame.

## Editing

- **Timing:** the `TIMELINE` array at the top of the script. Each beat has `start`/`end` in seconds and `cues` (offsets inside the beat).
- **Colors:** CSS variables in `:root` (`--cream`, `--red`, `--charcoal`, `--peach`, `--gray`).
- **Placeholder numbers:** the `DATA` object (likes, engagement, followers, bar heights).
- **Logos:** the `LOGOS` object, which holds each file path and the crop box of the artwork inside the PNG.

## Logo files

- `assets/logo-primary.png`: the supplied primary logo, byte-for-byte.
- `assets/logo-reversed.png`: a **stand-in**. It was derived from the primary file by keying out the cream background and turning the artwork white. Nothing was redrawn. Replace it with the official reversed logo, and update `LOGOS.reversed.crop` if that file is framed differently.
