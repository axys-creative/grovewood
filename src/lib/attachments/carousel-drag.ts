import type { Attachment } from 'svelte/attachments';

export type CarouselDragOptions = {
	/** Share of a slide a gesture must cross to move on. Lower is more sensitive. Defaults to `0.04`. */
	sensitivity?: number;
};

const DRAG_START = 4;
const WHEEL_END = 140;
const SETTLE_FALLBACK = 700;

/** Drag and sideways swipes for a row of snapping slides; the row has `data-dragging` while one is under way. */
export function carouselDrag({
	sensitivity = 0.04
}: CarouselDragOptions = {}): Attachment<HTMLElement> {
	return (track) => {
		const step = () => {
			const slides = track.children;
			return slides.length > 1
				? slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left
				: track.clientWidth;
		};
		const win = track.ownerDocument.defaultView ?? window;
		const setDragging = (value: boolean) => track.toggleAttribute('data-dragging', value);
		const dragging = () => track.hasAttribute('data-dragging');

		let settleTimer: ReturnType<typeof setTimeout> | undefined;
		let release: (() => void) | undefined;

		// Snap stays off until the scroll settles, or it would jump instantly.
		function settle(from: number) {
			const size = step();
			const travelled = (track.scrollLeft - from) / size;
			const index =
				Math.abs(travelled) >= 1
					? Math.round(track.scrollLeft / size)
					: Math.round(from / size) +
						(Math.abs(travelled) >= sensitivity ? Math.sign(travelled) : 0);
			const max = track.scrollWidth - track.clientWidth;
			const reduced = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
			track.scrollTo({
				left: Math.min(max, Math.max(0, index * size)),
				behavior: reduced ? 'auto' : 'smooth'
			});

			release?.();
			const done = () => {
				release?.();
				setDragging(false);
			};
			const fallback = setTimeout(done, SETTLE_FALLBACK);
			track.addEventListener('scrollend', done);
			release = () => {
				clearTimeout(fallback);
				track.removeEventListener('scrollend', done);
				release = undefined;
			};
		}

		let pressed = false;
		let startX = 0;
		let startScroll = 0;

		const onPointerdown = (event: PointerEvent) => {
			if (event.pointerType === 'mouse' && event.button !== 0) return;
			pressed = true;
			setDragging(false);
			startX = event.clientX;
			startScroll = track.scrollLeft;
		};
		const onPointermove = (event: PointerEvent) => {
			if (!pressed) return;
			const dx = event.clientX - startX;
			if (!dragging() && Math.abs(dx) < DRAG_START) return;
			setDragging(true);
			track.scrollLeft = startScroll - dx;
		};
		const onPointerup = () => {
			if (!pressed) return;
			pressed = false;
			if (dragging()) settle(startScroll);
		};

		let wheelAxis: 'x' | 'y' | null = null;
		let wheelFrom = 0;

		const onWheel = (event: WheelEvent) => {
			if (!event.deltaX && !event.deltaY) return;
			wheelAxis ??= Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'x' : 'y';
			clearTimeout(settleTimer);
			settleTimer = setTimeout(() => {
				const axis = wheelAxis;
				wheelAxis = null;
				if (axis === 'x') settle(wheelFrom);
			}, WHEEL_END);

			if (wheelAxis !== 'x') return;
			// Stopped here so the page's smooth scroll never sees the vertical part.
			event.preventDefault();
			event.stopPropagation();
			if (!dragging()) {
				setDragging(true);
				wheelFrom = track.scrollLeft;
			}
			track.scrollLeft += event.deltaX;
		};

		track.addEventListener('pointerdown', onPointerdown);
		track.addEventListener('wheel', onWheel, { passive: false });
		win.addEventListener('pointermove', onPointermove);
		win.addEventListener('pointerup', onPointerup);
		win.addEventListener('pointercancel', onPointerup);

		return () => {
			track.removeEventListener('pointerdown', onPointerdown);
			track.removeEventListener('wheel', onWheel);
			win.removeEventListener('pointermove', onPointermove);
			win.removeEventListener('pointerup', onPointerup);
			win.removeEventListener('pointercancel', onPointerup);
			clearTimeout(settleTimer);
			release?.();
			setDragging(false);
		};
	};
}
