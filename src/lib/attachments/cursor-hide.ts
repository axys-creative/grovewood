import type { Attachment } from 'svelte/attachments';
import { cursor } from '$lib/utils/cursor.svelte';

/** Hides the custom cursor while the mouse is over this element. */
export function cursorHide(): Attachment<HTMLElement> {
	return (el) => {
		const owner = Symbol('cursor-hide');

		const onEnter = (event: PointerEvent) => {
			if (event.pointerType === 'mouse') cursor.claim(owner, { hidden: true });
		};
		const onLeave = () => cursor.release(owner);

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointerleave', onLeave);

		return () => {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointerleave', onLeave);
			cursor.release(owner);
		};
	};
}
