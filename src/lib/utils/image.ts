/** Netlify's Image CDN: it resizes and re-encodes (AVIF or WebP when the browser supports it) on request. */
const ENDPOINT = '/.netlify/images';

/** The widths a picture is offered at, when a component does not choose its own. */
export const IMAGE_WIDTHS = [320, 640, 960, 1280, 1920];

export type ImageOptions = {
	/** The width to resize to, in px. */
	width?: number;
	/** 1-100. Lower is smaller. */
	quality?: number;
	/** How the picture fills a width and height: `cover`, `contain` or `fill`. */
	fit?: 'cover' | 'contain' | 'fill';
	/** Forces one format instead of choosing by what the browser supports. Needed for share images (`jpg`). */
	format?: 'avif' | 'webp' | 'jpg' | 'png';
	/** Height in px, with `fit`. */
	height?: number;
};

// SVG and GIF are not resized: SVG is already tiny and sharp, and a GIF would lose its frames.
const keeps = /\.(svg|gif)(\?|#|$)/i;
const outside = /^(data:|blob:|https?:|\/\/)/i;

/**
 * Whether a picture can go through the CDN: a file on this site, not an SVG or GIF. It is off for local dev and
 * local previews, where there is no CDN, and when `IMAGE_CDN=off` is set for the build.
 */
export function isOptimized(src: string | undefined): src is string {
	return __IMAGE_CDN__ && !!src && src.startsWith('/') && !outside.test(src) && !keeps.test(src);
}

/** The address of a picture at a size. Anything that cannot be optimized is returned as it is. */
export function imageUrl(
	src: string,
	{ width, height, quality = 75, fit, format }: ImageOptions = {}
) {
	if (!isOptimized(src)) return src;

	const params = new URLSearchParams({ url: src, q: String(quality) });
	if (width) params.set('w', String(width));
	if (height) params.set('h', String(height));
	if (fit) params.set('fit', fit);
	if (format) params.set('fm', format);
	return `${ENDPOINT}?${params}`;
}

/** A `srcset` of a picture at several widths, or `undefined` when it is not optimized. */
export function imageSrcset(src: string, widths = IMAGE_WIDTHS, quality = 75) {
	if (!isOptimized(src)) return undefined;
	return widths.map((width) => `${imageUrl(src, { width, quality })} ${width}w`).join(', ');
}

export type ImagePropsOptions = {
	/** How wide the picture is drawn at each screen width, e.g. `(min-width: 1024px) 50vw, 100vw`. The browser picks the file from it. Defaults to `100vw`. */
	sizes?: string;
	/** The widths offered, in px. */
	widths?: number[];
	/** 1-100. */
	quality?: number;
};

/**
 * The `src`, `srcset` and `sizes` of an `<img>`, to spread on it: `<img {...imageProps(src, { sizes })} alt="" />`.
 * The browser downloads the smallest file that fills the space, in the best format it supports. Anything that is not
 * optimized gets just its `src`. It spreads, rather than being a component, so a component's own scoped CSS still
 * reaches the `<img>`.
 */
export function imageProps(
	src: string,
	{ sizes = '100vw', widths = IMAGE_WIDTHS, quality = 75 }: ImagePropsOptions = {}
) {
	const srcset = imageSrcset(src, widths, quality);
	if (!srcset) return { src };
	return {
		// The fallback for a browser that ignores `srcset`: the middle of the range.
		src: imageUrl(src, { width: widths[Math.floor(widths.length / 2)], quality }),
		srcset,
		sizes
	};
}
