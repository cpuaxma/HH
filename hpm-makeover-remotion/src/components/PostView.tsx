import React from 'react';
import {COPY} from '../copy';
import {measureText} from '../fonts';
import {enter, mix, progress} from '../lib/anim';
import {POST, POST_TILE, SCREEN, tileRect} from '../lib/stage';
import {captionLine} from '../lib/sweeps';
import {CUE} from '../timeline';
import {CLIENT, EASE_IN, FONT, WEIGHT} from '../theme';
import {AFTER_PALETTES} from '../feed/palettes';
import {BrushReveal} from './BrushReveal';
import {ClientMark} from './ClientMark';
import {TileArt, TileTag} from './FeedGrid';
import {IconBookmark, IconChevronLeft, IconComment, IconHeart, IconSend} from './Icons';
import {TypeOn} from './TypeOn';

const CAPTION_SIZE = 25;
const LINE_H = 1.42;

// Where the strike-through crosses the old caption (box-local px).
export const strikeGeometry = () => {
  const handle = measureText(`${COPY.client.handle} `, `700 ${CAPTION_SIZE}px ${FONT.arial}`);
  const text = measureText(COPY.makeover.oldCaption, `400 ${CAPTION_SIZE}px ${FONT.arial}`);
  return {x0: handle - 3, x1: handle + text + 8, y: (CAPTION_SIZE * LINE_H) / 2 + 1};
};

// 0 → 1 as the post opens out of its tile, back to 0 as it closes.
export const postOpenness = (frame: number) =>
  Math.min(enter(frame, CUE.postOpen, 50), 1 - progress(frame, CUE.postClose, 30, EASE_IN));

// The single-post view used in 4b. Rendered above the profile layers, inside the phone.
export const PostView: React.FC<{frame: number}> = ({frame}) => {
  const o = postOpenness(frame);
  if (o <= 0) return null;
  const t = tileRect(POST_TILE);
  const img = {
    x: mix(t.x, POST.image.x, o),
    y: mix(t.y, POST.image.y, o),
    size: mix(t.size, POST.image.size, o),
  };
  const chrome = Math.max(0, (o - 0.35) / 0.65);
  const line = captionLine(frame, strikeGeometry());
  const swept = line?.sweptY;
  const textStyle: React.CSSProperties = {fontSize: CAPTION_SIZE, lineHeight: LINE_H};

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', inset: 0, background: CLIENT.oat, opacity: o}} />
      <div style={{opacity: chrome}}>
        <div style={{position: 'absolute', left: 18, top: 64, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.brand, fontWeight: WEIGHT.headline, fontSize: 25, color: CLIENT.espresso}}>
          <IconChevronLeft size={30} color={CLIENT.espresso} stroke={2.4} />
          {COPY.makeover.postsTitle}
        </div>
        <div style={{position: 'absolute', left: 24, top: 128, display: 'flex', alignItems: 'center', gap: 12}}>
          <ClientMark size={48} />
          <div style={{fontFamily: FONT.brand, color: CLIENT.espresso}}>
            <div style={{fontWeight: WEIGHT.headline, fontSize: 20}}>{COPY.client.handle}</div>
            <div style={{fontWeight: WEIGHT.body, fontSize: 15, color: CLIENT.sageDeep}}>{COPY.client.after.name}</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 24, top: 798, width: SCREEN.w - 48, display: 'flex', gap: 22, alignItems: 'center'}}>
          <IconHeart size={32} color={CLIENT.accent} filled stroke={2} />
          <IconComment size={30} color={CLIENT.espresso} stroke={2.2} />
          <IconSend size={30} color={CLIENT.espresso} stroke={2.2} />
          <div style={{flex: 1}} />
          <IconBookmark size={30} color={CLIENT.espresso} stroke={2.2} />
        </div>
        <div style={{position: 'absolute', left: POST.caption.x, top: POST.caption.y, width: POST.caption.w, height: POST.caption.h}}>
          <BrushReveal
            regions={[swept == null ? [] : [[-60, -60], [POST.caption.w + 60, -60], [POST.caption.w + 60, swept], [-60, swept]]]}
            before={
              <div style={{...textStyle, fontFamily: FONT.arial, color: '#6B6B6B'}}>
                <b style={{color: '#333'}}>{COPY.client.handle}</b> {COPY.makeover.oldCaption}
              </div>
            }
            after={
              <div style={{...textStyle, position: 'absolute', inset: -20, padding: 20, background: CLIENT.oat, fontFamily: FONT.brand, fontWeight: WEIGHT.body, color: CLIENT.espresso}}>
                <span style={{fontWeight: WEIGHT.headline}}>{COPY.client.handle}</span>{' '}
                <TypeOn frame={frame} text={COPY.makeover.newCaption} start={CUE.typeOn} cursorFrom={CUE.captionSweep + 6} />
              </div>
            }
          />
        </div>
      </div>
      <div style={{position: 'absolute', left: img.x, top: img.y, width: img.size, height: img.size, overflow: 'hidden'}}>
        <TileArt index={POST_TILE} state="after" />
        <TileTag text={COPY.makeover.tileText[POST_TILE]} onDark={AFTER_PALETTES[POST_TILE].bg === CLIENT.espresso} scale={mix(1, 2, o)} reveal={1} />
      </div>
    </div>
  );
};
