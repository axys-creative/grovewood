import type { Attachment } from 'svelte/attachments';
import './bg-follow.scss';

/** Fills a button with color from the pointer outward on hover, and back in to where it leaves. Works on the solid and outline Button types. */
export function bgFollow(): Attachment<HTMLElement> {
	return (el) => {
		const previousBackground = el.style.background;

		const place = (x: number, y: number) => {
			const { width, height } = el.getBoundingClientRect();
			const reach = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) * 1.15 + 4;
			el.style.setProperty('--bg-follow-x', `${x}px`);
			el.style.setProperty('--bg-follow-y', `${y}px`);
			el.style.setProperty('--bg-follow-max', `${reach}px`);
		};

		const onPointer = (event: PointerEvent) => {
			const { left, top } = el.getBoundingClientRect();
			place(event.clientX - left, event.clientY - top);
		};

		const onFocus = () => {
			const { width, height } = el.getBoundingClientRect();
			place(width / 2, height / 2);
		};

		el.classList.add('bg-follow');
		el.style.background = 'none';
		el.addEventListener('pointerenter', onPointer);
		el.addEventListener('pointermove', onPointer);
		el.addEventListener('focus', onFocus);

		return () => {
			el.removeEventListener('pointerenter', onPointer);
			el.removeEventListener('pointermove', onPointer);
			el.removeEventListener('focus', onFocus);
			el.classList.remove('bg-follow');
			el.style.background = previousBackground;
			for (const name of ['x', 'y', 'max']) el.style.removeProperty(`--bg-follow-${name}`);
		};
	};
}
