import type { Attachment } from 'svelte/attachments';
import { scribbleBox, scribbleLoop, scribblePath, type ScribbleCurve } from '$lib/utils/scribble';
import { loadGsap } from '$lib/utils/gsap';
import './scribble.scss';

export type ScribbleOptions = {
	/** `underline` is a line under the element. `circle` is a loop drawn around it. */
	type?: 'underline' | 'circle';
	/** For an underline: a preset (`swoosh`, `wave`, `dip`, `flat`; `zigzag` and `notch` are made of straight lines, with one or two there-and-backs or a single V dip; `random` picks one of them for each stroke), or a cubic Bézier in the Marquee Curve's form: `cubic-bezier(x1, y1, x2, y2)`, or the four numbers. The line runs from the left edge to the right at mid-height, and a `y` of 1 is the top, 0 the bottom. */
	curve?: ScribbleCurve;
	/** The line's widest point, from 0 to 1. */
	thickness?: number;
	/** Any CSS color. Defaults to the accent. */
	color?: string;
	/** For an underline: the height of the box the line is drawn in, as a CSS length. */
	height?: string;
	/** For an underline: how far the box sits below the element's bottom edge, as a CSS length. */
	offset?: string;
	/** For a circle: how far the loop sits out from the element, in em. */
	padding?: number;
	/** For a circle: multiplies `padding`, so `1.2` draws the loop farther out and `0.8` closer in. */
	scale?: number;
	/** How ragged the edges are, from 0 (smooth) to 1: they wobble and are chipped in places. */
	rough?: number;
	/** How many thin dry streaks are left bare inside the line, like a dry brush. */
	streaks?: number;
	/** Any number draws the same line every time. Without it each line is different. */
	seed?: number;
	/** Draws it in on hover and focus instead of showing it from the start. */
	hover?: boolean;
	/** Draws it in when the element scrolls into view instead of showing it from the start. Loads GSAP ScrollTrigger when used. */
	scroll?: boolean;
	/** For `scroll`: draw it in each time it scrolls into view (the default is `true`, the first time only). */
	once?: boolean;
	/** For `scroll`: a ScrollTrigger-style start, e.g. `top 85%` (element point, viewport point). */
	start?: string;
	/** For `scroll`: a ScrollTrigger-style end, e.g. `bottom 2%`. With `once: false` the scribble resets past it. */
	end?: string;
	/** For `scroll`: show GSAP's start and end markers for debugging. */
	markers?: boolean;
	/** For `scroll`: a selector or element to watch instead of this element, e.g. a whole section. */
	trigger?: string | Element;
};

const SVG = 'http://www.w3.org/2000/svg';
let counter = 0;

