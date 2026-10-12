import type { Attachment } from 'svelte/attachments';
import { cursor, type CursorClaim } from '$lib/utils/cursor.svelte';
import type { VelocityTiltOptions } from '$lib/utils/velocity-tilt';

export type CursorContentOptions = {
	/** Text shown inside the cursor. */
	message?: string;
	/** An icon name from `static/icons`, or `true` for the cursor's default icon. */
	icon?: string | true;
	iconSize?: 'sm' | 'md' | 'lg';
	iconColor?: string;
	/** A picture shown inside the cursor, e.g. `/images/img-sample-1.jpg`. */
	image?: string;
	/** Whether the picture sits over the cursor's message and icon (`front`) or under them (`behind`, the default). */
	imageLayer?: 'front' | 'behind';
	/** A second icon the cursor swaps to each time the element is clicked, e.g. play and pause. */
	iconSwap?: string;
	/** A named look from `<MouseCursor variants>`. */
	variant?: string;
	/** Tilt the cursor by how fast the mouse moves while over this element. A picture tilts slightly by default; pass `false` to stop it. */
	tilt?: boolean | VelocityTiltOptions;
};

export function cursorContent({
	message,
	icon,
	iconSize,
	iconColor,
	image,
	imageLayer,
	iconSwap,
	variant,
	tilt
}: CursorContentOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const owner = Symbol('cursor-content');
		let swapped = false;
		let claimed = false;
		const resolvedTilt =
			tilt === true ? {} : tilt === undefined && image ? { max: 10 } : tilt || undefined;

		const claim = (): CursorClaim => ({
			variant,
			content: {
				message,
				icon: swapped && iconSwap ? iconSwap : icon,
				iconSize,
				iconColor,
				image,
				imageLayer
			},
			tilt: resolvedTilt
		});

		const lifted = !!image && imageLayer !== 'front';
		let restore: (() => void) | undefined;

		const lift = () => {
			const { position, zIndex } = el.style;
			if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
			el.style.zIndex = 'calc(var(--z-cursor-behind) + 1)';
			restore = () => {
				el.style.position = position;
				el.style.zIndex = zIndex;
			};
		};

		const onEnter = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			claimed = true;
			if (lifted && !restore) lift();
			cursor.claim(owner, claim());
		};

		const onLeave = () => {
			claimed = false;
			restore?.();
			restore = undefined;
			cursor.release(owner);
		};

		const onClick = () => {
			if (!iconSwap) return;
			swapped = !swapped;
			if (claimed) cursor.claim(owner, claim());
		};

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointerleave', onLeave);
		el.addEventListener('click', onClick);

		return () => {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('click', onClick);
			restore?.();
			cursor.release(owner);
		};
	};
}
