import {continueRender, delayRender, staticFile} from 'remotion';

// Heavy didone for the shop name, matching the poster's "COOKIELICIUS" lockup.
export const SERIF = 'Bodoni Moda';

const handle = delayRender('Loading Bodoni Moda');
const face = new FontFace(SERIF, `url(${staticFile('fonts/bodoni-moda-latin-800-normal.woff2')})`, {
	weight: '800',
});
face
	.load()
	.then((f) => {
		document.fonts.add(f);
		continueRender(handle);
	})
	.catch((err) => {
		console.error(err);
		continueRender(handle);
	});
