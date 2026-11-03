import type { Attachment } from 'svelte/attachments';
import './text-underline.scss';

export type TextUnderlineOptions = {
	/** Seconds to wait before drawing. */
	delay?: number;
};

/** Draws a line under the element's text (its `.label` when it has one, so icons stay clear) as the pointer or keyboard focus arrives. */
export function textUnderline({ delay = 0 }: TextUnderlineOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const target = el.querySelector<HTMLElement>(':scope > .label') ?? el;
		el.classList.add('text-underline-host');
		target.classList.add('text-underline');
		if (delay) el.style.setProperty('--text-underline-delay', `${delay}s`);

		return () => {
			el.classList.remove('text-underline-host');
			target.classList.remove('text-underline');
			el.style.removeProperty('--text-underline-delay');
		};
	};
}
