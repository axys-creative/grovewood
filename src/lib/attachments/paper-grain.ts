import type { Attachment } from 'svelte/attachments';
import './paper-grain.scss';

export type PaperGrainOptions = {
	/** `fibers` is sparse, tiny, randomly turned wisps, `flecks` adds a few specks, `pulp` crosses the lines over a soft mottle. */
	variant?: 'fibers' | 'flecks' | 'pulp';
	/** How visible the grain is, 0 to 1. Defaults to `0.1`. */
	opacity?: number;
	/** Any CSS color for the grain. Defaults to the text color, so it follows the theme. */
	color?: string;
	/** Pixels before the noise tile repeats. Defaults to `480`. */
	size?: number;
};

/** Lays a faint construction-paper texture, made from SVG noise, over an element's background. */
export function paperGrain({
	variant = 'fibers',
	opacity,
	color,
	size
}: PaperGrainOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		el.classList.add('paper-grain', `paper-grain--${variant}`);
		if (opacity !== undefined) el.style.setProperty('--paper-grain-opacity', String(opacity));
		if (color) el.style.setProperty('--paper-grain-color', color);
		if (size) el.style.setProperty('--paper-grain-size', `${size}px`);

		return () => {
			el.classList.remove('paper-grain', `paper-grain--${variant}`);
			el.style.removeProperty('--paper-grain-opacity');
			el.style.removeProperty('--paper-grain-color');
			el.style.removeProperty('--paper-grain-size');
		};
	};
}
