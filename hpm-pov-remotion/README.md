# Hot Pepper Media: "POV: You Hired Hot Pepper Media"

A 30-second vertical reel (1080×1920, 60fps, 1800 frames) built in Remotion. The full frame is the viewer's own lock screen.

It opens cold on the payoff: frame 0 is already mid-flood at Month 3, under "POV: you hired hot pepper media." Then it rewinds three months to a dead-quiet phone with one sad notification. After the hire, notifications arrive slowly, then faster, then in a flood. At the peak the phone overheats red, and the red floods into the CTA.

```
npm install
npm run studio            # preview and scrub in the browser
npm run stills            # QA stills: one per beat (0.8s … 28s) → out/stills
npm run render            # → out/hpm-pov.mp4 (H.264, CRF 18, with sound)
python3 scripts/make-sfx.py   # regenerate the sound effects in public/sfx (numpy)
```

Rendering goes frame by frame through `remotion render`. To use a Chrome or Chromium you already have, add `--browser-executable=/path/to/chrome` to the render, or set `REMOTION_BROWSER` for `npm run stills`. Montserrat 500/600/700/800 is bundled locally from `@fontsource/montserrat`. All icons come from `lucide-react`.

The lock screen and notifications are generic: no real app names, logos or OS branding. All usernames are fictional.

## Scenes (frames at 60fps; the overlaps are intentional)

| # | Frames | Beat |
|---|---|---|
| 1 | 0–150 | Cold open: Month 3, mid-flood from frame 0, "POV: you hired / hot pepper media." |
| 2 | 140–220 | Rewind: the cards fly back up, the clock rolls backwards to 9:00 / DAY 1, "99+" counts down |
| 3 | 210–380 | The quiet phone: "3 months earlier…", one notification from mom |
| 4 | 370–540 | The hire: "it all started / with one call.", the pepper drops, draws, kicks and docks |
| 5a | 530–700 | WEEK 1: one card every ~36 frames |
| 5b | 690–910 | WEEK 4: the gap tightens from 20 to 15 frames |
| 5c | 900–1150 | MONTH 3: the flood again (every 7 → 6 frames), "+more" climbs 12 → 47 → 99+ |
| 6 | 1140–1420 | Overheat: faster than the cold open (every 5 → 4 frames), motion blur, shake, heat glow and shimmer, system alert, 6-frame freeze, "Clear all" burst |
| 7 | 1410–1800 | CTA: the heat floods the frame Hot Red; the final frame holds ~3s |

## Editing

- **Notifications:** `src/notifications.ts`.
  - Every card is `{frame, type, title, body}`. `cadence()` spaces the flood with a gap that tightens.
  - There are two runs, each its own stack. `OPEN_RUN` is the cold open; its cards have negative frames so the stack is already full on frame 0. `MAIN_RUN` is the story after the rewind.
  - `MOMENTS` holds the clock, date and chip after each time jump.
  - Each run's `counter` drives its "+N more" counter: the real hidden count until `from`, then the keyframes.
- **Timing:** `src/timeline.ts`. `SCENES` holds the scene ranges; `CUE` holds every cue as an absolute frame. `CUE.jumps` lists the time jumps, including the reversed rewind. `storyTime()` freezes time during the stillness.
- **Sound:** `src/sound.ts`, see below.
- **Look:** `src/theme.ts` holds the colours, springs and easing, the lock-screen and card layout, and the notification type → icon and tile colour map.

## Sound

The reel has a sound layer. All cues live as data in `src/sound.ts`, and `<SoundTrack>` plays each one in its own `<Sequence>` with `@remotion/media` `<Audio>`.

- **Pings:** each arrival pings. The pitch rises through the story: one lonely ping for mom, then C6 in Week 1, D6 in Week 4, E6 in the flood. The flood pings every other card at lower volume, so it builds like a beat instead of turning to noise.
- **Moves:** whooshes play on the time jumps, a falling stutter on the rewind, and a low thump when the pepper lands.
- **Overheat and the end:** a rumble swells under the overheat and cuts dead on the 6-frame freeze, so the stillness is real silence. Then a snap and swoosh on "Clear all", a boom on the red flood, and a final ping for the CTA card.

`scripts/make-sfx.py` synthesises every effect from sine waves and filtered noise. They're original and license-free, and deliberately generic: no real phone or OS notification sounds. Running it again produces identical files.

## How the stack works

`src/lib/stack.ts` computes a layout after every arrival.

- The newest card is on top. Up to 5 cards show in full, fewer if they would run past y 1520.
- Older cards fold into a grouped stack behind the last visible card (scale 0.94/0.88, opacity 0.6/0.3, 18px peeks), and their contents fade out.
- A card's position is its layout on arrival plus each later layout change, each springing in from the frame that caused it. So the stack glides even when arrivals overlap.
- `<NotificationStack>` reads the frame itself, so `<CameraMotionBlur>` can re-render it at sub-frame times during the overheat.

## Layout and safe zones

- Notification cards are 860px wide, at x 80–940. That keeps the right 140px clear (a centred 920px card would cross it).
- The notification area is y 620–1560, with "Illustrative example" just below.
- Only the decorative CTA waves sit in the bottom 320px.

## Brand files

- `public/logo-reversed.png` is the cream stand-in reversed logo: the supplied primary logo, keyed and recoloured. If you add `public/logo-reversed.svg`, it is used instead.
- The pepper is a single-stroke placeholder path traced from the logo. If you add `public/pepper-icon.svg`, its paths are drawn instead. Stroked paths work best, because the draw-on animation uses `strokeDashoffset`.
