import type { Attachment } from 'svelte/attachments';
import './text-roll.scss';

export type TextRollOptions = {
	/** Seconds between each letter starting to roll. */
	stagger?: number;
	/** Seconds each letter takes to roll. */
	duration?: number;
	/** The element that holds the text: a selector inside, or an element. Defaults to a `.label` (as in Button), else the element itself. */
	target?: string | HTMLElement;
};

/** Rolls each letter up and out as the pointer or keyboard focus arrives, replaced by a copy from below. */
export function textRoll({
	stagger = 0.02,
	duration = 0.6,
	target: targetOption
}: TextRollOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const target =
			(typeof targetOption === 'string'
				? el.querySelector<HTMLElement>(targetOption)
				: targetOption) ??
			el.querySelector<HTMLElement>('.label') ??
			el;
		const original = Array.from(target.childNodes);
		const text = target.textContent ?? '';

		const readable = document.createElement('span');
		readable.className = 'visually-hidden';
		readable.textContent = text;

		const chars = document.createElement('span');
		chars.className = 'text-roll__chars';
		chars.setAttribute('aria-hidden', 'true');
		[...text].forEach((char, index) => {
			const span = document.createElement('span');
			span.className = 'text-roll__char';
			span.dataset.char = char;
			span.textContent = char;
			span.style.setProperty('--text-roll-index', String(index));
			chars.append(span);
		});

		target.replaceChildren(readable, chars);
		el.classList.add('text-roll');
		el.style.setProperty('--text-roll-stagger', `${stagger}s`);
		el.style.setProperty('--text-roll-duration', `${duration}s`);

		return () => {
			target.replaceChildren(...original);
			el.classList.remove('text-roll');
			el.style.removeProperty('--text-roll-stagger');
			el.style.removeProperty('--text-roll-duration');
		};
	};
}
