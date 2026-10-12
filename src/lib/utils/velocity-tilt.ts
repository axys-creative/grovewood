import { damp } from './easing';

export type VelocityTiltOptions = {
	/** Largest tilt in degrees. */
	max?: number;
	/** Pointer speed in px/s that reaches the max tilt. */
	velocityMax?: number;
	/** How quickly the tilt builds (0-1, per frame at 60fps). */
	inSpeed?: number;
	/** How quickly the tilt returns to neutral (0-1, per frame at 60fps). */
	outSpeed?: number;
	/** Milliseconds without movement before the tilt returns to neutral. */
	idleMs?: number;
	/** Flip the direction of the tilt. */
	reverse?: boolean;
};

/**
 * Tilts by how fast the pointer is moving sideways. Call `update` with the pointer position each
 * frame (or each move) and apply the returned angle to `rotate`.
 */
export function createVelocityTilt({
	max = 25,
	velocityMax = 1800,
	inSpeed = 0.12,
	outSpeed = 0.12,
	idleMs = 90,
	reverse = false
}: VelocityTiltOptions = {}) {
	let angle = 0;
	let lastTime = performance.now();
	let lastMove = lastTime;
	let previousX = 0;
	let previousY = 0;

	return {
		update(x: number, y: number) {
			const now = performance.now();
			const seconds = Math.max((now - lastTime) / 1000, 1 / 240);
			lastTime = now;

			const dx = x - previousX;
			const dy = y - previousY;
			if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) lastMove = now;
			previousX = x;
			previousY = y;

			const speed = Math.hypot(dx, dy) / seconds;
			const normalized = Math.min(Math.max(speed / velocityMax, 0), 1);
			const idle = now - lastMove > idleMs;
			const target = idle ? 0 : Math.sign(dx) * (reverse ? 1 : -1) * normalized * max;

			angle += (target - angle) * damp(target === 0 ? outSpeed : inSpeed, seconds);
			if (Math.abs(angle) < 0.001) angle = 0;
			return angle;
		},
		reset() {
			angle = 0;
		}
	};
}
