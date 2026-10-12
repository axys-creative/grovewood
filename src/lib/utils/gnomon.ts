export type GnomonFrom =
	'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left';

export type GnomonCutout = {
	from: GnomonFrom;
	/** Shown inside the notch, sized to fill it. */
	text?: string;
};

export type GnomonOptions = {
	cutouts: GnomonCutout[];
	depth: number;
	length: number;
	radius: number;
	angle: number;
};

type Point = [number, number];

const SAFE_SPAN = 96;

const num = (value: number) => +value.toFixed(6);

/**
 * Works out a square with a notch cut from any of its eight slots (four corners, four side
 * midpoints). Returns one path for the 0-100 stroke and one in 0-1 units for a responsive clip-path.
 * `depth` and `length` are shared by every cutout. When two cutouts ask one edge for more than it has,
 * both shrink together so they never collide. `angle` tilts each notch's inner corner from a square
 * step (90) toward a single diagonal (45).
 */
export function gnomonShape({ cutouts, depth, length, radius, angle }: GnomonOptions) {
	const slot = (from: GnomonFrom) => cutouts.find((cutout) => cutout.from === from);
	const [tl, t, tr, r, br, b, bl, l] = (
		[
			'top-left',
			'top',
			'top-right',
			'right',
			'bottom-right',
			'bottom',
			'bottom-left',
			'left'
		] as const
	).map(slot);

	const draw = (...entries: [unknown, number][]) =>
		entries.reduce((sum, [active, amount]) => sum + (active ? amount : 0), 0);
	const worst = Math.max(
		draw([tl, length], [tr, length], [t, length]),
		draw([bl, length], [br, length], [b, length]),
		draw([tl, depth], [bl, depth], [l, length]),
		draw([tr, depth], [br, depth], [r, length])
	);
	const scale = worst > SAFE_SPAN ? SAFE_SPAN / worst : 1;
	depth *= scale;
	length *= scale;
	const half = length / 2;

	const tilt = (90 - Math.min(90, Math.max(45, angle))) / 45;
	const sideDepth = (depth / 2) * tilt;
	const sideLength = half * tilt;

	const points: Point[] = [
		...(tl
			? ([
					[0, depth],
					[length * (1 - tilt), depth],
					[length, 0]
				] as Point[])
			: [[0, 0] as Point]),
		...(t
			? ([
					[50 - half, 0],
					[50 - half + sideLength, depth - sideDepth],
					[50 + half - sideLength, depth - sideDepth],
					[50 + half, 0]
				] as Point[])
			: []),
		...(tr
			? ([
					[100 - length, 0],
					[100 - length + length * tilt, depth],
					[100, depth]
				] as Point[])
			: [[100, 0] as Point]),
		...(r
			? ([
					[100, 50 - half],
					[100 - depth + sideDepth, 50 - half + sideLength],
					[100 - depth + sideDepth, 50 + half - sideLength],
					[100, 50 + half]
				] as Point[])
			: []),
		...(br
			? ([
					[100, 100 - depth],
					[100 - length + length * tilt, 100 - depth],
					[100 - length, 100]
				] as Point[])
			: [[100, 100] as Point]),
		...(b
			? ([
					[50 + half, 100],
					[50 + half - sideLength, 100 - depth + sideDepth],
					[50 - half + sideLength, 100 - depth + sideDepth],
					[50 - half, 100]
				] as Point[])
			: []),
		...(bl
			? ([
					[length, 100],
					[length * (1 - tilt), 100 - depth],
					[0, 100 - depth]
				] as Point[])
			: [[0, 100] as Point]),
		...(l
			? ([
					[0, 50 + half],
					[depth - sideDepth, 50 + half - sideLength],
					[depth - sideDepth, 50 - half + sideLength],
					[0, 50 - half]
				] as Point[])
			: [])
	];

	const distance = ([ax, ay]: Point, [bx, by]: Point) => Math.hypot(ax - bx, ay - by);
	const shortest = Math.min(
		...points.map((point, i) => distance(point, points[(i + 1) % points.length]) / 2)
	);
	const curve = Math.max(0, Math.min(radius, shortest));

	// Every corner, including each notch's, rounds to a quadratic curve.
	const path = (unit: number) =>
		points
			.map((point, i) => {
				const prev = points[(i + points.length - 1) % points.length];
				const next = points[(i + 1) % points.length];
				const t1 = distance(point, prev) > 0 ? curve / distance(point, prev) : 0;
				const t2 = distance(point, next) > 0 ? curve / distance(point, next) : 0;
				const a = [point[0] + (prev[0] - point[0]) * t1, point[1] + (prev[1] - point[1]) * t1];
				const c = [point[0] + (next[0] - point[0]) * t2, point[1] + (next[1] - point[1]) * t2];
				return `${i === 0 ? 'M' : 'L'}${num(a[0] * unit)},${num(a[1] * unit)}Q${num(point[0] * unit)},${num(point[1] * unit)} ${num(c[0] * unit)},${num(c[1] * unit)}`;
			})
			.join('') + 'Z';

	// Each notch's text sits in the cut-away rectangle: pinned to both edges at a corner, to one
	// edge (and centered along the other) on a side.
	const labels = cutouts
		.filter((cutout) => cutout.text)
		.map(({ from, text }) => {
			let style: string;
			if (from === 'top' || from === 'bottom') {
				style = `${from}: 0; left: 50%; transform: translateX(-50%); width: ${length}%; height: ${depth}%;`;
			} else if (from === 'left' || from === 'right') {
				style = `${from}: 0; top: 50%; transform: translateY(-50%); width: ${depth}%; height: ${length}%;`;
			} else {
				const x = from.endsWith('left') ? 'left' : 'right';
				const y = from.startsWith('top') ? 'top' : 'bottom';
				style = `${x}: 0; ${y}: 0; width: ${length}%; height: ${depth}%;`;
			}
			return { from, text: text!, style };
		});

	return { stroke: path(1), clip: path(0.01), labels };
}

