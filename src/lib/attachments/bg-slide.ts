import type { Attachment } from 'svelte/attachments';
import './bg-slide.scss';

export type BgSlideOptions = {
	/** The way the color slides: out of a solid button, into an outline button. */
	direction?: 'right' | 'left' | 'up' | 'down';
};

const vectors = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] } as const;

/** Slides a block of color across a button on hover. Works on the solid and outline Button types. */
export function bgSlide({ direction = 'right' }: BgSlideOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const [x, y] = vectors[direction];
		const previousBackground = el.style.background;

		el.classList.add('bg-slide');
		el.style.background = 'none';
		el.style.setProperty('--bg-slide-x', String(x));
		el.style.setProperty('--bg-slide-y', String(y));

		return () => {
			el.classList.remove('bg-slide');
			el.style.background = previousBackground;
			el.style.removeProperty('--bg-slide-x');
			el.style.removeProperty('--bg-slide-y');
		};
	};
}
