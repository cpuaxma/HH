/**
 * The voiceover, line by line, timed to the video. `text` is the on-screen wording without the
 * "..." ellipses (they trip up AI voices), and sentences that appear in two halves on screen are
 * read as one line. `voiced` is the same words with tashkeel where AI voices tend to misread them.
 * `at` / `end` are global frames: each line starts when its text appears and may run until just
 * before the next line, so every line has room to be said at a natural pace.
 * `npm run vo` regenerates voiceover-script-ar.md and voiceover-guide.srt from this list.
 */
import {CUES, RIDE_LABELS, STAGES, TEXT} from './config';

export type VoLine = {at: number; end: number; text: string; voiced: string; note?: string};

/** on-screen text as one spoken line: no line breaks, no "...", halves joined with a comma */
const clean = (...parts: string[]) =>
  parts
    .map((p) => p.replace(/\n/g, ' ').replace(/\.\.\./g, ' ').replace(/\s+/g, ' ').trim())
    .join('، ')
    .replace(/ ،/g, '،');
const label = (k: string) => RIDE_LABELS.find((l) => l.stage === k)!;
const word = (k: string) => STAGES.find((s) => s.key === k)!.word!;
const c = CUES;

/** a single emotion word on the ride: from just before it lands until just before the next one */
const w = (k: string, voiced: string, end: number, note?: string): VoLine => ({at: label(k).at - 4, end, text: word(k), voiced, note});

export const VO: VoLine[] = [
  {at: c.coldOpen.slam, end: 26, text: TEXT.coldOpen.word, voiced: 'ذُعْر!', note: 'a gasp, not a shout'},
  {at: c.coldOpen.text, end: 88, text: clean(TEXT.coldOpen.line.text), voiced: 'هل شَعَرْتَ بهذا من قَبْل؟', note: 'close to the mic'},
  {at: c.rewind.text, end: 160, text: clean(TEXT.rewind.line.text), voiced: 'لِنَبْدَأْ من البِداية.', note: 'calm reset'},
  {at: c.question.text1, end: 254, text: clean(TEXT.question.line1.text, TEXT.question.line2.text), voiced: 'لماذا يَشْتَري النّاسُ في القِمّة، ويَبيعونَ في القاع؟', note: 'one breath, lift on القمة, drop on القاع'},
  w('optimism', 'تَفاؤُل', 288, 'warm, hopeful'),
  w('excitement', 'حَماس', 318, 'brighter, quicker'),
  w('thrill', 'إثارة', 348, 'breathless'),
  w('euphoria', 'نَشْوة', 392, 'stretched, almost laughing'),
  {at: c.ride.peakCallout, end: 454, text: clean(TEXT.ride.peakCallout, TEXT.ride.peakTag), voiced: 'هُنا يَشْتَري الأَغْلَبيّة، أَعْلى مُخاطَرة.', note: 'near whisper: the music is almost silent here'},
  w('anxiety', 'قَلَق', 477, 'uneasy'),
  w('denial', 'إنْكار', 506, 'dismissive'),
  w('fear', 'خَوْف', 530, 'tight'),
  w('panic', 'ذُعْر', 554, 'sharp'),
  w('capitulation', 'اسْتِسْلام', 580, 'giving up, falling'),
  {at: 582, end: 604, text: word('despondency'), voiced: 'إحْباط.', note: 'heavy, slow'},
  {at: c.ride.bottomCallout + 2, end: 666, text: clean(TEXT.ride.bottomCallout, TEXT.ride.bottomTag), voiced: 'هُنا يَبيعُ الأَغْلَبيّة، أَكْبَرُ فُرْصة.', note: 'quiet, then a turn of hope on the last two words'},
  w('hope', 'أَمَل', 692, 'soft, first warmth'),
  w('relief', 'ارْتِياح', 720, 'exhale'),
  w('optimism2', 'تَفاؤُل', 760, 'steady, calm'),
  {at: c.reveal.text1, end: 834, text: clean(TEXT.reveal.line1.text), voiced: 'هذه دَوْرةُ مَشاعِرِ المُسْتَثْمِر.', note: 'the reveal: slower'},
  {at: c.reveal.text2, end: 908, text: clean(TEXT.reveal.line2.text).replace('يكرّرها مرة', 'يكرّرها، مرة'), voiced: 'والسّوقُ يُكَرِّرُها، مَرّةً بَعْدَ مَرّة.'},
  {at: c.crowd.text1, end: 992, text: clean(TEXT.crowd.line1.text, TEXT.crowd.line2.text), voiced: 'العاطِفةُ تَشْتَري غالِياً، وتَبيعُ رَخيصاً.'},
  {at: 994, end: 1050, text: clean(TEXT.quote.line1.text), voiced: 'كُنْ خائِفاً حينَ يَطْمَعُ الآخَرون،', note: 'quoting: measured'},
  {at: c.quote.text2, end: 1088, text: clean(TEXT.quote.line2.text), voiced: 'وطَمّاعاً حينَ يَخافون.'},
  {at: 1090, end: 1124, text: TEXT.quote.attribution, voiced: 'وارِن بافيت.'},
  {at: c.lesson.text1, end: 1208, text: clean(TEXT.lesson.line1.text, TEXT.lesson.line2.text), voiced: 'تَحَكَّمْ بِمَشاعِرِك، قَبْلَ أنْ تَتَحَكَّمَ بِأَمْوالِك.', note: 'slow and certain: the takeaway'},
  // the Miran Gold outro is in English, so its line is read in English, as on screen
  {at: c.cta.text, end: 1346, text: `${TEXT.cta.line1.text} ${TEXT.cta.line2.text}`, voiced: `${TEXT.cta.line1.text} ${TEXT.cta.line2.text}`, note: 'English, as on screen'},
];
