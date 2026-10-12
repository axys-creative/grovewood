import { distanceTo, type ScrollPoint } from './scroll-point';

type ZoneOptions = {
	start: ScrollPoint;
	end: ScrollPoint;
	/** Called on scroll and resize while the element is near the viewport, and once when it enters or leaves. */
	onUpdate: (startDistance: number, endDistance: number) => void;
};

/**
 * Reports how far an element is from the start and end of a scroll range (see `distanceTo`). The
 * scroll listener only runs while the element is close to the viewport. `update` re-checks right now.
 */
export function watchScrollZone(watched: Element, { start, end, onUpdate }: ZoneOptions) {
	let frame = 0;

	const update = () => {
		frame = 0;
		onUpdate(distanceTo(watched, start), distanceTo(watched, end));
	};

	const schedule = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				addEventListener('scroll', schedule, { passive: true });
				addEventListener('resize', schedule, { passive: true });
			} else {
				removeEventListener('scroll', schedule);
				removeEventListener('resize', schedule);
			}
			update();
		},
		{ rootMargin: '10% 0px' }
	);
	observer.observe(watched);

	return {
		update,
		stop() {
			observer.disconnect();
			cancelAnimationFrame(frame);
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
		}
	};
}

type EnterLeaveOptions = {
	start: ScrollPoint;
	end: ScrollPoint;
	onEnter: () => void;
	onLeave: () => void;
};

/** Calls `onEnter` when the element's start point has been reached and `onLeave` once its end point passes. */
export function onScrollZone(
	watched: Element,
	{ start, end, onEnter, onLeave }: EnterLeaveOptions
) {
	let inZone = false;

	return watchScrollZone(watched, {
		start,
		end,
		onUpdate(startDistance, endDistance) {
			const nowInZone = startDistance <= 0 && endDistance > 0;
			if (nowInZone && !inZone) {
				inZone = true;
				onEnter();
			} else if (!nowInZone && inZone) {
				inZone = false;
				onLeave();
			}
		}
	}).stop;
}
