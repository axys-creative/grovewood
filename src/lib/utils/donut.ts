export type DonutOptions = {
	/** Which slice, counting from `0`. */
	index: number;
	count: number;
	/** 0-99, the hole as a percent of the outer radius. `0` draws pie slices. */
	holeSize: number;
	/** The curve on every slice corner, in the same 0-100 units as the ring. */
	radius: number;
	/** The space left between neighboring slices, in the same units. */
	gap: number;
	/** `default` centers slice 0 at 12 o'clock. `tilted` puts a division there with slice 0 to its right, `tilted-left` with slice 0 to its left. */
	orientation: 'default' | 'tilted' | 'tilted-left';
};

const CENTER = 50;
const OUTER = 50;
const DEGREES = 180 / Math.PI;

/**
 * One slice of a donut (or pie) as an SVG path in a 0-100 box, plus the angle of its middle (0 is the top,
 * turning clockwise). Rounding the corners and keeping a straight, even gap between slices both need real
 * trigonometry, so the whole ring is worked out here rather than with a stroke.
 */
export function donutSlice({ index, count, holeSize, radius, gap, orientation }: DonutOptions) {
	const slices = Math.max(1, count || 1);
	const inner = (OUTER * Math.min(Math.max(holeSize || 0, 0), 99)) / 100;
	const hasHole = inner > 1;
	const step = 360 / slices;
	const offset = orientation === 'tilted' ? 0 : orientation === 'tilted-left' ? -step : -step / 2;
	const start = index * step + offset;
	const end = start + step;
	// Unaffected by the gap, so a caption stays centered on the slice's original sweep.
	const middle = start + step / 2;

	const toRadians = (degrees: number) => ((degrees - 90) * Math.PI) / 180;
	const point = (degrees: number, distance: number) => ({
		x: CENTER + distance * Math.cos(toRadians(degrees)),
		y: CENTER + distance * Math.sin(toRadians(degrees))
	});
	const text = (p: { x: number; y: number }) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`;

	// A gap keeps each edge parallel to its own boundary, moved sideways by half the spacing. A sideways shift of
	// `half` meets a circle of radius R at asin(half / R) from that boundary, so every point asks for its angle at its
	// own radius and they all land on the same straight line as the neighbor's matching point.
	const half = Math.max(gap || 0, 0) / 2;
	const gapAngle = (distance: number) =>
		half > 0 && distance > 0
			? Math.min(Math.asin(Math.min(half / distance, 0.999)) * DEGREES, step / 2 - 0.01)
			: 0;

	const outerStart = start + gapAngle(OUTER);
	const outerEnd = end - gapAngle(OUTER);
	const innerStart = start + (hasHole ? gapAngle(inner) : 0);
	const innerEnd = end - (hasHole ? gapAngle(inner) : 0);
	const outerSweep = outerEnd - outerStart;
	const innerSweep = hasHole ? innerEnd - innerStart : 0;

	// The corner radius can never eat past the ring's thickness or half of either edge.
	const sweepRadians = (Math.min(outerSweep, hasHole ? innerSweep : outerSweep) * Math.PI) / 180;
	const largest =
		Math.min(
			(OUTER - inner) / 2,
			(OUTER * sweepRadians) / 2,
			hasHole ? (inner * sweepRadians) / 2 : Infinity
		) * 0.98;
	const round = Math.min(Math.max(radius || 0, 0), Math.max(largest, 0));

	const outerRail = gapAngle(OUTER - round);
	const innerRail = hasHole ? gapAngle(inner + round) : 0;

	// A single slice is a full turn, which SVG cannot draw (the ends coincide), so it gets a hairline seam.
	const capped = (angle: number, available: number) => Math.min(angle, available / 2 - 0.01);
	const seam = step >= 359.9 && half === 0 ? 0.01 : 0;
	const trimOuter = Math.max(round > 0 ? capped((round / OUTER) * DEGREES, outerSweep) : 0, seam);
	const trimInner = Math.max(
		hasHole && round > 0 ? capped((round / inner) * DEGREES, innerSweep) : 0,
		seam
	);

	const largeOuter = outerSweep - 2 * trimOuter > 180 ? 1 : 0;
	const outerSharpStart = point(outerStart, OUTER);
	const outerSharpEnd = point(outerEnd, OUTER);
	const outerTrimStart = point(outerStart + trimOuter, OUTER);
	const outerTrimEnd = point(outerEnd - trimOuter, OUTER);

	let path: string[];

	if (!hasHole) {
		// The center stays sharp: rounding every slice's tip at the same point would pile the curves up.
		const railStart = point(start + outerRail, OUTER - round);
		const railEnd = point(end - outerRail, OUTER - round);

		path = [
			`M ${CENTER},${CENTER}`,
			`L ${text(railStart)}`,
			round > 0 ? `Q ${text(outerSharpStart)} ${text(outerTrimStart)}` : '',
			`A ${OUTER} ${OUTER} 0 ${largeOuter} 1 ${text(outerTrimEnd)}`,
			round > 0 ? `Q ${text(outerSharpEnd)} ${text(railEnd)}` : '',
			`L ${CENTER},${CENTER}`,
			'Z'
		];
	} else {
		const largeInner = innerSweep - 2 * trimInner > 180 ? 1 : 0;
		const innerSharpStart = point(innerStart, inner);
		const innerSharpEnd = point(innerEnd, inner);
		const innerTrimStart = point(innerStart + trimInner, inner);
		const innerTrimEnd = point(innerEnd - trimInner, inner);
		const railInnerStart = point(start + innerRail, inner + round);
		const railOuterStart = point(start + outerRail, OUTER - round);
		const railOuterEnd = point(end - outerRail, OUTER - round);
		const railInnerEnd = point(end - innerRail, inner + round);

		path = [
			`M ${text(innerTrimStart)}`,
			round > 0 ? `Q ${text(innerSharpStart)} ${text(railInnerStart)}` : '',
			`L ${text(railOuterStart)}`,
			round > 0 ? `Q ${text(outerSharpStart)} ${text(outerTrimStart)}` : '',
			`A ${OUTER} ${OUTER} 0 ${largeOuter} 1 ${text(outerTrimEnd)}`,
			round > 0 ? `Q ${text(outerSharpEnd)} ${text(railOuterEnd)}` : '',
			`L ${text(railInnerEnd)}`,
			round > 0 ? `Q ${text(innerSharpEnd)} ${text(innerTrimEnd)}` : '',
			`A ${inner} ${inner} 0 ${largeInner} 0 ${text(innerTrimStart)}`,
			'Z'
		];
	}

	return { path: path.filter(Boolean).join(' '), middle };
}
