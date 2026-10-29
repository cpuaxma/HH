# نص التعليق الصوتي (عربي): لماذا ينخفض الذهب رغم الأزمات؟

The Arabic voiceover for `out/gold-falling-crisis-ar.mp4` (about 47 seconds), written for an AI voice.

**Each line says exactly the text shown on screen.** The only changes are the ones speech needs:

- Numbers are written as words: ٥٬٦٠٠ → «خمسة آلاف وستّمئة», ٢٨٪ → «ثمانية وعشرين بالمئة», ٣ → «ثلاثة».
- «=» is said as «يعني».
- «…» and «:» become commas.
- The small «نصيحة» pill is read at the start of line 7.

Each scene was lengthened so its line can be said in full while its text is on screen. The chart beats, chain nodes and cards land when the voice names them.

## How it avoids the "robotic Arabic" sound

- **No symbols or Latin text.** AI voices read «٪», «=», «…» and «XAU/USD» unpredictably. Commas and full stops mark the pauses.
- **Numbers as words.** As digits, AI voices often read them in English or one digit at a time («خمسة ستة صفر صفر»).
- **Light tashkeel only.** Diacritics are added only where the AI could misread a word:
  - «الذَّهَب» is marked so it isn't read as «الذَّهاب» (going).
  - «قُرب» is marked so it isn't read as the verb «قرّب».
  - «فَقَد» is marked so it isn't read as the particle «فقد».
  - «دَوره» is marked so it is read as "its role".
  - «قمّة», «ستّمئة» and «ليوفّروا» carry a shadda.
  - «جُولد» is marked so it is read "gold/jold", not "jawlad".
  - Full tashkeel on every word makes AI voices sound like formal recitation, so it's left out.

## Script

| # | Place at | Must end by | Voiceover |
|---|---|---|---|
| 1 | 0:00.1 | 0:03.4 | أزمات وتوترات حول العالم، فلماذا ينخفض الذَّهَب؟ |
| 2 | 0:03.5 | 0:13.2 | سجّل الذَّهَب قمّة قُرب خمسة آلاف وستّمئة دولار في يناير. واليوم يتداول قُرب أربعة آلاف دولار، أقل بنحو ثمانية وعشرين بالمئة. |
| 3 | 0:13.3 | 0:17.5 | التوترات رفعت النفط فوق مئة دولار للبرميل. |
| 4 | 0:17.6 | 0:23.7 | النفط الغالي يرفع التضخم في أمريكا. وفيدرالي يحارب التضخم، يعني توقعات برفع الفائدة. |
| 5 | 0:23.8 | 0:30.4 | فائدة أعلى، يعني دولار أقوى وعوائد أعلى. والذَّهَب لا يدفع فائدة، فتتجه الأموال بعيداً عنه. |
| 6 | 0:30.5 | 0:34.6 | وفي الذعر، يبيع المستثمرون الذَّهَب ليوفّروا السيولة. |
| 7 | 0:34.7 | 0:42.8 | نصيحة. الهبوط لا يعني أن الذَّهَب فَقَد دَوره. راقب ثلاثة أشياء، النفط، والتضخم، وقرار الفيدرالي القادم. |
| 8 | 0:42.9 | 0:46.5 | انضم إلى مجتمع ميران جُولد. الرابط في البايو. |

The disclaimer «محتوى تعليمي فقط وليس نصيحة مالية.» and the small chart labels stay on screen only.

## Text to paste (one clip per line)

```
أزمات وتوترات حول العالم، فلماذا ينخفض الذَّهَب؟
```
```
سجّل الذَّهَب قمّة قُرب خمسة آلاف وستّمئة دولار في يناير. واليوم يتداول قُرب أربعة آلاف دولار، أقل بنحو ثمانية وعشرين بالمئة.
```
```
التوترات رفعت النفط فوق مئة دولار للبرميل.
```
```
النفط الغالي يرفع التضخم في أمريكا. وفيدرالي يحارب التضخم، يعني توقعات برفع الفائدة.
```
```
فائدة أعلى، يعني دولار أقوى وعوائد أعلى. والذَّهَب لا يدفع فائدة، فتتجه الأموال بعيداً عنه.
```
```
وفي الذعر، يبيع المستثمرون الذَّهَب ليوفّروا السيولة.
```
```
نصيحة. الهبوط لا يعني أن الذَّهَب فَقَد دَوره. راقب ثلاثة أشياء، النفط، والتضخم، وقرار الفيدرالي القادم.
```
```
انضم إلى مجتمع ميران جُولد. الرابط في البايو.
```

## Tips

- **Make each line its own clip** and drop it at its "Place at" time. Eight short clips are easier to line up than one long take, and you can regenerate one line if a word comes out wrong.
- **If a clip runs past its "Must end by" time,** set the speed to 1.05–1.1 for that clip only. Line 2 is the longest and the most likely to need it.
- **Pick a native Arabic voice**, not an English voice in "multilingual" mode. English-first voices give Arabic a flat, foreign stress pattern, which is most of what makes it sound "AI".
- **Settings (ElevenLabs or similar):** stability around 40–50%, style low, speed 1.0. High stability makes Arabic sound monotone. Very low stability makes it overacted. Use the same voice and settings for all eight clips.
- **If one word sounds wrong,** add a diacritic to only that word and regenerate that line. Don't add diacritics everywhere.
- **Brand name:** if «ميران» comes out as "mayran", try «مِيران». If you say «جولد» with a hard G, try a few spellings and keep the one that matches how you say it.
- The video has no audio. If you add music, keep it about 15–18 dB below the voice.
