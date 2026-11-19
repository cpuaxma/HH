# Miran Gold: S&P 500 explainer (Arabic, 30 s vertical)

A 1080×1920, 30 fps, 900-frame (exactly 30 s) Remotion video explaining the S&P 500 in Arabic, in the Miran Gold dark-gold look. Rendered output: `out/sp500.mp4` (H.264).

| Time | Scene | File |
|---|---|---|
| 0:00–0:03 | Black screen, gold ٠→٥٠٠ counter lands with shake and zoom, then "٥٠٠ / شركة... / في رقم واحد!" and "هل تعرف ما هو؟" | `src/scenes/Scene1Hook.tsx` |
| 0:03–0:09 | ٥٠٠ morphs into "S&P 500", 500 dots fill in a staggered wave, 4 grow into Apple / Microsoft / NVIDIA / Amazon chips | `src/scenes/Scene2SP500.tsx` |
| 0:09–0:15 | Dots pulse like a heartbeat while a gold line chart climbs behind them | `src/scenes/Scene3Heartbeat.tsx` |
| 0:15–0:23 | Timeline from ١٩٥٧ (right) to today (left), growth curve with dips, ≈ ١٠٪ counter and footnote | `src/scenes/Scene4History.tsx` |
| 0:23–0:27 | Camera pulls back from New York to a gold-dot globe with glowing connection arcs | `src/scenes/Scene5World.tsx` |
| 0:27–0:30 | CTA ("تابعنا للمزيد من المحتوى التعليمي"), Telegram line ("وانضموا إلى قناتنا على تيليجرام") and logo with a shine sweep | `src/scenes/Scene6CTA.tsx` |

## Editing

All the settings are in **`src/config.ts`**:

- `COLORS`: brand colors. `FONT.arabic` switches between `'Cairo'` and `'Tajawal'`.
- `SCENES`: start frame and length of each scene. Scenes overlap by 10–12 frames.
- `CUES`: when each element inside a scene appears, in scene-local frames.
- `IMPACTS`: frames where the camera shakes and punches in.
- `TEXT`: every on-screen string. `"\n"` forces a line break, and `gold` lists the words drawn in gold. Use Eastern Arabic digits (٠١٢٣٤٥٦٧٨٩).
- `AUDIO`: file names, volumes, fades and SFX cue frames. `AMBIENCE`: particle count, glow strength, push-in amount.
- `SAFE`: safe zone (center 900 px, clear of the top 250 px and bottom 350 px).

Shared parts are in `src/components/`: the background (glow, dust, vignette), `AnimatedText` (word-by-word mask or rise reveal, blur exit, shine), the dot grid, the logo, the audio layer and the safe-zone overlay.

## Assets (all optional, all in `public/`)

- `logo.png`: the Miran Gold logo, copied from the other Miran Gold projects in this repo. Replace it with your own file. Without it, "Miran Gold" appears in gold text instead.
- `music.mp3`: background music. It loops at a low volume and fades out over the last 2 s. It is ducked automatically when a voiceover is present.
- `voiceover.mp3`: plays from frame 0.
- `sfx/hit.mp3`, `sfx/whoosh.mp3`, `sfx/shine.mp3`: see `public/sfx/README.md`.

Files that are missing are skipped. The project checks for them with `getStaticFiles()`, so it never fails on a missing file.

## Commands

```bash
npm install
npx remotion studio                    # preview (toggle "showSafeZone" in the props panel for guides)
npx remotion render SP500 out/sp500.mp4 --codec=h264 --crf=18   # or: npm run render
npm run check:safe                     # fails if any text pixel lands outside the safe zone on any frame
npm run stills -- out 0.5 60 300 640   # PNG stills of chosen frames
```

The Cairo font loads from Google Fonts, so stay online while you preview or render.

**Servers / sandboxes:** to use an installed Chrome for Testing instead of Remotion's downloaded headless shell, set `REMOTION_BROWSER=/path/to/chrome` and `REMOTION_CHROME_MODE=chrome-for-testing`.

## Notes

- The curve in scene 4 is drawn from approximate S&P 500 year-end levels on a log scale. It shows the shape only and has no value labels. "≈ ١٠٪" is the commonly cited long-run average annual return, dividends included. The footnote says that past performance does not guarantee future results.
- `src/data/land-dots.json` holds the globe's land points, generated from Natural Earth data via `world-atlas`. To change the dot density, run `npm run build:globe -- 2.0`.
