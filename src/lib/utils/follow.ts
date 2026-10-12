import type { Ease } from './easing';

export type { Ease };

/**
 * A front-loaded curve: the y-values of cubic-bezier(0.29, 1.01, 0.16, 1.09), read straight off the
 * progress. It is mostly done by 60% progress and may overshoot slightly.
 */
export const followEase: Ease = (t) =>
	3 * (1 - t) ** 2 * t * 1.01 + 3 * (1 - t) * t ** 2 * 1.09 + t ** 3;

export type FollowerFrame = {
	/** Where the follower is now. */
	x: number;
	y: number;
	/** Where it is heading. */
	targetX: number;
	targetY: number;
	/** Seconds since the previous frame. */
	seconds: number;
};

export type FollowerOptions = {
	/** Milliseconds to catch up with a new target. */
	duration?: number;
	ease?: Ease;
	/** Runs every frame. Return true to keep the loop running while an extra effect is still settling. */
	onFrame: (frame: FollowerFrame) => boolean | void;
};

/**
 * Glides a point toward a target. Every new target restarts the glide from wherever the point is, so
 * the motion stays smooth while the target keeps moving. The loop only runs while something moves.
 */
export function createFollower({ duration = 333, ease = followEase, onFrame }: FollowerOptions) {
	let x = 0;
	let y = 0;
	let startX = 0;
	let startY = 0;
	let targetX = 0;
	let targetY = 0;
	let progress = 1;
	let activeUntil = 0;
	let lastTime = 0;
	let fresh = false;
	let frame = 0;

	const tick = (now: number) => {
		// A loop that just woke up has no previous frame, so assume a steady 60fps for its first step.
		const seconds = fresh ? 1 / 60 : Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
		fresh = false;
		lastTime = now;

		if (progress < 1) {
			progress = Math.min(progress + (seconds * 1000) / duration, 1);
			const eased = ease(progress);
			x = startX + (targetX - startX) * eased;
			y = startY + (targetY - startY) * eased;
		}

		const busy = onFrame({ x, y, targetX, targetY, seconds }) === true;
		frame = progress >= 1 && now > activeUntil && !busy ? 0 : requestAnimationFrame(tick);
	};

	const wake = () => {
		activeUntil = performance.now() + 600;
		if (!frame) {
			fresh = true;
			frame = requestAnimationFrame(tick);
		}
	};

	return {
		moveTo(nextX: number, nextY: number) {
			startX = x;
			startY = y;
			targetX = nextX;
			targetY = nextY;
			progress = 0;
			wake();
		},
		/** Keeps the loop running a little longer, e.g. while the pointer is still moving. */
		wake,
		stop() {
			cancelAnimationFrame(frame);
			frame = 0;
		}
	};
}
