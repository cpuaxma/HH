# نص التعليق الصوتي (عربي): لماذا انهارت الفضة؟

The Arabic voiceover for `out/silver-falling-ar.mp4` (about 42 seconds), written for an AI voice.

**The voice reads each scene's headline (the big text) word for word**, so it matches what the viewer is reading at that moment. The smaller second lines stay on screen as supporting text and aren't read aloud.

The only changes from the screen text are the ones speech needs:

- Numbers are written as words: ٦٠٪ → «ستين بالمئة», ١٢١ → «مئة وواحد وعشرين».
- «…» becomes a comma.
- The small «نصيحة» pill is read at the start of line 7.

Some animation beats are timed to the voice:
- **Scene 2:** the chart peaks as the voice says the price.
- **Scene 4:** each weight drops as its word is said.
- **Scene 6:** the sell order hits the pools on «بيع».

After the last line, the logo screen holds for about 3 seconds with no voice, leaving room for outro music.

## How it avoids the "robotic Arabic" sound

- **No symbols or Latin text.** AI voices read «٪», «…» and «XAG/USD» unpredictably. Commas and full stops mark the pauses.
- **Numbers as words.** As digits, AI voices often read them in English or one digit at a time.
- **Light tashkeel only.** Diacritics are added only where the AI could misread a word:
  - «الفِضّة» is marked so it isn't read with the wrong vowel.
  - «الذَّهَب» is marked so it isn't read as «الذَّهاب» (going).
  - «قُرب» is marked so it isn't read as the verb «قرّب».
  - «سجّلت», «قمّة» and «يحرّكه» carry a shadda.
  - «جُولد» is marked so it is read "gold/jold", not "jawlad".
  - Full tashkeel on every word makes AI voices sound like formal recitation, so it's left out.

## Script

| # | Place at | Must end by | Voiceover (= the headline on screen) |
|---|---|---|---|
| 1 | 0:00.0 | 0:03.6 | الفِضّة خسرت نحو ستين بالمئة من قمتها، فلماذا؟ |
| 2 | 0:03.6 | 0:09.2 | سجّلت الفِضّة قمّة قُرب مئة وواحد وعشرين دولاراً في يناير. |
| 3 | 0:09.3 | 0:14.0 | الذَّهَب هبط نحو ثمانية وعشرين بالمئة، والفِضّة نحو ستين بالمئة. |
| 4 | 0:14.1 | 0:19.0 | نفس ضغوط الذَّهَب، تضخم، وفائدة، ودولار أقوى. |
| 5 | 0:19.1 | 0:24.0 | لكن أكثر من نصف الطلب على الفِضّة صناعي. |
| 6 | 0:24.1 | 0:28.8 | سوق الفِضّة صغير، فأي بيع يحرّكه بقوة. |
| 7 | 0:28.9 | 0:35.6 | نصيحة. الفِضّة أكثر تقلباً من الذَّهَب. |
| 8 | 0:35.7 | 0:39.0 | انضم إلى مجتمع ميران جُولد. الرابط في البايو. |

**Outro music:** start it under line 8 or right after it. The final frame holds until 0:42.2. Between about 0:32 and 0:35.7 there is no headline on screen while the camera pulls back to show the whole story, which suits a music swell.

The disclaimer «محتوى تعليمي فقط وليس نصيحة مالية.», the price HUD and the chart labels stay on screen only.

## Text to paste (one clip per line)

```
الفِضّة خسرت نحو ستين بالمئة من قمتها، فلماذا؟
```
```
سجّلت الفِضّة قمّة قُرب مئة وواحد وعشرين دولاراً في يناير.
```
```
الذَّهَب هبط نحو ثمانية وعشرين بالمئة، والفِضّة نحو ستين بالمئة.
```
```
نفس ضغوط الذَّهَب، تضخم، وفائدة، ودولار أقوى.
```
```
لكن أكثر من نصف الطلب على الفِضّة صناعي.
```
```
سوق الفِضّة صغير، فأي بيع يحرّكه بقوة.
```
```
نصيحة. الفِضّة أكثر تقلباً من الذَّهَب.
```
```
انضم إلى مجتمع ميران جُولد. الرابط في البايو.
```

## Tips

- **Make each line its own clip** and drop it at its "Place at" time. Each clip starts just as its headline appears, so the voice and the words on screen line up.
- **Line 1 is the tightest.** If it runs past 0:03.6, set that clip's speed to 1.05–1.1.
- **Pick a native Arabic voice**, not an English voice in "multilingual" mode, and use the same voice as the gold reel so the series sounds consistent.
- **Settings (ElevenLabs or similar):** stability around 40–50%, style low, speed 1.0.
- **If one word sounds wrong,** add a diacritic to only that word and regenerate that line.
- **Music levels:** keep any music about 15–18 dB below the voice while it's speaking. In the pull-back and the outro it can come up.
