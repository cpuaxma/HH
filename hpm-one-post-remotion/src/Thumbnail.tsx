import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND, COLORS, FONT, THUMBNAIL} from './config';
import {Phone, PostCard} from './components/Art';
import {GridPaper} from './components/SceneShell';
import {FontGate, FontSource} from './components/FontGate';
import {GrainVignette} from './components/Ambient';
import {CX, INNER_W} from './lib/layout';
import {fitSize} from './lib/text';

const Cover: React.FC = () => {
  const size1 = fitSize([THUMBNAIL.line1], 100, INNER_W);
  const heroSize = fitSize([THUMBNAIL.hero], 420, INNER_W);
  const size3 = fitSize([THUMBNAIL.line3], 150, INNER_W);
  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      <GridPaper />
      {/* blurred phone mockup */}
      <div style={{position: 'absolute', left: CX - 330, top: 250, transform: 'rotate(-9deg) scale(1.06)', filter: 'blur(12px)', opacity: 0.4}}>
        <Phone width={660} time="08:00">
          <div style={{position: 'absolute', left: 20, top: 124}}>
            <PostCard width={372} t={20} liked={1} />
          </div>
        </Phone>
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(70% 32% at 50% 46%, rgba(253,251,246,0.9) 0%, rgba(253,251,246,0.5) 70%, rgba(253,251,246,0) 100%)'}} />
      <div style={{position: 'absolute', left: CX - INNER_W / 2, width: INNER_W, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, fontFamily: FONT.family, fontWeight: FONT.bold, letterSpacing: '-0.03em', color: COLORS.ink}}>
        <div style={{fontWeight: FONT.medium, fontSize: 38, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.red}}>{THUMBNAIL.kicker}</div>
        <div style={{fontSize: size1, lineHeight: 0.95}}>{THUMBNAIL.line1}</div>
        <div style={{fontSize: heroSize, lineHeight: 0.86, color: COLORS.red, letterSpacing: '-0.04em'}}>{THUMBNAIL.hero}</div>
        <div style={{fontSize: size3, lineHeight: 0.95}}>{THUMBNAIL.line3}</div>
      </div>
      <Img src={staticFile(BRAND.logo)} style={{position: 'absolute', left: CX - 150, top: 1250, width: 300, height: 300 / BRAND.logoAspect}} />
      <GrainVignette />
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC<{fontSource: FontSource}> = ({fontSource}) => (
  <AbsoluteFill style={{background: COLORS.bg}}>
    <FontGate source={fontSource}>
      <Cover />
    </FontGate>
  </AbsoluteFill>
);
