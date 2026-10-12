import type { Attachment } from 'svelte/attachments';

export type BgGridAnimation =
	| 'stack-top'
	| 'stack-bottom'
	| 'stack-left'
	| 'stack-right'
	| 'ripple-out'
	| 'ripple-in'
	| 'random'
	| 'diag-tl'
	| 'diag-tr'
	| 'diag-br'
	| 'diag-bl';

export type BgGridOptions = {
	/** The width and height of each square, in px. */
	cellSize?: number;
	/** Any CSS color for the lines, including `var(--color-border)`. */
	color?: string;
	/** The line width in px. */
	lineWidth?: number;
	/** Seconds a square takes to fade away. */
	fade?: number;
	/** The chance (0-1) that each square touching the one under the pointer lights up too. */
	spread?: number;
	/** Milliseconds between the grid lighting up by itself, so a visitor without a mouse still sees it. `0` turns it off. */
	ambient?: number;
	/** Covers the whole screen and follows it, instead of covering this element. Meant for `<body>`. */
	fixed?: boolean;
	/** Holds the whole grid on while this element is mostly on screen, and fades it out after. */
	show?: boolean | { enter?: BgGridAnimation; exit?: BgGridAnimation; stagger?: number };
	/** A selector for elements inside that stop the pointer from lighting squares while it is over them. */
	disableOn?: string;
	/** A selector for elements inside that hide the grid completely while the pointer is over them. */
	hideOn?: string;
};

type Cell = {
	row: number;
	col: number;
	opacity: number;
	fadingIn: boolean;
	revealAt: number | null;
	fadeOutAt: number | null;
};

const MAX_DPR = 2;

/**
 * Draws a grid of lines behind an element. Squares near the pointer light up and fade away, and every so often
 * the grid lights up by itself. It is a transparent canvas, so the element's own background shows through, and it
 * only runs while something is animating and the element is on screen. Reduced motion shows no grid at all.
 */
