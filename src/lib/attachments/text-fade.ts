import type { Attachment } from 'svelte/attachments';
import { textScroll, type TextScrollOptions } from '$lib/utils/text-scroll';
import './text-split.scss';

export type TextFadeOptions = TextScrollOptions & {
	type?: 'chars' | 'words';
	/** Fade the pieces in random order or from first to last. */
	style?: 'random' | 'linear';
	/** Seconds each piece takes to fade. */
	duration?: number;
	/** Seconds between each piece starting. */
	stagger?: number;
	/** A GSAP ease. */
	ease?: string;
};

/** Fades text in word by word or character by character as it scrolls into view. */
export function textFade({
	type = 'words',
	style = 'random',
	duration = 0.25,
	stagger = 0.0125,
	ease = 'linear',
	...scroll
}: TextFadeOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return textScroll(el, type, scroll, ({ gsap, targets, scrollTrigger }) =>
			gsap
				.timeline({ scrollTrigger })
				.fromTo(
					style === 'random' ? gsap.utils.shuffle([...targets]) : targets,
					{ opacity: 0 },
					{ opacity: 1, duration, stagger, ease }
				)
		);
	};
}
