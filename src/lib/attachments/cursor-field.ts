import type { Attachment } from 'svelte/attachments';
import { damp } from '$lib/utils/easing';
import { hasMouse, trackPointer } from '$lib/utils/pointer';
import { createVelocityTilt, type VelocityTiltOptions } from '$lib/utils/velocity-tilt';

export type CursorFieldOptions = {
	/** The element that moves: a selector inside the field, an element, or the first child. */
	child?: string | HTMLElement;
	/** `ease` glides, `spring` overshoots, `instant` sticks to the pointer. */
	ease?: 'ease' | 'spring' | 'instant';
	/** How quickly the child follows the pointer (0-1, per frame at 60fps). */
	followSpeed?: number;
	/** How quickly the child returns to the center (0-1, per frame at 60fps). */
	returnSpeed?: number;
	/** How bouncy a `spring` is (0-1). */
	bounce?: number;
	/** Tilt the child by how fast the mouse moves sideways. */
	tilt?: boolean | VelocityTiltOptions;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Lets a child element lean toward the mouse while it is inside the field, staying within its bounds. */
export function cursorField({
	child: childOption,
	ease = 'ease',
	followSpeed = 0.08,
	returnSpeed = 0.06,
	bounce = 0.6,
	tilt
}: CursorFieldOptions = {}): Attachment<HTMLElement> {
	return (field) => {
		const child =
			typeof childOption === 'string'
				? field.querySelector<HTMLElement>(childOption)
				: (childOption ?? (field.firstElementChild as HTMLElement | null));
		if (!child || !hasMouse() || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const tilter = tilt ? createVelocityTilt(tilt === true ? {} : tilt) : null;
		let active = false;
		let currentX = 0;
		let currentY = 0;
		let targetX = 0;
		let targetY = 0;
		let velocityX = 0;
		let velocityY = 0;
		let frame = 0;
		let lastTime = 0;
		let fresh = false;
		let stopTracking: (() => void) | undefined;

		const toTarget = (clientX: number, clientY: number) => {
			const parent = field.getBoundingClientRect();
			const size = child.getBoundingClientRect();
			const maxX = Math.max((parent.width - size.width) / 2, 0);
			const maxY = Math.max((parent.height - size.height) / 2, 0);
			targetX = clamp(clientX - (parent.left + parent.width / 2), -maxX, maxX);
			targetY = clamp(clientY - (parent.top + parent.height / 2), -maxY, maxY);
		};

		const spring = (current: number, target: number, velocity: number, speed: number) => {
			const next = (velocity + (target - current) * speed * 2) * (1 - bounce * 0.9);
			return { value: current + next, velocity: next };
		};

		const tick = (now: number) => {
			const seconds = fresh ? 1 / 60 : Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
			fresh = false;
			lastTime = now;
			const speed = active ? followSpeed : returnSpeed;
			let moving = false;

			if (ease === 'instant') {
				currentX = targetX;
				currentY = targetY;
			} else if (ease === 'spring') {
				for (let i = Math.max(1, Math.round(seconds * 60)); i > 0; i--) {
					const sx = spring(currentX, targetX, velocityX, speed);
					const sy = spring(currentY, targetY, velocityY, speed);
					[currentX, velocityX, currentY, velocityY] = [
						sx.value,
						sx.velocity,
						sy.value,
						sy.velocity
					];
				}
				moving = [currentX - targetX, currentY - targetY, velocityX, velocityY].some(
					(value) => Math.abs(value) > 0.01
				);
			} else {
				const amount = damp(speed, seconds);
				currentX += (targetX - currentX) * amount;
				currentY += (targetY - currentY) * amount;
				moving = Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01;
			}

			child.style.translate = `${currentX}px ${currentY}px`;
			const angle = tilter ? tilter.update(targetX, targetY) : 0;
			if (tilter) child.style.rotate = `${angle}deg`;

			frame =
				ease === 'instant' || moving || Math.abs(angle) > 0.001 ? requestAnimationFrame(tick) : 0;
		};

		const start = () => {
			if (frame) return;
			fresh = true;
			frame = requestAnimationFrame(tick);
		};

		const onEnter = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			active = true;
			velocityX = velocityY = 0;
			stopTracking?.();
			stopTracking = trackPointer((moveEvent) => {
				toTarget(moveEvent.clientX, moveEvent.clientY);
				start();
			});
			toTarget(event.clientX, event.clientY);
			start();
		};

		const onLeave = () => {
			active = false;
			stopTracking?.();
			stopTracking = undefined;
			targetX = targetY = 0;
			start();
		};

		field.addEventListener('pointerenter', onEnter);
		field.addEventListener('pointerleave', onLeave);

		return () => {
			field.removeEventListener('pointerenter', onEnter);
			field.removeEventListener('pointerleave', onLeave);
			stopTracking?.();
			cancelAnimationFrame(frame);
			child.style.translate = '';
			child.style.rotate = '';
		};
	};
}
