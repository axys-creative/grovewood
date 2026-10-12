/** `zigzag` and `notch` are made of straight segments, and `random` picks any of the others for each stroke. */
export type ScribblePreset = 'swoosh' | 'wave' | 'dip' | 'flat' | 'zigzag' | 'notch' | 'random';
export type ScribbleCurve = ScribblePreset | string | [number, number, number, number];

/** Curves in the same form as the Marquee Curve's: the stroke starts and ends mid-height, and a `y` of 1 is the top edge, 0 the bottom. */
export const scribblePresets: Record<
	Exclude<ScribblePreset, 'zigzag' | 'notch' | 'random'>,
	string
> = {
	swoosh: 'cubic-bezier(0.3, -0.1, 0.7, 0.9)',
	wave: 'cubic-bezier(0.3, 0, 0.7, 1)',
	dip: 'cubic-bezier(0.3, 0, 0.7, 0)',
	flat: 'cubic-bezier(0.33, 0.5, 0.67, 0.5)'
};

const WIDTH = 100;
const HEIGHT = 20;
const STEPS = 120;

const pool: ScribblePreset[] = ['flat', 'swoosh', 'wave', 'dip', 'zigzag', 'zigzag', 'notch'];

const numbersOf = (curve: ScribbleCurve) => {
	const source = Array.isArray(curve)
		? curve
		: ((scribblePresets as Record<string, string>)[curve] ?? curve);
	const found = Array.isArray(source) ? source : (source.match(/-?\d*\.?\d+/g) ?? []).map(Number);
	return found.length === 4 && found.every(Number.isFinite) ? found : null;
};

// A dry-brush stroke: a blunt start that thickens quickly, then a long taper into a thin, broken tail.
const profile = (t: number) => Math.min(1, t / 0.07) ** 0.5 * (1 - t ** 2.5);

export type ScribbleShape = {
	/** The widest point as a share of the box's height. */
	thickness?: number;
	/** How ragged the edges are, from 0 (smooth) to 1. */
	rough?: number;
	/** How many dry streaks are left bare inside the stroke. The body is solid unless this is set. */
	streaks?: number;
	/** Any number gives the same stroke every time. Without it each stroke is different. */
	seed?: number;
};

