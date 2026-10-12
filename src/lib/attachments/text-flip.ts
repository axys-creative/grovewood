import type { Attachment } from 'svelte/attachments';
import { textScroll, type TextScrollOptions } from '$lib/utils/text-scroll';
import './text-split.scss';

export type TextFlipOptions = TextScrollOptions & {
	type?: 'chars' | 'words' | 'lines';
	/** The edge the pieces tip forward from. */
	from?: 'top' | 'center' | 'bottom';
	/** Seconds each piece takes to flip. */
	duration?: number;
	/** Seconds between each piece starting. */
	stagger?: number;
	/** A GSAP ease, e.g. `back.out(2)`. */
	ease?: string;
};

/** Tips text forward into place, piece by piece, as it scrolls into view. */
export function textFlip({
	type = 'words',
	from = 'top',
	duration = 1,
	stagger = 0.05,
	ease = 'power2.out',
	...scroll
}: TextFlipOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return textScroll(el, type, scroll, ({ gsap, targets, scrollTrigger }) =>
			gsap
				.timeline({ scrollTrigger })
				.fromTo(
					targets,
					{ rotateX: -65, transformPerspective: 500, transformOrigin: from, opacity: 0 },
					{ rotateX: 0, opacity: 1, duration, stagger, ease }
				)
		);
	};
}
