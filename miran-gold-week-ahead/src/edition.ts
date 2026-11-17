import edition20261123 from './editions/2026-11-23/edition.json';

export type Caption = {l1: string; l2: string; oneLine?: boolean};
export type Bar = {label: string; value: number | null; display?: string};

export type Edition = {
  id: string;
  fileName: string;
  datePill: string;
  nextWeekTab: string;
  days: {key: string; ar: string; date: string; holiday?: boolean; shortDay?: boolean}[];
  disclaimer: string;
  price: {
    label: string;
    latest: number;
    latestAsOf: string;
    record: number;
    recordDate: string;
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
    gdp: {title: string; subtitle: string; unit: string; bars: Bar[]};
    pce: {title: string; subtitle: string; last: number; lastLabel: string; target: number; targetLabel: string; max: number};
    chip: {label: string; time: string};
    source: string;
  };
  chain: {tag: string; up: {header: string; steps: string[]}; down: {header: string; steps: string[]}};
  holiday: {
    thu: {day: string; title: string; detail: string; stamp: string};
    fri: {day: string; title: string; detail: string; time: string; timeZone: string};
    liquidityLabel: string;
    liquidity: number[];
    tag: string;
    source: string;
  };
  nfp: {
    day: string;
    time: string;
    timeZone: string;
    title: string;
    ticker: string;
    subtitle: string;
    bars: Bar[];
    source: string;
    nodes: string[];
    centre: string;
  };
  captions: Record<string, Caption>;
  outro: {l1: string; l2: string; brand: string; cta: string; disclaimer: string};
};

export type IconName = 'gauge' | 'calendarOff' | 'briefcase' | 'calendar' | 'clock' | 'chart' | 'book' | 'plane';

export const EDITIONS: Record<string, Edition> = {
  '2026-11-23': edition20261123 as Edition,
};

export const DEFAULT_EDITION = '2026-11-23';
