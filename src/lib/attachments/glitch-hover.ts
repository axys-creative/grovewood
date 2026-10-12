import type { Attachment } from 'svelte/attachments';
import {
	lockWidth,
	preloadScramble,
	scrambleTo,
	stopScramble,
	type ScrambleChars
} from '$lib/utils/scramble';
import './glitch.scss';

export type GlitchHoverOptions = {
	/** Scramble into this text on hover, and back to the original on leave. */
	newText?: string;
	/** Also scramble when the pointer leaves or focus moves away. Always on with `newText`. */
	out?: boolean;
	/** The element whose text scrambles: a selector inside, or an element. Defaults to a `.label` (as in Button), else the element itself. */
	target?: string | HTMLElement;
	chars?: ScrambleChars;
	duration?: number;
	revealDelay?: number;
};

/** Scrambles an element's text when it is hovered or focused. */
export function glitchHover({
	newText,
	out = false,
	target: targetOption,
	chars,
	duration = 0.5,
	revealDelay = 0.125
}: GlitchHoverOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const target =
			(typeof targetOption === 'string'
				? el.querySelector<HTMLElement>(targetOption)
				: targetOption) ??
			el.querySelector<HTMLElement>('.label') ??
			el;
		const original = target.textContent ?? '';

		preloadScramble();
		el.classList.add('glitch-hover');
		if (target !== el) target.classList.add('glitch-hover__text');
		// A new message changes the width on purpose, so only the same-text version is pinned.
		const unlock = newText ? undefined : lockWidth(target);

		const glitchTo = (text: string) => {
			target.textContent = text;
			scrambleTo(target, text, { chars, duration, revealDelay });
		};

		const onEnter = () => glitchTo(newText ?? original);
		const onLeave = () => {
			if (out || newText) glitchTo(original);
		};

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('focus', onEnter);
		el.addEventListener('pointerleave', onLeave);
		el.addEventListener('blur', onLeave);

		return () => {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('focus', onEnter);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('blur', onLeave);
			stopScramble(target);
			target.textContent = original;
			unlock?.();
			el.classList.remove('glitch-hover');
			target.classList.remove('glitch-hover__text');
		};
	};
}
