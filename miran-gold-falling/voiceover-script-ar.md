# نص التعليق الصوتي (عربي): لماذا ينخفض الذهب رغم الأزمات؟

The Arabic voiceover for `out/gold-falling-crisis-ar.mp4` (about 42 seconds), written for an AI voice.

**The voice reads each scene's headline (the big text) word for word**, so it matches what the viewer is reading at that moment. The smaller second lines stay on screen as supporting text and aren't read aloud. In scenes 2, 4, 5 and 7, that line is «واليوم يتداول…», «وفيدرالي يحارب…», «والذهب لا يدفع…» and «راقب ٣ أشياء…».

The only changes from the screen text are the ones speech needs:

- Numbers are written as words: ٥٬٦٠٠ → «خمسة آلاف وستّمئة», ١٠٠ → «مئة».
- «=» is said as «يعني».
- «…» becomes a comma.
- The small «نصيحة» pill is read at the start of line 7.

After the last line, the outro holds for about 5 seconds with no voice, leaving room for outro music.

## How it avoids the "robotic Arabic" sound

- **No symbols or Latin text.** AI voices read «٪», «=», «…» and «XAU/USD» unpredictably. Commas and full stops mark the pauses.
- **Numbers as words.** As digits, AI voices often read them in English or one digit at a time.
- **Light tashkeel only.** Diacritics are added only where the AI could misread a word:
  - «الذَّهَب» is marked so it isn't read as «الذَّهاب» (going).
  - «قُرب» is marked so it isn't read as the verb «قرّب».
  - «فَقَد» is marked so it isn't read as the particle «فقد».
  - «دَوره» is marked so it is read as "its role".
  - «قمّة», «ستّمئة» and «ليوفّروا» carry a shadda.
  - «جُولد» is marked so it is read "gold/jold", not "jawlad".
  - Full tashkeel on every word makes AI voices sound like formal recitation, so it's left out.

## Script

| # | Place at | Must end by | Voiceover (= the headline on screen) |
|---|---|---|---|
| 1 | 0:00.1 | 0:03.4 | أزمات وتوترات حول العالم، فلماذا ينخفض الذَّهَب؟ |
| 2 | 0:03.5 | 0:09.1 | سجّل الذَّهَب قمّة قُرب خمسة آلاف وستّمئة دولار في يناير. |
| 3 | 0:09.2 | 0:14.0 | التوترات رفعت النفط فوق مئة دولار للبرميل. |
| 4 | 0:14.1 | 0:19.0 | النفط الغالي يرفع التضخم في أمريكا. |
| 5 | 0:19.1 | 0:24.1 | فائدة أعلى، يعني دولار أقوى وعوائد أعلى. |
| 6 | 0:24.2 | 0:29.0 | وفي الذعر، يبيع المستثمرون الذَّهَب ليوفّروا السيولة. |
| 7 | 0:29.1 | 0:34.3 | نصيحة. الهبوط لا يعني أن الذَّهَب فَقَد دَوره. |
| 8 | 0:34.4 | 0:37.5 | انضم إلى مجتمع ميران جُولد. الرابط في البايو. |

**Outro music:** start it under line 8 or right after it. The final frame holds until 0:42.2.

The disclaimer «محتوى تعليمي فقط وليس نصيحة مالية.» and the small chart labels stay on screen only.

## Text to paste (one clip per line)

```
أزمات وتوترات حول العالم، فلماذا ينخفض الذَّهَب؟
```
```
سجّل الذَّهَب قمّة قُرب خمسة آلاف وستّمئة دولار في يناير.
```
```
التوترات رفعت النفط فوق مئة دولار للبرميل.
```
```
النفط الغالي يرفع التضخم في أمريكا.
```
```
فائدة أعلى، يعني دولار أقوى وعوائد أعلى.
```
```
وفي الذعر، يبيع المستثمرون الذَّهَب ليوفّروا السيولة.
```
```
نصيحة. الهبوط لا يعني أن الذَّهَب فَقَد دَوره.
```
```
انضم إلى مجتمع ميران جُولد. الرابط في البايو.
```

## Tips

- **Make each line its own clip** and drop it at its "Place at" time. Each clip starts just as its headline appears, so the voice and the words on screen line up. You can also regenerate one line if a word comes out wrong.
- **Pick a native Arabic voice**, not an English voice in "multilingual" mode. English-first voices give Arabic a flat, foreign stress pattern, which is most of what makes it sound "AI".
- **Settings (ElevenLabs or similar):** stability around 40–50%, style low, speed 1.0. High stability makes Arabic sound monotone. Very low stability makes it overacted. Use the same voice and settings for all eight clips.
- **If one word sounds wrong,** add a diacritic to only that word and regenerate that line. Don't add diacritics everywhere.
- **Brand name:** if «ميران» comes out as "mayran", try «مِيران». If you say «جولد» with a hard G, try a few spellings and keep the one that matches how you say it.
- **Music levels:** keep any music about 15–18 dB below the voice while it's speaking. In the outro it can come up to full level.
