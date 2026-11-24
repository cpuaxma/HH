# Hot Pepper Media: "A day in the life of ONE post"

A 30-second Instagram Reel (1080×1920, 30 fps, 900 frames) built in Remotion. Its goal is to get new clients to DM "KICK".

| Time | Scene | Clock |
|---|---|---|
| 0–2 s | **Hook**: opens on red, bursts to white; "What goes into" / a giant red **ONE** / "post?" slam in, then a chili-flame wipe | none |
| 2–6 s | **Idea**: three big sticky notes slap down, two get scribbled out and fall, the winner is circled | 08:00 |
| 6–10 s | **Strategy**: a bullseye draws in, a dart thunks into the centre, Audience / Goal / Message chips pop | 10:00 |
| 10–15 s | **Create**: one big post builds itself (1/3 SHOOT → camera flash, 2/3 DESIGN → headline + button, 3/3 WRITE → caption types), then a heart pops | 13:00 |
| 15–19 s | **Launch**: post gets a POSTED stamp, a finger taps a giant red "Launch ad campaign" button, reactions burst out, notifications pop | 17:00 |
| 19–22 s | **Results**: one giant number (people reached) counts up over a graph that shoots up, plus followers and leads chips | 20:00 |
| 22–27 s | **Nothing → something**: an empty grey "yourbrand" profile; on the voice's "to something" its tiles flip one by one into branded posts, the avatar becomes the chili logo and followers count up to 12.4K | none |
| 27–30 s | **CTA**: full chili-red card: white logo, "Want this for your brand?", "DM us 'KICK'", tagline, handle, then a 1.5 s hold | none |

Design rule: one huge hero object per scene, big type (captions 110 px), one big "hit" moment per scene, all on a red graph-paper grid (`COLORS.grid`, `COLORS.gridOnRed`, `GRID.cell`, `GRID.lineWidth`).

## Voiceover

One continuous, warm female narration that flows across the whole reel. Each sentence lands just ahead of its scene's cut.

| ≈ When | Line |
|---|---|
| 0:00 | "What goes into one post?" |
| 0:02 | "It starts with an idea... one that stops the scroll." |
| 0:06 | "Then a strategy: who it's for, and what to say." |
| 0:10 | "We shoot it, design it, and write it... until it's just right." |
| 0:15 | "Then we hit publish, and launch the ad campaign behind it." |
| 0:19 | "And we track what's working, in real time." |
| 0:22 | "We take your brand from nothing... to something." |
| 0:27 | "Want this? DM us the word kick." |

- **Note:** the glow-up line was voiced on its own in the same cloned voice and spliced into the approved narration, so the other lines stay exactly as approved. Running the generator again re-reads the whole script in one take.
- **File:** `assets/vo/narration.wav`, one track played from frame 0. `src/voLengths.ts` (generated) says when it is speaking, so music dips to `musicDuckTo` (0.35) and SFX to `sfxDuckTo` (0.6) under it.
- **Engine:** Chatterbox Turbo by Resemble AI (MIT licence, so commercial use is fine), run locally. The output carries Resemble's inaudible "Perth" watermark. `VOICEOVER.engine: 'chatterbox'` switches to the standard model, which uses `exaggeration` and `cfgWeight`.
- **Voice:** it clones `VOICEOVER.voiceRef` (`assets/vo/voice-ref.wav`), currently Kokoro's "af_heart" voice (Apache-2.0), a warm American female. A speech gender classifier confirms it reads 100% female. To use your own or a team member's voice, record 10–20 s of clean, natural talking, save it over that file and regenerate.
- **How it's made:** the whole script is read in **one continuous take** (`takes` of them), so intonation flows between sentences. Each take is split at its natural pauses and Whisper checks every sentence word for word. Sentences are laid on the timeline: each starts at its target (`at`, may lead the cut by `lead` s), never closer than a breath to the previous one. The liveliest clean take that ends before the loop point is kept and polished, then normalised to -15 LUFS with a true peak of -1.5 dBTP.
- **Regenerating** after editing `VOICEOVER.lines` or the voice:
  ```
  pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
  pip install chatterbox-tts sherpa-onnx soundfile librosa numpy
  # MODELS_DIR must hold asr-models/sherpa-onnx-whisper-small.en (github.com/k2-fsa/sherpa-onnx/releases)
  npm run voiceover -- MODELS_DIR [--takes 10]
  npm run render
  ```
  Model weights download from Hugging Face on the first run. A take of the full script takes about 40 s on CPU.

## Commands

```
npm install
npm run render       # out/reel.mp4   (H.264, CRF 18, yuv420p, AAC 320k if there is audio)
npm run thumbnail    # out/thumbnail.png (1080×1920 cover)
npm run stills       # QA stills at 15 90 210 400 520 620 735 → out/stills/
npm run stills -- --audit 180 400   # same, with the safe zone and every text box outlined
npm run studio       # preview and scrub
npm run assets       # rebuild assets/logo-on-dark.png, grain.png and fonts/ from ../assets
```

To use a local Chrome or Chromium instead of Remotion's download, set `REMOTION_BROWSER=/path/to/chrome`. Montserrat loads through `@remotion/google-fonts`. If Google Fonts can't be reached (it is probed once before rendering), the bundled copies in `assets/fonts/` are used.

## Editing

**Everything editable is in `src/config.ts`:** copy, colours (light cream theme: `COLORS.bg`, `ink`, `card`, `line`, `grid`), numbers, scene durations and cues (in frames), font sizes, spring presets, BPM, and the music and SFX settings.

