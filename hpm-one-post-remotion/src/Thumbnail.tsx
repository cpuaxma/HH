import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND, COLORS, FONT, THUMBNAIL} from './config';
import {Phone, PostCard} from './components/Art';
import {FontGate, FontSource} from './components/FontGate';
import {GrainVignette} from './components/Ambient';
import {CX, INNER_W} from './lib/layout';
import {fitSize, parseWord} from './lib/text';

const Cover: React.FC = () => {
  const l2 = THUMBNAIL.line2.map(parseWord);
  const size1 = fitSize([THUMBNAIL.line1], 104, INNER_W);
  const size2 = fitSize([l2.map((w) => w.text).join(' ')], 176, INNER_W);
  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      {/* blurred phone mockup */}
      <div style={{position: 'absolute', left: CX - 330, top: 250, transform: 'rotate(-9deg) scale(1.06)', filter: 'blur(10px)', opacity: 0.5}}>
        <Phone width={660} time="08:00">
          <div style={{position: 'absolute', left: 20, top: 124}}>
            <PostCard width={372} t={20} liked={1} />
          </div>
        </Phone>
      </div>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(72% 30% at 50% 47%, rgba(255,251,239,0.92) 0%, rgba(255,251,239,0.6) 70%, rgba(255,251,239,0) 100%), radial-gradient(120% 30% at 50% 108%, rgba(230,57,70,0.16) 0%, rgba(255,122,26,0.06) 40%, rgba(255,251,239,0) 70%)',
        }}
      />
      <div style={{position: 'absolute', left: CX - INNER_W / 2, width: INNER_W, top: 610, textAlign: 'center', fontFamily: FONT.family, color: COLORS.ink}}>
        <div style={{fontWeight: FONT.medium, fontSize: 38, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.orange, marginBottom: 26}}>
          {THUMBNAIL.kicker}
        </div>
        <div style={{fontWeight: FONT.bold, fontSize: size1, lineHeight: 1.02, letterSpacing: '-0.025em'}}>{THUMBNAIL.line1}</div>
        <div style={{fontWeight: FONT.bold, fontSize: size2, lineHeight: 1.0, letterSpacing: '-0.03em', display: 'inline-flex', gap: '0.22em'}}>
          {l2.map((w, i) => (
            <span key={i} style={{color: w.accent ? COLORS.red : COLORS.ink, textShadow: w.accent ? '0 0 40px rgba(230,57,70,0.2)' : undefined}}>
              {w.text}
            </span>
          ))}
        </div>
        <div style={{width: 150, height: 10, borderRadius: 5, background: COLORS.orange, margin: '34px auto 0'}} />
      </div>
      <Img src={staticFile(BRAND.logo)} style={{position: 'absolute', left: CX - 170, top: 1180, width: 340, height: 340 / BRAND.logoAspect}} />
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
