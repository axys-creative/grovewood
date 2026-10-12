import type { Attachment } from 'svelte/attachments';
import './theme-follow.scss';

const themes = ['dark', 'light', 'invert'];
const selector = themes.map((theme) => `.theme-${theme}`).join(', ');

/** Takes the theme of the `theme-dark`, `theme-light` or `theme-invert` surface behind this element. */
export function themeFollow(): Attachment<HTMLElement> {
	return (el) => {
		let frame = 0;

		const update = () => {
			frame = 0;
			const { left, top, width, height } = el.getBoundingClientRect();
			const behind = document
				.elementsFromPoint(left + width / 2, top + height / 2)
				.find((found) => !el.contains(found) && found.closest(selector));
			const surface = behind?.closest(selector);
			const theme = themes.find((name) => surface?.classList.contains(`theme-${name}`));

			if (theme) el.dataset.themeFollow = theme;
			else delete el.dataset.themeFollow;
		};

		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		update();
		window.addEventListener('scroll', schedule, { passive: true, capture: true });
		window.addEventListener('resize', schedule);

		return () => {
			window.removeEventListener('scroll', schedule, { capture: true });
			window.removeEventListener('resize', schedule);
			cancelAnimationFrame(frame);
			delete el.dataset.themeFollow;
		};
	};
}
