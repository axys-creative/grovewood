import type { Attachment } from 'svelte/attachments';
import { parseGsapEase, type Ease } from '$lib/utils/easing';
import { parseScrollPoint } from '$lib/utils/scroll-point';
import { onScrollZone, watchScrollZone } from '$lib/utils/scroll-zone';
import './flip.scss';

export type FlipOptions = {
	/** The edge the element pivots from. */
	from?: 'top' | 'center' | 'bottom';
	/** A selector or element to watch for scrolling instead of the flipped element itself. */
	trigger?: string | Element;
	/** ScrollTrigger-style start, e.g. `top 98%` (element point, viewport point). */
	start?: string;
	/** ScrollTrigger-style end, e.g. `bottom top`. */
	end?: string;
	/** Tie the tilt to scroll position instead of playing the swing when it comes into view. */
	scrub?: boolean;
	/** Easing while scrubbing: a GSAP-style name such as `back.out(2)` or `elastic.out(1, 0.4)`, or a function. */
	ease?: string | Ease;
	/** Only swing the first time it comes into view. Ignored while scrubbing. */
	once?: boolean;
};

const START_ANGLE = -60;

export function flip({
	from = 'top',
	trigger,
	start = 'top 98%',
	end = 'bottom top',
	scrub = false,
	ease = 'none',
	once = false
}: FlipOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const watched = (typeof trigger === 'string' ? document.querySelector(trigger) : trigger) ?? el;
		const startPoint = parseScrollPoint(start, 'top 98%');
		const endPoint = parseScrollPoint(end, 'bottom top');
		const easeProgress = typeof ease === 'function' ? ease : parseGsapEase(ease);

		el.classList.add('flip');
		if (scrub) el.classList.add('flip--scrub');
		el.style.transformOrigin = from;

		const stopWatching = scrub
			? watchScrollZone(watched, {
					start: startPoint,
					end: endPoint,
					onUpdate(startDistance, endDistance) {
						const raw =
							startDistance === endDistance ? 0 : startDistance / (startDistance - endDistance);
						const eased = easeProgress(Math.min(1, Math.max(0, raw)));
						el.style.transform = `perspective(500px) rotateX(${START_ANGLE * (1 - eased)}deg)`;
					}
				}).stop
			: onScrollZone(watched, {
					start: startPoint,
					end: endPoint,
					onEnter: () => el.classList.add('flipped'),
					onLeave: () => {
						if (!once) el.classList.remove('flipped');
					}
				});

		return () => {
			stopWatching();
			el.classList.remove('flip', 'flip--scrub', 'flipped');
			el.style.transform = '';
			el.style.transformOrigin = '';
		};
	};
}
