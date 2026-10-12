import type { Attachment } from 'svelte/attachments';
import './dots-fill.scss';

export type DotsFillOptions = {
	/** The radius of each dot, in the SVG's own units. On an `<img>`, in px. */
	size?: number;
	/** The space between dot centers, in the same units. */
	gap?: number;
	/** How quickly the pointer's speed fades once it stops (0-1). Higher stops the push sooner. */
	restore?: number;
	/** How long dots keep moving after a push (0-1). Closer to `1` springs back more slowly. */
	sensitivity?: number;
	/** How far from the pointer dots react, in the SVG's own units. On an `<img>`, in px. */
	distance?: number;
	/** How hard the pointer pushes dots away. */
	strength?: number;
	/** Any CSS color, including `var(--color-accent)`. Defaults to the element's own text color. */
	color?: string;
	/** Dots fade down away from the pointer, so the ones near it light up. */
	illuminate?: boolean;
	/** How much dots swell near the pointer, as a multiple of their size. `0` keeps them the same size. */
	grow?: number;
};

type Dot = {
	el: SVGCircleElement;
	anchorX: number;
	anchorY: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	smoothX: number;
	smoothY: number;
	opacity: number;
	radius: number;
};

type Point = [number, number];

const SHAPES = 'circle, rect, path, polygon, ellipse';
const SVG = 'http://www.w3.org/2000/svg';
const MIN_INTENSITY = 0.25;
/** How opaque a pixel must be to count as part of an image. */
const SOLID = 40;

/**
 * Draws a dot at each point inside `svg` and lets the pointer push them around. Returns what undoes it. The loop
 * only runs while the SVG is on screen, and with reduced motion the dots are drawn and left still.
 */
function animateDots(
	svg: SVGSVGElement,
	points: Point[],
	{
		size,
		restore,
		sensitivity,
		distance,
		strength,
		illuminate,
		grow
	}: Required<Omit<DotsFillOptions, 'color' | 'gap'>>
) {
	const group = document.createElementNS(SVG, 'g');
	group.setAttribute('aria-hidden', 'true');
	const dots: Dot[] = points.map(([x, y]) => {
		const el = document.createElementNS(SVG, 'circle');
		el.setAttribute('cx', String(x));
		el.setAttribute('cy', String(y));
		el.setAttribute('r', String(size));
		el.classList.add('dots-fill__dot');
		group.append(el);
		return {
			el,
			anchorX: x,
			anchorY: y,
			x,
			y,
			vx: 0,
			vy: 0,
			smoothX: x,
			smoothY: y,
			opacity: 1,
			radius: size
		};
	});
	svg.append(group);

	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => group.remove();

	const viewBox = svg.viewBox.baseVal;
	const pointer = { x: 0, y: 0, previousX: 0, previousY: 0, speed: 0, seen: false };
	let frame = 0;
	let visible = false;

	const onMove = (event: PointerEvent) => {
		pointer.x = event.clientX;
		pointer.y = event.clientY;
		pointer.seen = true;
	};

	const tick = () => {
		// The SVG's place on screen is read each frame, so scrolling moves the dots under a still pointer.
		const bounds = svg.getBoundingClientRect();
		const scaleX = viewBox.width / bounds.width;
		const scaleY = viewBox.height / bounds.height;
		const pointerX = (pointer.x - bounds.left) * scaleX + viewBox.x;
		const pointerY = (pointer.y - bounds.top) * scaleY + viewBox.y;

		// How fast the pointer moves sets how hard it pushes. A jump too big to be a real move resets it.
		const travelled = Math.hypot(pointer.previousX - pointer.x, pointer.previousY - pointer.y);
		if (travelled > 200) pointer.speed = 0;
		else pointer.speed += (travelled - pointer.speed) * restore;
		if (pointer.speed < 0.001) pointer.speed = 0;
		pointer.previousX = pointer.x;
		pointer.previousY = pointer.y;

		for (const dot of dots) {
			const dx = pointerX - dot.x;
			const dy = pointerY - dot.y;
			const away = Math.max(Math.hypot(dx, dy), 1);
			const intensity =
				MIN_INTENSITY + Math.min(Math.max(1 - away / distance, 0), 1) * (1 - MIN_INTENSITY);

			// Only touched when it has changed enough to see.
			if (illuminate && Math.abs(dot.opacity - intensity) > 0.01) {
				dot.el.style.opacity = String(intensity);
				dot.opacity = intensity;
			}
			if (grow > 0) {
				const radius = size * (1 + intensity * grow);
				if (Math.abs(dot.radius - radius) > 0.1) {
					dot.el.setAttribute('r', String(radius));
					dot.radius = radius;
				}
			}

			if (pointer.seen && away < distance) {
				const push = Math.min((strength / away) * (pointer.speed * 0.1), 20);
				const angle = Math.atan2(dy, dx);
				dot.vx -= Math.cos(angle) * push;
				dot.vy -= Math.sin(angle) * push;
			}
			dot.vx *= sensitivity;
			dot.vy *= sensitivity;
			dot.x = dot.anchorX + dot.vx;
			dot.y = dot.anchorY + dot.vy;
			dot.smoothX += (dot.x - dot.smoothX) * 0.1;
			dot.smoothY += (dot.y - dot.smoothY) * 0.1;
			dot.el.setAttribute('cx', String(dot.smoothX));
			dot.el.setAttribute('cy', String(dot.smoothY));
		}

		frame = requestAnimationFrame(tick);
	};

	const observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting === visible) return;
		visible = entry.isIntersecting;
		if (visible) frame = requestAnimationFrame(tick);
		else cancelAnimationFrame(frame);
	});
	observer.observe(svg);
	addEventListener('pointermove', onMove, { passive: true });

	return () => {
		cancelAnimationFrame(frame);
		observer.disconnect();
		removeEventListener('pointermove', onMove);
		group.remove();
	};
}

