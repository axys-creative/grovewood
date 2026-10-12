import type { Attachment } from 'svelte/attachments';
import { preloadScramble, scrambleTo, stopScramble, type ScrambleChars } from '$lib/utils/scramble';
import { parseScrollPoint } from '$lib/utils/scroll-point';
import { onScrollZone } from '$lib/utils/scroll-zone';
import './glitch.scss';

export type GlitchScrollOptions = {
	chars?: ScrambleChars;
	/** Seconds between each character settling into place. */
	revealDelay?: number;
	/** Seconds the effect lasts. */
	duration?: number;
	/** Only scramble the first time it scrolls into view. */
	once?: boolean;
	/** A selector or element to watch for scrolling instead of this element, e.g. a pinned section. */
	trigger?: string | Element;
	/** ScrollTrigger-style start, e.g. `top 98%` (element point, viewport point). */
	start?: string;
	/** ScrollTrigger-style end, e.g. `bottom 2%`. */
	end?: string;
	/** Use the mono-spaced font so the width changes less while scrambling. */
	mono?: boolean;
};

/** Scrambles the element's text each time it scrolls into view. */
export function glitchScroll({
	chars,
	revealDelay = 0.05,
	duration = 0.75,
	once = false,
	trigger,
	start = 'top 98%',
	end = 'bottom 2%',
	mono = true
}: GlitchScrollOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const original = el.textContent ?? '';
		const watched = (typeof trigger === 'string' ? document.querySelector(trigger) : trigger) ?? el;

		preloadScramble();
		if (mono) el.classList.add('glitch-text');

		const stopWatching = onScrollZone(watched, {
			start: parseScrollPoint(start, 'top 98%'),
			end: parseScrollPoint(end, 'bottom 2%'),
			onEnter() {
				el.textContent = original;
				scrambleTo(el, original, { chars, duration, revealDelay });
				if (once) stopWatching();
			},
			onLeave() {}
		});

		return () => {
			stopWatching();
			stopScramble(el);
			el.textContent = original;
			el.classList.remove('glitch-text');
		};
	};
}