/** Draws a hand-drawn scribble on an element, an underline or a loop: shown from the start, or drawn in on hover and focus. Works on a span, a button or a whole paragraph. */
export function scribble({
	type = 'underline',
	curve = 'swoosh',
	thickness = 0.35,
	rough,
	streaks,
	seed,
	color,
	height,
	offset,
	padding = 0.4,
	scale = 1,
	hover = false,
	scroll = false,
	once = true,
	start = 'top 85%',
	end = 'bottom 2%',
	markers = false,
	trigger
}: ScribbleOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		// Chosen for each element, so one attachment shared by many elements still draws each differently.
		const lineSeed = seed ?? Math.random() * 4294967296;
		const svg = document.createElementNS(SVG, 'svg');
		svg.setAttribute('class', `scribble-stroke scribble-${type}`);
		svg.setAttribute('aria-hidden', 'true');

		const path = document.createElementNS(SVG, 'path');
		path.setAttribute('fill', 'currentColor');
		path.setAttribute('fill-rule', 'evenodd');

		let observer: ResizeObserver | undefined;

		if (type === 'circle') {
			// The loop is drawn at the element's real size, in px, so its line stays an even width however wide the element is.
			const id = `scribble-mask-${++counter}`;
			const mask = document.createElementNS(SVG, 'mask');
			mask.setAttribute('id', id);
			mask.setAttribute('maskUnits', 'userSpaceOnUse');
			const reveal = document.createElementNS(SVG, 'path');
			reveal.setAttribute('class', 'scribble-draw');
			reveal.setAttribute('pathLength', '1');
			reveal.setAttribute('fill', 'none');
			reveal.setAttribute('stroke', '#fff');
			reveal.setAttribute('stroke-linecap', 'round');
			mask.append(reveal);
			svg.append(mask);
			path.setAttribute('mask', `url(#${id})`);

			const draw = () => {
				const size = parseFloat(getComputedStyle(el).fontSize) || 16;
				// More room at the end than at the start: the loop's pass there runs closest to the last letters.
				const padStart = padding * scale * 1.3 * size;
				const padEnd = padding * scale * 1.6 * size;
				const padY = padding * scale * size;
				const width = el.offsetWidth + padStart + padEnd;
				const tall = el.offsetHeight + padY * 2;
				const line = thickness * 0.8 * size;
				const shape = scribbleLoop(width, tall, { width: line, rough, streaks, seed: lineSeed });

				svg.setAttribute('viewBox', `0 0 ${width} ${tall}`);
				svg.style.cssText = `left:${-padStart}px;top:${-padY}px;width:${width}px;height:${tall}px`;
				mask.setAttribute('x', `${-width}`);
				mask.setAttribute('y', `${-tall}`);
				mask.setAttribute('width', `${width * 3}`);
				mask.setAttribute('height', `${tall * 3}`);
				path.setAttribute('d', shape.outline);
				reveal.setAttribute('d', shape.center);
				reveal.setAttribute('stroke-width', `${line * 2.5}`);
			};
			draw();
			observer = new ResizeObserver(draw);
			observer.observe(el);
		} else {
			svg.setAttribute('viewBox', `0 0 ${scribbleBox.width} ${scribbleBox.height}`);
			svg.setAttribute('preserveAspectRatio', 'none');
			path.setAttribute('d', scribblePath(curve, { thickness, rough, streaks, seed: lineSeed }));
		}
		svg.append(path);

		el.classList.add('scribble-host');
		el.toggleAttribute('data-scribble-hover', hover);
		// An inline element is as wide as its text only as a block of its own, so the line can span it.
		if (getComputedStyle(el).display === 'inline') el.classList.add('scribble-inline');
		if (color) el.style.setProperty('--scribble-color', color);
		if (height) el.style.setProperty('--scribble-height', height);
		if (offset) el.style.setProperty('--scribble-offset', offset);
		el.append(svg);

		// With `scroll` it stays undrawn until the element scrolls into view, which sets `data-scribble-in`.
		let cancelled = false;
		let revert: (() => void) | undefined;
		if (scroll) {
			el.setAttribute('data-scribble-scroll', '');
			if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
				el.setAttribute('data-scribble-in', '');
			} else {
				loadGsap('scrollTrigger').then(async (gsap) => {
					const { ScrollTrigger } = await import('gsap/ScrollTrigger');
					if (cancelled) return;
					const watched =
						(typeof trigger === 'string' ? document.querySelector(trigger) : trigger) ?? el;
					const context = gsap.context(() => {
						ScrollTrigger.create({
							trigger: watched,
							start,
							end,
							markers,
							onEnter: (self) => {
								el.setAttribute('data-scribble-in', '');
								if (once) self.kill();
							},
							onEnterBack: () => el.setAttribute('data-scribble-in', ''),
							...(once
								? {}
								: {
										onLeave: () => el.removeAttribute('data-scribble-in'),
										onLeaveBack: () => el.removeAttribute('data-scribble-in')
									})
						});
					}, el);
					revert = () => context.revert();
				});
			}
		}

		return () => {
			cancelled = true;
			revert?.();
			el.removeAttribute('data-scribble-scroll');
			el.removeAttribute('data-scribble-in');
			observer?.disconnect();
			svg.remove();
			el.classList.remove('scribble-host', 'scribble-inline');
			el.removeAttribute('data-scribble-hover');
			for (const name of ['--scribble-color', '--scribble-height', '--scribble-offset'])
				el.style.removeProperty(name);
		};
	};
}
