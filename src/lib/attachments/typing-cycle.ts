import type { Attachment } from 'svelte/attachments';
import { keystroke, prepareTyping, type TypingCursor } from '$lib/utils/typing';
import './typing.scss';

export type TypingCycleOptions = {
	/** The words to type and delete, in order, then around again. */
	words: string[];
	/** Colors to switch to along with each word. Any CSS color, including variables. */
	colors?: string[];
	/** Milliseconds per character typed. */
	speedIn?: number;
	/** Milliseconds per character deleted. */
	speedOut?: number;
	/** Milliseconds a finished word stays before it is deleted. */
	interval?: number;
	cursor?: TypingCursor;
	/** Milliseconds to wait before the first word. */
	delay?: number;
	/** Start when the element scrolls into view instead of right away. */
	onScroll?: boolean;
};

/** Types a word, deletes it, and moves to the next, forever, like someone at a keyboard. */
export function typingCycle({
	words,
	colors = [],
	speedIn = 120,
	speedOut = 50,
	interval = 2000,
	cursor = 'caret',
	delay = 0,
	onScroll = false
}: TypingCycleOptions): Attachment<HTMLElement> {
	return (el) => {
		if (!words.length) return;

		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const { text, restore } = prepareTyping(el, reduced ? 'none' : cursor, words.join(', '));

		if (reduced) {
			text.textContent = words[0];
			return restore;
		}

		let timer: ReturnType<typeof setTimeout> | undefined;
		let observer: IntersectionObserver | undefined;
		let wordIndex = 0;
		let charIndex = 0;
		let deleting = false;

		const type = () => {
			const word = words[wordIndex];
			text.textContent = deleting ? word.substring(0, charIndex--) : word.substring(0, charIndex++);

			if (!deleting && charIndex === 1 && colors.length) {
				text.style.color = colors[wordIndex % colors.length];
			}

			if (!deleting && charIndex > word.length) {
				timer = setTimeout(() => {
					deleting = true;
					type();
				}, interval);
			} else if (deleting && charIndex < 0) {
				deleting = false;
				wordIndex = (wordIndex + 1) % words.length;
				charIndex = 0;
				type();
			} else {
				timer = setTimeout(type, keystroke(deleting ? speedOut : speedIn, 100));
			}
		};

		if (onScroll) {
			observer = new IntersectionObserver(([entry]) => {
				if (!entry.isIntersecting) return;
				observer?.disconnect();
				timer = setTimeout(type, delay);
			});
			observer.observe(el);
		} else {
			timer = setTimeout(type, delay);
		}

		return () => {
			observer?.disconnect();
			clearTimeout(timer);
			restore();
		};
	};
}
