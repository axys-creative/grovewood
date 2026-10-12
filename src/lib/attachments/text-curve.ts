import type { Attachment } from 'svelte/attachments';
import './text-curve.scss';

export type TextCurveOptions = {
	radius?: number;
	kerning?: number;
	centered?: boolean;
	spin?: 'right' | 'left';
	spinDuration?: number;
};

const RESIZE_DEBOUNCE_MS = 250;
const RADIUS_SCALE = 500;
const HEIGHT_PADDING = 50;

/** Bends an element's text along a circular arc. */
export function textCurve({
	radius = 1,
	kerning = 0,
	centered = false,
	spin,
	spinDuration
}: TextCurveOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const original = Array.from(el.childNodes);
		const text = el.textContent ?? '';

		const readable = document.createElement('span');
		readable.className = 'visually-hidden';
		readable.textContent = text;

		const wrapper = document.createElement('span');
		wrapper.className = 'text-curve__chars';
		wrapper.setAttribute('aria-hidden', 'true');
		const chars = [...text].map((char) => {
			const span = document.createElement('span');
			span.className = 'text-curve__char';
			span.textContent = char === ' ' ? ' ' : char;
			wrapper.append(span);
			return span;
		});

		el.replaceChildren(readable, wrapper);
		el.classList.add('text-curve');
		if (spin) el.classList.add(`text-curve--spin-${spin}`);
		if (spinDuration) el.style.setProperty('--text-curve-spin-duration', `${spinDuration}s`);

		const arcRadius = radius === 0 ? 999999 : RADIUS_SCALE / Math.abs(radius);

		const layout = () => {
			const widths = chars.map((span) => span.offsetWidth);
			const arcLength =
				widths.reduce((sum, width) => sum + width, 0) + kerning * (chars.length - 1);
			const startAngle = -arcLength / arcRadius / 2;
			const rise = arcRadius - arcRadius * Math.cos(arcLength / arcRadius / 2);
			const offsetY = centered ? (radius > 0 ? rise / 2 : -rise / 2) : 0;

			let position = 0;
			chars.forEach((span, index) => {
				const angle = startAngle + (position + widths[index] / 2) / arcRadius;
				const x = Math.sin(angle) * arcRadius;
				const y = (Math.cos(angle) - 1) * arcRadius;
				const degrees = (angle * 180) / Math.PI;
				span.style.transform = `translate(${x}px, ${(radius > 0 ? y : -y) + offsetY}px) rotate(${radius > 0 ? -degrees : degrees}deg)`;
				position += widths[index] + kerning;
			});

			el.style.width = `${arcLength}px`;
			el.style.height = `${rise + HEIGHT_PADDING}px`;
		};

		layout();
		document.fonts?.ready.then(layout);

		let timer: ReturnType<typeof setTimeout>;
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(layout, RESIZE_DEBOUNCE_MS);
		};
		window.addEventListener('resize', onResize);

		return () => {
			clearTimeout(timer);
			window.removeEventListener('resize', onResize);
			el.replaceChildren(...original);
			el.classList.remove('text-curve', 'text-curve--spin-right', 'text-curve--spin-left');
			el.style.removeProperty('--text-curve-spin-duration');
			el.style.width = '';
			el.style.height = '';
		};
	};
}
