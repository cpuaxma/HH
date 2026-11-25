// Every on-screen caption, in order. Markup inside a line:
//   [text]  → an LTR run (number, %, $, ticker) wrapped in <bdi>, kept as one animated word.
// Line 2 is the accent line (gold gradient, or the chapter's lane colour).
import type {LaneKey} from './brand';

export type CaptionCue = {
  from: number;
  to: number;
  l1: string;
  l2: string;
  /** Frames after `from` at which line 2 starts (default: right after line 1). */
  l2Delay?: number;
  accent?: 'gold' | LaneKey;
};

export const CAPTIONS: CaptionCue[] = [
  {from: 60, to: 172, l1: 'قرار واحد من الفيد…', l2: 'ثلاث أسواق، ثلاث ردود فعل.', l2Delay: 60},
  {from: 180, to: 322, l1: 'الفيد رفع الفائدة في سبتمبر', l2: 'لأول مرة منذ [2023].'},
  {from: 330, to: 472, l1: 'والسوق يتوقع', l2: 'رفعاً جديداً في ديسمبر.'},
  {from: 480, to: 592, l1: 'رفع الفائدة يعني:', l2: 'المال صار أغلى.', l2Delay: 30},
  {from: 600, to: 690, l1: 'لكن كل سوق', l2: 'يتأثر بطريقة مختلفة.'},
  {from: 720, to: 832, l1: '[NASDAQ]:', l2: 'الأكثر حساسية.', accent: 'nasdaq'},
  {from: 840, to: 952, l1: 'قيمة شركات التكنولوجيا', l2: 'مبنية على أرباح المستقبل.', accent: 'nasdaq'},
  {from: 960, to: 1100, l1: 'فائدة أعلى =', l2: 'أرباح المستقبل تساوي أقل اليوم.', accent: 'nasdaq'},
  {from: 1140, to: 1282, l1: '[S&P 500]:', l2: 'تأثر أهدأ.', accent: 'spx'},
  {from: 1290, to: 1460, l1: 'فيه بنوك تستفيد من الفائدة…', l2: 'وقطاعات تصمد.', accent: 'spx'},
  {from: 1500, to: 1612, l1: 'الذهب', l2: 'لا يعطيك فائدة.'},
  {from: 1620, to: 1740, l1: 'عندما ترتفع العوائد والدولار…', l2: 'يفقد جاذبيته.'},
  {from: 1770, to: 1880, l1: 'هذا ما رأيناه', l2: 'في نوفمبر.'},
  {from: 1890, to: 2002, l1: 'لكن السوق يتحرك على التوقعات،', l2: 'لا على القرار.'},
  {from: 2010, to: 2150, l1: 'قرار أخفّ من المتوقع؟', l2: 'قد ينقلب كل شيء.'},
  {from: 2190, to: 2336, l1: 'فهمك للعلاقة =', l2: 'استعداد أفضل قبل القرار.'},
  {from: 2370, to: 2452, l1: 'قرار الفيد القادم: ٩ ديسمبر.', l2: 'كن جاهزاً.'},
];
