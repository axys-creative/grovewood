import type { Attachment } from 'svelte/attachments';
import { preloadScramble, scrambleTo, stopScramble, type ScrambleChars } from '$lib/utils/scramble';
import './glitch.scss';

export type GlitchCycleOptions = {
	/** The words to cycle through, in order. */
	words: string[];
	/** Colors to fade to along with each word. Any CSS color, including variables. */
	colors?: string[];
	/** Milliseconds to wait between words. */
	interval?: number;
	chars?: ScrambleChars;
	/** Use the mono-spaced font so the width changes less between words. */
	mono?: boolean;
};

const ALPHANUMERIC = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Swaps the element's text between words with a scramble, only while it is on screen. */
export function glitchCycle({
	words,
	colors,
	interval = 2000,
	chars = ALPHANUMERIC,
	mono = true
}: GlitchCycleOptions): Attachment<HTMLElement> {
	return (el) => {
		if (!words.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		preloadScramble();
		if (mono) el.classList.add('glitch-text');

		let index = 0;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let running = false;

		const next = () => {
			if (!running) return;
			scrambleTo(el, words[index], {
				chars,
				duration: 0.5,
				revealDelay: 0.125,
				color: colors?.length ? colors[index % colors.length] : undefined,
				onComplete() {
					index = (index + 1) % words.length;
					timer = setTimeout(next, interval);
				}
			});
		};

		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && !running) {
				running = true;
				next();
			} else if (!entry.isIntersecting) {
				running = false;
				clearTimeout(timer);
			}
		});
		observer.observe(el);

		return () => {
			running = false;
			observer.disconnect();
			clearTimeout(timer);
			stopScramble(el);
			el.classList.remove('glitch-text');
		};
	};
}
