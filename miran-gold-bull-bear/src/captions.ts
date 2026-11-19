/**
 * Arabic captions synced to the voice-over.
 *
 * - `start` / `end` are in seconds from the start of the video.
 * - Wrap key words in *asterisks* to highlight them in gold.
 * - `onScreen: true` means the scene already shows this line as big on-screen
 *   text, so the caption band stays empty for it (no duplicate text).
 *
 * The timings are estimates for a natural reading pace. After you add your
 * recorded voiceover.mp3, scrub it in `npm run dev` and nudge these numbers
 * so each line appears as it is spoken.
 */
export type Caption = {start: number; end: number; text: string; onScreen?: boolean};

export const CAPTIONS: Caption[] = [
  // 1) Hook (0–3s)
  {start: 0.0, end: 1.0, text: '*ثور* أم *دب*؟', onScreen: true},
  {start: 1.0, end: 3.0, text: 'فهمك لهذا الفرق قد يحميك من *خسارة كبيرة!*'},

  // 2) Bull market (3–13s)
  {start: 3.0, end: 4.7, text: '*السوق الصاعد* (Bull Market)'},
  {start: 4.7, end: 7.0, text: 'هو *ارتفاع* الأسعار بنسبة *٢٠٪* أو أكثر'},
  {start: 7.0, end: 8.3, text: 'عن *أدنى مستوى* لها،'},
  {start: 8.3, end: 9.9, text: 'ويسود *التفاؤل* و*الثقة*.'},
  {start: 9.9, end: 11.1, text: 'سُمّي *بالثور*'},
  {start: 11.1, end: 13.0, text: 'لأنه يضرب بقرنيه *إلى الأعلى*.'},

  // 3) Bear market (13–23s)
  {start: 13.0, end: 15.0, text: 'أما *السوق الهابط* (Bear Market)'},
  {start: 15.0, end: 17.2, text: 'فهو *هبوط* الأسعار بنسبة *٢٠٪* أو أكثر'},
  {start: 17.2, end: 18.5, text: 'عن *أعلى مستوى* لها،'},
  {start: 18.5, end: 19.8, text: 'ويسيطر *الخوف*.'},
  {start: 19.8, end: 21.0, text: 'سُمّي *بالدب*'},
  {start: 21.0, end: 23.0, text: 'لأنه يضرب بمخالبه *إلى الأسفل*.'},

  // 4) Comparison (23–31s)
  {start: 23.2, end: 27.0, text: 'في الصاعد: *ثقة* و*طلب قوي*.'},
  {start: 27.0, end: 31.0, text: 'وفي الهابط: *خوف* و*بيع كثير*.'},

  // 5) What to do (31–39s)
  {start: 31.0, end: 33.8, text: 'في السوق الصاعد، اتبع *الاتجاه* وضع *وقف خسارة*.'},
  {start: 33.8, end: 36.3, text: 'وفي الهابط، قلّل *المخاطر* وتحلَّ *بالصبر*.'},
  {start: 36.3, end: 39.0, text: 'لا يوجد سوق سيئ، بل متداول غير مستعد!', onScreen: true},

  // 6) Outro (39–45s)
  {start: 39.2, end: 41.6, text: 'انضم إلى قناتنا على *تيليجرام*'},
  {start: 41.6, end: 44.6, text: 'وتابعنا للمزيد من *التعليم* و*التحديثات!*'},
];
