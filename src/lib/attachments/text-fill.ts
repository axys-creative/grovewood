import type { Attachment } from 'svelte/attachments';
import { textScroll, type TextScrollOptions } from '$lib/utils/text-scroll';
import './text-fill.scss';

export type TextFillOptions = TextScrollOptions & {
	/** Seconds the fill takes when not scrubbing. */
	duration?: number;
};

/** Fills text with color as it scrolls into view. Scrubs with the scroll by default. */
export function textFill({
	scrub = true,
	duration = 1,
	start = scrub ? 'top 90%' : 'top 98%',
	end = scrub ? 'bottom 60%' : 'bottom 2%',
	...scroll
}: TextFillOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		el.classList.add('text-fill');

		const stop = textScroll(
			el,
			undefined,
			{ ...scroll, scrub, start, end },
			({ gsap, targets, scrollTrigger }) =>
				gsap.fromTo(
					targets,
					{ backgroundSize: '0%' },
					{ backgroundSize: '100%', scrollTrigger, ...(scrub ? {} : { duration }) }
				)
		);

		return () => {
			stop();
			el.classList.remove('text-fill');
		};
	};
}
