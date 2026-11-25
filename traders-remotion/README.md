# الحلبة · The Arena (Miran Gold)

A 40-second vertical Arabic video about why most retail traders lose money. It's built with Remotion (React + TypeScript) and `@remotion/three` (React Three Fiber): 1080×1920, 30 fps, exactly 1200 frames.

100 traders stand as glowing gold pillars on a 10×10 grid of floating black-glass tiles. Six classic mistakes wipe them out wave by wave, each with its own visual trap. A rolling counter ticks **١٠٠ → ٢٥**. The 25 survivors rise into warm light, show the habits that saved them, and lock into one upward arrow behind the logo.

Output: `out/traders.mp4` (H.264, CRF 16, yuv420p, bt709, AAC audio).

## Quick start

```bash
npm install
npm run studio                 # preview in Remotion Studio
npm run render                 # → out/traders.mp4  (H.264, CRF 16, --gl=swangle, mastered audio)
```

`npm run render` runs two steps:

```bash
npx remotion render TradersArena out/traders-raw.mp4 --codec=h264 --crf=16 --gl=swangle
node scripts/master-audio.mjs out/traders-raw.mp4 out/traders.mp4   # audio limiter, video copied untouched
```

The second step is needed because Remotion mixes audio without a master limiter. Without it, effects stacked on the music can peak above 0 dBFS.

### The GL flag (servers / no GPU)

The 3D needs WebGL. On a machine without a GPU, such as a server, CI or a container, render with **`--gl=swangle`**. That is SwiftShader through ANGLE, a software renderer. `remotion.config.ts` already sets it, so `npx remotion render` and `npx remotion still` use it by default. On a desktop with a GPU you can try `--gl=angle` for a faster render.

### Fonts without internet

Cairo is loaded through `@remotion/google-fonts`, so the headless browser must reach fonts.gstatic.com. If it can't (for example a locked-down server), download the same files once and render with the local switch:

```bash
node scripts/fetch-fonts.mjs                    # → public/fonts/cairo-{arabic,latin}.woff2
REMOTION_LOCAL_FONTS=1 npm run render
```

### Browser

Remotion downloads its own headless Chrome on first render. To use an existing one instead: `REMOTION_BROWSER=/path/to/chrome-headless-shell npm run render`.

## Render time

| Step | Time |
|---|---|
| Full render (1200 frames, 4-core cloud VM, no GPU, SwiftShader) | **1604 s (26.7 min)**, ~1.3 s/frame |
| Audio mastering (`node scripts/master-audio.mjs`) | ~5 s |
| One still (`npm run still -- --frame=430 out/f.png`) | ~6–8 s |
| Safe-zone audit (`npm run safezone`, text only) | ~40 s |

Concurrency does not speed up a software-GL render, because SwiftShader already uses every core. On a GPU machine with `--gl=angle`, render with the default concurrency.

## Editing

Everything you would normally change is in **`src/config.ts`**:

- `COLORS`, `FONT`, `SAFE`: palette, weights and the text-safe area.
- `SCENES`, `BEATS`: frame ranges and beats. Neighbouring scenes overlap by 8–12 frames.
- `TEXT`, `ACCENTS`: every on-screen string, plus the words that get colour and a shine. `\n` forces a line break.
- **`TRAPS`**: the trap sequence as one editable list:

  ```ts
  {title: 'رافعة مالية مفرطة', accent: ['مفرطة'], remove: 16, mechanism: 'lever'},
  ```

  - **Reorder, retitle or swap** freely. The counter values (`COUNTER_STEPS`), hit frames, camera shots, sound cues and docs are all derived from this list.
  - **Mechanisms:** `wander`, `crack`, `lever`, `chain`, `fomo`, `rumor`. Each picks its own victims by geometry from the pillars still standing, so any order works.
  - **Counts:** `remove` values must total 75 (100 → 25). `lever` needs ≤10, or an even number ≤20. The planner throws a clear error if a combination can't work.
- `AUDIO`: file names and levels (music, duck, swell, fade-out).

After changing timings or traps, run `node scripts/gen-docs.mjs`. It regenerates `sfx-cues.md`, `voiceover-guide-ar.srt` and `counter-check.md`.

## Sound

Every audio file is optional. A slot plays only if its file exists in `public/`.

| Slot | File |
|---|---|
| Music bed: tense pulse, ducks under the voiceover, swells warm for the survivors, fades over the last 2 s | `public/music.mp3` |
| Voiceover (optional) | `public/voiceover.mp3` |
| Effects | `public/sfx/{ripple,hit,crack,lever,chain,rush,whisper,rise,flare,shine,whoosh}.mp3` |