export function bgGrid({
	cellSize = 48,
	color = 'var(--color-border)',
	lineWidth = 1,
	fade = 0.85,
	spread = 0.5,
	ambient = 7500,
	fixed = false,
	show,
	disableOn,
	hideOn
}: BgGridOptions = {}): Attachment<HTMLElement> {
	return (host) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) return;
		const ctx = context;

		canvas.setAttribute('aria-hidden', 'true');
		Object.assign(canvas.style, {
			position: fixed ? 'fixed' : 'absolute',
			inset: '0',
			width: '100%',
			height: '100%',
			zIndex: '-1',
			pointerEvents: 'none'
		});

		// The canvas sits behind the element's content but above its own background, which needs a stacking
		// context to hold it, and a position to be placed against.
		const previous = { position: host.style.position, isolation: host.style.isolation };
		if (!fixed) {
			if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
			host.style.isolation = 'isolate';
		}
		host.prepend(canvas);

		const cells = new Map<number, Cell>();
		let width = 0;
		let height = 0;
		let rows = 0;
		let cols = 0;
		let strokeColor = '';

		let frame = 0;
		let last = 0;
		let visible = fixed;
		let frozen = false;
		let zone: 'none' | 'disabled' | 'hidden' = 'none';
		const pointer = { x: -1, y: -1, dirty: false };
		let current = { row: -1, col: -1 };

		const key = (row: number, col: number) => row * cols + col;

		const upsert = (row: number, col: number, patch: Partial<Cell>) => {
			const id = key(row, col);
			const found = cells.get(id);
			if (found) return Object.assign(found, patch);
			const cell: Cell = {
				row,
				col,
				opacity: 0,
				fadingIn: false,
				revealAt: null,
				fadeOutAt: null,
				...patch
			};
			cells.set(id, cell);
			return cell;
		};

		const resize = () => {
			const ratio = Math.min(devicePixelRatio || 1, MAX_DPR);
			const box = fixed ? { width: innerWidth, height: innerHeight } : host.getBoundingClientRect();
			width = box.width;
			height = box.height;
			canvas.width = Math.floor(width * ratio);
			canvas.height = Math.floor(height * ratio);
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			ctx.lineWidth = lineWidth;
			rows = Math.ceil(height / cellSize);
			cols = Math.ceil(width / cellSize);

			for (const [id, cell] of cells) {
				if (cell.row >= rows || cell.col >= cols) cells.delete(id);
			}
			wake();
		};

		// Where in the grid a square's turn comes, in milliseconds after the start, for each sweep.
		const delayOf = (row: number, col: number, animation: BgGridAnimation, stagger: number) => {
			const middleRow = Math.floor(rows / 2);
			const middleCol = Math.floor(cols / 2);
			switch (animation) {
				case 'stack-bottom':
					return (rows - row) * stagger;
				case 'stack-left':
					return col * stagger;
				case 'stack-right':
					return (cols - col) * stagger;
				case 'ripple-out':
					return Math.hypot(row - middleRow, col - middleCol) * stagger;
				case 'ripple-in':
					return (
						(Math.hypot(middleRow, middleCol) - Math.hypot(row - middleRow, col - middleCol)) *
						stagger
					);
				case 'random':
					return Math.random() * stagger * 10;
				case 'diag-tl':
					return (row + col) * stagger;
				case 'diag-tr':
					return (row + (cols - col)) * stagger;
				case 'diag-br':
					return (rows - row + (cols - col)) * stagger;
				case 'diag-bl':
					return (rows - row + col) * stagger;
				default:
					return row * stagger;
			}
		};

		const revealAll = (animation: BgGridAnimation, stagger: number) => {
			if (zone === 'hidden') return;
			const now = performance.now();
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const existing = cells.get(key(row, col));
					if (existing && existing.opacity >= 1 && !existing.fadeOutAt && !existing.revealAt)
						continue;
					upsert(row, col, {
						opacity: existing ? existing.opacity : 0,
						fadingIn: false,
						revealAt: now + delayOf(row, col, animation, stagger),
						fadeOutAt: null
					});
				}
			}
			wake();
		};

		const fadeAll = (animation: BgGridAnimation, stagger: number) => {
			const now = performance.now();
			for (const cell of cells.values()) {
				cell.fadingIn = false;
				cell.revealAt = null;
				cell.fadeOutAt = now + delayOf(cell.row, cell.col, animation, stagger);
			}
			wake();
		};

		const light = (row: number, col: number) => {
			for (let dr = -1; dr <= 1; dr++) {
				for (let dc = -1; dc <= 1; dc++) {
					if (!dr && !dc) continue;
					const r = row + dr;
					const c = col + dc;
					if (r < 0 || r >= rows || c < 0 || c >= cols || Math.random() >= spread) continue;
					upsert(r, c, { opacity: 1, fadingIn: false, revealAt: null, fadeOutAt: null });
				}
			}
		};

		const draw = (now: number) => {
			frame = 0;
			const seconds = Math.min(0.05, Math.max(0, (now - last) / 1000));
			last = now;
			ctx.clearRect(0, 0, width, height);

			if (zone === 'hidden') {
				cells.clear();
				current = { row: -1, col: -1 };
				return;
			}

			if (pointer.dirty) {
				pointer.dirty = false;
				if (pointer.x >= 0 && pointer.y >= 0) {
					const row = Math.floor(pointer.y / cellSize);
					const col = Math.floor(pointer.x / cellSize);
					if (row !== current.row || col !== current.col) {
						current = { row, col };
						light(row, col);
					}
				} else current = { row: -1, col: -1 };
			}

			const step = seconds / fade;
			ctx.strokeStyle = strokeColor;

			for (const [id, cell] of cells) {
				if (cell.revealAt != null && now >= cell.revealAt) {
					cell.fadingIn = true;
					cell.revealAt = null;
				}

				if (cell.fadingIn) {
					cell.opacity = Math.min(1, cell.opacity + step);
					if (cell.opacity >= 1) cell.fadingIn = false;
				} else if (!frozen && (cell.fadeOutAt == null || now >= cell.fadeOutAt)) {
					cell.opacity = Math.max(0, cell.opacity - step);
				}

				ctx.globalAlpha = cell.opacity;
				ctx.strokeRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);

				if (cell.opacity <= 0 && cell.revealAt == null) cells.delete(id);
			}
			ctx.globalAlpha = 1;

			// Keeps going while any square is still lighting, fading, or waiting for its turn.
			const busy = [...cells.values()].some(
				(cell) => cell.fadingIn || cell.revealAt != null || cell.fadeOutAt != null || !frozen
			);
			if (cells.size && busy && visible) frame = requestAnimationFrame(draw);
		};

		function wake() {
			if (frame || !visible) return;
			// The line color is read each time it starts, so a theme change shows up the next time the grid lights.
			canvas.style.color = color;
			strokeColor = getComputedStyle(canvas).color;
			last = performance.now();
			frame = requestAnimationFrame(draw);
		}

		const onMove = (event: PointerEvent) => {
			const target = event.target as Element | null;
			zone =
				hideOn && target?.closest?.(hideOn)
					? 'hidden'
					: disableOn && target?.closest?.(disableOn)
						? 'disabled'
						: 'none';

			const box = fixed ? { left: 0, top: 0 } : host.getBoundingClientRect();
			const x = event.clientX - box.left;
			const y = event.clientY - box.top;
			const inside = fixed || (x >= 0 && y >= 0 && x <= width && y <= height);

			if (!inside || zone !== 'none') {
				pointer.x = pointer.y = -1;
			} else {
				pointer.x = x;
				pointer.y = y;
			}
			pointer.dirty = true;
			wake();
		};

		const sweep = typeof show === 'object' ? show : {};
		const enter = sweep.enter ?? 'stack-top';
		const exit = sweep.exit ?? 'stack-top';
		const stagger = sweep.stagger ?? 50;

		const observer = new IntersectionObserver(
			([entry]) => {
				const seen = entry.isIntersecting;
				if (seen !== visible && !fixed) {
					visible = seen;
					if (seen) wake();
				}
				if (!show) return;
				const mostly = entry.intersectionRatio >= 0.5;
				if (mostly && !frozen) {
					frozen = true;
					revealAll(enter, stagger);
				} else if (!mostly && frozen) {
					frozen = false;
					fadeAll(exit, stagger);
				}
			},
			{ threshold: [0, 0.5] }
		);
		observer.observe(host);

		const resizer = new ResizeObserver(resize);
		if (fixed) addEventListener('resize', resize, { passive: true });
		else resizer.observe(host);

		resize();
		addEventListener('pointermove', onMove, { passive: true });

		const timer =
			ambient > 0
				? setInterval(() => {
						if (!frozen && zone !== 'hidden' && visible && !document.hidden)
							revealAll('random', 100);
					}, ambient)
				: undefined;

		return () => {
			cancelAnimationFrame(frame);
			clearInterval(timer);
			observer.disconnect();
			resizer.disconnect();
			removeEventListener('pointermove', onMove);
			removeEventListener('resize', resize);
			canvas.remove();
			host.style.position = previous.position;
			host.style.isolation = previous.isolation;
		};
	};
}
