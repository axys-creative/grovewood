import type { Attachment } from 'svelte/attachments';

export type ButtonJumpOptions = {
	/** The size at the peak, as a multiple of the size. */
	scale?: number;
	/** Milliseconds for the jump up and back. */
	duration?: number;
};

/** Pops an element up and back once when it is hovered or focused. */
export function buttonJump({
	scale = 1.1,
	duration = 300
}: ButtonJumpOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let animation: Animation | undefined;

		const jump = () => {
			if ('disabled' in el && el.disabled) return;
			animation?.cancel();
			const base = parseFloat(getComputedStyle(el).scale) || 1;
			// No 0% or 100% keyframe, so it starts and ends on whatever the element is at.
			animation = el.animate([{ scale: base * scale, offset: 0.4 }], {
				duration,
				easing: 'ease-in-out'
			});
		};

		const onFocus = () => {
			if (el.matches(':focus-visible')) jump();
		};

		el.addEventListener('pointerenter', jump);
		el.addEventListener('focus', onFocus);

		return () => {
			el.removeEventListener('pointerenter', jump);
			el.removeEventListener('focus', onFocus);
			animation?.cancel();
		};
	};
}
