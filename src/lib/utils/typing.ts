export type TypingCursor = 'caret' | 'underscore' | 'none';

const CURSORS: Record<TypingCursor, string> = { caret: '|', underscore: '_', none: '' };

/** The time between two keystrokes, varied a little so it feels typed by hand. */
export const keystroke = (speed: number, variation: number) =>
	Math.max(speed + Math.random() * variation - variation / 2, 20);

/**
 * Replaces an element's content with a text span and a cursor, plus a hidden copy of the full text
 * for screen readers. Returns the pieces and a function that puts the original content back.
 */
export function prepareTyping(el: HTMLElement, cursor: TypingCursor, readable: string) {
	const original = Array.from(el.childNodes);

	const hidden = document.createElement('span');
	hidden.className = 'visually-hidden';
	hidden.textContent = readable;

	const text = document.createElement('span');
	text.setAttribute('aria-hidden', 'true');

	const caret = document.createElement('span');
	caret.className = 'typing__cursor';
	caret.setAttribute('aria-hidden', 'true');
	caret.textContent = CURSORS[cursor];

	el.replaceChildren(hidden, text, caret);

	return { text, restore: () => el.replaceChildren(...original) };
}
