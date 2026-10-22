import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Sequence} from 'remotion';
import {BrandLine} from './components/BrandLine';
import {Grain} from './components/Grain';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {OneTeam} from './scenes/OneTeam';
import {Process} from './scenes/Process';
import {Services} from './scenes/Services';
import {COLORS, FONT} from './theme';
import {range, SCENES} from './timeline';

// Text is measured (fitText, word wrap), so nothing renders until Montserrat is loaded.
const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading Montserrat'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([500, 600, 800].map((w) => document.fonts.load(`${w} 40px '${FONT}'`)))
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

// Line icons draw in through a CSS dash driven by --dash (see LineIcon).
const ICON_CSS = `.hpm-icon svg * { stroke-dasharray: 100; stroke-dashoffset: var(--dash); }`;

export const HpmServices: React.FC = () => {
  const ready = useFonts();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.cream}}>
      <style>{ICON_CSS}</style>
      {ready ? (
        <>
          <BrandLine layer="under" />

          <Sequence {...range(SCENES.hook)} name="1 Hook">
            <Hook />
          </Sequence>
          <Sequence {...range(SCENES.oneTeam)} name="2 One team">
            <OneTeam />
          </Sequence>
          <Sequence {...range(SCENES.services)} name="3 Services">
            <Services />
          </Sequence>
          <Sequence {...range(SCENES.process)} name="4 Process">
            <Process />
          </Sequence>

          <BrandLine layer="over" />

          <Sequence {...range(SCENES.cta)} name="5 CTA">
            <Cta />
          </Sequence>
        </>
      ) : null}
      <Grain />
    </AbsoluteFill>
  );
};
