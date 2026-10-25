import React from 'react';
import {Chip, LotBadge} from '../components/Badges';
import {SideTag} from '../components/SideTag';
import {SpeechBubble} from '../components/SpeechBubble';
import {COPY, Lang} from '../i18n';
import {colors} from '../theme';
import {BEAT, BUBBLES, SCENES} from '../timeline';
import {POS} from './positions';

const FROM = SCENES.drop[0];
const l = (abs: number) => abs - FROM;

export const Scene3Drop: React.FC<{lang: Lang}> = ({lang}) => {
  const c = COPY[lang];
  return (
    <>
      <SpeechBubble lang={lang} lines={c.s3RayBubble} start={l(BUBBLES.ray3[0])} exit={l(BUBBLES.ray3[1])} tipX={POS.rayTip.x} tipY={POS.rayTip.y} x={POS.rayX} accent={colors.red} />
      <LotBadge
        steps={[
          {at: l(1040), n: 10},
          {at: l(BEAT.jab + 1), n: 20},
        ]}
        start={l(1040)}
        exit={l(1590)}
        x={POS.rayLot.x}
        y={POS.rayLot.y}
        punch
        color={colors.red}
        size={46}
      />
      <SideTag lang={lang} kind="x" lines={c.s3RayTag} start={l(1080)} exit={l(1590)} x={POS.rayX} color={colors.red} weight={600} />

      <Chip lang={lang} kind="x" text={c.slHit} start={l(BEAT.slHit)} exit={l(1200)} x={POS.chip.x} y={POS.chip.y} />
      <SpeechBubble lang={lang} lines={c.s3SamBubble} start={l(BUBBLES.sam3[0])} exit={l(BUBBLES.sam3[1])} tipX={POS.samTip.x} tipY={POS.samTip.y} x={POS.samX} accent={colors.goldFrom} />
      <SideTag lang={lang} kind="check" lines={c.s3SamTag} start={l(1270)} exit={l(1594)} x={POS.samX} />
    </>
  );
};