/**
 * A rounded rectangle of the given size in px with one rectangular notch cut from its top right corner, as an SVG
 * path (also valid in CSS `path()`). Unlike `gnomonShape`, which is square and stretches, this keeps its corners
 * round at any width and height. The inner corner of the notch is rounded the other way.
 */
export function notchedBoxPath(
	width: number,
	height: number,
	notchWidth: number,
	notchHeight: number,
	radius: number
) {
	const nw = Math.min(notchWidth, width - radius * 2);
	const nh = Math.min(notchHeight, height - radius * 2);
	const r = Math.max(0, Math.min(radius, width / 2, height / 2));
	const inner = Math.min(r, nw / 2, nh / 2);
	const x = width - nw;
	const round = (value: number) => +value.toFixed(2);

	return [
		`M${round(r)} 0`,
		`H${round(x - r)}`,
		`A${round(r)} ${round(r)} 0 0 1 ${round(x)} ${round(r)}`,
		`V${round(nh - inner)}`,
		`A${round(inner)} ${round(inner)} 0 0 0 ${round(x + inner)} ${round(nh)}`,
		`H${round(width - r)}`,
		`A${round(r)} ${round(r)} 0 0 1 ${round(width)} ${round(nh + r)}`,
		`V${round(height - r)}`,
		`A${round(r)} ${round(r)} 0 0 1 ${round(width - r)} ${round(height)}`,
		`H${round(r)}`,
		`A${round(r)} ${round(r)} 0 0 1 0 ${round(height - r)}`,
		`V${round(r)}`,
		`A${round(r)} ${round(r)} 0 0 1 ${round(r)} 0`,
		'Z'
	].join(' ');
}

/** A plain rounded rectangle of the given size in px, as an SVG path (also valid in CSS `path()`). */
export function roundedBoxPath(width: number, height: number, radius: number) {
	const r = Math.max(0, Math.min(radius, width / 2, height / 2));
	const round = (value: number) => +value.toFixed(2);

	return [
		`M${round(r)} 0`,
		`H${round(width - r)}`,
		`A${round(r)} ${round(r)} 0 0 1 ${round(width)} ${round(r)}`,
		`V${round(height - r)}`,
		`A${round(r)} ${round(r)} 0 0 1 ${round(width - r)} ${round(height)}`,
		`H${round(r)}`,
		`A${round(r)} ${round(r)} 0 0 1 0 ${round(height - r)}`,
		`V${round(r)}`,
		`A${round(r)} ${round(r)} 0 0 1 ${round(r)} 0`,
		'Z'
	].join(' ');
}
