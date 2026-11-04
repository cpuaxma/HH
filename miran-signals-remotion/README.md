# Miran Gold: "Trading blind vs. trading with Miran Gold" (signals reel)

A 20-second Arabic reel (1080×1920, 60fps, 1200 frames) built in Remotion with `@remotion/three` (React Three Fiber) and `@remotion/motion-blur`. Two original, unbranded 3D phones in a deep navy studio trade the same gold market on the same day:

- **Left: «تداول بلا خطة»** (trading without a plan). Copied and random trades with a "?" where the reason should be, "SL: —", 8.00 lots at 1:500, an unopened economic calendar. It walks into a high-impact USD news candle and gets a margin call: **$10,000 → $6,850**.
- **Right: «التداول مع ميران جولد»** (trading with Miran Gold). A Miran signal with entry, stop loss and targets, 1% risk, the stop moved to break-even after TP1, and a Miran market update before the news. It comes through protected and grows steadily, with one small, controlled loss: **$10,000 → $10,640 (+6.4%)**.
- Then the left phone flips and switches to Miran Gold.

The reel is built on three pillars: strategy, risk management and market updates. It uses the engine of the Hot Pepper Media competitor reel (`hpm-competitor-remotion` on the `claude/hpm-competitor-reel` branch): the accumulation motion-blur pipeline, the phone geometry and glass, the canvas screen kit with cached layers, content keys and hi/lo texture tiers, the camera shot list, and the QA scripts. The brand (colours, Arabic type rules, the «توضيحي» label, the logo) comes from `miran-gold-tensions` and `miran-gold-falling`.

The trading app, the "TopTrader_07" handle, the news event and every number are **fictional and illustrative**. Every number on screen carries a «توضيحي» (illustrative) label.

## Commands

```
npm install
npm run studio          # preview and scrub in the browser
npm run stills          # QA stills → out/stills (args: outDir scale frames [--safe] [--feed])
npm run stills -- out/safe 0.5 90,280,708,1180 --safe   # with Instagram's UI zones drawn on top
COMP=MiranSignalsEN npm run stills -- out/en 0.5 40,690  # stills of another composition
npm run check:camera    # numerical jerk check of the camera path (both formats)
npm run blur:budget     # motion-blur sample count per frame and a render-time estimate
npm run preview         # half-res draft → out/preview.mp4
npm run render:all      # every deliverable (see below); run it detached
npm run sfx:make        # re-synthesise the sound effects (numpy)
npm run scan -- out/miran-signals-silent.mp4   # flicker / black / glitched frame scan
python3 scripts/storyboard.py storyboard.png out/sb   # captioned storyboard from stills
```

Compositions:

- `MiranSignals`: Arabic, 9:16.
- `MiranSignals4x5`: Arabic, 1080×1350, re-framed for feed ads.
- `MiranSignalsEN`: English, 9:16, the same picture with the strings swapped.
- `MiranSignalsSfx` and `MiranSignalsAudio`: the audio mixes alone.

`scripts/render-all.sh` renders each format's picture once (muted), renders the two audio mixes as WAVs, muxes them on, renders the cover and scans every file:

| File | What |
|---|---|
| `miran-signals.mp4` / `miran-signals-4x5.mp4` | Effects and Arabic voiceover |
| `miran-signals-sfx.mp4` / `-4x5-sfx.mp4` | No voice (effects only) |
| `miran-signals-silent.mp4` / `-4x5-silent.mp4` | Silent |
| `miran-signals-sfx.wav` | The effects alone |
| `miran-signals-cover.png` | 1080×1920 cover (frame 960) |

The English version (`miran-signals-en-sfx.mp4`, `miran-signals-en-silent.mp4`) is rendered too, without the Arabic voiceover. Set `FORMATS` to render a subset.

The script writes to `out/`, which git ignores. The finished files from the last full render, all scanned clean, are committed in `deliverables/`.

Final settings are H.264, CRF 16, yuv420p, preset slow. They are passed on the render command, not in `remotion.config.ts`, because setting them there breaks the WAV renders.

Rendering uses the Chrome Headless Shell in `/opt/pw-browsers` with SwiftShader through ANGLE (`swangle`), so it needs no GPU and every frame is deterministic. Concurrency is 1. A full-res format takes about 45 minutes, so run `setsid nohup bash scripts/render-all.sh > out/render-all.log 2>&1 &` and poll. IBM Plex Sans Arabic is bundled through `@fontsource`, so rendering never fetches fonts. If Chrome hits certificate errors on other downloads, add your network's TLS-inspection CA to its NSS store (`certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n name -i ca.crt`). Never turn TLS checks off.

