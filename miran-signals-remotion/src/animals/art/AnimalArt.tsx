// The line-art animals, drawn over the 3D studio (chart, phone) each frame as one SVG: a
// soft shadow and a line of light under whoever is standing, then the figures.
import {useCurrentFrame} from 'remotion';
import {AnimalsFormat, LAYOUT} from '../data';
import {ART_POSES, STAGE, groundGlow} from './poses';
import {drawShape, shapeDefs} from './render';
import {ART_SHAPES} from './shapes';

export const AnimalArt: React.FC<{fmt: AnimalsFormat}> = ({fmt}) => {
  const t = useCurrentFrame();
  const {width, height} = LAYOUT[fmt];
  const S = STAGE[fmt];
  const parts: string[] = [];
  for (const g of groundGlow(t, fmt)) {
    parts.push(
      `<ellipse cx="${g.x.toFixed(1)}" cy="${S.ground + 6}" rx="${(g.w * 0.62).toFixed(1)}" ry="${(g.w * 0.06 + 10).toFixed(1)}" fill="url(#art-shadow)" opacity="${(0.85 * g.k).toFixed(3)}"/>`,
      `<rect x="${(g.x - g.w * 0.7).toFixed(1)}" y="${S.ground - 1}" width="${(g.w * 1.4).toFixed(1)}" height="2.5" fill="url(#art-pedestal)" opacity="${(0.9 * g.k).toFixed(3)}"/>`,
    );
  }
  for (const a of ART_POSES) {
    const pose = a.at(t, fmt);
    if (!pose) continue;
    const shape = ART_SHAPES.find((s) => s.id === a.id)!;
    parts.push(drawShape(shape, pose, `art-${a.id}`));
  }
  const defs =
    ART_SHAPES.map((s) => shapeDefs(`art-${s.id}`)).join('') +
    `<defs><radialGradient id="art-shadow"><stop offset="0" stop-color="#000" stop-opacity="0.75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="art-pedestal"><stop offset="0" stop-color="#F3D27A" stop-opacity="0"/><stop offset="0.5" stop-color="#F3D27A" stop-opacity="0.85"/><stop offset="1" stop-color="#F3D27A" stop-opacity="0"/></linearGradient></defs>`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{position: 'absolute', inset: 0}}
      dangerouslySetInnerHTML={{__html: defs + parts.join('')}}
    />
  );
};
