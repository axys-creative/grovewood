import type { Attachment } from 'svelte/attachments';
import { textScroll, type TextScrollOptions } from '$lib/utils/text-scroll';
import './text-split.scss';

export type TextScaleOptions = TextScrollOptions & {
	type?: 'chars' | 'words';
	/** Scale the pieces in random order or from first to last. */
	style?: 'random' | 'linear';
	/** Seconds each piece takes to scale. */
	duration?: number;
	/** Seconds between each piece starting. */
	stagger?: number;
	/** A GSAP ease. */
	ease?: string;
};

/** Scales text up from nothing, piece by piece, as it scrolls into view. Each piece grows from its own side of the text. */
export function textScale({
	type = 'words',
	style = 'random',
	duration = 0.25,
	stagger = 0.0125,
	ease = 'linear',
	...scroll
}: TextScaleOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return textScroll(el, type, scroll, ({ gsap, targets, scrollTrigger }) => {
			const parent = el.getBoundingClientRect();
			targets.forEach((target) => {
				const box = target.getBoundingClientRect();
				const centerX = (box.left + box.width / 2 - parent.left) / parent.width;
				target.style.transformOrigin = `${Math.round((1 - centerX) * 100)}% 50%`;
			});

			return gsap
				.timeline({ scrollTrigger })
				.fromTo(
					style === 'random' ? gsap.utils.shuffle([...targets]) : targets,
					{ scale: 0, opacity: 0 },
					{ scale: 1, opacity: 1, duration, stagger, ease }
				);
		});
	};
}
