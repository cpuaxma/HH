# Miran Gold: 3 beginner trading mistakes

`index.html` is a 43.6-second, 9:16 (1080×1920) educational reel. It scales to fit any screen, auto-plays, and replays on tap (or Enter/Space). There is no audio; the voiceover is added in the edit, so the captions below give the timing to record against.

The motion is calm: words slide up through a mask, beats crossfade, and each beat pushes in slowly from 100% to 104%. There are no shakes, flashes or scale slams. Every move uses one easing curve, `cubic-bezier(0.22, 1, 0.36, 1)`.

Open it straight from disk or from any local web server. Useful switches:

- Press **D** (or add `?debug`) to show the current beat, the time inside the beat, the total time and which caption is up, in the top-left corner. It never appears in exports.
- Add `?t=12.5` to freeze on one frame.
- Add `?check` to print a timing report to the browser console: every text block's hold time, beat start and end times, and any frame where a caption shows outside its beat.

## Beats

| Beat | Start | End | Length | Order |
|---|---|---|---|---|
| Hook | 0.0 | 5.8 | 5.8s | Chart push-in, red candle glides down, headline rises, two caption phrases |
| 1. No stop loss | 5.8 | 15.5 | 9.7s | Numeral → headline → chart draws → captions → stop line, entry, drop → chart alone (14.5–15.5) |
| 2. Risking too much | 15.5 | 26.6 | 11.1s | Numeral → headline → red slice fills → captions (eases to 1–2% at 19.1) → donut alone (25.6–26.6) |
| 3. Trading on emotion | 26.6 | 36.6 | 10.0s | Numeral → headline → chaotic trades → captions → crossfade to checklist (33.35) → checklist alone (35.6–36.6) |
| CTA | 36.6 | 43.6 | 7.0s | Logo, headline, button and disclaimer. Complete at 39.7, then held for 3.9s with no caption |

Each beat crossfades into the next over 0.6s, and the incoming beat drifts up 30px as it fades in.

## Voiceover timing

Captions show one phrase at a time. Each phrase replaces the previous one, and the last phrase of a beat fades out over 0.2s before the beat's caption-free ending. Record the VO so each phrase starts at the time shown.

| Beat | On | Off | Phrase |
|---|---|---|---|
| Hook | 0.00 | 2.60 | Three mistakes are quietly wiping out |
| | 2.60 | 5.30 | beginner accounts. Are you making them? |
| 1. No stop loss | 7.46 | 9.40 | A single bad trade |
| | 9.40 | 11.65 | can erase weeks of progress. |
| | 11.65 | 14.30 | Know your exit before you enter. |
| 2. Risking too much | 17.16 | 18.77 | Keep each trade |
| | 18.77 | 21.58 | to a small slice of your account, |
| | 21.58 | 23.49 | so no one loss |
| | 23.49 | 25.40 | can end the game. |
| 3. Trading on emotion | 28.26 | 30.80 | Revenge trades and chasing the market |
| | 30.80 | 33.35 | turn small losses into big ones. |
| | 33.35 | 35.40 | Stick to your plan. |

Visual sync points: the red candle starts falling at 0.9s and settles at 1.8s. In beat 1, the stop-loss line draws at 11.65s, EXIT appears at 12.45s and ENTRY at 12.85s, and price comes to rest on the stop at 14.3s. In beat 2, the red slice fills from 16.8s and eases back to 1–2% at 19.1s. In beat 3, REVENGE TRADE fades in at 28.6s and CHASING at 29.6s, the checklist crossfades in at 33.35s and ticks at 33.85, 34.4 and 34.95s.

## Editing

