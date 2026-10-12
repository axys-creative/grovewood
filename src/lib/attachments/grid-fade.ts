import type { Attachment } from 'svelte/attachments';
import { parseScrollPoint } from '$lib/utils/scroll-point';
import { watchScrollZone } from '$lib/utils/scroll-zone';
import './grid-fade.scss';

export type GridFadeOptions = {
	/** `in` fades the tiles away; `in-out` fades them away and back. */
	type?: 'in' | 'in-out';
	size?: 'sm' | 'md' | 'lg';
	/** The order tiles fade: shuffled, left to right, or outward from the center. */
	sequence?: 'random' | 'linear' | 'circular';
	/** Tie the fade to scroll position (default) or play it once the element is in range. */
	scrub?: boolean;
	/** Only play the first time. Applies when `scrub` is false. */
	once?: boolean;
	/** Seconds the fade lasts. Applies when `scrub` is false. */
	duration?: number;
	/** ScrollTrigger-style start, e.g. `top 96%` (element point, viewport point). */
	start?: string;
	/** ScrollTrigger-style end, e.g. `center 75%`. */
	end?: string;
};

const TILE_SIZES = {
	sm: { count: 520, minWidth: '3%' },
	md: { count: 192, minWidth: '6%' },
	lg: { count: 40, minWidth: '12%' }
};

const RANGES = {
	scrub: {
		in: { start: 'top 96%', end: 'center 75%' },
		'in-out': { start: 'top 96%', end: 'bottom 4%' }
	},
	play: {
		in: { start: 'top 96%', end: 'bottom 4%' },
		'in-out': { start: 'top 60%', end: 'bottom 4%' }
	}
};

const shuffle = <T>(items: T[]) => {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

const byDistanceFromCenter = (tiles: HTMLElement[], overlay: HTMLElement) => {
	const cx = overlay.clientWidth / 2;
	const cy = overlay.clientHeight / 2;
	const distance = (tile: HTMLElement) =>
		Math.hypot(
			tile.offsetLeft + tile.offsetWidth / 2 - cx,
			tile.offsetTop + tile.offsetHeight / 2 - cy
		);
	return [...tiles].sort((a, b) => distance(a) - distance(b));
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function gridFade({
	type = 'in',
	size = 'md',
	sequence = 'random',
	scrub = true,
	once = false,
	duration = 1.5,
	start,
	end
}: GridFadeOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const range = RANGES[scrub ? 'scrub' : 'play'][type];
		const startPoint = parseScrollPoint(start, range.start);
		const endPoint = parseScrollPoint(end, range.end);

		const { count, minWidth } = TILE_SIZES[size];
		const overlay = document.createElement('div');
		overlay.className = 'grid-fade__overlay';
		const tiles = Array.from({ length: count }, () => {
			const tile = document.createElement('div');
			tile.className = 'grid-fade__tile';
			tile.style.minWidth = minWidth;
			overlay.append(tile);
			return tile;
		});
		el.classList.add('grid-fade');
		el.append(overlay);

		let ordered: HTMLElement[] = [];
		let progress = 0;
		let inZone = false;
		let playFrame = 0;

		// Tiles fade one after another; `in-out` is fade out, hold, fade in, each one tile-length apart.
		const render = () => {
			const total = ordered.length;
			const time = progress * total * (type === 'in-out' ? 3 : 1);

			ordered.forEach((tile, rank) => {
				let opacity: number;
				if (type === 'in') opacity = 1 - clamp(time - rank);
				else if (time < total) opacity = 1 - clamp(time - rank);
				else if (time < total * 2) opacity = 0;
				else opacity = clamp(time - total * 2 - rank);
				tile.style.opacity = String(opacity);
			});
		};

		const play = (from: number) => {
			cancelAnimationFrame(playFrame);
			const startTime = performance.now();
			const tick = (now: number) => {
				progress = from + (1 - from) * clamp((now - startTime) / (duration * 1000));
				render();
				if (progress < 1) playFrame = requestAnimationFrame(tick);
			};
			playFrame = requestAnimationFrame(tick);
		};

		const reset = () => {
			cancelAnimationFrame(playFrame);
			progress = 0;
			render();
		};

		const watcher = watchScrollZone(el, {
			start: startPoint,
			end: endPoint,
			onUpdate(startDistance, endDistance) {
				if (scrub) {
					progress =
						startDistance === endDistance
							? 0
							: clamp(startDistance / (startDistance - endDistance));
					render();
					return;
				}

				const nowInZone = startDistance <= 0 && endDistance > 0;
				if (nowInZone && !inZone) {
					inZone = true;
					play(0);
				} else if (!nowInZone && inZone) {
					inZone = false;
					if (!once) reset();
				}
			}
		});

		// Which tiles are visible, and their distance from center, depends on the rendered size.
		const build = () => {
			const visible = tiles.filter((tile) => tile.offsetTop < overlay.clientHeight);
			ordered =
				sequence === 'random'
					? shuffle(visible)
					: sequence === 'circular'
						? byDistanceFromCenter(visible, overlay)
						: visible;
			tiles.forEach((tile) => {
				if (!ordered.includes(tile)) tile.style.opacity = '0';
			});
			if (scrub || !inZone) render();
			watcher.update();
		};

		let lastSize = '';
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const resizeObserver = new ResizeObserver(() => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				const current = `${el.clientWidth}x${el.clientHeight}`;
				if (!el.clientHeight || current === lastSize) return;
				lastSize = current;
				build();
			}, 150);
		});
		resizeObserver.observe(el);

		return () => {
			clearTimeout(timeout);
			cancelAnimationFrame(playFrame);
			resizeObserver.disconnect();
			watcher.stop();
			overlay.remove();
			el.classList.remove('grid-fade');
		};
	};
}
