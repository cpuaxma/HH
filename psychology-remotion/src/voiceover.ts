/**
 * The voiceover, line by line. `text` is exactly what is on screen (line breaks removed);
 * `voiced` is the same words with tashkeel where AI voices tend to misread them.
 * `at` / `end` are global frames taken from the on-screen cues, so the VO lands with the text.
 * `npm run vo` regenerates voiceover-script-ar.md and voiceover-guide.srt from this list.
 */
import {CUES, RIDE_LABELS, STAGES, TEXT} from './config';

export type VoLine = {at: number; end: number; text: string; voiced: string; note?: string};

const flat = (s: string) => s.replace(/\n/g, ' ');
const label = (k: string) => RIDE_LABELS.find((l) => l.stage === k)!;
const word = (k: string) => STAGES.find((s) => s.key === k)!.word!;
const c = CUES;

const ride: [string, string, string?][] = [
  ['optimism', 'تَفاؤُل', 'warm, hopeful'],
  ['excitement', 'حَماس', 'brighter, quicker'],
  ['thrill', 'إثارة', 'breathless'],
  ['euphoria', 'نَشْوة', 'stretched, almost laughing'],
];
const drop: [string, string, string?][] = [
  ['anxiety', 'قَلَق', 'uneasy'],
  ['denial', 'إنْكار', 'dismissive'],
  ['fear', 'خَوْف', 'tight'],
  ['panic', 'ذُعْر', 'sharp'],
  ['capitulation', 'اسْتِسْلام', 'giving up, falling'],
];
const recover: [string, string, string?][] = [
  ['hope', 'أَمَل', 'soft, first warmth'],
  ['relief', 'ارْتِياح', 'exhale'],
  ['optimism2', 'تَفاؤُل', 'steady, calm'],
];
const labels = (list: [string, string, string?][]) =>
  list.map(([k, voiced, note]) => ({at: label(k).at - 4, end: label(k).out + 6, text: word(k), voiced, note}));

export const VO: VoLine[] = [
  {at: c.coldOpen.slam, end: c.coldOpen.text - 6, text: TEXT.coldOpen.word, voiced: 'ذُعْر!', note: 'a gasp, not a shout'},
  {at: c.coldOpen.text, end: c.coldOpen.textExit + 10, text: flat(TEXT.coldOpen.line.text), voiced: 'هل شَعَرْتَ بهذا من قَبْل؟', note: 'close to the mic'},
  {at: c.rewind.text, end: c.rewind.textExit + 12, text: flat(TEXT.rewind.line.text), voiced: 'لِنَبْدَأْ من البِداية.', note: 'calm reset'},
  {at: c.question.text1, end: c.question.text2 - 2, text: flat(TEXT.question.line1.text), voiced: 'لماذا يَشْتَري النّاسُ في القِمّة...'},
  {at: c.question.text2, end: c.question.exit + 10, text: flat(TEXT.question.line2.text), voiced: '...ويَبيعونَ في القاع؟'},
  ...labels(ride),
  {at: c.ride.peakCallout, end: c.ride.peakCalloutExit + 6, text: `${TEXT.ride.peakCallout}... ${TEXT.ride.peakTag}`, voiced: 'هُنا يَشْتَري الأَغْلَبيّة... أَعْلى مُخاطَرة.', note: 'near whisper: the music is almost silent here'},
  ...labels(drop),
  {at: label('despondency').at - 12, end: c.ride.bottomCallout + 2, text: word('despondency'), voiced: 'إحْباط.', note: 'heavy, slow'},
  {at: c.ride.bottomCallout + 4, end: c.ride.bottomCalloutExit + 6, text: `${TEXT.ride.bottomCallout}... ${TEXT.ride.bottomTag}`, voiced: 'هُنا يَبيعُ الأَغْلَبيّة... أَكْبَرُ فُرْصة.', note: 'quiet, then a turn of hope on the last two words'},
  ...labels(recover),
  {at: c.reveal.text1, end: c.reveal.text1Exit + 6, text: flat(TEXT.reveal.line1.text), voiced: 'هذه دَوْرةُ مَشاعِرِ المُسْتَثْمِر.', note: 'the reveal: slower'},
  {at: c.reveal.text2, end: c.reveal.text2Exit + 8, text: flat(TEXT.reveal.line2.text), voiced: 'والسّوقُ يُكَرِّرُها... مَرّةً بَعْدَ مَرّة.'},
  {at: c.crowd.text1, end: c.crowd.text2 - 1, text: flat(TEXT.crowd.line1.text), voiced: 'العاطِفةُ تَشْتَري غالِياً...'},
  {at: c.crowd.text2, end: c.crowd.exit + 6, text: flat(TEXT.crowd.line2.text), voiced: '...وتَبيعُ رَخيصاً.'},
  {at: c.quote.text1, end: c.quote.text1Exit + 4, text: flat(TEXT.quote.line1.text), voiced: 'كُنْ خائِفاً حينَ يَطْمَعُ الآخَرون...', note: 'quoting: measured'},
  {at: c.quote.text2, end: c.quote.attribution + 10, text: flat(TEXT.quote.line2.text), voiced: '...وطَمّاعاً حينَ يَخافون.'},
  {at: c.quote.attribution + 12, end: c.quote.exit + 8, text: TEXT.quote.attribution, voiced: 'وارِن بافيت.'},
  {at: c.lesson.text1, end: c.lesson.text2 - 1, text: flat(TEXT.lesson.line1.text), voiced: 'تَحَكَّمْ بِمَشاعِرِك...'},
  {at: c.lesson.text2, end: c.lesson.exit + 6, text: flat(TEXT.lesson.line2.text), voiced: '...قَبْلَ أنْ تَتَحَكَّمَ بِأَمْوالِك.'},
  {at: c.cta.text, end: c.cta.footnote + 26, text: flat(TEXT.cta.line.text), voiced: 'تابِعْنا لِتَتَعَلَّمَ الاسْتِثْمارَ بِعَقْلٍ هادِئ.'},
  {at: c.cta.footnote + 30, end: 1346, text: TEXT.cta.footnote, voiced: 'مُحْتَوى تَعْليميّ، وليسَ نَصيحةً اسْتِثْماريّة.', note: 'quick and low, optional'},
];
