---
name: video-shotcraft
description: Planning and executing the shots of a short vertical motion-graphics reel (Reels/TikTok/Shorts) so it reads as filmed, not animated - beat sheet, shot list, camera moves with easing and speed ramps, cuts vs whip pans, impact frames, real motion blur, kinetic type timing, safe-zone composition, storyboard stills, and numeric checks on the camera path. Use when designing or reviewing the camera, timing or pacing of any video.
metadata:
  tags: cinematography, camera, shots, motion-blur, timing, storyboard, reels, motion-graphics
---

# Shotcraft for short vertical reels

The goal is a piece that feels shot on a real camera by someone with taste: motivated moves, decisive cuts, weight, and blur that looks like a shutter and not like a filter. Plan everything below on paper (in `data.ts`) before writing scene code.

## 1. Beat sheet first

Split the runtime into 4–6 acts. Each act has one job and one sentence of on-screen copy at most. A 25 s / 60 fps reel, for example:

| Frames | Act | Job |
|---|---|---|
| 0–360 | Hook / problem | Show the boring status quo fast. Movement and repetition. |
| 360–450 | Turn | One hard event: a stop, slam or reveal. The loudest frame of the piece. |
| 450–1080 | Proof | Three points, each with its own angle. Breathe between them. |
| 1080–1260 | Contrast | Pull back and restate the idea in two lines. |
| 1260–1500 | End card | Logo, line, CTA. **Hold the last 1 s still** so the loop point and cover work. |

- **The first 1.5 s decides the scroll.** Something must already be moving in frame 0. No fade-up from black.
- **Read time:** at least 0.4 s plus 0.3 s per word after a line finishes landing. A three-word line holds about 1.3 s (80 frames at 60 fps).
- Put each beat's frame in `T` in `data.ts`. Sound cues, cuts and type all key off the same numbers.

## 2. Shot list

Aim for at least 5 distinct shots. Vary at least two of these between neighbouring shots: **size** (wide / medium / macro), **height** (low / eye / high / overhead) and **side** (left 3/4, right 3/4, profile).

Write each shot as data:

```ts
{name: 'push-in', start: 342, end: 452, ease: 'inOut',
 from: {focus: [x, y] | 'centre', yaw: -8, pitch: 4, dist: 7.6, fov: 30, roll: 0, frameY: 960},
 to:   {...,                      yaw: -2, pitch: 2, dist: 5.5, fov: 30, roll: 0, frameY: 940},
 whipIn?: 16}   // frames of whip pan from the previous shot instead of a hard cut
```

- **Long lenses** (fov 24–35°) look like product photography. Wide FOVs look like a game engine.
- **`frameY`** puts the subject on the frame where the composition needs it: below the type band, above the bottom safe zone. Don't just centre it.
- **Every shot moves.** A slow push, drift or orbit of 2–6° keeps it alive, and a dead-static camera reads as a slide. The one exception is the final hold.
- **Motivate moves.** Push in when attention should narrow. Pull back to reveal context. Orbit to show form. Track to follow action.

## 3. Easing and speed ramps

- **Never ease linearly**, except a constant drift layered on top of an eased move.
- Use `inOut` (cubic or quint) for moves contained within a shot.
- Use **`out` (a speed ramp)** for a move that starts at a cut: it opens fast and settles. It's the single biggest "this was filmed" tell.
- For whip pans, ease **into** the whip from the previous shot's tail (`easeInOutQuint` across `whipIn` frames), and let the new shot's own move start already in motion. Don't stop and start again.
- **Keep it C¹ inside a shot.** Velocity must not jump except at hard cuts. Blend shot keys rather than switching parameters.
- **Layered life:** add a tiny noise-driven bob or wobble to the subject (≤ 0.5°), plus independent camera drift. Two slightly different frequencies feel handheld-premium; one feels mechanical.

## 4. Cuts, whips and impact

- **Hard cuts** land on beats: a sound cue, a word landing, a scroll stop. Cut on action where you can, with motion continuing across the cut in the same screen direction.
- Use **whip pans** (12–20 frames at 60 fps) between angles of the same subject when you want energy without a jarring jump. Give each one a whip sound cue about 3 frames before its centre.
- **The impact frame** for a slam, stop or hit:
  1. A **flash** for 1 frame at full strength and 1 frame at about 35%. Brighten and lift the frame; don't go white.
  2. A **shake** of 2–3 frames, decaying, at an amplitude of about 1.5% of the camera distance. Bigger shakes smear under motion blur and read as a glitch.
  3. A **zoom punch** of 5–8%, relaxing over about 15 frames.
  4. The subject's own **jolt**, which lags the camera by a frame.
