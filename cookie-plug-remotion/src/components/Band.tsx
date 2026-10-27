import React from 'react';
import {Band as BandName, BANDS, GROUP_LEFT, POSTER_W, S} from '../theme';

/** Box for one horizontal band of the poster, in canvas px. */
export const bandBox = (band: BandName) => {
	const b = BANDS[band];
	return {left: GROUP_LEFT, top: b.top, width: POSTER_W * S, height: (b.y1 - b.y0) * S};
};

/** Poster coords → px inside a band box. */
export const bandPx = (band: BandName, [x, y]: [number, number]) => [x * S, (y - BANDS[band].y0) * S] as const;

/** An SVG showing one band of the poster at scale S; children draw in poster pixel units. */
export const BandSvg: React.FC<{band: BandName; style?: React.CSSProperties; children: React.ReactNode}> = ({
	band,
	style,
	children,
}) => {
	const b = BANDS[band];
	return (
		<svg
			viewBox={`0 ${b.y0} ${POSTER_W} ${b.y1 - b.y0}`}
			style={{position: 'absolute', ...bandBox(band), overflow: 'visible', ...style}}
		>
			{children}
		</svg>
	);
};
