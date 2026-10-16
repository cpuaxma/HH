# Miran Gold: 3 beginner trading mistakes

`index.html` is a 38.6-second, 9:16 (1080×1920) educational reel. It scales to fit any screen, auto-plays, and replays on tap (or Enter/Space). There is no audio; the voiceover is added in the edit, so the captions below give the timing to record against.

Open it straight from disk or from any local web server. Useful switches:

- Press **D** (or add `?debug`) to show the current beat, the time inside the beat, the total time and which caption is up, in the top-left corner. It never appears in exports.
- Add `?t=12.5` to freeze on one frame.
- Add `?check` to print a timing report to the browser console: every text block's hold time, beat start and end times, and any frame where a caption shows outside its beat.

## Beats

| Beat | Start | End | Length | Order |
|---|---|---|---|---|
| Hook | 0.0 | 4.8 | 4.8s | Candle crash and headline, with two caption phrases |
| 1. No stop loss | 4.8 | 13.5 | 8.7s | Headline → chart draws → captions → stop line, entry, drop → chart alone (12.5–13.5) |
| 2. Risking too much | 13.5 | 23.6 | 10.1s | Headline → red slice fills → captions (snaps to 1–2% at 16.8) → donut alone (22.6–23.6) |
| 3. Trading on emotion | 23.6 | 32.6 | 9.0s | Headline → chaotic trades → captions → cut to checklist (29.8) → checklist alone (31.6–32.6) |
| CTA | 32.6 | 38.6 | 6.0s | Logo, headline, button and disclaimer. Complete at 35.3, then held for 3.3s with no caption |

## Voiceover timing

Captions show one phrase at a time. Each phrase replaces the previous one, and each beat's captions are cleared before its cut. Record the VO so each phrase starts at the time shown.

| Beat | On | Off | Phrase |
|---|---|---|---|
| Hook | 0.00 | 2.35 | Three mistakes are quietly wiping out |
| | 2.35 | 4.70 | beginner accounts. Are you making them? |
| 1. No stop loss | 6.30 | 8.05 | A single bad trade |
| | 8.05 | 10.10 | can erase weeks of progress. |
| | 10.10 | 12.50 | Know your exit before you enter. |
| 2. Risking too much | 15.00 | 16.45 | Keep each trade |
| | 16.45 | 19.10 | to a small slice of your account, |
| | 19.10 | 20.85 | so no one loss |
| | 20.85 | 22.60 | can end the game. |
| 3. Trading on emotion | 25.10 | 27.45 | Revenge trades and chasing the market |
| | 27.45 | 29.80 | turn small losses into big ones. |
| | 29.80 | 31.60 | Stick to your plan. |

Visual sync points: the red candle hits at 0.94s. In beat 1, the stop-loss line draws at 10.1s, EXIT appears at 10.8s and ENTRY at 11.2s, and price is stopped out at 12.5s. In beat 2, the red slice fills from 14.5s and snaps to 1–2% at 16.8s. In beat 3, REVENGE TRADE flashes at 25.4s and CHASING at 26.3s, the checklist cuts in at 29.8s and ticks at 30.25, 30.8 and 31.35s.

## Editing

- **Timing and captions:** the `TIMELINE` array at the top of the script. Each beat has a `dur`, and beats play back to back, so changing one length moves everything after it. `cues` are offsets inside the beat (arrays hold one time per headline word), `punch` lists the 108% zoom punches, `cuts` lists extra hard cuts, and `caption` is a list of `[offset, phrase]` pairs. In a phrase, `*word*` is highlighted gold and `!word!` red. Set `caption: null` for no caption.
- **Tail:** `tail` is the caption-free time at the end of a beat: 1s on the mistake beats so the visual is seen on its own, and `CAP.gap` (0.1s) elsewhere. The last phrase stays up until the tail starts.
- **Hold rule:** every text block stays fully visible for at least 0.4s plus 0.3s per word after it lands (`HOLD`). The layout enforces this for captions. A phrase that would replace the previous one too early is pushed later, and a beat whose captions would run into its tail is lengthened. Both cases are logged as console warnings, so a warning means the timeline needs retiming. Keep phrases to about 6 words.
- **Feel:** `SLAM`, `SHAKE`, `PUNCH` and `CAP` set the slam scale and speed, the shake strength, the punch zoom and the caption pop. `DRAW` sets the visual animation speeds: chart draw, stop line, drop, chaos line, red sweep, snap, check ticks and the CTA line.
- **Charts:** `HK` (hook candles), `M1` (price path, stop level and ghost path), `M2` (the 80% and 2% slices), `M3` (the zig-zag) and `CTA` (the rising line).
- **Colors:** CSS variables in `:root`: `--bg`, `--gold`, `--gold-hi`, `--gold-lo`, `--ink`, `--muted`, `--loss` and `--panel`. Red (`--loss`) is reserved for crashes, losses and mistakes.
- **Safe zone:** all text and key visuals sit between y=154 (top 8%) and y=1536 (bottom 20%), including at the peak of a zoom punch.

## Logo

`assets/logo.jpg` is the supplied file, byte-for-byte. The same bytes are embedded as a data URI at the end of `index.html`, so the page works as a single file. Nothing is redrawn. On the stage, the JPEG's near-black square drops out with `mix-blend-mode: lighten` and its corners fade with a mask; the light sweep is a separate layer masked by the logo's own brightness. If you replace the logo, update `LOGO_SRC` and the ring-center numbers in the `#logo` CSS rule.

## Exporting the video

From the repository root:

```
node tools/export-video.js 30 exports/miran-gold.mp4 miran-gold/index.html
```

This steps the timeline frame by frame in headless Chromium and pipes the frames into ffmpeg. It needs the `playwright` package and ffmpeg on your PATH, and an internet connection for the Outfit font. The output is H.264 at CRF 12, around 400 MB, because the film grain is costly to encode. For a smaller upload copy:

```
ffmpeg -i exports/miran-gold.mp4 -c:v libx264 -preset slow -crf 26 -tune grain -pix_fmt yuv420p -movflags +faststart exports/miran-gold-preview.mp4
```
