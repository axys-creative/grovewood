import type { Attachment } from 'svelte/attachments';
import { cursor } from '$lib/utils/cursor.svelte';

export type CursorTargetOptions = {
	/** Where the cursor should go: a selector, an element, or a function that returns one. */
	target: string | Element | (() => Element | null);
	/** A named look from `<MouseCursor variants>` while snapped. */
	variant?: string;
	/** Snap as soon as the pointer enters (`enter`), or on the first movement over it (`move`). */
	event?: 'enter' | 'move';
};

/** Detaches the cursor from the mouse and sits it on another element while the pointer is here. */
export function cursorTarget({
	target,
	variant,
	event = 'move'
}: CursorTargetOptions): Attachment<HTMLElement> {
	return (el) => {
		const owner = Symbol('cursor-target');
		let claimed = false;

		const resolve = () =>
			typeof target === 'string'
				? document.querySelector(target)
				: typeof target === 'function'
					? target()
					: target;

		const snap = (pointerEvent: PointerEvent) => {
			if (claimed || pointerEvent.pointerType !== 'mouse') return;
			if (!resolve()) return;

			claimed = true;
			cursor.claim(owner, {
				variant,
				target: () => {
					const rect = resolve()?.getBoundingClientRect();
					return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
				}
			});
		};

		const release = () => {
			claimed = false;
			cursor.release(owner);
		};

		const trigger = event === 'enter' ? 'pointerenter' : 'pointermove';
		el.addEventListener(trigger, snap);
		el.addEventListener('pointerleave', release);

		return () => {
			el.removeEventListener(trigger, snap);
			el.removeEventListener('pointerleave', release);
			cursor.release(owner);
		};
	};
}
