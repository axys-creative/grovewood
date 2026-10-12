export type Ease = (progress: number) => number;

const NAMED_EASES: Record<string, string> = {
	linear: 'cubic-bezier(0, 0, 1, 1)',
	ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
	'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
	'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
	'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)'
};

const FALLBACK = [0.16, 1, 0.3, 1];

/** Turns `cubic-bezier(...)` or a CSS keyword into a function from 0-1 progress to eased 0-1 (may overshoot). */
export function parseEase(value: string): (progress: number) => number {
	const source = NAMED_EASES[value.trim()] ?? value;
	const points = /cubic-bezier\(([^)]+)\)/i.exec(source)?.[1].split(',').map(Number);
	const [x1, y1, x2, y2] =
		points?.length === 4 && points.every(Number.isFinite) ? points : FALLBACK;

	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
	const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
	const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

	return (progress) => {
		if (progress <= 0) return 0;
		if (progress >= 1) return 1;

		let t = progress;
		for (let i = 0; i < 8; i++) {
			const error = sampleX(t) - progress;
			if (Math.abs(error) < 1e-6) return sampleY(t);
			const slope = slopeX(t);
			if (Math.abs(slope) < 1e-6) break;
			t -= error / slope;
		}

		let low = 0;
		let high = 1;
		t = progress;
		while (low < high) {
			const x = sampleX(t);
			if (Math.abs(x - progress) < 1e-6) break;
			if (progress > x) low = t;
			else high = t;
			t = (high + low) / 2;
		}
		return sampleY(t);
	};
}

/** Frame-rate independent version of "move `speed` of the way there each frame at 60fps". */
export const damp = (speed: number, seconds: number) => 1 - Math.pow(1 - speed, seconds * 60);

// "in" curves; "out" and "inOut" are made from these by mirroring.
const bounceOut: Ease = (t) => {
	if (t < 1 / 2.75) return 7.5625 * t * t;
	if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
	if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
	return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
};

const inCurves: Record<string, (params: number[]) => Ease> = {
	none: () => (t) => t,
	linear: () => (t) => t,
	power1: () => (t) => t ** 2,
	power2: () => (t) => t ** 3,
	power3: () => (t) => t ** 4,
	power4: () => (t) => t ** 5,
	sine: () => (t) => 1 - Math.cos((t * Math.PI) / 2),
	// Blended with a small term so it lands exactly on 1, the same way GSAP does.
	expo: () => (t) => 2 ** (10 * (t - 1)) * t + t ** 6 * (1 - t),
	circ: () => (t) => 1 - Math.sqrt(1 - t * t),
	back:
		([overshoot = 1.70158]) =>
		(t) =>
			t * t * ((overshoot + 1) * t - overshoot),
	elastic:
		([amplitude = 1, period = 0.3]) =>
		(t) => {
			const amp = Math.max(amplitude, 1);
			const shift = (period / (2 * Math.PI)) * Math.asin(1 / amp);
			if (t === 0 || t === 1) return t;
			return -(amp * 2 ** (10 * (t - 1)) * Math.sin(((t - 1 - shift) * 2 * Math.PI) / period));
		},
	bounce: () => (t) => 1 - bounceOut(1 - t)
};

/**
 * Reads a GSAP-style ease name such as `none`, `power2.out`, `back.out(2)` or `elastic.out(1, 0.4)`.
 * Unknown names fall back to linear.
 */
export function parseGsapEase(name: string): Ease {
	const match = /^(\w+)(?:\.(in|out|inOut))?(?:\(([^)]*)\))?$/.exec(name.trim());
	const make = match && inCurves[match[1]];
	if (!make) return (t) => t;

	const params = (match[3] ?? '')
		.split(',')
		.filter((part) => part.trim() !== '')
		.map(Number)
		.filter(Number.isFinite);
	const easeIn = make(params);
	const mode = match[2] ?? 'out';

	if (match[1] === 'none' || match[1] === 'linear') return easeIn;
	if (mode === 'in') return easeIn;
	if (mode === 'out') return (t) => 1 - easeIn(1 - t);
	return (t) => (t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn((1 - t) * 2) / 2);
}
