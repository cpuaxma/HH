# نص التعليق الصوتي (عربي): لماذا ينخفض الذهب رغم الأزمات؟

The Arabic voiceover for `out/gold-falling-crisis-ar.mp4` (38 seconds), written for an AI voice.

The on-screen text is written to be read, so some of it is too long or too formal to say in the time each scene allows. The voiceover says the same thing in shorter, spoken sentences. The exact figures (٢٨٪, the "=" lines) stay on screen only.

## How it avoids the "robotic Arabic" sound

- **Simple spoken Arabic, not textbook Arabic.** Short sentences, everyday words («لامس», «حوالي», «وقت الذعر»), and none of the stiff written connectors AI voices make sound like a news bulletin («حيث إن», «في ظل», «علاوة على ذلك»).
- **No case endings written at the stops.** No sentence ends on a word with tanween or a marked case ending, so the AI uses the natural pause form instead of a formal «ـُن / ـِن».
- **Light tashkeel only.** Diacritics are added only where the AI could misread a word:
  - «الذَّهَب» is marked so it isn't read as «الذَّهاب» (going).
  - «فَقَد» is marked so it isn't read as the particle «فقد».
  - «دَوره» is marked so it is read as "its role".
  - «ليوفّروا», «يردّ» and «ستّمئة» carry a shadda.
  - «جُولد» is marked so it is read "gold/jold", not "jawlad".
- **Numbers are written as words.** AI voices often read digits in English or one digit at a time («خمسة ستة صفر صفر»).
- **No symbols.** There is no «٪», «=», «…», «XAU/USD» or Latin text. Commas and full stops mark the pauses.

## Script

| # | Place at | Must end by | Voiceover | Notes |
|---|---|---|---|---|
| 1 | 0:00.1 | 0:02.9 | أزمات حول العالم، فلماذا ينخفض الذَّهَب؟ | Hook. The «؟» makes the voice rise at the end. |
| 2 | 0:03.0 | 0:07.9 | في يناير، لامس الذَّهَب خمسة آلاف وستّمئة دولار. اليوم، حوالي أربعة آلاف. | The tightest clip. Generate it at normal speed first. |
| 3 | 0:08.0 | 0:12.9 | التوترات رفعت سعر النفط فوق مئة دولار للبرميل. | Plenty of room. |
| 4 | 0:13.0 | 0:17.9 | النفط الغالي يرفع التضخم في أمريكا، والفيدرالي قد يردّ برفع الفائدة. | |
| 5 | 0:18.0 | 0:22.9 | فائدة أعلى تعني دولاراً أقوى. والذَّهَب لا يدفع فائدة، فتبتعد عنه الأموال. | |
| 6 | 0:23.0 | 0:27.9 | ووقت الذعر، يبيع المستثمرون الذَّهَب ليوفّروا السيولة. | Plenty of room. A slightly slower read suits it. |
| 7 | 0:28.0 | 0:33.2 | هذا لا يعني أن الذَّهَب فَقَد دَوره. راقب النفط، والتضخم، وقرار الفيدرالي. | If there's time left, you can add «القادم» at the end. |
| 8 | 0:33.3 | 0:37.0 | انضم إلى مجتمع ميران جُولد. الرابط في البايو. | Leave the last second silent. |

The disclaimer «محتوى تعليمي فقط وليس نصيحة مالية.» stays on screen only.

## Text to paste (one clip per line)

```
أزمات حول العالم، فلماذا ينخفض الذَّهَب؟
```
```
في يناير، لامس الذَّهَب خمسة آلاف وستّمئة دولار. اليوم، حوالي أربعة آلاف.
```
```
التوترات رفعت سعر النفط فوق مئة دولار للبرميل.
```
```
النفط الغالي يرفع التضخم في أمريكا، والفيدرالي قد يردّ برفع الفائدة.
```
```
فائدة أعلى تعني دولاراً أقوى. والذَّهَب لا يدفع فائدة، فتبتعد عنه الأموال.
```
```
ووقت الذعر، يبيع المستثمرون الذَّهَب ليوفّروا السيولة.
```
```
هذا لا يعني أن الذَّهَب فَقَد دَوره. راقب النفط، والتضخم، وقرار الفيدرالي.
```
```
انضم إلى مجتمع ميران جُولد. الرابط في البايو.
```

## Tips

- **Make each line its own clip** and drop it at its "Place at" time. Eight short clips are easier to line up than one long take, and you can regenerate one line if a word comes out wrong.
- **Pick a native Arabic voice**, not an English voice in "multilingual" mode. English-first voices give Arabic a flat, foreign stress pattern, which is most of what makes it sound "AI".
- **Settings (ElevenLabs or similar):** stability around 40–50%, style low, speed 1.0. High stability makes Arabic sound monotone. Very low stability makes it overacted. Use the same voice and settings for all eight clips.
- **If one word sounds wrong,** add a diacritic to only that word and regenerate that line. Adding diacritics everywhere makes the voice sound like formal recitation.
- **Brand name:** if «ميران» comes out as "mayran", try «مِيران». If you say «جولد» with a hard G, try a few spellings and keep the one that matches how you say it.
- **If clip 2 runs long,** drop «في يناير،». The date is on screen anyway.
- The video has no audio. If you add music, keep it about 15–18 dB below the voice.
