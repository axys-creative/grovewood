import type { Attachment } from 'svelte/attachments';

export type TiltOptions = {
	/** Flip the direction of the tilt. */
	reverse?: boolean;
	/** The largest tilt in degrees. */
	max?: number;
	/** Resting tilt along the x-axis, in degrees. */
	startX?: number;
	/** Resting tilt along the y-axis, in degrees. */
	startY?: number;
	/** Lower is more dramatic. */
	perspective?: number;
	/** Scale while hovered, for a subtle pop. */
	scale?: number;
	/** Milliseconds for the enter and exit transition. */
	speed?: number;
	/** CSS easing for the enter and exit transition. */
	easing?: string;
	/** Set false to follow the pointer with no enter and exit transition. */
	transition?: boolean;
	/** `x` tilts only left and right (no rotateX), `y` only up and down (no rotateY). */
	axis?: 'x' | 'y';
	/** Return to the resting tilt when the pointer leaves. */
	reset?: boolean;
	/** A light sheen that follows the pointer. */
	glare?: boolean;
	/** The strongest the glare gets, from 0 to 1. */
	maxGlare?: number;
	/** A selector or element that listens for the pointer instead of the tilted element. */
	mouseEventElement?: string | Element;
};

const DEFAULTS = {
	reverse: false,
	max: 15,
	startX: 0,
	startY: 0,
	perspective: 1000,
	scale: 1,
	speed: 300,
	easing: 'cubic-bezier(.03,.98,.52,.99)',
	transition: true,
	axis: undefined as TiltOptions['axis'],
	reset: true,
	glare: false,
	maxGlare: 1,
	mouseEventElement: undefined as TiltOptions['mouseEventElement']
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** Tilts an element in 3D toward the pointer, like Vanilla Tilt, without the library. */
export function tilt(options: TiltOptions = {}): Attachment<HTMLElement> {
	const settings = { ...DEFAULTS };
	for (const [key, value] of Object.entries(options)) {
		if (value !== undefined) (settings as Record<string, unknown>)[key] = value;
	}

	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const listener =
			(typeof settings.mouseEventElement === 'string'
				? document.querySelector(settings.mouseEventElement)
				: settings.mouseEventElement) ?? el;
		const direction = settings.reverse ? -1 : 1;

		let width = 0;
		let height = 0;
		let left = 0;
		let top = 0;
		let clientX = 0;
		let clientY = 0;
		let scale = settings.scale;
		let updateCall = 0;
		let transitionTimeout: ReturnType<typeof setTimeout> | undefined;

		// The glare sits inside the element, so the element has to be a positioning parent for it.
		const previousPosition = el.style.position;
		let glareWrapper: HTMLElement | undefined;
		let glareElement: HTMLElement | undefined;

		if (settings.glare) {
			if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

			glareWrapper = document.createElement('div');
			glareWrapper.className = 'js-tilt-glare';
			Object.assign(glareWrapper.style, {
				position: 'absolute',
				top: '0',
				left: '0',
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				pointerEvents: 'none',
				borderRadius: 'inherit'
			});

			glareElement = document.createElement('div');
			glareElement.className = 'js-tilt-glare-inner';
			Object.assign(glareElement.style, {
				position: 'absolute',
				top: '50%',
				left: '50%',
				pointerEvents: 'none',
				backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
				transform: 'rotate(180deg) translate(-50%, -50%)',
				transformOrigin: '0% 0%',
				opacity: '0'
			});

			glareWrapper.append(glareElement);
			el.append(glareWrapper);
		}

		const updateGlareSize = () => {
			if (!glareElement) return;
			const size = Math.max(el.offsetWidth, el.offsetHeight) * 2;
			glareElement.style.width = `${size}px`;
			glareElement.style.height = `${size}px`;
		};

		const updateElementPosition = () => {
			const rect = el.getBoundingClientRect();
			width = el.offsetWidth;
			height = el.offsetHeight;
			left = rect.left;
			top = rect.top;
		};

		const setTransition = () => {
			clearTimeout(transitionTimeout);
			if (!settings.transition) return;

			el.style.transition = `${settings.speed}ms ${settings.easing}`;
			if (glareElement)
				glareElement.style.transition = `opacity ${settings.speed}ms ${settings.easing}`;

			transitionTimeout = setTimeout(() => {
				el.style.transition = '';
				if (glareElement) glareElement.style.transition = '';
			}, settings.speed);
		};

		const resetGlare = () => {
			if (!glareElement) return;
			glareElement.style.transform = 'rotate(180deg) translate(-50%, -50%)';
			glareElement.style.opacity = '0';
		};

		const update = () => {
			updateCall = 0;
			const x = clamp01((clientX - left) / width);
			const y = clamp01((clientY - top) / height);
			const tiltX = (direction * (settings.max - x * settings.max * 2)).toFixed(2);
			const tiltY = (direction * (y * settings.max * 2 - settings.max)).toFixed(2);

			el.style.transform =
				`perspective(${settings.perspective}px) ` +
				`rotateX(${settings.axis === 'x' ? 0 : tiltY}deg) ` +
				`rotateY(${settings.axis === 'y' ? 0 : tiltX}deg) ` +
				`scale3d(${scale}, ${scale}, ${scale})`;

			if (glareElement) {
				const angle =
					Math.atan2(clientX - (left + width / 2), -(clientY - (top + height / 2))) *
					(180 / Math.PI);
				glareElement.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`;
				glareElement.style.opacity = `${(y * 100 * settings.maxGlare) / 100}`;
			}
		};

		const enter = () => {
			updateElementPosition();
			el.style.willChange = 'transform';
			setTransition();
		};

		// Settles at the resting tilt: the point on the element that produces startX and startY.
		const reset = () => {
			enter();
			clientX = left + ((settings.startX + settings.max) / (2 * settings.max)) * width;
			clientY = top + ((settings.startY + settings.max) / (2 * settings.max)) * height;

			const hoverScale = scale;
			scale = 1;
			update();
			scale = hoverScale;
			resetGlare();
		};

		const isMouse = (event: PointerEvent) => event.pointerType === 'mouse';

		const onEnter = (event: PointerEvent) => {
			if (isMouse(event)) enter();
		};

		const onMove = (event: PointerEvent) => {
			if (!isMouse(event)) return;
			cancelAnimationFrame(updateCall);
			clientX = event.clientX;
			clientY = event.clientY;
			updateCall = requestAnimationFrame(update);
		};

		const onLeave = (event: PointerEvent) => {
			if (!isMouse(event)) return;
			setTransition();
			if (settings.reset) requestAnimationFrame(reset);
		};

		listener.addEventListener('pointerenter', onEnter as EventListener);
		listener.addEventListener('pointermove', onMove as EventListener);
		listener.addEventListener('pointerleave', onLeave as EventListener);

		const resizeObserver = glareElement ? new ResizeObserver(updateGlareSize) : undefined;
		resizeObserver?.observe(el);
		updateGlareSize();
		reset();

		return () => {
			clearTimeout(transitionTimeout);
			cancelAnimationFrame(updateCall);
			resizeObserver?.disconnect();
			listener.removeEventListener('pointerenter', onEnter as EventListener);
			listener.removeEventListener('pointermove', onMove as EventListener);
			listener.removeEventListener('pointerleave', onLeave as EventListener);
			glareWrapper?.remove();
			el.style.willChange = '';
			el.style.transition = '';
			el.style.transform = '';
			el.style.position = previousPosition;
		};
	};
}
