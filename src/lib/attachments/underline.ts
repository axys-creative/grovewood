import type { Attachment } from 'svelte/attachments';
import './underline.scss';

/** Draws a line under a button's label that slides away on hover. Works with any Button type. */
export function underline(): Attachment<HTMLElement> {
	return (el) => {
		const target = el.querySelector<HTMLElement>('.label') ?? el;
		target.classList.add('underline-effect');
		return () => target.classList.remove('underline-effect');
	};
}
