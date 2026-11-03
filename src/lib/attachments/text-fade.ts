import type { Attachment } from 'svelte/attachments';
import { textScroll, type TextScrollOptions } from '$lib/utils/text-scroll';
import './text-split.scss';

export type TextFadeOptions = TextScrollOptions & {
	/** Pixels each word travels while fading in. */
	distance?: number;
	/** Seconds each word takes to fade in. */
	duration?: number;
	/** Seconds each word takes to travel, usually shorter than the fade. */
	travelDuration?: number;
	/** Seconds between each word starting. */
	stagger?: number;
	/** A GSAP ease, e.g. `power2.out`. */
	ease?: string;
	/** Fraction of the viewport width around the middle that counts as centered. */
	centerZone?: number;
};

/** Fades text in word by word as it scrolls into view, travelling from the side it sits on (from below when centered). */
export function textFade({
	distance = 36,
	duration = 1.4,
	travelDuration = 0.8,
	stagger = 0.1,
	ease = 'power2.out',
	centerZone = 0.1,
	...scroll
}: TextFadeOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		return textScroll(el, 'words', scroll, ({ gsap, targets, scrollTrigger }) => {
			const rect = el.getBoundingClientRect();
			const offset = (rect.left + rect.width / 2) / innerWidth - 0.5;
			const from =
				Math.abs(offset) <= centerZone / 2
					? { y: distance }
					: { x: offset < 0 ? -distance : distance };

			return gsap
				.timeline({ scrollTrigger })
				.fromTo(targets, { opacity: 0 }, { opacity: 1, duration, stagger, ease }, 0)
				.fromTo(targets, from, { x: 0, y: 0, duration: travelDuration, stagger, ease }, 0);
		});
	};
}
