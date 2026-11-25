// The voiceover guide: one line per on-screen text, same words (numbers written out, tashkeel on
// the words TTS voices tend to misread), timed to when the text appears.
import {BEATS, TEXT} from '../config';
import {PLAN} from '../arena/plan';

export type VoLine = {from: number; to: number; screen: string; spoken: string};

const SPOKEN_TRAPS: Record<string, string> = {
  'الدخول بلا خطة': 'الدُّخولُ بِلا خُطَّة',
  'التداول بلا\nوقف خسارة': 'التَّداوُلُ بِلا وَقْفِ خَسارة',
  'رافعة مالية مفرطة': 'رافِعَةٌ مالِيَّةٌ مُفْرِطَة',
  'التداول الانتقامي\nبعد الخسارة': 'التَّداوُلُ الانْتِقامِيُّ بَعْدَ الخَسارة',
  'الخوف من\nتفويت الفرصة': 'الخَوْفُ مِنْ تَفْويتِ الفُرْصَة',
  'التداول\nعلى الإشاعات': 'التَّداوُلُ عَلى الإشاعات',
};

export const VO: VoLine[] = [
  {from: BEATS.hookLine1, to: BEATS.hookLine2 - 4, screen: TEXT.hook1.replace('\n', ' '), spoken: 'مِئَةُ مُتَداوِلٍ دَخَلوا السّوق...'},
  {from: BEATS.hookLine2, to: 96, screen: TEXT.hook2.replace('\n', ' '), spoken: '...كَمْ بَقِيَ مِنْهُم؟'},
  {from: BEATS.setupText - 4, to: 150, screen: TEXT.setup.replace('\n', ' '), spoken: 'مُعْظَمُهُم ارْتَكَبَ الأَخْطاءَ نَفْسَها'},
  ...PLAN.traps.map((t) => ({
    from: t.start + 6,
    to: t.start + t.len - 12,
    screen: t.def.title.replace('\n', ' '),
    spoken: SPOKEN_TRAPS[t.def.title] ?? t.def.title.replace('\n', ' '),
  })),
  {from: BEATS.revealText, to: 836, screen: TEXT.reveal.replace('\n', ' '), spoken: 'ثَلاثَةٌ مِنْ كُلِّ أَرْبَعَة... خَسِروا'},
  {from: BEATS.habitAt[0], to: BEATS.habitAt[1] - 1, screen: TEXT.habits[0].replace('\n', ' '), spoken: 'خُطَّةٌ واضِحَةٌ قَبْلَ كُلِّ صَفْقَة'},
  {from: BEATS.habitAt[1], to: BEATS.habitAt[2] - 1, screen: TEXT.habits[1].replace('\n', ' '), spoken: 'وَقْفُ خَسارَة... دائِماً'},
  {from: BEATS.habitAt[2], to: BEATS.habitAt[3] - 1, screen: TEXT.habits[2].replace('\n', ' '), spoken: 'مُخاطَرَةٌ صَغيرَةٌ في كُلِّ صَفْقَة'},
  {from: BEATS.habitAt[3], to: 992, screen: TEXT.habits[3].replace('\n', ' '), spoken: 'انْضِباط... لا عاطِفَة'},
  {from: BEATS.arrowText, to: 1068, screen: TEXT.arrow.replace('\n', ' '), spoken: 'كُنْ مِنَ القِلَّةِ الَّتي تَبْقى'},
  {from: BEATS.ctaText, to: 1160, screen: TEXT.cta.replace('\n', ' '), spoken: 'تابِعْنا لِتَتَداوَلَ بِعَقْلِيَّةِ المُحْتَرِفين'},
];
