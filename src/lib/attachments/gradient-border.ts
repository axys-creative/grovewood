import type { Attachment } from 'svelte/attachments';
import './gradient-border.scss';

export type GradientBorderOptions = {
	/** Border width in px. */
	width?: number;
	/** Gradient angle in degrees. */
	angle?: number;
	/** Any CSS color. */
	color?: string;
	/** How much of the border the gradient covers. */
	length?: 'short' | 'long';
	/** `true` sweeps around the element forever; `'hover'` reveals it on hover. */
	animate?: boolean | 'hover';
	/** Seconds per sweep. */
	duration?: number;
	/** A glow that follows the pointer. Give the element its own background. */
	rayTrace?: boolean;
};

type Tracked = { el: HTMLElement };

const tracked = new Set<Tracked>();
let pointerX = 0;
let pointerY = 0;
let frame = 0;
let maxDistance = 0;

function updateRayTrace() {
	frame = 0;

	for (const { el } of tracked) {
		const rect = el.getBoundingClientRect();
		const distance = Math.hypot(
			pointerX - (rect.left + rect.width / 2),
			pointerY - (rect.top + rect.height / 2)
		);
		const intensity = 1 - Math.min(distance / maxDistance, 1);

		el.style.setProperty('--gradient-x', `${((pointerX - rect.left) / rect.width) * 100}%`);
		el.style.setProperty('--gradient-y', `${((pointerY - rect.top) / rect.height) * 100}%`);
		el.style.setProperty('--gradient-opacity', String(0.3 + intensity * 0.7));
	}
}

const onPointerMove = (event: PointerEvent) => {
	pointerX = event.clientX;
	pointerY = event.clientY;
	if (!frame) frame = requestAnimationFrame(updateRayTrace);
};

const onResize = () => (maxDistance = Math.hypot(innerWidth, innerHeight));

export function gradientBorder({
	width,
	angle,
	color,
	length,
	animate,
	duration,
	rayTrace
}: GradientBorderOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const classes = [
			'gradient-border',
			length && `gradient-border--${length}`,
			animate === 'hover' && 'gradient-border--animate-hover',
			animate === true && 'gradient-border--animate',
			rayTrace && 'gradient-border--ray-trace'
		].filter((name): name is string => !!name);
		el.classList.add(...classes);

		const vars: Record<string, string | undefined> = {
			'--gradient-border-width': width === undefined ? undefined : `${width}px`,
			'--gradient-border-angle': angle === undefined ? undefined : `${angle}deg`,
			'--gradient-border-color': color,
			'--gradient-border-duration': duration === undefined ? undefined : `${duration}s`
		};
		for (const [name, value] of Object.entries(vars)) {
			if (value) el.style.setProperty(name, value);
		}

		const entry: Tracked = { el };
		if (rayTrace) {
			if (!tracked.size) {
				onResize();
				addEventListener('pointermove', onPointerMove, { passive: true });
				addEventListener('resize', onResize, { passive: true });
			}
			tracked.add(entry);
		}

		return () => {
			if (tracked.delete(entry) && !tracked.size) {
				removeEventListener('pointermove', onPointerMove);
				removeEventListener('resize', onResize);
				cancelAnimationFrame(frame);
				frame = 0;
			}
			el.classList.remove(...classes);
			for (const name of [
				...Object.keys(vars),
				'--gradient-x',
				'--gradient-y',
				'--gradient-opacity'
			]) {
				el.style.removeProperty(name);
			}
		};
	};
}
