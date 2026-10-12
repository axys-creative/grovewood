import { loadGsap } from './gsap';

export type TextEffect = 'reveal' | 'fade' | 'scale' | 'flip' | 'none';

export type PreparedTextEffect = { play: () => void; revert: () => void };

/**
 * Splits an element's words once and returns a `play` that runs the effect on demand. The scroll-driven `text-*`
 * attachments time themselves off the element's own scroll position, which is wrong for text inside a pinned
 * frame, so this leaves the timing to the caller.
 */
export async function prepareTextEffect(
	el: HTMLElement,
	effect: TextEffect
): Promise<PreparedTextEffect | undefined> {
	if (effect === 'none') return;

	const gsap = await loadGsap('splitText');
	const { SplitText } = await import('gsap/SplitText');

	const split = SplitText.create(el, {
		type: 'words',
		wordsClass: 'text-effect__word',
		aria: 'auto',
		...(effect === 'reveal' ? { mask: 'words' as const } : {})
	});
	const words = split.words as HTMLElement[];
	const shuffled = () => gsap.utils.shuffle(words.slice());

	if (effect === 'scale') {
		// Each word grows from the side nearest the middle of the line.
		const box = el.getBoundingClientRect();
		words.forEach((word) => {
			const rect = word.getBoundingClientRect();
			const center = (rect.left + rect.width / 2 - box.left) / box.width;
			word.style.transformOrigin = `${Math.round((1 - center) * 100)}% 50%`;
		});
	}

	const play = () => {
		if (effect === 'fade') {
			gsap.fromTo(
				shuffled(),
				{ opacity: 0 },
				{ opacity: 1, duration: 0.25, stagger: 0.0125, ease: 'linear' }
			);
		} else if (effect === 'reveal') {
			gsap.fromTo(
				words,
				{ yPercent: 100 },
				{ yPercent: 0, duration: 0.2, stagger: 0.05, ease: 'linear' }
			);
		} else if (effect === 'scale') {
			gsap.fromTo(
				shuffled(),
				{ scale: 0, opacity: 0 },
				{ scale: 1, opacity: 1, duration: 0.25, stagger: 0.0125, ease: 'linear' }
			);
		} else {
			gsap.fromTo(
				words,
				{ rotateX: -65, transformPerspective: 500, transformOrigin: 'top', opacity: 0 },
				{ rotateX: 0, opacity: 1, duration: 1, stagger: 0.05, ease: 'power2.out' }
			);
		}
	};

	return {
		play,
		revert: () => {
			gsap.killTweensOf(words);
			split.revert();
		}
	};
}