## Changing things

Everything you are likely to change is in **`src/data.ts`**.

- **Copy (Arabic and English):** `COPY.ar` / `COPY.en`.
  - The hook: `hookA`, `hookB`.
  - The phone labels: `labelLeft`, `labelRight`.
  - The three pillars: `name`, the red `without`, the gold `with`.
  - The twist: `twistA`, `twistB`.
  - The flip line: `flip`.
  - The end card: `cta` and `disclaimer`; also `illustrative`.
  - In each block, `gold` and `red` list the words drawn in the gold gradient or in loss red.
  - Lines are auto-fitted to the 800px column, so longer copy shrinks instead of clipping. Numbers inside Arabic lines are wrapped in `<bdi>` automatically.
- **Text inside the phones:** `SCREEN_COPY.ar` / `.en` (Miran's own cards: the signal title, the reason, the market update, the protected state, the checklist, "signal source"). The app's own UI is English trading terms (`Entry`, `SL`, `TP1`, `Margin call`), as in most trading apps.
- **Prices:** `MARKET.price` is the gold price as `[frame, price]` keyframes joined by a smooth curve (illustrative late-2026 levels around $4,000). The news candle is the drop at frame 480.
  - `MARKET.candleFrames` sets the candle length and `visibleCandles` the chart width.
  - `NEWS` holds the generic news label.
- **Left account:** `LEFT_TRADES` (side, lots, entry, close, P&L), `LEFT.balance` (balance keyframes, $10,000 → $6,850), `LEFT.leverage`, the margin levels, `LEFT.afterFlip` (its first Miran signal) and `LEFT_NOTIFS` (every banner, with its frame).
- **Right account:**
  - `SIGNAL` holds the Miran signal: entry 4,000.50, SL 3,998.00, TP1 4,011.10, TP2 4,018.50, 0.40 lots, Risk 1%. It is half closed at TP1 (+$212), with the stop moved to break-even and the rest closed at BE in the spike.
  - `FRESH_SIGNAL` is the signal after the news.
  - `RIGHT.balance` (keyframes, $10,000 → $10,640), `RIGHT.history` (the trade list, including the −0.5% stop-out) and `RIGHT_NOTIFS`.
  - The numbers reconcile. Left: 10,000 − 420 − 320 − 153 − 2,257 = 6,850. Right: 10,000 + 208 − 50 + 212 + 0 + 104 + 166 = 10,640. If you change one, change the others to match.
- **Colours:** `BRAND`.
  - Navy `bgTop #0A0E18` / `bgBottom #131A2A`, gold `#D4A24C` → `#F3D27A`, glow `#C8963E`.
  - Cards `#141A28`, text `#F5F1E8`, grey meta `#8C93A3`, green `#4CC38A` and red `#D9534F`.
  - `STUDIO` holds the floor, the red and gold pools, the dark titanium and the key light.
- **Timings:** `TIMING`, in frames at 60fps. Sounds follow these automatically.

  | Beat | Frames | Keys |
  |---|---|---|
  | Hook | 0–180 | `hookAIn/Out`, `hookBIn/Out` |
  | The gap | 180–540 | `pillars` (per pillar: shot window, `redIn`, `goldIn`, `out`), `signalBuildAt` + `signalLineGap` (the signal card builds line by line), `updateAt` (the Miran market update), `lean*` (the phones lean back for the overhead) |
  | Twist | 540–720 | `checklistAt`, `ticks` (the three gold ticks, on the voice's three words), `tagAt`, `twistAIn/Out`, `twistBIn/Out` |
  | Flip | 720–1020 | `streakStart/End`, `flipStart/End`, `impactAt` + `impactFrames`, `syncPulseFrom/Period`, `flipTextIn/Out` |
  | End card | 1020–1200 | `endCardStart`, `logoAt`, `ctaAt`, `tapAt`, `disclaimerAt`, `holdFrom` (nothing moves after this) |

- **Camera:** the edit is `EDIT` in `src/lib/camera.ts`. Each shot has `until` (the frame it hands over), `blend` (how many frames the move to the next shot takes) and an easing. The shots in `SHOTS` are:
  - a wide two-shot;
  - a macro on each screen;
  - a low 3/4 across both phones;
  - an overhead with a speed-ramped push on the news candle;
  - a push-in on the checklist;
  - the low 3/4 hero for the flip.

  Run `npm run check:camera` after changing it.
- **Layout:** `SAFE` (Instagram's top 220, bottom 400 and right 140px), `COLUMN` (the centred 800px column) and `LAYOUT` (per-format text positions and sizes, camera framing and focus points). `LAYOUT` is how the 4:5 version is re-framed rather than cropped.

## How it's built

- **Phones** (`src/three/Phone.tsx`, `phoneGeometry.ts`, `glass.ts`): original, unbranded.
  - A satin dark-titanium band (PBR metal) swept from a superellipse profile with analytic normals, so there's no `flatShading` and no NaN pixels.
  - A black glass front, and the screen under a cheap glass shader with Fresnel reflections of a painted navy and gold studio.
  - A dark frosted back with a generic camera bump.
  - A faint, blurred reflection of each screen in the glossy floor.
- **Screens** (`src/screens/draw.ts`, `kit.ts`): a fictional dark trading app on XAU/USD, drawn on 1200×2670 canvases.
  - Candlestick charts slide live with a price line, level lines (entry, SL, TP, BE) and the news-candle marker.
  - Account blocks with equity sparklines, stacking notification banners (motion-smeared while they move), and the left's trades, position, calendar and margin call.
  - The right's history, Miran signal card, risk meter, market update, protected state and checklist.
  - Static parts are cached layers. Text uses IBM Plex Sans Arabic (RTL where Arabic). The font has no ✓, so check marks are drawn as vectors.
  - The texture is uploaded full-res (no mipmaps) when the screen is big on frame, and half-res mipmapped in wide shots. The canvas follows the render scale, so the preview is cheap.
- **Studio** (`src/three/Studio.tsx`):
  - An unlit, designed cyclorama shader: the navy gradient, a soft gold key on the wall, a floor pool, and a glossy floor reflecting the blurred studio with Fresnel.
  - RoomEnvironment through PMREM for the metal, a warm key, gold rim strips and a top softbox.
  - Soft projected decal shadows (no shadow maps).
  - A cold red pool under the left phone that pulses with each loss, and a warm gold pool under the right. Both glow gold after the flip.
- **Render pipeline** (`src/three/Pipeline.tsx`):
  - Real accumulation motion blur. Probes on every moving part decide 1–16 sub-frame samples per frame, with a still threshold of 6px, so screens and type stay crisp when nothing moves.
  - SMAA, then bloom at half resolution, only during the streak and the impact.
  - Neutral tone mapping, then a warm-gold split-tone grade that also makes the navy/gold impact frame. There is no depth of field.
  - Every value is a pure function of the frame (`src/lib/story.ts`, `src/lib/camera.ts`); there is no `useFrame`.
- **Type** (`src/ui/Kinetic.tsx`):
  - Big Arabic kinetic type, animated word by word (never letter by letter, so letters stay joined), with no letter-spacing.
  - Gold-gradient key words, red losses, `<bdi>` around numbers, and generous line masks so diacritics never clip.
  - The pillar pairs animate as a mirrored split: red "without" on the left phone's side, gold "with" on the right.
  - Lines over busy screens get a dark glass backing.
  - `CameraMotionBlur` runs only while the type moves.
- **Overlays** (`src/ui/Overlays.tsx`):
  - Labels pinned under the phones with the renderer's own camera, showing live balances and «توضيحي».
  - The impact burst.
  - The end card: navy, drifting gold particles, the logo (`public/logo.png`, cropped from `assets/logo-source.jpg`), the gold CTA with a tap, and the disclaimer.
  - A vignette and very light grain.

## Sound

Every effect is synthesised by `scripts/make-sfx.py` from sine waves and filtered noise, seeded so they are identical on every run. The sounds are original, with no library samples. `src/sound.tsx` places them from the same timings as the visuals.

| Moment | Sound |
|---|---|
| Left losses | harsh, descending three-step error blips |
| Left margin warning | a low heartbeat pulse until the news |
| Left margin call | a soft two-tone alarm |
| Left notifications | a short, slightly sour two-note blip |
| Right signal card builds | soft rising gold chimes, one per line |
| Right TP hits | a bright rising arpeggio |
| Miran market update | a calm two-note chime with a long tail |
| News candle (both) | a sub-drop and rumble on the same frame; a hard hit on the left, then a soft shield tone for the right |
| Twist checklist | three gold ticks, then a glint on the tag |
| Gold streak / flip | a metallic whoosh, a whip swish, an impact |
| End card | a warm logo hit, a tap on the CTA |

- **Levels:** effects only measure −19.9 LUFS with a −3.3 dBFS true peak; with the voice, −19.3 LUFS and −3.3 dBFS. That keeps them under music added in Instagram.
- **Adjusting:** `SFX_MASTER` in `src/sound.tsx` sets the overall level, `getCues()` the per-cue volumes, and `VOICEOVER.volume` / `duckTo` the voice.

## Voiceover

Three Arabic lines, from `VOICEOVER` in `src/data.ts`:

- «نفس السوق… نتيجتان مختلفتان.» on the hook.
- «استراتيجية، إدارة مخاطر، وتحديثات السوق.» on the twist, with the checklist ticks timed to its three words.
- «تداول بخطة مع ميران جولد.» on the flip.

How the take was chosen:

- Generated with Supertonic 3 (Arabic, voice 5), run locally through sherpa-onnx (the model ships under the MIT licence).
- Every take was checked by multilingual Whisper. A voice qualified only if all three lines came back word for word, and the liveliest qualifying voice was kept.
- Four of the ten voices failed, mostly by slurring «مختلفتان» to «مختلفة».
- I could not listen to the result here. **Please listen before publishing**; if it isn't good enough, use the `-sfx` files or set `VOICEOVER.enabled = false`.

To regenerate it:

```
pip install sherpa-onnx soundfile librosa numpy
# unpack into MODELS_DIR from github.com/k2-fsa/sherpa-onnx/releases:
#   tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2
#   asr-models/sherpa-onnx-whisper-small.tar.bz2   (multilingual)
python3 scripts/make-voiceover.py MODELS_DIR 5        # or a list of voices to compare: 0,1,2,...
```

## Layout and safe zones

- **Vertical:**
  - All text sits in the centred column (x 140–940), between y 262 and 1500, clear of Instagram's top 220, bottom 400 and right 140px.
  - The macros creep down the screen as they play, so the trade rows and the signal card land inside the safe area.
  - The CTA sits at y ≈ 1000–1090 and the disclaimer at y ≈ 1346–1450. The disclaimer is on screen from frame 1050 to the end (2.5 seconds).
- **4:5:** the text starts at y 96 and labels stay above y 1250. The camera's framing and focus points are re-set per format in `LAYOUT`.

## Compliance notes (for Miran Gold's sign-off)

Built in:

- No "guaranteed", "risk-free", "easy money", "passive income" or "get rich" language in the copy or voiceover.
- No real people, testimonials, brokers or platforms. The app is generic and "TopTrader_07" is a clearly fictional handle. Copy trading isn't called a scam: the message is trading without strategy, risk management or market awareness.
- The news event is generic ("High-impact USD news / US inflation data"), with no date and no claim about a real release.
- Every result is labelled «توضيحي». The winning side shows 1% risk, a stop loss always set, and one small loss (−0.5%).
- The risk disclaimer is readable on mute.

Worth checking with compliance before running it as an ad:

- **Meta:** ads for trading or signals services fall under the "Financial products and services" special ad category in many regions. Some regions need advertiser verification or a licence, and signals and copy trading can be restricted. Check the targeting countries.
- **Regional rules:** depending on where it runs, the authority that applies may be the UAE (SCA/DFSA/FSRA), Saudi Arabia (CMA), Egypt (FRA), Jordan (JSC) or others, and the UK FCA or EU (ESMA) if it reaches those audiences.
  - A signals service may count as investment advice and need a licence.
  - Some regulators require a specific risk-warning wording, or a "% of retail accounts lose money" statement for leveraged products.
- **Performance figures:** the +6.4% / +$212 / $10,640 are illustrative. Some rules forbid showing hypothetical returns at all, or require a stated basis and period.
- **Leverage:** showing 1:500 is a negative example, but leverage above local retail caps may still need care in some regions.
- **The disclaimer:** check that its wording, size and duration meet each platform's and regulator's minimum. It could be shown earlier, or for longer.
