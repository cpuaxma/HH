import React from 'react';
import {BULL_CANDLES} from '../components/Candles';
import {MarketScene} from '../components/MarketScene';
import {COLORS} from '../constants';

/** 2) Bull market — green candles grow, the bull rises on the right, counter ticks up to +٢٠٪. */
export const BullMarket: React.FC = () => (
  <MarketScene
    cfg={{
      kind: 'bull',
      titleLead: 'السوق',
      titleKey: 'الصاعد',
      latin: 'Bull Market',
      color: COLORS.green,
      candles: BULL_CANDLES,
      target: 20,
      refLabel: 'أدنى مستوى',
      moods: ['تفاؤل', 'ثقة'],
    }}
  />
);