- **Spring brakes:** use an analytic damped spring (ω ≈ 0.4 rad/frame, ζ ≈ 0.6) with a visible overshoot of about 5–10% of the travel. Fit the starting distance so the overshoot is an exact value. Keep the stop (velocity to about 0) under 5 frames and the full settle under 20.
- **Desaturate the world, keep the hero** after the turn. This is the visual "everything else disappears". Ramp it over about 12 frames, starting on the impact frame.

## 5. Motion blur that looks like a shutter

- Use a **180° shutter**: blur over half the frame interval, centred on the frame time.
- Blur 3D by **accumulation**: render K sub-frame samples of the whole scene (camera, subject, scroll and all) and average them in a half-float buffer.
  - Choose K by on-screen speed: 4 when still (as jittered anti-aliasing), 6 / 8 / 12 for medium, fast and whip.
  - Fill the gaps between samples with a short directional blur along the motion field fitted to the subject.
- **Never blur across a hard cut.** Clamp sample times to the current shot's range.
- **Still moments must be sharp.** When nothing moves, all samples share one instant and only the sub-pixel jitter differs.
- Blur 2D overlays with `@remotion/motion-blur` `CameraMotionBlur`, **only** in the windows where they move. Always-on blur softens type.
- Content inside a moving screen (a scrolling feed) gets its own blur along its velocity, inside the shader.

## 6. Kinetic type

- **Slam in:** scale from 1.6–1.8 to 1 on a spring with slight overshoot (ζ ≈ 0.45–0.5), with opacity reaching 1 in 3 frames. A 2–3° rotation that settles adds attitude.
- **Exit:** ease-in lift and fade over 8–12 frames. Finish the exit **before** a cut, never across it.
- **Hierarchy:** use one display face (heavy grotesk, for example Archivo Black) for the big words and one text face (Inter) for small type. Use one accent colour for one word or punctuation mark per line, not whole lines.
- **Vertical safe zones (Instagram):** keep out of the top 220 px, the bottom 400 px and the right 140 px. Keep type in a centred column with equal side margins, and give the type band its own vertical region so it never covers the subject.

## 7. Callouts and pointers

- Number them ("01 / 03") and give each its own shot or angle.
- **Leader lines** start from the card and end on the exact element, re-projected from 3D every frame so they stay locked while the camera moves. Draw the line on over about 12 frames, then pop the target dot with a small tick sound.
- Give lines a light halo (a white underlay) so they read over both dark and light content.

## 8. Finish

- **Grade:** warm shadows, a soft-knee highlight roll-off (no clipping on whites), and exact brand colours where they matter. Use unlit materials for brand-coloured backdrops so lighting can't shift them.
- **Grain:** subtle (overlay at 10–18%), changing every frame, at a fixed seed. **Vignette:** 10–15%, warm.

## 9. Storyboard before the build

1. Render 8–12 stills: one per act plus every impact frame and every callout. Use the draft prop (one sample) for speed.
2. Tile them with frame numbers and act labels into `docs/storyboard.png`, and show it to the user before building the rest.
3. Re-check composition at real size with a 100% crop of the most detailed frame. Screen text must be sharp at 1080 px wide.

## 10. Numeric checks on the camera

Sample the camera at every frame and compute second differences:

- position (divided by the camera distance), view direction (degrees) and roll (degrees);
- **skip pairs that span a hard cut**;
- report the top values and the maximum per shot.

The script just needs `cameraAt(f)` from your shot code (see `hpm-scroll-test-remotion/scripts/check-camera.ts`).

- **Expect** large values only in planned places: whips, the impact shake, an intentional snap. Anywhere else, a spike means a velocity discontinuity, usually two eases that don't meet or a key switch without blending.
- **The end hold must read exactly 0.**

After rendering, check the picture too:

- `remotion-render/scripts/check-frames.py` with `--cuts` (the hard-cut frames) and `--motion` (the whip and slam windows). Any big jump outside them is a bug.
- A contact sheet of the final at the storyboard frames, compared side by side with the storyboard.