- **Retiming:** change `SCENES.<scene>.duration`. Every scene is its own component inside a `<Series>` in `src/Reel.tsx`. Cuts snap to the nearest beat of `MUSIC.bpm` (with `MUSIC.snapCutsToBeat`). At 120 BPM a beat is 15 frames, so all cuts fall on beats. Cues inside a scene (`captionAt`, `tapAt`, …) are frames counted from that scene's cut.
- **Captions:** each array entry is one line (max 5 words, max 2 lines). `*word*` (or `*several words*`) sets it in chili red. A line that is too wide is shrunk to fit 800 px. Each caption stays up well over 1.2 s.
- **Transitions:** `TRANSITIONS_IN` sets the transition into each scene (`flame` / `whip`). Each whip is centred on its cut, with horizontal motion blur scaled to speed.
- **Safe zone:** x 90–940, y 220–1500 (`SAFE`). Scene content is laid out in a slightly smaller inner box, so the 1.00→1.05 camera push never carries anything past the edge.

## What to replace before posting

| Replace | Where | Config key |
|---|---|---|
| **Instagram handle** | CTA, post card | `BRAND.handle` (now `@hotpeppermedia`, which is a guess) |
| **DM keyword / tagline** | CTA | `BRAND.dmKeyword` (`KICK`), `BRAND.tagline` |
| **Logo** | Thumbnail (colour) and red CTA (white) | `BRAND.logo` → `assets/logo-on-light.png` and `BRAND.logoWhite` → `assets/logo-white.png`, both made from `../assets/logo-primary.png` by `npm run assets`. Swap in official transparent PNGs and update `BRAND.logoAspect`. |
| **Red or light end card** | CTA | `SCENES.cta.redBackground` (`true` = full chili red; the hook then opens on red so the loop is seamless) |
| **Hero result** | Results | `SCENES.results.hero` (`value`, `label`, `format`: `compact` = 48.2K, `comma` = 1,240) |
| **Other results** | Results chips | `SCENES.results.stats[]` |
| **"Example results" label** | Under the stats | `SCENES.results.showExampleLabel`: set to `false` once the numbers are real |
| **Graph shape** | Results | `SCENES.results.graph` (values 0..1, left → right) |
| **Ad-campaign button** | Launch | `SCENES.launch.adButtonLabel`, `adLiveLabel`, caption `SCENES.launch.caption` |
| **Notifications** | Launch | `SCENES.launch.notifications[].text` |
| **Strategy chips** | Strategy | `SCENES.strategy.chips[].title` |
| **Idea notes** | Idea | `SCENES.idea.notes` (3), `SCENES.idea.chosenNote` |
| **Example post copy** | Create + Launch | `SCENES.create.postHeadline`, `postButton`, `typedCaption`, step labels `SCENES.create.steps` |
| **Nothing → something** | Glow-up scene | `SCENES.glowup` (`handle`, `before` / `after` stats, `flipAt`, captions) |
| **Hook words** | Hook + thumbnail | `SCENES.hook.line1 / hero / line3`, `THUMBNAIL.*` |
| **Voiceover** | Whole reel | `VOICEOVER.lines[].text` / `at`, then `npm run voiceover -- MODELS_DIR`. Voice: replace `assets/vo/voice-ref.wav`. A real recording can replace `assets/vo/narration.wav`; update `src/voLengths.ts` windows if its timing differs. |
| **Music** | Whole reel | Add `assets/music.mp3`, then set `MUSIC.bpm` and `MUSIC.firstBeatFrame` (and `trimStartSeconds` if needed). Volume: `volume`, `fadeInFrames`, `duckTo` (CTA duck, 0.4), `fadeOutFrames`. Without the file the reel has only the voiceover. |
| **SFX** | Hits and transitions | Add `assets/sfx/whoosh`, `pop`, `tap`, `bass-hit` (`.mp3` or `.wav`); missing files are skipped. Levels: `SFX.volume`. bass-hit = ONE, the dart, the ad tap, the hero number and the logo; whoosh = every transition; pop / tap = notes, chips, stamps, clicks. |
| **Footage / photos** | No assets were supplied, so everything is vector graphics (`DishArt`, `PostCard`, `Phone` in `src/components/Art.tsx`, and the build-up card in `src/scenes/Create.tsx`) | Replace `<DishArt>` with an `<Img>` or `<OffthreadVideo>` from `assets/` to use real product shots. |
| **Clock times** | HUD | `SCENES.<scene>.clock` (results `20:00`; set to `null` to hide it there) |

## Files

- `src/config.ts`: all copy, numbers, timings and styling.
- `src/Reel.tsx`: the layer order (backdrop → embers → `<Series>` of scenes → clock and logo mark → grain and vignette → audio).
- `src/scenes/`: `Hook`, `Idea`, `Strategy`, `Create`, `Launch`, `Results`, `Cta`.
- `src/components/SceneShell.tsx`: camera push, whip-pan with SVG motion blur, flame-wipe clip.
- `src/components/`: `Caption` (word-by-word springs), `Hud` (clock + logo mark), `Ambient` (embers, glow, grain, vignette), `Flame`, `Icons` (custom SVG icons; emoji characters aren't used because they render as boxes in headless Chrome), `Art` (dish, post card, phone), `Sound` (music and SFX, skipped when a file is missing), `SafeZoneAudit` (QA overlay), `FontGate`.
- `src/lib/timeline.ts`: turns the config into beat-snapped cuts and transition overlaps.

The loop is seamless: the reel ends on the red CTA card and the hook opens on the same red, bursting open to white just before the first word. The embers and glow are periodic over all 750 frames.
