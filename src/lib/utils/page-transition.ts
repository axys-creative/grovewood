/** Fades the old page out, then fades the new one in. */
export type CrossName = 'fade';
/** Covers the page with an overlay, swaps the page underneath, then uncovers it. */
export type CoverName = 'tiles';
export type PageTransitionName = CrossName | CoverName;

export const isCover = (name: PageTransitionName): name is CoverName => name === 'tiles';

export type TileSequence = 'linear' | 'circle' | 'checkers';

export type TilesOptions = {
	/** Approximate tile width and height in px. The page is divided into as many as fit. */
	tileSize?: number;
	/** The order tiles appear, and disappear again: reading order, outward from the center, or a checkerboard in two waves. */
	sequence?: TileSequence;
	/** Milliseconds each tile takes to fade. */
	duration?: number;
	/** Milliseconds between the first tile starting and the last. */
	spread?: number;
	/** Any CSS color. */
	color?: string;
};

export type PageTransitionOptions = TilesOptions & {
	/** Keeps the header in place and on top while the page changes. */
	preserveHeader?: boolean;
	/** Milliseconds, for transitions that are not tile based. */
	duration?: number;
};

type CrossSpec = {
	out: Keyframe[];
	in: Keyframe[];
	duration: number;
	easing: string;
};

/** The leaving and arriving keyframes of each cross transition. Both the real navigation and the library demos play these. */
export const crossTransitions: Record<CrossName, CrossSpec> = {
	fade: {
		out: [
			{ opacity: 1, translate: '0 0' },
			{ opacity: 0, translate: '0 -12px' }
		],
		in: [
			{ opacity: 0, translate: '0 12px' },
			{ opacity: 1, translate: '0 0' }
		],
		duration: 600,
		easing: 'cubic-bezier(0.18, 0.97, 0.47, 1)'
	}
};

/** The leaving and arriving halves of a cross transition: the arriving one waits for the leaving one to finish. */
const phases = (spec: CrossSpec, duration = spec.duration) => {
	const half = duration / 2;
	const base = { easing: spec.easing, fill: 'both' } as const;
	return {
		out: { ...base, duration: half },
		in: { ...base, duration: half, delay: half }
	};
};

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Plays a cross transition between two elements. Resolves when both finish. */
export async function playTransition(
	leaving: Element,
	arriving: Element,
	name: CrossName,
	duration?: number
) {
	const spec = crossTransitions[name];
	const timing = phases(spec, duration);

	await Promise.all([
		leaving.animate(spec.out, timing.out).finished,
		arriving.animate(spec.in, timing.in).finished
	]);
}

/** Plays a cross transition on the page itself, using the View Transitions pseudo-elements. */
export function playViewTransition(name: CrossName, duration?: number) {
	const spec = crossTransitions[name];
	const timing = phases(spec, duration);

	document.documentElement.animate(spec.out, {
		...timing.out,
		pseudoElement: '::view-transition-old(root)'
	});
	document.documentElement.animate(spec.in, {
		...timing.in,
		pseudoElement: '::view-transition-new(root)'
	});
}

/** When each tile starts, from 0 (first) to 1 (last), in row-major order. */
function tileOrder(columns: number, rows: number, sequence: TileSequence) {
	const total = columns * rows;
	const cell = (index: number) => [Math.floor(index / columns), index % columns] as const;
	const spread = (rank: number, count: number) => (count > 1 ? rank / (count - 1) : 0);

	if (sequence === 'circle') {
		const distances = Array.from({ length: total }, (_, index) => {
			const [row, column] = cell(index);
			return Math.hypot(column + 0.5 - columns / 2, row + 0.5 - rows / 2);
		});
		const farthest = Math.max(...distances) || 1;
		return distances.map((distance) => distance / farthest);
	}

	if (sequence === 'checkers') {
		const evens = Array.from({ length: total }, (_, index) => index).filter((index) => {
			const [row, column] = cell(index);
			return (row + column) % 2 === 0;
		});
		const odds = Array.from({ length: total }, (_, index) => index).filter(
			(index) => !evens.includes(index)
		);
		const order = new Array<number>(total);
		evens.forEach((index, rank) => (order[index] = spread(rank, evens.length) * 0.5));
		odds.forEach((index, rank) => (order[index] = 0.5 + spread(rank, odds.length) * 0.5));
		return order;
	}

	return Array.from({ length: total }, (_, index) => spread(index, total));
}

/**
 * Covers `container` with a grid of tiles, runs `swap` while it is covered, then fades the tiles away in
 * the same order. `fixed` covers the whole window instead of the container.
 */
export async function playTiles(
	container: HTMLElement,
	swap: () => Promise<void> | void,
	{
		tileSize = 160,
		sequence = 'linear',
		duration = 200,
		spread = 600,
		color = 'var(--color-surface)',
		preserveHeader = false
	}: TilesOptions & { preserveHeader?: boolean } = {},
	fixed = false
) {
	const width = fixed ? innerWidth : container.clientWidth;
	const height = fixed ? innerHeight : container.clientHeight;
	const columns = Math.max(1, Math.round(width / tileSize));
	const rows = Math.max(1, Math.round(height / tileSize));
	const delays = tileOrder(columns, rows, sequence);

	const overlay = document.createElement('div');
	overlay.setAttribute('aria-hidden', 'true');
	overlay.style.cssText = `position:${fixed ? 'fixed' : 'absolute'};inset:0;z-index:${preserveHeader ? 'calc(var(--z-header) - 1)' : 100};display:grid;grid-template-columns:repeat(${columns},1fr);grid-template-rows:repeat(${rows},1fr);`;

	const tiles = delays.map(() => {
		const tile = document.createElement('div');
		tile.style.cssText = `opacity:0;background:${color};box-shadow:0 0 0 0.5px ${color};`;
		overlay.append(tile);
		return tile;
	});
	container.append(overlay);

	const run = (from: number, to: number) =>
		Promise.all(
			tiles.map(
				(tile, index) =>
					tile.animate([{ opacity: from }, { opacity: to }], {
						duration,
						delay: delays[index] * spread,
						easing: 'ease-in-out',
						fill: 'both'
					}).finished
			)
		);

	try {
		await run(0, 1);
		await swap();
		await run(1, 0);
	} finally {
		overlay.remove();
	}
}
