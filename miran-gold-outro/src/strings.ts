// Every on-screen string, per language. Edit here to change the outro's text.
export type Lang = 'en' | 'ar';

export const STRINGS: Record<Lang, {brand: string; button: string; disclaimer: string; dir: 'ltr' | 'rtl'}> = {
  en: {
    brand: 'Miran Gold',
    button: 'Join on Telegram',
    disclaimer: 'Educational content only. Not financial advice.',
    dir: 'ltr',
  },
  ar: {
    brand: 'ميران جولد',
    button: 'انضم على تيليجرام',
    disclaimer: 'محتوى تعليمي فقط وليس نصيحة مالية.',
    dir: 'rtl',
  },
};
