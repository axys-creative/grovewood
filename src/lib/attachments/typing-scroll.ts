import type { Attachment } from 'svelte/attachments';
import { keystroke, prepareTyping, type TypingCursor } from '$lib/utils/typing';
import './typing.scss';

export type TypingScrollOptions = {
	/** Milliseconds per character. */
	speed?: number;
	/** Only type the first time it scrolls into view. */
	once?: boolean;
	cursor?: TypingCursor;
	/** Milliseconds to wait before typing starts. */
	delay?: number;
};

/** Types the element's text out, character by character, each time it scrolls into view. */
export function typingScroll({
	speed = 50,
	once = false,
	cursor = 'caret',
	delay = 0
}: TypingScrollOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const full = el.textContent?.trim() ?? '';
		const { text, restore } = prepareTyping(el, cursor, full);

		let timer: ReturnType<typeof setTimeout> | undefined;
		let started = false;

		const type = () => {
			if (once && started) return;
			started = true;
			clearTimeout(timer);

			let index = 0;
			text.textContent = '';
			const next = () => {
				if (index >= full.length) return;
				text.textContent += full.charAt(index++);
				timer = setTimeout(next, keystroke(speed, 40));
			};
			timer = setTimeout(next, delay);
		};

		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) type();
			else if (!once) clearTimeout(timer);
		});
		observer.observe(el);

		return () => {
			observer.disconnect();
			clearTimeout(timer);
			restore();
		};
	};
}
