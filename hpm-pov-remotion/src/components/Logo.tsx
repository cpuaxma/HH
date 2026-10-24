import React from 'react';
import {getStaticFiles, Img, staticFile} from 'remotion';

// Reversed (cream) Hot Pepper Media logo. Uses public/logo-reversed.svg when present,
// otherwise the cropped stand-in PNG (753×521).
const RATIO = 521 / 753;

export const LogoReversed: React.FC<{width: number; style?: React.CSSProperties}> = ({width, style}) => {
  const svg = getStaticFiles().find((f) => f.name === 'logo-reversed.svg');
  return <Img src={svg ? svg.src : staticFile('logo-reversed.png')} style={{width, height: width * RATIO, objectFit: 'contain', display: 'block', ...style}} />;
};
