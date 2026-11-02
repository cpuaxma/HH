# نص التعليق الصوتي (عربي): لماذا انهارت الفضة؟

The Arabic voiceover for `out/silver-falling-ar.mp4` (42.2 seconds), written for an AI voice. This is the **longer version**: the voice talks through almost the whole video instead of only reading the headlines.

Each line has two parts:

1. **It starts with the scene's headline (the big text), word for word**, so the voice matches what the viewer is reading.
2. **It then adds a short follow-on** that matches the smaller second line or what the animation is doing at that moment:
   - «ثم انهارت» lands just after the chart has crashed.
   - «والتباطؤ يُضعفه» is said as the red slowdown wave sweeps across the circuit board.
   - «وتتوالى أوامر البيع» is said as the «بيع» dominoes fall.
   - «راقب…» is said as the three tip cards light up.

The video is unchanged. Each line was sized to its scene's window on the rendered timeline: from when its headline appears to when the next one appears. The estimates assume a typical AI voice pace (about 6–6.5 syllables a second).

## Script

| # | Place at | Max length | Voiceover | Estimated |
|---|---|---|---|---|
| 1 | 0:00.0 | 3.5 s | الفِضّة خسرت نحو ستين بالمئة من قمتها، فلماذا؟ | ~3.4 s |
| 2 | 0:03.6 | 5.6 s | سجّلت الفِضّة قمّة قُرب مئة وواحد وعشرين دولاراً في يناير، **ثم انهارت.** | ~5.1 s |
| 3 | 0:09.3 | 4.8 s | الذَّهَب هبط نحو ثمانية وعشرين بالمئة، والفِضّة نحو ستين بالمئة. | ~4.7 s |
| 4 | 0:14.2 | 4.8 s | نفس ضغوط الذَّهَب، تضخم وفائدة ودولار أقوى، **تسحب الأموال من الفِضّة.** | ~4.7 s |
| 5 | 0:19.1 | 4.9 s | لكن أكثر من نصف الطلب على الفِضّة صناعي، **والتباطؤ يُضعفه.** | ~4.5 s |
| 6 | 0:24.1 | 4.9 s | سوق الفِضّة صغير، فأي بيع يحرّكه بقوة، **وتتوالى أوامر البيع.** | ~4.8 s |
| 7 | 0:29.1 | 6.5 s | نصيحة. الفِضّة أكثر تقلّباً من الذَّهَب. **راقب التضخم والفائدة والطلب الصناعي.** | ~6.1 s |
| 8 | 0:35.7 | 4.5 s | انضم إلى مجتمع ميران جُولد. الرابط في البايو. | ~3.3 s |

Bold = the follow-on added after the headline. The rest of each line is the headline.

- **Line 7** runs into the camera pull-back. The tip scene is still on screen, shrinking into the story strip, so it still matches.
- **After line 8** the logo screen holds until 0:42.2, about 2 seconds of outro music on its own. The music can also play softly under the voice before that.
- **Not read aloud:** the disclaimer «محتوى تعليمي فقط وليس نصيحة مالية.», the price HUD and the chart labels stay on screen only.

## Text to paste (one clip per line)

```
الفِضّة خسرت نحو ستين بالمئة من قمتها، فلماذا؟
```
```
سجّلت الفِضّة قمّة قُرب مئة وواحد وعشرين دولاراً في يناير، ثم انهارت.
```
```
الذَّهَب هبط نحو ثمانية وعشرين بالمئة، والفِضّة نحو ستين بالمئة.
```
```
نفس ضغوط الذَّهَب، تضخم وفائدة ودولار أقوى، تسحب الأموال من الفِضّة.
```
```
لكن أكثر من نصف الطلب على الفِضّة صناعي، والتباطؤ يُضعفه.
```
```
سوق الفِضّة صغير، فأي بيع يحرّكه بقوة، وتتوالى أوامر البيع.
```
```
نصيحة. الفِضّة أكثر تقلّباً من الذَّهَب. راقب التضخم والفائدة والطلب الصناعي.
```
```
انضم إلى مجتمع ميران جُولد. الرابط في البايو.
```

## Making it fit exactly

- **Make each line its own clip** and drop it at its "Place at" time. Each clip starts as its headline appears.
- **Check each clip's length against "Max length".** Voices differ in pace, so a clip may come out a little long. In that order, either:
  1. Set that clip's speed to 1.05–1.1. This is barely noticeable and usually enough.
  2. Remove the bold follow-on from that line. The headline alone always fits.
- **If a clip comes out short,** leave the gap. A short pause before the next headline reads naturally.
- **Lines 3 and 6 are the fullest**, so check those first.

## Keeping it natural (not "robotic Arabic")

- **Numbers are written as words.** As digits, AI voices often read them in English or one digit at a time.
- **No symbols.** There is no «٪», «…», «:» or Latin text. Commas and full stops make the pauses.
- **Light tashkeel only.** Diacritics are added only where the AI could misread a word:
  - «الفِضّة» and «الذَّهَب» are marked so the AI uses the right vowels.
  - «قُرب» is marked so it isn't read as the verb «قرّب».
  - «يُضعفه» is marked so the AI reads it as "weakens it".
  - «سجّلت», «قمّة», «يحرّكه» and «تقلّباً» carry a shadda.
  - «جُولد» is marked so it is read "gold/jold".
- **Voice:** use a native Arabic voice, the same one as the gold reel. Stability around 40–50%, style low, speed 1.0 unless a clip needs the small speed-up above.
- **Music:** keep it about 15–18 dB below the voice while it's speaking. In the last 2 seconds it can come up to full level.