/** The grid points inside the shapes of an `<svg>`, in its own units. */
function pointsInShapes(shapes: SVGGeometryElement[], gap: number) {
	const boxes = shapes.map((shape) => shape.getBBox());
	const left = Math.min(...boxes.map((box) => box.x));
	const top = Math.min(...boxes.map((box) => box.y));
	const right = Math.max(...boxes.map((box) => box.x + box.width));
	const bottom = Math.max(...boxes.map((box) => box.y + box.height));
	const points: Point[] = [];

	for (let y = top; y <= bottom; y += gap) {
		for (let x = left; x <= right; x += gap) {
			// A shape's own box rules most points out before the exact test.
			const inside = shapes.some((shape, at) => {
				const box = boxes[at];
				if (x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height) return false;
				return shape.isPointInFill(new DOMPoint(x, y));
			});
			if (inside) points.push([x, y]);
		}
	}
	return points;
}

/** Where an image's pixels land inside its box, the way `object-fit` places them. */
function fitted(img: HTMLImageElement, width: number, height: number) {
	const fit = getComputedStyle(img).objectFit;
	const ratio = img.naturalWidth / img.naturalHeight || width / height;
	let drawWidth = width;
	let drawHeight = height;

	if (fit === 'contain' || fit === 'scale-down') {
		drawWidth = Math.min(width, height * ratio);
		drawHeight = drawWidth / ratio;
	} else if (fit === 'cover') {
		drawWidth = Math.max(width, height * ratio);
		drawHeight = drawWidth / ratio;
	} else if (fit === 'none') {
		drawWidth = img.naturalWidth;
		drawHeight = img.naturalHeight;
	}
	return {
		x: (width - drawWidth) / 2,
		y: (height - drawHeight) / 2,
		width: drawWidth,
		height: drawHeight
	};
}

/**
 * Turns an `<svg>`, or an `<img>`, into a grid of dots that the pointer pushes around. For an `<svg>` every shape
 * inside is sampled on a grid, and a dot is drawn wherever a grid point lands inside a shape. The shapes are hidden
 * and come back when the attachment is removed.
 *
 * An `<img>` keeps its shapes out of reach, so it is drawn to a canvas and every point that lands on a solid pixel
 * gets a dot. That works for an SVG file and for any image with transparency (a PNG or WebP cut-out), as long as it
 * comes from your own site or allows cross-origin reads. Sizes are then px, and the dots are redone when it resizes.
 */
export function dotsFill({
	size = 1,
	gap = 16,
	restore = 0.15,
	sensitivity = 0.95,
	distance = 50,
	strength = 10,
	color,
	illuminate = false,
	grow = 0
}: DotsFillOptions = {}): Attachment<SVGSVGElement | HTMLImageElement> {
	const motion = { size, restore, sensitivity, distance, strength, illuminate, grow };

	return (el) => {
		if (el instanceof SVGSVGElement) {
			const shapes = Array.from(el.querySelectorAll<SVGGeometryElement>(SHAPES));
			if (!shapes.length) return;

			const previous = {
				color: el.style.color,
				opacity: shapes.map((shape) => shape.style.opacity)
			};
			el.classList.add('dots-fill');
			if (color) el.style.color = color;

			const stop = animateDots(el, pointsInShapes(shapes, gap), motion);
			shapes.forEach((shape) => (shape.style.opacity = '0'));

			return () => {
				stop();
				shapes.forEach((shape, at) => (shape.style.opacity = previous.opacity[at]));
				el.style.color = previous.color;
				el.classList.remove('dots-fill');
			};
		}

		// An image: an SVG laid over it carries the dots, and the image itself is hidden.
		const overlay = document.createElementNS(SVG, 'svg');
		overlay.classList.add('dots-fill');
		overlay.setAttribute('aria-hidden', 'true');
		Object.assign(overlay.style, { position: 'absolute', pointerEvents: 'none' });
		if (color) overlay.style.color = color;

		let stop: (() => void) | undefined;
		let cancelled = false;
		let timeout: ReturnType<typeof setTimeout> | undefined;

		const build = async () => {
			try {
				await el.decode();
			} catch {
				return;
			}
			const width = el.offsetWidth;
			const height = el.offsetHeight;
			if (cancelled || !width || !height) return;

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (!ctx) return;
			const at = fitted(el, width, height);
			ctx.drawImage(el, at.x, at.y, at.width, at.height);

			let pixels: Uint8ClampedArray;
			try {
				pixels = ctx.getImageData(0, 0, width, height).data;
			} catch {
				// A picture from another site that does not allow it cannot be read, so it is left as it is.
				return;
			}

			const points: Point[] = [];
			for (let y = gap / 2; y < height; y += gap) {
				for (let x = gap / 2; x < width; x += gap) {
					if (pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > SOLID) points.push([x, y]);
				}
			}

			stop?.();
			overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
			overlay.style.left = `${el.offsetLeft}px`;
			overlay.style.top = `${el.offsetTop}px`;
			overlay.style.width = `${width}px`;
			overlay.style.height = `${height}px`;
			if (!overlay.isConnected) el.after(overlay);
			stop = animateDots(overlay, points, motion);
			el.style.visibility = 'hidden';
		};

		const resizer = new ResizeObserver(() => {
			clearTimeout(timeout);
			timeout = setTimeout(build, 150);
		});
		resizer.observe(el);
		build();

		return () => {
			cancelled = true;
			clearTimeout(timeout);
			resizer.disconnect();
			stop?.();
			overlay.remove();
			el.style.visibility = '';
		};
	};
}
