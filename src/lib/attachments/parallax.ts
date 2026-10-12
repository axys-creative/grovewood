import type { Attachment } from 'svelte/attachments';

export type ParallaxOptions = {
	/** Starting offset, as a percent of the element's height. */
	from?: number;
	/** Ending offset, as a percent of the element's height. */
	to?: number;
};

export function parallax({ from = -5, to = 5 }: ParallaxOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let offset = from;
		let frame = 0;

		const update = () => {
			frame = 0;
			const rect = el.getBoundingClientRect();
			const top = rect.top - (offset / 100) * rect.height;
			const progress = Math.min(1, Math.max(0, (innerHeight - top) / (innerHeight + rect.height)));

			offset = from + (to - from) * progress;
			el.style.translate = `0 ${offset}%`;
		};

		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				addEventListener('scroll', onScroll, { passive: true });
				addEventListener('resize', onScroll, { passive: true });
				onScroll();
			} else {
				removeEventListener('scroll', onScroll);
				removeEventListener('resize', onScroll);
			}
		});
		observer.observe(el);

		return () => {
			observer.disconnect();
			removeEventListener('scroll', onScroll);
			removeEventListener('resize', onScroll);
			cancelAnimationFrame(frame);
			el.style.translate = '';
		};
	};
}
