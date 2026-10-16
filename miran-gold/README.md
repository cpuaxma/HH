# Miran Gold: 3 beginner trading mistakes

`index.html` is a 30-second, 9:16 (1080×1920) educational reel. It scales to fit any screen, auto-plays, and replays on tap (or Enter/Space). There is no audio; the voiceover is added in the edit, so the captions below give the timing to record against.

Open it straight from disk or from any local web server. Add `?t=12.5` to the URL to freeze on one frame. Add `?check` to print a hold-rule report to the browser console.

## Voiceover timing

Each phrase appears on screen at the time shown. Record the VO so each phrase starts there.

| Beat | Time | Phrase |
|---|---|---|
| Hook | 0.00 | Three mistakes |
| | 0.60 | are quietly wiping out |
| | 1.25 | beginner accounts. |
| | 1.90 | Are you making them? |
| 1. No stop loss | 3.70 | A single bad trade |
| | 4.35 | can erase |
| | 4.80 | weeks of progress. |
| | 6.00 | Know your exit |
| | 6.70 | before you enter. |
| 2. Risking too much | 11.50 | Keep each trade |
| | 12.55 | to a small slice |
| | 13.55 | of your account, |
| | 14.30 | so no one loss |
| | 15.00 | can end the game. |
| 3. Trading on emotion | 18.30 | Revenge trades |
| | 18.90 | and chasing the market |
| | 19.70 | turn small losses |
| | 20.30 | into big ones. |
| | 21.30 | Stick to your plan. |
| CTA | 24.00 | No caption. The headline carries it: "Protect your capital first. Profits second." |

Visual sync points: the red candle hits at 0.94s, the stop-loss line draws at 6.0s, price is stopped out at 8.0s, the red slice snaps to 1–2% at 13.0s, the calm checklist cuts in at 20.9s, and the end card is complete at 26.7s and holds until 30s.

## Editing

- **Timing and captions:** the `TIMELINE` array at the top of the script. Each beat has absolute `start`/`end`, `cues` (offsets inside the beat; arrays hold one time per headline word), `punch` (offsets of the 108% zoom punches), `cuts` (extra hard cuts) and `caption`, a list of `[offset, phrase]` pairs. In a phrase, `*word*` is highlighted gold and `!word!` red. A caption stays up until the next beat's first phrase, so the last line of a beat can hold across the cut. Set `caption: null` for no caption.
- **Hold rule:** every text block stays fully visible for at least 0.4s plus 0.3s per word after it lands. After retiming, open `index.html?check`: the console lists every block with its landing time, how long it held and how long it needs, plus the longest stretch without a cut or punch and the length of the final hold.
- **Feel:** `SLAM`, `SHAKE`, `PUNCH`, `CAP` and `DRAW` set the slam scale and speed, the shake strength, the punch zoom, the caption pop and the line-draw speeds.
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

This steps the timeline frame by frame in headless Chromium and pipes the frames into ffmpeg. It needs the `playwright` package and ffmpeg on your PATH, and an internet connection for the Outfit font. The output is H.264 at CRF 12, around 300 MB, because the film grain is costly to encode. For a smaller upload copy:

```
ffmpeg -i exports/miran-gold.mp4 -c:v libx264 -preset slow -crf 26 -tune grain -pix_fmt yuv420p -movflags +faststart exports/miran-gold-preview.mp4
```
