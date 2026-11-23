# Hot Pepper Media: "A day in the life of ONE post"

A 25-second Instagram Reel (1080×1920, 30 fps, 750 frames) built in Remotion. Its goal is to get new clients to DM "KICK".

| Time | Scene | Clock |
|---|---|---|
| 0–2 s | **Hook**: "What goes into ONE post?" slams in, then a chili-flame wipe | none |
| 2–6 s | **Idea**: sticky notes fly in and scatter, then a red circle is drawn around one | 08:00 |
| 6–10 s | **Strategy**: Audience / Goal / Message cards snap in and get checked off | 10:00 |
| 10–15 s | **Create**: viewfinder (REC), design canvas and typed caption merge into the post | 13:00 |
| 15–19 s | **Launch**: phone publishes, a finger taps "Launch ad campaign", notifications pop in | 17:00 |
| 19–22 s | **Results**: Reach / Followers / Leads count up over a rising graph | 20:00 |
| 22–25 s | **CTA**: logo flame reveal, "DM us 'KICK'", tagline, handle, then a 1.5 s hold | none |

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
| **Instagram handle** | CTA, post card, phone | `BRAND.handle` (now `@hotpeppermedia`, which is a guess) |
| **DM keyword** | CTA | `BRAND.dmKeyword` (`KICK`) |
| **Tagline** | CTA | `BRAND.tagline` |
| **Logo** | CTA logo reveal, thumbnail | `BRAND.logo` → `assets/logo-on-light.png`, made from `../assets/logo-primary.png` with the cream background keyed out (original colours). Drop in an official transparent PNG and update `BRAND.logoAspect` (width / height). |
| **Chili mark** (top-right, avatars) | `src/components/ChiliMark.tsx` | It is traced from the logo. Swap the paths if you have an official icon SVG. |
| **Results numbers** | Results tiles | `SCENES.results.stats[].value` / `prefix` / `suffix` / `format` (`compact` = 48.2K, `comma` = 1,240) |
| **"Example results" label** | Under the stats | `SCENES.results.showExampleLabel`: set to `false` once the numbers are real. Text: `exampleLabel` |
| **Graph shape** | Results | `SCENES.results.graph` (values 0..1, left → right) |
| **Notification numbers / DM text** | Launch | `SCENES.launch.notifications[].text` |
| **Strategy lines** | Strategy cards | `SCENES.strategy.cards[].title` / `.line` |
| **Idea notes** | Sticky notes | `SCENES.idea.notes`, `SCENES.idea.chosenNote` |
| **Ad-campaign button** | Launch | `SCENES.launch.adButtonLabel` ("Launch ad campaign"), `adLiveLabel` ("Campaign live"), caption `SCENES.launch.caption` |
| **Example post copy** | Create + Launch | `SCENES.create.postHeadline`, `postButton`, `typedCaption` |
| **Music** | Whole reel | Add `assets/music.mp3`, then set `MUSIC.bpm` and `MUSIC.firstBeatFrame` (and `trimStartSeconds` if needed). Volume: `volume`, `fadeInFrames`, `duckTo` (CTA duck, 0.4), `fadeOutFrames`. Without the file the reel renders silent. |
| **SFX** | Transitions and hits | Add `assets/sfx/whoosh`, `pop`, `tap`, `bass-hit` (`.mp3` or `.wav`). Each plays at its cue; missing files are skipped. Levels: `SFX.volume`. whoosh = every whip and flame wipe; bass-hit = "ONE" in the hook (`SCENES.hook.bassHitWord`); pop = notes, cards, stats, bubbles; tap = checks, design clicks, the ad-campaign button. |
| **Footage / screenshots** | No assets were supplied, so everything is vector motion graphics (`DishArt`, `PostCard`, `Phone` in `src/components/Art.tsx`) | To use real shots, replace `<DishArt>` inside `PostCard` / the viewfinder with an `<Img>` or `<OffthreadVideo>` from `assets/`. |
| **Clock times** | HUD | `SCENES.<scene>.clock` (results `20:00`; set to `null` to hide it there) |

## Files

- `src/config.ts`: all copy, numbers, timings and styling.
- `src/Reel.tsx`: the layer order (backdrop → embers → `<Series>` of scenes → clock and logo mark → grain and vignette → audio).
- `src/scenes/`: `Hook`, `Idea`, `Strategy`, `Create`, `Launch`, `Results`, `Cta`.
- `src/components/SceneShell.tsx`: camera push, whip-pan with SVG motion blur, flame-wipe clip.
- `src/components/`: `Caption` (word-by-word springs), `Hud` (clock + logo mark), `Ambient` (embers, glow, grain, vignette), `Flame`, `Icons` (custom SVG icons; emoji characters aren't used because they render as boxes in headless Chrome), `Art` (dish, post card, phone), `Sound` (music and SFX, skipped when a file is missing), `SafeZoneAudit` (QA overlay), `FontGate`.
- `src/lib/timeline.ts`: turns the config into beat-snapped cuts and transition overlaps.

The loop is seamless because the embers and the bottom glow are periodic over all 750 frames, and the CTA ends on the same plain warm-white background, glow and ember field the hook opens on.
