# Hot Pepper Media: "POV: You Hired Hot Pepper Media"

A 30-second vertical reel (1080×1920, 60fps, 1800 frames) built in Remotion. The full frame is the viewer's own lock screen. It starts dead quiet with one sad notification. After they hire Hot Pepper Media, notifications arrive slowly, then faster, then in a flood. At the peak the phone overheats red, and the red floods into the CTA.

```
npm install
npm run studio            # preview and scrub in the browser
npm run stills            # QA stills at 2.5s, 5.5s, 9s, 15s, 19.5s, 22.5s, 28s → out/stills
npm run render            # → out/hpm-pov.mp4 (H.264, CRF 18)
```

Rendering goes frame by frame through `remotion render`. To use a Chrome or Chromium you already have, add `--browser-executable=/path/to/chrome` to the render, or set `REMOTION_BROWSER` for `npm run stills`. Montserrat 500/600/700/800 is bundled locally from `@fontsource/montserrat`. All icons come from `lucide-react`.

The lock screen and notifications are generic: no real app names, logos or OS branding. All usernames are fictional.

## Scenes (frames at 60fps; the overlaps are intentional)

| # | Frames | Beat |
|---|---|---|
| 1 | 0–210 | The quiet phone: DAY 1, one notification from mom |
| 2 | 200–400 | The hire: the pepper drops, draws in red, kicks and docks in the status bar |
| 3a | 390–640 | WEEK 1: one card every ~40 frames |
| 3b | 630–900 | WEEK 4: the gap tightens from 22 to 16 frames |
| 3c | 890–1230 | MONTH 3: the flood (every 8 → 6 frames), "+more" climbs 12 → 47 → 99+ |
| 4 | 1220–1500 | Overheat: motion blur, shake, heat glow and shimmer, system alert, 6-frame freeze, "Clear all" burst |
| 5 | 1490–1800 | CTA: the heat floods the frame Hot Red |

## Editing

- **Notifications:** `src/notifications.ts`.
  - Every card is `{frame, type, title, body}`. `cadence()` spaces the flood with a gap that tightens.
  - `MOMENTS` holds the clock, date and chip after each time jump.
  - `COUNTER_KEYS` drives the "+N more" counter during the flood. Before the flood it shows the real hidden count.
- **Timing:** `src/timeline.ts`. `SCENES` holds the scene ranges; `CUE` holds every cue as an absolute frame. `storyTime()` freezes time during the stillness.
- **Look:** `src/theme.ts` holds the colours, springs and easing, the lock-screen and card layout, and the notification type → icon and tile colour map.

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
