import type { gsap as Gsap } from 'gsap';
import { loadGsap } from './gsap';

/** One of GSAP's presets, or your own string of characters to scramble through. */
export type ScrambleChars = 'upperCase' | 'lowerCase' | 'upperAndLowerCase' | (string & {});

export type ScrambleOptions = {
	chars?: ScrambleChars;
	/** Seconds the effect lasts. */
	duration?: number;
	/** Seconds between each character settling into place. */
	revealDelay?: number;
	/** A CSS color to fade to while scrambling. */
	color?: string;
	onComplete?: () => void;
};

let gsapInstance: typeof Gsap | undefined;

/** Starts downloading GSAP's scramble plugin so the first effect is not delayed. */
export const preloadScramble = () => {
	loadGsap('scramble');
};

/** Scrambles the element's text and settles on `text`. */
export async function scrambleTo(
	el: HTMLElement,
	text: string,
	{
		chars = 'upperAndLowerCase',
		duration = 0.5,
		revealDelay = 0.125,
		color,
		onComplete
	}: ScrambleOptions = {}
) {
	gsapInstance = await loadGsap('scramble');
	if (!el.isConnected) return;

	gsapInstance.to(el, {
		scrambleText: { text, chars, revealDelay },
		duration,
		overwrite: true,
		...(color ? { color } : {}),
		onComplete
	});
}

export function stopScramble(el: HTMLElement) {
	gsapInstance?.killTweensOf(el);
}

/**
 * Pins an element to its natural width so the scramble cannot make the layout jump. The width is
 * measured again once web fonts have loaded (they change text widths) and when the window resizes,
 * and never while the text is mid-scramble. An element that is hidden when this runs is pinned the
 * first time it gets a size.
 */
export function lockWidth(target: HTMLElement) {
	const original = target.textContent ?? '';
	const previous = { display: target.style.display, width: target.style.width };
	target.style.display = 'inline-block';

	type Result = 'done' | 'hidden' | 'busy';

	const measure = (): Result => {
		if (target.textContent !== original) return 'busy';
		if (target.getClientRects().length === 0) return 'hidden';

		target.style.width = '';
		// The fractional width, rounded up, so the last pixel of a glyph is never cut off.
		const width = Math.ceil(target.getBoundingClientRect().width);
		if (!width) return 'hidden';

		target.style.width = `${width}px`;
		return 'done';
	};

	let retry: ReturnType<typeof setTimeout> | undefined;
	let resize: ReturnType<typeof setTimeout> | undefined;
	let observer: ResizeObserver | undefined;
	let stopped = false;

	const remeasure = () => {
		if (stopped) return;
		clearTimeout(retry);
		const result = measure();

		if (result === 'busy') {
			retry = setTimeout(remeasure, 100);
		} else if (result === 'hidden' && !observer) {
			observer = new ResizeObserver(() => {
				if (target.getClientRects().length === 0) return;
				observer?.disconnect();
				observer = undefined;
				remeasure();
			});
			observer.observe(target);
		}
	};

	const onResize = () => {
		clearTimeout(resize);
		resize = setTimeout(remeasure, 150);
	};

	remeasure();
	document.fonts.ready.then(remeasure);
	document.fonts.addEventListener('loadingdone', remeasure);
	addEventListener('resize', onResize, { passive: true });

	return () => {
		stopped = true;
		clearTimeout(retry);
		clearTimeout(resize);
		observer?.disconnect();
		document.fonts.removeEventListener('loadingdone', remeasure);
		removeEventListener('resize', onResize);
		target.style.display = previous.display;
		target.style.width = previous.width;
	};
}
