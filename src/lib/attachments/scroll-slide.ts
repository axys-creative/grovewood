import type { Attachment } from 'svelte/attachments';
import { loadGsap } from '$lib/utils/gsap';

export type ScrollSlideOptions = {
	/** Selector inside for the box the track slides across. */
	viewport?: string;
	/** Selector inside for the row that slides. */
	track?: string;
	/** A media query. Outside it nothing is pinned and the track is left alone. */
	media?: string;
	/** Seconds the track takes to catch up with the scroll. */
	scrub?: number;
	/** Selector for elements inside the track that drift sideways as it slides. */
	parallax?: string;
	/** How far they drift, as a percent of their own width. */
	parallaxAmount?: number;
};

/**
 * Pins the element to the center of the screen and slides the track sideways as the page scrolls, for exactly as
 * far as the track overflows. While it is active the element has `data-sliding`, which is when the viewport should
 * clip. Reduced motion leaves it alone, so the row can scroll on its own.
 */
export function scrollSlide({
	viewport = '[data-slide-viewport]',
	track = '[data-slide-track]',
	media = '(min-width: 1024px)',
	scrub = 1,
	parallax,
	parallaxAmount = 25
}: ScrollSlideOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then((gsap) => {
			const box = el.querySelector<HTMLElement>(viewport);
			const row = el.querySelector<HTMLElement>(track);
			if (cancelled || !box || !row) return;

			const match = gsap.matchMedia();
			match.add(media, () => {
				const distance = () => row.scrollWidth - box.offsetWidth;
				if (distance() <= 0) return;

				el.dataset.sliding = '';
				const range = { trigger: el, start: 'center center', end: () => `+=${distance()}` };

				gsap.to(row, {
					x: () => -distance(),
					ease: 'none',
					scrollTrigger: { ...range, pin: true, scrub, invalidateOnRefresh: true }
				});

				if (parallax) {
					el.querySelectorAll(parallax).forEach((item) =>
						gsap.fromTo(
							item,
							{ x: 0 },
							{
								x: `${parallaxAmount}%`,
								ease: 'none',
								scrollTrigger: { ...range, scrub, invalidateOnRefresh: true }
							}
						)
					);
				}

				return () => delete el.dataset.sliding;
			});
			revert = () => match.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	};
}