// A small seeded generator, so a seed always draws the same stroke.
function random(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Smooth random wobble along the stroke: random values at a few points, blended with a cosine.
function wobble(rand: () => number, every: number) {
	const points = Array.from({ length: Math.ceil(STEPS / every) + 2 }, () => rand() * 2 - 1);
	return (step: number) => {
		const at = step / every;
		const k = Math.floor(at);
		const f = (1 - Math.cos((at - k) * Math.PI)) / 2;
		return points[k] * (1 - f) + points[k + 1] * f;
	};
}

// A line made of straight segments: level, a zigzag of one or two there-and-backs, level again; or one V-shaped dip.
function segments(kind: 'zigzag' | 'notch', rand: () => number) {
	const mid = HEIGHT / 2;
	const sign = rand() < 0.5 ? 1 : -1;

	if (kind === 'notch') {
		const half = 10 + rand() * 7;
		const start = 12 + rand() * (WIDTH - 24 - half * 2);
		return [
			[0, mid],
			[start, mid],
			[start + half, mid + sign * HEIGHT * (0.36 + rand() * 0.14)],
			[start + half * 2, mid],
			[WIDTH, mid]
		];
	}

	const zigs = rand() < 0.5 ? 1 : 2;
	const half = 7 + rand() * 4;
	const amp = HEIGHT * (0.3 + rand() * 0.15);
	const start = 8 + rand() * (WIDTH - 16 - (zigs * 2 + 1) * half);
	const points = [
		[0, mid],
		[start, mid]
	];
	for (let k = 0; k < zigs * 2; k++) {
		points.push([start + (k + 1) * half, mid + sign * (k % 2 ? -amp : amp)]);
	}
	points.push([start + (zigs * 2 + 1) * half, mid], [WIDTH, mid]);
	return points;
}

// Rounds off each corner a little (cutting a quarter off both sides of it) so the joins read as paint, not as
// the sharp tips of a polygon.
function soften(points: number[][]) {
	let line = points;
	for (let pass = 0; pass < 1; pass++) {
		const next = [line[0]];
		for (let i = 0; i < line.length - 1; i++) {
			const [ax, ay] = line[i];
			const [bx, by] = line[i + 1];
			next.push(
				[ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25],
				[ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]
			);
		}
		next.push(line[line.length - 1]);
		line = next;
	}
	return line;
}

/** Evenly spaced points along a polyline, with the direction of travel at each. */
function along(points: number[][], count: number) {
	const lengths = [0];
	for (let i = 1; i < points.length; i++) {
		lengths.push(
			lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
		);
	}
	const total = lengths[lengths.length - 1];
	const out: { x: number; y: number; dx: number; dy: number }[] = [];
	let k = 0;
	for (let i = 0; i <= count; i++) {
		const target = (i / count) * total;
		while (k < points.length - 2 && lengths[k + 1] < target) k++;
		const [ax, ay] = points[k];
		const [bx, by] = points[k + 1];
		const f = (target - lengths[k]) / (lengths[k + 1] - lengths[k] || 1);
		out.push({ x: ax + (bx - ax) * f, y: ay + (by - ay) * f, dx: bx - ax, dy: by - ay });
	}
	return out;
}

type Sample = { x: number; y: number; nx: number; ny: number; half: number };

/**
 * Turns a centerline into the outline of a stroke, as an SVG path to fill with the even-odd rule: a solid body whose edges
 * wobble and are chipped in places, going ragged toward the tail, where flecks break away from it, like a dry brush.
 * Thin streaks can also be cut out of the inside.
 */
function outline(samples: Sample[], rand: () => number, rough: number, streaks: number) {
	const steps = samples.length - 1;
	const peak = Math.max(...samples.map((sample) => sample.half));

	const slowTop = wobble(rand, 10);
	const fastTop = wobble(rand, 3);
	const slowBottom = wobble(rand, 10);
	const fastBottom = wobble(rand, 3);

	// Chips: short bites out of one edge.
	const bites = Array.from({ length: Math.round(rough * 5) }, () => ({
		edge: rand() < 0.5 ? 0 : 1,
		at: 6 + rand() * (steps - 12),
		width: 2 + rand() * 4,
		depth: 0.35 + rand() * 0.45
	}));
	const bite = (step: number, edge: number) =>
		bites.reduce((deepest, b) => {
			if (b.edge !== edge) return deepest;
			const near = 1 - Math.abs(step - b.at) / b.width;
			return near > 0 ? Math.max(deepest, near * b.depth) : deepest;
		}, 0);

	// Past the middle the edges grow ragged: random bites that get bigger and more frequent toward the tail.
	const tailAt = (step: number) => {
		const k = Math.max(0, (step / steps - 0.45) / 0.55);
		return k * k * (3 - 2 * k);
	};
	const jag = [1, -1].map(() => Array.from({ length: steps + 1 }, () => rand() ** 2));

	const edge = (side: 1 | -1) =>
		samples.map(({ x, y, nx, ny, half }, i) => {
			const slow = side === 1 ? slowTop(i) : slowBottom(i);
			const fast = side === 1 ? fastTop(i) : fastBottom(i);
			const wobbly = rough * (0.28 * slow + 0.16 * fast);
			const ragged = tailAt(i) * rough * 1.4 * jag[side === 1 ? 0 : 1][i];
			const reach = half * Math.max(0.1, 1 + wobbly - bite(i, side === 1 ? 0 : 1) - ragged);
			const offset = side * reach;
			return `${(x + nx * offset).toFixed(2)} ${(y + ny * offset).toFixed(2)}`;
		});
	const upper = edge(1);
	const lower = edge(-1).reverse();

	let d = `M${upper.join(' L')} L${lower.join(' L')}Z`;

	// Flecks: small specks that have come away from the body along its tail, on either side of the line.
	const flecks = Math.round(rough * 24);
	for (let n = 0; n < flecks; n++) {
		const at = Math.round(steps * (0.55 + rand() * 0.45));
		const { x, y, nx, ny, half } = samples[Math.min(at, steps)];
		const side = rand() < 0.5 ? 1 : -1;
		const distance = side * (half * 1.1 + peak * (0.04 + rand() * 0.3));
		const radius = peak * (0.08 + rand() * 0.18);
		const turn = rand() * Math.PI;
		const points = Array.from({ length: 7 }, (_, k) => {
			const angle = turn + (k / 7) * Math.PI * 2;
			const r = radius * (0.65 + rand() * 0.6);
			return `${(x + nx * distance + Math.cos(angle) * r).toFixed(2)} ${(y + ny * distance + Math.sin(angle) * r).toFixed(2)}`;
		});
		d += ` M${points.join(' L')}Z`;
	}

	// Dry streaks: thin slivers along the stroke, cut out with the even-odd rule.
	for (let n = 0; n < streaks; n++) {
		const lane = (rand() * 2 - 1) * 0.55;
		const from = Math.round(steps * (0.08 + rand() * 0.5));
		const to = Math.min(steps - 6, from + Math.round(steps * (0.18 + rand() * 0.32)));
		const bare = peak * (0.07 + rand() * 0.12);
		const top: string[] = [];
		const bottom: string[] = [];
		for (let i = from; i <= to; i++) {
			const { x, y, nx, ny, half } = samples[i];
			const k = (i - from) / (to - from);
			const width = bare * Math.sin(Math.PI * k) ** 0.7;
			const centre = lane * half;
			top.push(
				`${(x + nx * (centre + width)).toFixed(2)} ${(y + ny * (centre + width)).toFixed(2)}`
			);
			bottom.push(
				`${(x + nx * (centre - width)).toFixed(2)} ${(y + ny * (centre - width)).toFixed(2)}`
			);
		}
		d += ` M${top.join(' L')} L${bottom.reverse().join(' L')}Z`;
	}

	return d;
}

/**
 * The outline of an underline as an SVG path in a 100 by 20 box. It follows a cubic Bézier from the left edge to the
 * right at mid-height and is thickest in the middle, tapering to a point at both ends.
 */
export function scribblePath(
	curve: ScribbleCurve = 'swoosh',
	{
		thickness = 0.35,
		rough = 0.5,
		streaks = 0,
		seed = Math.random() * 4294967296
	}: ScribbleShape = {}
) {
	const rand = random(seed);
	const kind = curve === 'random' ? pool[Math.floor(rand() * pool.length)] : curve;
	const [x1, y1, x2, y2] = numbersOf(kind) ?? numbersOf('swoosh')!;
	const mid = HEIGHT / 2;
	const control = (value: number) => mid - (value - 0.5) * HEIGHT;
	const p = [
		[0, mid],
		[WIDTH * x1, control(y1)],
		[WIDTH * x2, control(y2)],
		[WIDTH, mid]
	];

	const samples: Sample[] = [];
	const straight =
		kind === 'zigzag' || kind === 'notch' ? along(soften(segments(kind, rand)), STEPS) : null;
	for (let i = 0; i <= STEPS; i++) {
		const t = i / STEPS;
		const half = (thickness * HEIGHT * profile(t)) / 2;
		if (straight) {
			const { x, y, dx, dy } = straight[i];
			const length = Math.hypot(dx, dy) || 1;
			samples.push({ x, y, nx: -dy / length, ny: dx / length, half });
			continue;
		}
		const u = 1 - t;
		const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
		const x = b[0] * p[0][0] + b[1] * p[1][0] + b[2] * p[2][0] + b[3] * p[3][0];
		const y = b[0] * p[0][1] + b[1] * p[1][1] + b[2] * p[2][1] + b[3] * p[3][1];
		const dx =
			3 * u * u * (p[1][0] - p[0][0]) +
			6 * u * t * (p[2][0] - p[1][0]) +
			3 * t * t * (p[3][0] - p[2][0]);
		const dy =
			3 * u * u * (p[1][1] - p[0][1]) +
			6 * u * t * (p[2][1] - p[1][1]) +
			3 * t * t * (p[3][1] - p[2][1]);
		const length = Math.hypot(dx, dy) || 1;
		samples.push({ x, y, nx: -dy / length, ny: dx / length, half });
	}

	return outline(samples, rand, rough, streaks);
}

/**
 * A hand-drawn loop around a box of the given size in px, as `outline` (the shape to fill, with the even-odd rule) and
 * `center` (the line it follows, to reveal it by drawing along it). It is an uneven oval, drawn in one quick pass that
 * overshoots its start and ends in a tail that does not meet the beginning. `width` is the stroke's widest point in px.
 */
export function scribbleLoop(
	width: number,
	height: number,
	{ width: stroke = 6, rough = 0.5, streaks = 0, seed = Math.random() * 4294967296 } = {}
) {
	const rand = random(seed);
	const start = ((-70 + rand() * 40) * Math.PI) / 180;
	const sweep = ((385 + rand() * 40) * Math.PI) / 180;
	const tilt = ((rand() * 6 - 4) * Math.PI) / 180;
	const inner = 0.9 + rand() * 0.03;
	const outer = 1.04 + rand() * 0.06;
	const squash = 0.86 + rand() * 0.06;
	const cx = width / 2;
	const cy = height / 2;

	const points = Array.from({ length: STEPS + 1 }, (_, i) => {
		const t = i / STEPS;
		const angle = start + sweep * t;
		const spiral = inner + (outer - inner) * t ** 1.4;
		// The sides move out less than the top and bottom as the loop spirals, so the early, inner pass does not cut into
		// the end of the words.
		const ex = Math.cos(angle) * (width / 2) * (1 + (spiral - 1) * 0.5);
		const ey = Math.sin(angle) * (height / 2) * squash * spiral;
		return {
			x: cx + ex * Math.cos(tilt) - ey * Math.sin(tilt),
			y: cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)
		};
	});

	const samples: Sample[] = points.map(({ x, y }, i) => {
		const a = points[Math.max(0, i - 1)];
		const b = points[Math.min(STEPS, i + 1)];
		const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
		const half = (stroke * profile(i / STEPS)) / 2;
		return { x, y, nx: -(b.y - a.y) / length, ny: (b.x - a.x) / length, half };
	});

	return {
		outline: outline(samples, rand, rough, streaks),
		center: `M${points.map(({ x, y }) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')}`
	};
}

export const scribbleBox = { width: WIDTH, height: HEIGHT };
