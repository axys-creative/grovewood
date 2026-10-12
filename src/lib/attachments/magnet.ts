import type { Attachment } from 'svelte/attachments';
import { parseEase } from '$lib/utils/easing';

export type MagnetOptions = {
	/** Horizontal pull, as a fraction of the pointer's distance from the element's center. */
	x?: number;
	/** Vertical pull, as a fraction of the pointer's distance from the element's center. */
	y?: number;
	/** Milliseconds the element takes to catch up to its target. This transition is always on. */
	followDuration?: number;
	/** CSS easing for catching up to the target. */
	followEase?: string;
	/** Milliseconds the target takes to travel back to the origin. */
	returnDuration?: number;
	/** `cubic-bezier(...)`, `linear`, `ease`, `ease-out` or `ease-in-out`. Values above 1 overshoot. */
	returnEase?: string;
};

const canHover = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function magnet({
	x = 0.5,
	y = 0.5,
	followDuration = 640,
	followEase = 'cubic-bezier(0.18, 0.97, 0.47, 1)',
	returnDuration = 220,
	returnEase = 'cubic-bezier(0.16, 1, 0.3, 1)'
}: MagnetOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (!matchMedia(canHover).matches) return;

		const ease = parseEase(returnEase);
		const style = getComputedStyle(el);
		const originalDisplay = el.style.display;
		if (style.display === 'inline') el.style.display = 'inline-block';

		// Adds a transform transition to the element's own list, by longhand so no browser has to re-parse a shorthand.
		const list = (value: string) => `${value}, `;
		el.style.transitionProperty = `${list(style.transitionProperty)}transform`;
		el.style.transitionDuration = `${list(style.transitionDuration)}${followDuration}ms`;
		el.style.transitionTimingFunction = `${list(style.transitionTimingFunction)}${followEase}`;
		el.style.transitionDelay = `${list(style.transitionDelay)}0s`;

		let currentX = 0;
		let currentY = 0;
		let pointerX = 0;
		let pointerY = 0;
		let frame = 0;
		let pending = 0;

		const apply = () => (el.style.transform = `translate(${currentX}px, ${currentY}px)`);

		// Measured from the element's current position, so the pull tapers as it closes in.
		const update = () => {
			pending = 0;
			const rect = el.getBoundingClientRect();
			currentX = (pointerX - (rect.left + rect.width / 2)) * x;
			currentY = (pointerY - (rect.top + rect.height / 2)) * y;
			apply();
		};

		// Safari restarts the transition on every write, so the target is written once per frame, not per event.
		const onMove = (event: PointerEvent) => {
			pointerX = event.clientX;
			pointerY = event.clientY;
			if (!pending) pending = requestAnimationFrame(update);
		};

		const onEnter = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			cancelAnimationFrame(frame);
			el.addEventListener('pointermove', onMove, { passive: true });
		};

		const onLeave = () => {
			el.removeEventListener('pointermove', onMove);
			cancelAnimationFrame(frame);
			cancelAnimationFrame(pending);
			pending = 0;

			const startX = currentX;
			const startY = currentY;
			const startTime = performance.now();

			const tick = (now: number) => {
				const progress = Math.min(1, (now - startTime) / returnDuration);
				const eased = ease(progress);
				currentX = startX * (1 - eased);
				currentY = startY * (1 - eased);
				apply();
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		};

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointerleave', onLeave);

		return () => {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('pointermove', onMove);
			cancelAnimationFrame(frame);
			cancelAnimationFrame(pending);
			el.style.transitionProperty = '';
			el.style.transitionDuration = '';
			el.style.transitionTimingFunction = '';
			el.style.transitionDelay = '';
			el.style.transform = '';
			el.style.display = originalDisplay;
		};
	};
}
