import type { Attachment } from 'svelte/attachments';
import {
	lockWidth,
	preloadScramble,
	scrambleTo,
	stopScramble,
	type ScrambleChars
} from '$lib/utils/scramble';
import './glitch.scss';

export type GlitchTargetOptions = {
	/** The element whose text scrambles: a selector, an element, or a function that returns one. */
	target: string | Element | (() => Element | null);
	chars?: ScrambleChars;
	duration?: number;
	revealDelay?: number;
};

type Prepared = { original: string; unlock: () => void };
const prepared = new WeakMap<HTMLElement, Prepared>();

/** Scrambles another element's text while this one is hovered or focused. */
export function glitchTarget({
	target,
	chars,
	duration = 0.75,
	revealDelay = 0.125
}: GlitchTargetOptions): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		preloadScramble();
		let current: HTMLElement | undefined;

		const resolve = () =>
			(typeof target === 'string'
				? document.querySelector(target)
				: typeof target === 'function'
					? target()
					: target) as HTMLElement | null;

		const run = () => {
			const element = resolve();
			if (!element) return;

			let info = prepared.get(element);
			if (!info) {
				element.classList.add('glitch-target');
				info = { original: element.textContent ?? '', unlock: lockWidth(element) };
				prepared.set(element, info);
			}

			current = element;
			element.textContent = info.original;
			scrambleTo(element, info.original, { chars, duration, revealDelay });
		};

		el.addEventListener('pointerenter', run);
		el.addEventListener('focus', run);

		return () => {
			el.removeEventListener('pointerenter', run);
			el.removeEventListener('focus', run);
			if (!current) return;

			stopScramble(current);
			const info = prepared.get(current);
			if (info) {
				current.textContent = info.original;
				info.unlock();
				current.classList.remove('glitch-target');
				prepared.delete(current);
			}
		};
	};
}