- **Timing and captions:** the `TIMELINE` array at the top of the script. Each beat has a `dur`, and beats play back to back, so changing one length moves everything after it. `cues` are offsets inside the beat (arrays hold one time per headline word, 0.15s apart), and `caption` is a list of `[offset, phrase]` pairs. In a phrase, `*word*` is highlighted gold and `!word!` red. Set `caption: null` for no caption.
- **Tail:** `tail` is the caption-free time at the end of a beat. The last phrase fades out over its first 0.2s (`CAP.out`). Mistake beats use 1.2s, which leaves a full second of the visual alone; other beats default to `CAP.gap` (0.4s).
- **Hold rule:** every text block stays fully visible for at least 0.4s plus 0.3s per word after it lands (`HOLD`). A block has landed once it is fully opaque and within 1.5% of its final position, which is 0.305s into a 0.5s reveal. The layout enforces this for captions. A phrase that would replace the previous one too early is pushed later, and a beat whose captions would run into its tail is lengthened. Both cases are logged as console warnings, so a warning means the timeline needs retiming. Keep phrases to about 6 words.
- **Feel:** `MOTION` holds the easing curve, the word reveal (0.5s), the word stagger (0.15s), the crossfade length (0.6s), the beat-entry drift (30px) and the push-in (4%). The same curve is also `--ease` in the CSS. `CAP` sets the caption reveal and fade-out. `DRAW` sets the visual animation speeds: chart push, candle fall, chart draw, stop line, drop, ghost line, red sweep, ease-back to gold, chaos line, check ticks, logo, light sweep and the CTA line.
- **Charts:** `HK` (hook candles), `M1` (price path, stop level and ghost path), `M2` (the 80% and 2% slices), `M3` (the zig-zag) and `CTA` (the rising line).
- **Colors:** CSS variables in `:root`: `--bg`, `--gold`, `--gold-hi`, `--gold-lo`, `--ink`, `--muted`, `--loss` and `--panel`. Red (`--loss`) is reserved for crashes, losses and mistakes.
- **Safe zone:** all text and key visuals sit between y=154 (top 8%) and y=1536 (bottom 20%), including at the end of each push-in.

## Logo

`assets/logo.jpg` is the supplied file, byte-for-byte. The same bytes are embedded as a data URI at the end of `index.html`, so the page works as a single file. Nothing is redrawn. On the stage, the JPEG's near-black square drops out with `mix-blend-mode: lighten` and its corners fade with a mask; the light sweep is a separate layer masked by the logo's own brightness. If you replace the logo, update `LOGO_SRC` and the ring-center numbers in the `#logo` CSS rule.

## Exporting the video

From the repository root:

```
node tools/export-video.js 30 exports/miran-gold.mp4 miran-gold/index.html
```

This steps the timeline frame by frame in headless Chromium and pipes the frames into ffmpeg. It needs the `playwright` package and ffmpeg on your PATH, and an internet connection for the Outfit font. The output is H.264 at CRF 12, around 450 MB, because the film grain is costly to encode. For a smaller upload copy:

```
ffmpeg -i exports/miran-gold.mp4 -c:v libx264 -preset slow -crf 26 -tune grain -pix_fmt yuv420p -movflags +faststart exports/miran-gold-preview.mp4
```

## Voiceover

`voiceover-script.md` has the script, one line per clip, with start and must-end-by times. `tools/make-voiceover.py` voices it with Kokoro, an open-source neural TTS that runs locally, and lays each line at its start time:

```
pip install kokoro-onnx soundfile
# model files: kokoro-v1.0.onnx and voices-v1.0.bin from
# https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
python tools/make-voiceover.py miran-gold/voiceover-script.md <model dir> exports/vo-raw.wav af_heart 43.6
ffmpeg -i exports/vo-raw.wav -af "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 exports/miran-gold-voiceover.wav
ffmpeg -i exports/miran-gold-preview.mp4 -i exports/miran-gold-voiceover.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart exports/miran-gold-with-vo.mp4
```

A line that would overrun its slot is sped up just enough to fit, up to 1.25x, and the script prints each line's length against its slot. If you retime the video, update the table in `voiceover-script.md` and run it again.
