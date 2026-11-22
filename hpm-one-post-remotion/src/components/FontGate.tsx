import React, {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {getInfo, loadFont} from '@remotion/google-fonts/Montserrat';
import {FONT} from '../config';

export type FontSource = 'google' | 'local';

/** Probe Google Fonts once (in calculateMetadata) so a dead network never stalls the render. */
export const resolveFontSource = async (): Promise<FontSource> => {
  if (FONT.source !== 'auto') return FONT.source;
  try {
    const url = getInfo().fonts.normal['800'].latin;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, {signal: ctrl.signal});
    clearTimeout(timer);
    return res.ok ? 'google' : 'local';
  } catch {
    return 'local';
  }
};

const loadLocal = async () => {
  for (const weight of [FONT.medium, FONT.bold]) {
    const face = new FontFace(FONT.family, `url(${staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`)}) format('woff2')`, {
      weight: String(weight),
    });
    await face.load();
    (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
  }
};

const loadGoogle = () =>
  loadFont('normal', {weights: [String(FONT.medium) as '500', String(FONT.bold) as '800'], subsets: ['latin']}).waitUntilDone();

/** Renders children only once Montserrat is ready, so text measuring is exact. */
export const FontGate: React.FC<{source?: FontSource; children: React.ReactNode}> = ({source = 'local', children}) => {
  const [handle] = useState(() => delayRender('Loading Montserrat'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (source === 'google' ? loadGoogle().catch(loadLocal) : loadLocal())
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle, source]);
  return ready ? <>{children}</> : null;
};
