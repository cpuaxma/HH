# The cycle of market emotions (Arabic, 45 s vertical, 3D)

A 1080×1920, 30 fps, 1350-frame (exactly 45 s) Remotion + React Three Fiber video about investment psychology. The viewer rides the cycle of market emotions like a rollercoaster: a glowing 3D track in a dark void, with a chase camera behind a glowing orb (the investor). Every emotion regrades the world: color, light, particles, camera, sound and typography. At the end the camera pulls back and the track turns out to be a price chart.

Rendered output: `out/psychology.mp4`, the master (H.264, CRF 16, 1350 frames, 45.000 s, about 122 MB). That is over GitHub's 100 MB file limit, so the repo holds **`out/psychology-share.mp4`**, a CRF 18 copy encoded from the master (about 89 MB, faststart). Rebuild the master with `npm run render`, then `npm run share`.

| Time | Scene | What happens | File |
|---|---|---|---|
| 0:00–0:03 | Cold open | Plunging down the red section mid-crash: shake, alarm light, RGB split, embers streaking up. HUD «١٤٠» flickers, «ذعر» slams in. "هل شعرت بهذا من قبل؟" | `src/scenes/S1ColdOpen.tsx` |
| 0:03–0:05 | Rewind | Tape stop, then the orb flies back up the track. Colors run back through red, amber and gold, the heart rate falls and the emotion words flash past in reverse. "لنبدأ من البداية" | `src/scenes/S2Rewind.tsx` |
| 0:05–0:08 | The question | The camera orbits the still orb. "لماذا يشتري الناس في القمة..." / "...ويبيعون في القاع؟" | `src/scenes/S3Question.tsx` |
| 0:08–0:25 | The ride | 13 emotion words, each with its own treatment. Hang time at the summit (near silence, tilt down at the drop, "هنا يشتري الأغلبية" + red «أعلى مخاطرة»). The plunge. A cold, foggy bottom ("هنا يبيع الأغلبية" + gold «أكبر فرصة»), then a warm ray of light at «أمل». HUD: heart rate and a fear/greed gauge. | `src/scenes/S4Ride.tsx` |
| 0:25–0:29 | The reveal | The camera pulls back and swings round as the track flattens into a 2D chart. A price line with candles draws on top, and the cycle repeats into the distance. | `src/scenes/S5Reveal.tsx` |
| 0:29–0:33 | Crowd vs wise | Replay on the flat chart: red «الجمهور» buys the top and sells the bottom; a gold orb does the opposite. | `src/scenes/S6Crowd.tsx` |
| 0:33–0:37.5 | The quote | The line calms into one slow gold wave. Buffett quote. | `src/scenes/S7Quote.tsx` |
| 0:37.5–0:40 | The lesson | The line becomes a heartbeat that settles from chaos to a calm, steady rhythm. | `src/scenes/S8Lesson.tsx` |
| 0:40–0:45 | Miran Gold outro (English) | The line coils into a gold loop behind the Miran Gold logo. Then the «MIRAN GOLD» wordmark, "Join the Miran Gold community. / Link in bio.", the «Join on Telegram» button with its shine, and "Educational content only. Not financial advice." It is rebuilt from the outro of `miran-gold-history` (same copy, IBM Plex Sans Arabic, golds and entrances). | `src/scenes/S9CTA.tsx` |

## How it is built

- **One continuous 3D world** (`src/world/`) runs under the nine scenes. A single pure function, `getWorld(frame)` in `src/lib/director.ts`, decides everything for each frame: camera, orb, color grade, morph weights, HUD values and effects. The 3D canvas and the DOM overlays both read it, so labels, pins and callouts always sit on the right 3D point.
- **The track is one editable list of curve points**, `TRACK_POINTS` in `src/config.ts`: x is time, y is price/emotion, z is the coaster's sideways swing. The chart in the reveal is exactly the (x, y) of the same list. The `stage` tags mark where each emotion lives.
- **The emotion color script**, `STAGES` in `src/config.ts`, holds each emotion's color, saturation, tint, exposure, heart rate, fear/greed needle, shake, RGB split, vignette, fog and particle drift. These are blended by the orb's position on the track, so the rewind runs the colors backwards automatically.
- **All Arabic text is DOM**, overlaid on the canvas (never three.js text), in Cairo from `@remotion/google-fonts`. Words animate one at a time with a mask or slide reveal, never letter by letter, so letters always join. They exit with blur and fade, and key words get a shine sweep that runs right to left.
- **Glow:** the real postprocessing `Bloom` (verified with stills under headless SwiftShader), backed by soft additive glow ribbons and sprites, so lines glow even where bloom is subtle.
- **One grade pass** (`src/world/GradeEffect.ts`) adds a velocity-driven radial blur (camera motion blur on the plunge, the rewind and the reveal), RGB split, emotion tint, saturation, vignette (dark red when afraid), seeded film grain and impact flashes.
- **Deterministic:** all randomness uses Remotion's `random(seed)`, the grain seed is the frame number, and everything that accumulates (heartbeat phase, particle drift) is integrated from frame 0. Every render is identical.
- **Motion:** the orb's position uses a monotone cubic through keyframes (`ORB_PATH`), so speed changes are smooth with no overshoot. Everything else uses `spring()` and eased `interpolate()`. Scenes overlap by 10 frames.

### Reused from `sp500-remotion`

Config-file structure, `AnimatedText` (extended with per-word accent colors and an LTR mode for the English outro), `AudioLayer` (extended with ducking, looped cues and a per-beat heartbeat), the safe-zone overlay and `scripts/check-safe.mjs`. The outro is rebuilt from `miran-gold-history`'s English outro (`src/scenes/Cta.tsx` there). Everything else is new.

