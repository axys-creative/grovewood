import type { Attachment } from 'svelte/attachments';
import { textScroll, type TextScrollOptions } from '$lib/utils/text-scroll';
import './text-split.scss';

export type TextRevealOptions = TextScrollOptions & {
	type?: 'chars' | 'words';
	/** The side the pieces slide in from. */
	from?: 'bottom' | 'top';
	/** Seconds each piece takes to slide in. */
	duration?: number;
	/** Seconds between each piece starting. */
	stagger?: number;
	/** A GSAP ease, e.g. `back.out(2)`. */
	ease?: string;
};

/** Slides text up out of a clipped line, piece by piece, as it scrolls into view. */
export function textReveal({
	type = 'words',
	from = 'bottom',
	duration = 0.2,
	stagger = 0.05,
	ease = 'linear',
	...scroll
}: TextRevealOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return textScroll(
			el,
			type,
			scroll,
			({ gsap, targets, scrollTrigger }) =>
				gsap
					.timeline({ scrollTrigger })
					.fromTo(
						targets,
						{ y: from === 'top' ? '-100%' : '100%' },
						{ y: '0%', duration, stagger, ease }
					),
			true
		);
	};
}
