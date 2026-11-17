import edition20261123 from './editions/2026-11-23/edition.json';

export type Caption = {l1: string; l2: string; oneLine?: boolean};
export type Bar = {label: string; value: number | null; display?: string};

export type Edition = {
  id: string;
  fileName: string;
  datePill: string;
  nextWeekTab: string;
  days: {key: string; ar: string; date: string; holiday?: boolean; shortDay?: boolean}[];
  intro: {l1: string; l2: string};
  disclaimer: string;
  price: {
    label: string;
    latest: number;
    record: number;
    recordLabel: string;
    nowLabel: string;
    source: string;
    path: number[];
    pathTag: string;
  };
  stack: {icon: IconName; day: string; title: string}[];
  stackPill: string;
  wednesday: {
    day: string;
    time: string;
    timeZone: string;
    title: string;
    value: number;
    valueMonth: string;
    target: number;
    targetLabel: string;
    aboveLabel: string;
    nextMonth: string;
    alsoChip: string;
    source: string;
  };
  seesaw: {tag: string; driver: string; rates: string; dollar: string; gold: string};
  holiday: {
    thu: {day: string; stamp: string};
    fri: {day: string; chip: string};
    liquidityLabel: string;
    priceLabel: string;
    tag: string;
    source: string;
  };
  nfp: {day: string; time: string; timeZone: string; title: string; source: string};
  captions: Record<string, Caption>;
  outro: {l1: string; l2: string; brand: string; cta: string; disclaimer: string};
};

export type IconName = 'gauge' | 'calendarOff' | 'briefcase' | 'calendar' | 'clock' | 'chart' | 'book' | 'plane';

export const EDITIONS: Record<string, Edition> = {
  '2026-11-23': edition20261123 as Edition,
};

export const DEFAULT_EDITION = '2026-11-23';
