# Hot Pepper Media: "A day in the life of ONE post"

A 25-second Instagram Reel (1080×1920, 30 fps, 750 frames) built in Remotion. Its goal is to get new clients to DM "KICK".

| Time | Scene | Clock |
|---|---|---|
| 0–2 s | **Hook**: opens on red, bursts to white; "What goes into" / a giant red **ONE** / "post?" slam in, then a chili-flame wipe | none |
| 2–6 s | **Idea**: three big sticky notes slap down, two get scribbled out and fall, the winner is circled | 08:00 |
| 6–10 s | **Strategy**: a bullseye draws in, a dart thunks into the centre, Audience / Goal / Message chips pop | 10:00 |
| 10–15 s | **Create**: one big post builds itself (1/3 SHOOT → camera flash, 2/3 DESIGN → headline + button, 3/3 WRITE → caption types), then a heart pops | 13:00 |
| 15–19 s | **Launch**: post gets a POSTED stamp, a finger taps a giant red "Launch ad campaign" button, reactions burst out, notifications pop | 17:00 |
| 19–22 s | **Results**: one giant number (people reached) counts up over a graph that shoots up, plus followers and leads chips | 20:00 |
| 22–25 s | **CTA**: full chili-red card: white logo, "Want this for your brand?", "DM us 'KICK'", tagline, handle, then a 1.5 s hold | none |

Design rule: one huge hero object per scene, big type (captions 110 px), one big "hit" moment per scene, all on a red graph-paper grid (`COLORS.grid`, `COLORS.gridOnRed`, `GRID.cell`, `GRID.lineWidth`).

## Voiceover

Seven short lines, one per scene, each landing on that scene's big moment. A confident female voice reads them.

| When | Line |
|---|---|
| 0:00 | "What goes into one post?" |
| 0:02 | "It starts with an idea. The right one." |
| 0:06 | "Then a strategy that hits the target." |
| 0:10 | "We shoot it. Design it. Write it." |
| 0:15 | "Publish it, and launch the ad campaign." |
| 0:19 | "Then we measure what works." |
| 0:22 | "Want this for your brand? DM us the word kick." |

- **Text, timing, voice and levels:** `VOICEOVER` in `src/config.ts`. Each line's `at` is the frame from its scene's cut. `musicDuckTo` (0.35) and `sfxDuckTo` (0.6) set how far music and SFX dip while the voice speaks.
- **Audio files:** `assets/vo/<id>.wav`. A missing file is skipped. To use a real voice actor, record each line to the same file names.
- **Engine:** Supertonic 3 by Supertone (licence OpenRAIL-M, which allows commercial use), run locally through sherpa-onnx, the same engine as `hpm-maps-remotion`. Speakers 0–4 are female and 5–9 male; this reel uses 3.
- **Regenerating** after you change the text or voice:
  ```
  pip install sherpa-onnx soundfile librosa numpy
  # download and unpack into MODELS_DIR from github.com/k2-fsa/sherpa-onnx/releases:
  #   tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2
  #   asr-models/sherpa-onnx-whisper-small.en.tar.bz2
  npm run voiceover -- MODELS_DIR        # optional 2nd arg: speaker id, e.g. 7 for a male voice
  npm run render
  ```
  The script reads the lines from the config and renders several takes of each. Whisper checks every word of each take, and a take with a wrong word is rejected. It then keeps the liveliest take that finishes before the next line, polishes it (warmth, presence, gentle compression, a very short room) and levels it. It also writes `src/voLengths.ts`, which the music and SFX ducking use.

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
| **Hook words** | Hook + thumbnail | `SCENES.hook.line1 / hero / line3`, `THUMBNAIL.*` |
| **Voiceover** | Whole reel | `VOICEOVER.lines[].text` / `at`, then `npm run voiceover -- MODELS_DIR` (or drop real recordings into `assets/vo/<id>.wav`) |
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