The repo ships **original synthesised placeholders** for all of them, made with `python3 scripts/make-audio.py` (numpy only, no samples). Drop your own files over them to replace them. Exact frames for every cue are in **`sfx-cues.md`**.

## Voiceover

`voiceover-script-ar.md` is the timed Arabic script. Its words match the on-screen text exactly, with numbers written as words and tashkeel where TTS voices tend to stumble. It also gives the script as one paragraph. `voiceover-guide-ar.srt` is the matching guide track.

## How it's built

```
src/
  config.ts                 ← colours, fonts, timings, all text, TRAPS, audio
  Root.tsx, Video.tsx       ← composition "TradersArena" (+ "ArenaTest", 3D only)
  scenes/                   ← one component per scene (DOM text layer over the arena)
    Hook · Setup · Trap · Reveal · Habits · ArrowScene · Cta
  arena/                    ← the 3D world (one continuous canvas, no cuts)
    plan.ts                 ← plans the massacre once: survivors, victims per trap, death frames, counter
    mechanisms/*.ts         ← the six traps: victim selection + hand-animated motion (seeded, no physics)
    world.ts                ← pure function frame → every pillar & tile state (hook, traps, rise, arrow, CTA)
    camera.ts               ← keyframed camera (monotone cubic, C1-continuous), shot per trap, hit shakes
    Pillars.tsx / Tiles.tsx ← instanced meshes (100 pillars + mirrored reflections; 200 half-tiles)
    shaders/materials.ts    ← gold metal with glow/red/cracks/dissolve, black-glass tiles, reflections
    Atmosphere.tsx          ← studio env map, gold dust, volumetric light cones, fog sheets
    TrapFx.tsx              ← red chain arcs, lever fulcrum, FOMO peak, whisper/hook rings
    Post.tsx                ← depth-reprojection camera motion blur, bloom, ACES, SMAA
  components/               ← AnimatedText (word-by-word), Counter (rolling digits), overlays, logo
  audio/                    ← SoundTrack (optional slots), cues, voiceover timings
scripts/
  stills.mjs                ← contact sheets: node scripts/stills.mjs out/qa "100-200:10" --scale=0.33
  safezone.mjs              ← per-frame safe-zone audit (exit code 1 on failure)
  gen-docs.mjs              ← sfx-cues.md, voiceover-guide-ar.srt, counter-check.md
  make-audio.py             ← synthesises the placeholder music + SFX
  fetch-fonts.mjs           ← offline Cairo
```

Key choices:

- **Deterministic.** Every pillar and tile state is a pure function of the frame, built from a plan computed once with Remotion's seeded `random()`. Frames render identically in any order, on any machine.
- **The counter always matches the arena.** Its whole number is computed from the same death frames that drive the pillars. Each loss only adds a short rolling animation. `counter-check.md` verifies this for all 1200 frames.
- **Arabic is DOM, never three.js text.** Words reveal one at a time through a mask, never letter by letter, so the joining stays intact. The gradient fill is padded so dots below the line (such as the two dots of a final ي) are never cut off.
- **Bloom is real postprocessing.** It was verified to render reliably in headless Chrome with SwiftShader. Every custom shader guards against NaN/Inf, which bloom would otherwise smear across the frame.
- **Reflections** on the black glass are mirrored instances, stencil-masked to the tiles. They're cheaper and steadier than a reflector pass.
- **Camera motion blur** reprojects each pixel with the camera from half a frame earlier (a 180° shutter), so it only shows on fast moves.

## QA tools

```bash
npm run safezone                                        # per-frame text safe-zone check
node scripts/stills.mjs out/qa "12,108,215,...,1185" --scale=0.33 --cols=6   # contact sheet
npx remotion still TradersArena out/sz.png --frame=300 --props='{"showSafeZone":true}'
```

## Render report

Final render of `out/traders.mp4`:

| Check | Result |
|---|---|
| Format | 1080×1920, 30 fps, **1200 frames**, 40.000 s, H.264 CRF 16, yuv420p, bt709; AAC 48 kHz stereo; 58 MB |
| Render time | 1604 s (26.7 min) on a 4-core cloud VM with no GPU (`--gl=swangle`, concurrency 1); an earlier full render took 1642 s |
| Loudness | −15.3 LUFS integrated, 4.7 LU range, true peak −1.6 dBTP (after `master-audio.mjs`) |
| Safe zone | `npm run safezone`: all 1200 frames pass |
| Counter | `counter-check.md`: 0 of 1200 frames where the number shown differs from the pillars still standing |
| Visual QA | Contact sheets of every scene, plus sampled frame sequences around every transition and trap (`scripts/stills.mjs`) |

## Logo

`public/logo.png` (Miran Gold) is shown in the CTA. If the file is missing, a gold «Miran Gold» wordmark is shown instead.
