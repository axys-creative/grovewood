import type { Attachment } from 'svelte/attachments';
import './text-roll.scss';

export type TextRollOptions = {
	/** Seconds between each letter starting to roll. Longer text rolls faster by default (see `text-roll.scss`). */
	stagger?: number;
	/** Seconds each letter takes to roll. */
	duration?: number;
	/** The element that holds the text: a selector inside, or an element. Defaults to a `.label` (as in Button), else the element itself. */
	target?: string | HTMLElement;
};

/** Rolls each letter up and out as the pointer or keyboard focus arrives, replaced by a copy from below. */
const LONG = 12;
const LONGEST = 30;

export function textRoll({
	stagger,
	duration,
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
		// Text is split into lines at each <br>, so a break from the CMS is kept.
		const lines: string[] = [''];
		const walker = document.createTreeWalker(
			target,
			NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
		);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			if (node.nodeType === Node.TEXT_NODE) lines[lines.length - 1] += node.textContent ?? '';
			else if ((node as Element).tagName === 'BR') lines.push('');
		}

		const readable = document.createElement('span');
		readable.className = 'visually-hidden';
		readable.textContent = lines.join(' ');

		const rows = lines.map((text, row) => {
			const chars = document.createElement('span');
			chars.className = 'text-roll__chars';
			chars.setAttribute('aria-hidden', 'true');
			const offset = lines.slice(0, row).reduce((sum, line) => sum + [...line].length, 0);
			[...text].forEach((char, index) => {
				const span = document.createElement('span');
				span.className = 'text-roll__char';
				span.dataset.char = char;
				span.textContent = char;
				span.style.setProperty('--text-roll-index', String(offset + index));
				chars.append(span);
			});
			return chars;
		});

		target.replaceChildren(
			readable,
			...rows.flatMap((chars, row) => (row ? [document.createElement('br'), chars] : [chars]))
		);
		const length = lines.reduce((sum, line) => sum + [...line].length, 0);
		el.classList.add('text-roll');
		if (length > LONGEST) el.classList.add('text-roll--longest');
		else if (length > LONG) el.classList.add('text-roll--long');
		if (stagger !== undefined) el.style.setProperty('--text-roll-stagger', `${stagger}s`);
		if (duration !== undefined) el.style.setProperty('--text-roll-duration', `${duration}s`);

		return () => {
			target.replaceChildren(...original);
			el.classList.remove('text-roll', 'text-roll--long', 'text-roll--longest');
			el.style.removeProperty('--text-roll-stagger');
			el.style.removeProperty('--text-roll-duration');
		};
	};
}
