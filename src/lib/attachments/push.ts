import type { Attachment } from 'svelte/attachments';
import { damp } from '$lib/utils/easing';
import { trackPointer } from '$lib/utils/pointer';

export type PushOptions = {
	/** How far the element moves for a given pointer speed. */
	strength?: number;
	/** How quickly it settles back (0-1, per frame at 60fps). Lower is slower. */
	restore?: number;
	/** The most rotation, in degrees, added by the push. `0` turns rotation off. */
	maxRotate?: number;
};

const VELOCITY_SCALE = 30;
const SETTLE_THRESHOLD = 0.01;
const SCROLL_SETTLE_MS = 250;
const STALE_MS = 100;

// One mouse tracker serves every element. Pointer speed is the distance moved between two events.
const velocity = { x: 0, y: 0, lastX: 0, lastY: 0, time: 0, tracking: false };
let users = 0;
let stopTracking: (() => void) | undefined;
let settleTimer: ReturnType<typeof setTimeout> | undefined;

const onMove = (event: PointerEvent) => {
	if (velocity.tracking) {
		velocity.x = event.clientX - velocity.lastX;
		velocity.y = event.clientY - velocity.lastY;
	} else {
		velocity.x = 0;
		velocity.y = 0;
		velocity.tracking = true;
	}
	velocity.lastX = event.clientX;
	velocity.lastY = event.clientY;
	velocity.time = event.timeStamp;
};

// Scrolling moves elements under a still pointer, so speed is ignored until the scroll settles.
const onScroll = () => {
	velocity.x = velocity.y = 0;
	velocity.tracking = false;
	clearTimeout(settleTimer);
	settleTimer = setTimeout(() => (velocity.tracking = true), SCROLL_SETTLE_MS);
};

function retain() {
	if (users++) return;
	stopTracking = trackPointer(onMove);
	addEventListener('scroll', onScroll, { passive: true });
}

function release() {
	if (--users) return;
	stopTracking?.();
	removeEventListener('scroll', onScroll);
	clearTimeout(settleTimer);
	velocity.tracking = false;
}

/** Pushes an element the way the pointer was moving when it entered, spinning it a little, then eases it back. */
export function push({
	strength = 10,
	restore = 0.1,
	maxRotate = 25
}: PushOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		retain();

		// A CSS transition follows the script's values, which is what makes the push feel soft.
		const previousTransition = el.style.transition;
		el.style.transition = `${getComputedStyle(el).transition}, translate 640ms var(--ease), rotate 640ms var(--ease)`;

		let offsetX = 0;
		let offsetY = 0;
		let rotation = 0;
		let frame = 0;
		let lastTime = 0;
		let fresh = false;

		const apply = () => {
			el.style.translate = `${offsetX}px ${offsetY}px`;
			el.style.rotate = `${rotation}deg`;
		};

		// Where the pointer hits decides which way it spins: hit the top edge going sideways and it
		// rotates one way, the bottom edge the other.
		const rotationFor = (
			relX: number,
			relY: number,
			width: number,
			height: number,
			speed: number
		) => {
			if (maxRotate === 0) return 0;

			const centerX = (relX / width) * 2 - 1;
			const centerY = (relY / height) * 2 - 1;
			const horizontal = Math.abs(velocity.x) > Math.abs(velocity.y);
			const base = horizontal
				? -centerY * Math.sign(velocity.x) * maxRotate
				: centerX * Math.sign(velocity.y) * maxRotate;
			return base * speed;
		};

		const tick = (now: number) => {
			const seconds = fresh ? 1 / 60 : Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
			fresh = false;
			lastTime = now;

			const amount = damp(restore, seconds);
			offsetX -= offsetX * amount;
			offsetY -= offsetY * amount;
			rotation -= rotation * amount;

			if (
				Math.abs(offsetX) < SETTLE_THRESHOLD &&
				Math.abs(offsetY) < SETTLE_THRESHOLD &&
				Math.abs(rotation) < SETTLE_THRESHOLD
			) {
				offsetX = offsetY = rotation = 0;
				el.style.translate = '';
				el.style.rotate = '';
				frame = 0;
				return;
			}

			apply();
			frame = requestAnimationFrame(tick);
		};

		const start = () => {
			if (frame) return;
			fresh = true;
			frame = requestAnimationFrame(tick);
		};

		const onEnter = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;

			// An element arriving under a still pointer is not a push. A real move enters before its
			// own pointermove is recorded, so the pointer has not been seen at this spot yet.
			const arrived = event.clientX === velocity.lastX && event.clientY === velocity.lastY;
			if (arrived || event.timeStamp - velocity.time > STALE_MS) velocity.x = velocity.y = 0;

			const rect = el.getBoundingClientRect();
			const speed = Math.min(Math.hypot(velocity.x, velocity.y) / VELOCITY_SCALE, 1);

			offsetX = velocity.x * strength;
			offsetY = velocity.y * strength;
			rotation = rotationFor(
				event.clientX - rect.left,
				event.clientY - rect.top,
				rect.width,
				rect.height,
				speed
			);
			apply();
			start();
		};

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointerleave', start);

		return () => {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointerleave', start);
			cancelAnimationFrame(frame);
			el.style.transition = previousTransition;
			el.style.translate = '';
			el.style.rotate = '';
			release();
		};
	};
}
