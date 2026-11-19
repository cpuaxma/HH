import React from 'react';
import {BEAR_CANDLES} from '../components/Candles';
import {MarketScene} from '../components/MarketScene';
import {COLORS} from '../constants';

/** 3) Bear market — red candles fall, the bear slides in from the left, counter drops to -٢٠٪. */
export const BearMarket: React.FC = () => (
  <MarketScene
    cfg={{
      kind: 'bear',
      titleLead: 'السوق',
      titleKey: 'الهابط',
      latin: 'Bear Market',
      color: COLORS.red,
      candles: BEAR_CANDLES,
      target: -20,
      refLabel: 'أعلى مستوى',
      moods: ['خوف'],
    }}
  />
);