## Editing

Everything lives in **`src/config.ts`**:

- `COLORS` and `GRADIENTS`: the video's palette (the sp500 dark gold, `#0A0A0A #D4AF37 #F5D77A #8C6D1F`). `OUTRO` holds the Miran Gold outro's own golds and weights, kept identical to the rest of the Miran Gold series.
- `TRACK_POINTS`: the curve. Move a point and the ride, the chart, the labels and the camera all follow.
- `STAGES`: the emotion color script and per-emotion effects.
- `ORB_PATH`: when the orb reaches each stage (this sets the pace of the ride).
- `RIDE_LABELS`: when each emotion word lands and leaves, and its typography treatment (`soft`, `pop`, `spark`, `swell`, `wobble`, `strike`, `fear`, `panic`, `drop`, `heavy`, `ray`, `color`, `climb`).
- `SCENES`, `CUES`, `IMPACTS`, `BURSTS`: scene timing, cues inside scenes, camera shakes and flashes, and particle bursts.
- `TEXT`: every on-screen string. Eastern Arabic digits. `"\n"` forces a line break. `TEXT.cta` is the English Miran Gold outro (wordmark, CTA lines, button, disclaimer).
- `AUDIO`: file names, volumes, ducking and every sfx cue.
- `src/voiceover.ts`: the voiceover lines (exact on-screen words plus a vocalised reading).

After changing cues, regenerate the documents:

```bash
npm run cues     # sfx-cues.md
npm run vo       # voiceover-script-ar.md + voiceover-guide.srt
npm run events   # docs/event-density.svg/.png, fails if any gap is over 1.5 s
```

## Assets (all optional, all in `public/`)

- `logo.png`: the Miran Gold logo (the same file as the other Miran Gold projects), shown inside the gold loop in the outro. Without it, the «MIRAN GOLD» wordmark is shown large on its own.
- `music.mp3`: loops; ducks under the voiceover, nearly to silence at the summit and low at the bottom; fades out over the last 2 s.
- `voiceover.mp3`: plays from frame 0. Script: `voiceover-script-ar.md`, guide track: `voiceover-guide.srt`.
- `sfx/*.mp3`: riser, impact, heartbeat, alarm, rewind, sub-drop, piano, whoosh, shine. Every frame is listed in **`sfx-cues.md`**. The heartbeat is triggered on every beat of the HUD heart rate, so it follows the number exactly.

Missing files are skipped (checked with `getStaticFiles()`), so a render never fails on a missing asset.

## Commands

```bash
npm install
npm run studio                 # preview in Remotion Studio (toggle "showSafeZone" in the props panel)
npm run render                 # out/psychology.mp4: H.264, CRF 16, 1350 frames (the master)
npm run share                  # out/psychology-share.mp4: CRF 18 copy for sharing / the repo (needs ffmpeg)
npm run render:preview         # quick half-size preview
npm run check:safe             # renders the text-only composition, fails if any text leaves the safe zone
npm run contact                # contact sheets of every scene in out/contact/
npm run stills -- out/stills 0.5 30 400 900   # PNG/JPEG stills of chosen frames
npm run typecheck
```

The Cairo font loads from Google Fonts, so stay online while you preview or render.

### WebGL on servers (the GL flag)

The 3D needs WebGL. `remotion.config.ts` sets **`--gl=swangle`** (SwiftShader through ANGLE) by default. It is software rendering, so it needs no GPU and gives identical frames everywhere, but it is CPU-heavy. To override:

```bash
REMOTION_GL=angle npm run render     # a machine with a GPU (much faster)
npx remotion render Psychology out/psychology.mp4 --gl=swangle --crf=16   # explicit flag on a headless server
```

Use `REMOTION_BROWSER=/path/to/chrome-headless-shell` to render with a Chrome you already have, and add `REMOTION_CHROME_MODE=chrome-for-testing` if that binary is a full Chrome for Testing.

## Quality checks that were run

- **Contact sheets** of every scene (`npm run contact`), reviewed and iterated. The final sheets, taken from the rendered MP4, are in `docs/contact/`. Fixes included: lifted blacks, ties and glow flooding the lens, a blown-out summit, camera framing (orb off-frame at the bottom and on curves), emotion words stacking, an empty pull-back frame, thin late scenes, and text wrapping.
- **Safe zone:** `npm run check:safe` passes on all 1350 frames. Text stays inside the center 900 px, clear of the top 250 px and the bottom 350 px.
- **Arabic:** DOM text only, words animated whole, so there is no broken letter joining. No text overflows its column.
- **Motion:** dense frame strips around every transition (`out/strips/`), with no jumps, pops or dead frames.
- **Event density:** `docs/event-density.png`. There is a new visual event at least every 1.5 s; the longest gap is 40 frames (1.33 s), during the continuous reveal move.
- **Render time:** about 19 min for the full 1350 frames (about 0.85 s per frame) on a 4-core machine with no GPU (software WebGL), at `--concurrency=2`. Concurrency 1, 2 and 4 benchmarked the same there, because SwiftShader already uses every core. With a GPU (`REMOTION_GL=angle`) it is much faster.
- **File size:** the film grain is about 2.5 px, refreshes every 2 frames and stays out of the blacks. Per-pixel grain that changed every frame had pushed the CRF 16 master to 620 MB (about 110 Mbit/s); it is now about 22 Mbit/s.
