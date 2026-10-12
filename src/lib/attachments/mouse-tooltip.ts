import type { Attachment } from 'svelte/attachments';
import { createFollower } from '$lib/utils/follow';
import { hasMouse, trackPointer } from '$lib/utils/pointer';
import { createVelocityTilt, type VelocityTiltOptions } from '$lib/utils/velocity-tilt';
import './mouse-tooltip.scss';

export type MouseTooltipOptions = {
	message: string;
	/** Minimum width of the bubble in px. */
	minWidth?: number;
	/** Tilt the bubble by how fast the mouse moves sideways. */
	tilt?: boolean | VelocityTiltOptions;
};

const BUBBLE_ID = 'mouse-tooltip-bubble';

type Shared = {
	root: HTMLElement;
	tiltEl: HTMLElement;
	bubble: HTMLElement;
	follower: ReturnType<typeof createFollower>;
	setTilt: (options: VelocityTiltOptions | null) => void;
};

let shared: Shared | undefined;
let users = 0;

// Created on first use and removed with the last trigger.
function acquire(): Shared {
	users++;
	if (shared) return shared;

	const root = document.createElement('div');
	root.className = 'mouse-tooltip';
	root.setAttribute('aria-hidden', 'true');
	const tiltEl = document.createElement('div');
	tiltEl.className = 'mouse-tooltip__tilt';
	const bubble = document.createElement('div');
	bubble.className = 'mouse-tooltip__bubble center';
	bubble.id = BUBBLE_ID;
	bubble.setAttribute('role', 'tooltip');
	tiltEl.append(bubble);
	root.append(tiltEl);
	document.body.append(root);

	let tilter: ReturnType<typeof createVelocityTilt> | null = null;

	const follower = createFollower({
		onFrame({ x, y, targetX, targetY }) {
			root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
			const angle = tilter ? tilter.update(targetX, targetY) : 0;
			tiltEl.style.rotate = tilter ? `${angle}deg` : '';
			return Math.abs(angle) >= 0.001;
		}
	});

	shared = {
		root,
		tiltEl,
		bubble,
		follower,
		setTilt: (options) => (tilter = options ? createVelocityTilt(options) : null)
	};
	return shared;
}

function release() {
	if (--users > 0 || !shared) return;
	shared.follower.stop();
	shared.root.remove();
	shared = undefined;
}

// Which part of the viewport the pointer is in decides which side of it the bubble sits on.
const quadrant = (x: number, y: number) => {
	const margin = innerWidth < 768 ? 96 : 180;
	const vertical = y < margin ? 'top' : y > innerHeight - margin ? 'bottom' : '';
	const horizontal = x < margin ? 'left' : x > innerWidth - margin ? 'right' : '';
	return [vertical, horizontal].filter(Boolean).join('-') || 'center';
};

/** A small bubble that follows the mouse while it is over this element, and anchors under it on focus or click. */
export function mouseTooltip({
	message,
	minWidth = 280,
	tilt
}: MouseTooltipOptions): Attachment<HTMLElement> {
	return (el) => {
		if (!hasMouse() && !('ontouchstart' in window)) return;

		const { bubble, follower, setTilt } = acquire();
		el.classList.add('mouse-tooltip-trigger');
		el.setAttribute('aria-describedby', BUBBLE_ID);

		let active = false;
		let anchored = false;
		let stopTracking: (() => void) | undefined;

		const place = (x: number, y: number) => {
			bubble.className = `mouse-tooltip__bubble ${quadrant(x, y)}${active ? ' active' : ''}`;
		};

		const show = () => {
			active = true;
			bubble.textContent = message;
			bubble.style.minWidth = `${minWidth}px`;
			setTilt(tilt ? (tilt === true ? {} : tilt) : null);
			bubble.classList.add('active');
		};

		const hide = () => {
			active = false;
			anchored = false;
			bubble.classList.remove('active');
		};

		const startTracking = () => {
			stopTracking?.();
			stopTracking = trackPointer((event) => {
				anchored = false;
				place(event.clientX, event.clientY);
				follower.moveTo(event.clientX, event.clientY);
			});
		};

		const onEnter = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			show();
			startTracking();
			place(event.clientX, event.clientY);
			follower.moveTo(event.clientX, event.clientY);
		};

		const onLeave = () => {
			stopTracking?.();
			stopTracking = undefined;
			hide();
		};

		// Keyboard and click: sit the bubble just under the element until the mouse moves again.
		const anchor = () => {
			show();
			anchored = true;
			startTracking();
			const rect = el.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.bottom + 8;
			place(x, y);
			follower.moveTo(x, y);
		};

		const onBlur = () => {
			stopTracking?.();
			stopTracking = undefined;
			hide();
		};

		const onScroll = () => {
			if (active) hide();
		};

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointerleave', onLeave);
		el.addEventListener('focus', anchor);
		el.addEventListener('click', anchor);
		el.addEventListener('blur', onBlur);
		addEventListener('scroll', onScroll, { passive: true });

		return () => {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('focus', anchor);
			el.removeEventListener('click', anchor);
			el.removeEventListener('blur', onBlur);
			removeEventListener('scroll', onScroll);
			stopTracking?.();
			if (active || anchored) hide();
			el.classList.remove('mouse-tooltip-trigger');
			el.removeAttribute('aria-describedby');
			release();
		};
	};
}
