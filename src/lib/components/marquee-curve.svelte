<script module lang="ts">
	export type MarqueeCurveProps = {
		/** The text that runs along the curve, repeated to fill it. */
		text: string;
		/** A cubic Bézier from the curve tool, pasted as it is: `cubic-bezier(x1, y1, x2, y2)`. Or the four numbers. */
		curve?: string | [number, number, number, number];
		/** The shape of the box the curve is drawn in, as width ÷ height. `1` is a square, the shape of the curve tool's canvas, so the curve looks just as it did there. A wider number gives a flatter frame. */
		aspect?: number;
		/** A fixed height in px, instead of `aspect`. The curve is stretched to fit it. */
		height?: number;
		/** Thickness in px of the colored band the text runs along. `0` is no band. */
		band?: number;
		/** Any CSS color. */
		bandColor?: string;
		/** Any CSS color, for the two lines along the band's edges. */
		borderColor?: string;
		/** Width in px of each of the two edge lines. `0` is none. */
		borderWidth?: number;
		/** The space between letters, as a multiple of each letter's own width. */
		spacing?: number;
		/** Pixels per second the text moves along the curve. `0` turns the automatic motion off. */
		speed?: number;
		/** Runs the text the other way. */
		backwards?: boolean;
		/** The text runs backwards after the page scrolls up and forwards again after it scrolls down. */
		reverse?: boolean;
		/** Ties the text to scrolling, on top of its own motion: `1` is 1px per 1px scrolled. */
		scrub?: number;
		uppercase?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let {
		text,
		curve = 'cubic-bezier(0.33, 0.5, 0.67, 0.5)',
		aspect = 1,
		height: fixedHeight,
		band = 0,
		bandColor = 'var(--color-accent)',
		borderColor = 'var(--color-text)',
		borderWidth = 2,
		spacing = 1,
		speed = 60,
		backwards = false,
		reverse = false,
		scrub = 0,
		uppercase = true,
		class: className
	}: MarqueeCurveProps = $props();

	const LUT = 1200;

	let frame = $state<HTMLElement>();
	let glyphs = $state<HTMLElement[]>([]);
	let poolSize = $state(0);
	let width = $state(0);
	let height = $state(0);
	let bandPath = $state('');

	const numbers = $derived(
		(Array.isArray(curve) ? curve : (curve.match(/-?\d*\.?\d+/g) ?? []).map(Number)).slice(0, 4)
	);
	const valid = $derived(numbers.length === 4 && numbers.every(Number.isFinite));
	const [x1, y1, x2, y2] = $derived(valid ? numbers : [0.33, 0.5, 0.67, 0.5]);

	// Everything below is rebuilt together: the curve's size follows the frame, the letter widths follow the font.
	let lut: { x: Float32Array; y: Float32Array; angle: Float32Array; step: number; length: number };
	let letters: string[] = [];
	let advances: number[] = [];
	let cumulative: number[] = [];
	let period = 1;
	let shiftY = 0;
	let offset = 0;
	let ready = false;
	let still = false;

	// The curve starts and ends at the frame's vertical middle. A y of 1 is the top edge and 0 the bottom edge.
	const control = (value: number) => height / 2 - (value - 0.5) * height;

	function build() {
		if (!frame || !width || !height) return;

		const mid = height / 2;
		const p = [
			[0, mid],
			[width * x1, control(y1)],
			[width * x2, control(y2)],
			[width, mid]
		];
		const at = (t: number) => {
			const u = 1 - t;
			const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
			return [
				b[0] * p[0][0] + b[1] * p[1][0] + b[2] * p[2][0] + b[3] * p[3][0],
				b[0] * p[0][1] + b[1] * p[1][1] + b[2] * p[2][1] + b[3] * p[3][1]
			];
		};

		// Walk the curve, then resample it at even distances so a letter moves at a steady pace along it.
		const samples = 2400;
		const raw = Array.from({ length: samples + 1 }, (_, i) => at(i / samples));
		const along = [0];
		for (let i = 1; i <= samples; i++) {
			along.push(along[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
		}
		const length = along[samples];
		const step = length / (LUT - 1);
		const xs = new Float32Array(LUT);
		const ys = new Float32Array(LUT);
		const angle = new Float32Array(LUT);
		for (let i = 0, j = 0; i < LUT; i++) {
			const distance = i * step;
			while (j < samples - 1 && along[j + 1] < distance) j++;
			const span = along[j + 1] - along[j] || 1;
			const f = (distance - along[j]) / span;
			xs[i] = raw[j][0] + (raw[j + 1][0] - raw[j][0]) * f;
			ys[i] = raw[j][1] + (raw[j + 1][1] - raw[j][1]) * f;
			angle[i] = Math.atan2(raw[j + 1][1] - raw[j][1], raw[j + 1][0] - raw[j][0]);
		}
		lut = { x: xs, y: ys, angle, step, length };

		// The band is the curve drawn as a thick line, so it keeps the same thickness all along it. Straight lengths
		// past both ends along the end tangents keep the band from stopping short of the frame's edges.
		const unit = (dx: number, dy: number) => {
			const size = Math.hypot(dx, dy) || 1;
			return [dx / size, dy / size];
		};
		const start = unit(p[1][0] - p[0][0] || 1, p[1][1] - p[0][1]);
		const end = unit(p[3][0] - p[2][0] || 1, p[3][1] - p[2][1]);
		const reach = width + band * 2;
		bandPath = `M ${p[0][0] - start[0] * reach} ${p[0][1] - start[1] * reach} L ${p[0][0]} ${p[0][1]} C ${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]} L ${p[3][0] + end[0] * reach} ${p[3][1] + end[1] * reach}`;

		// Letter widths come from the font, so any font works, not only a mono-spaced one.
		const style = getComputedStyle(frame);
		const size = parseFloat(style.fontSize);
		const context = document.createElement('canvas').getContext('2d')!;
		context.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
		const shown = uppercase ? text.toUpperCase() : text;
		letters = [...`${shown} `];
		advances = letters.map((letter) => context.measureText(letter).width * spacing);
		cumulative = advances.reduce<number[]>(
			(sums, width, i) => [...sums, (sums[i] ?? 0) + width],
			[0]
		);
		cumulative.pop();
		period = advances.reduce((sum, value) => sum + value, 0) || 1;

		// Lines are centered on the curve by the middle of the capitals (or the lowercase body), not the line box.
		const cap = context.measureText('H');
		const body = context.measureText('x');
		const ascent = cap.fontBoundingBoxAscent ?? size * 0.8;
		const descent = cap.fontBoundingBoxDescent ?? size * 0.2;
		const boxTop = (size - (ascent + descent)) / 2;
		const centerOfLetters = uppercase
			? cap.actualBoundingBoxAscent / 2
			: (cap.actualBoundingBoxAscent + body.actualBoundingBoxAscent) / 4;
		shiftY = size / 2 - (boxTop + ascent - centerOfLetters);

		const smallest =
			Math.min(...advances.filter((value, i) => letters[i] !== ' ' && value > 0)) || size / 2;
		poolSize = Math.ceil((length + size * 4) / smallest) + 2;
		ready = true;
		render();
	}

	function render(travel = offset) {
		// The pool can shrink when the frame does, which leaves empty slots behind.
		const pool = glyphs.slice(0, poolSize).filter(Boolean);
		if (!ready || !pool.length) return;

		const { x, y, angle, step, length } = lut;
		const margin = Math.max(...advances);
		const turned = ((travel % period) + period) % period;
		let used = 0;

		for (let k = 0; used < pool.length; k++) {
			const index = k % letters.length;
			const cycle = Math.floor(k / letters.length);
			const start = cumulative[index] + cycle * period + turned - period;
			const center = start + advances[index] / 2;
			if (center > length + margin) break;
			if (center < -margin || letters[index] === ' ') continue;

			// Past either end the line carries straight on along the end's direction, like the band does.
			let px: number;
			let py: number;
			let turn: number;
			if (center < 0 || center > length) {
				const last = center < 0 ? 0 : LUT - 1;
				const overshoot = center < 0 ? center : center - length;
				turn = angle[last];
				px = x[last] + Math.cos(turn) * overshoot;
				py = y[last] + Math.sin(turn) * overshoot;
			} else {
				const place = center / step;
				const i0 = Math.min(Math.floor(place), LUT - 2);
				const f = place - i0;
				px = x[i0] + (x[i0 + 1] - x[i0]) * f;
				py = y[i0] + (y[i0 + 1] - y[i0]) * f;
				turn = angle[i0] + (angle[i0 + 1] - angle[i0]) * f;
			}

			const glyph = pool[used++];
			if (glyph.textContent !== letters[index]) glyph.textContent = letters[index];
			glyph.style.visibility = 'visible';
			glyph.style.transform = `translate(${px}px, ${py}px) rotate(${turn}rad) translate(-50%, calc(-50% + ${shiftY}px))`;
		}
		for (; used < pool.length; used++) pool[used].style.visibility = 'hidden';
	}

	$effect(() => {
		// Rebuild when the curve, the frame, the text or the look changes.
		void [x1, y1, x2, y2, height, width, text, spacing, uppercase, band];
		build();
	});

	onMount(() => {
		still = matchMedia('(prefers-reduced-motion: reduce)').matches;

		const measureFrame = () => {
			width = frame!.clientWidth;
			height = frame!.clientHeight;
		};
		const resize = new ResizeObserver(measureFrame);
		resize.observe(frame!);
		measureFrame();
		document.fonts?.ready.then(build);

		let visible = true;
		const intersect = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		intersect.observe(frame!);

		let raf = 0;
		if (!still) {
			let scrolled = scrollY * scrub;
			let heading = 1;
			let direction = 1;
			let lastY = scrollY;
			let last = performance.now();

			const tick = (now: number) => {
				const elapsed = now - last;
				last = now;

				if (reverse) {
					const moved = scrollY - lastY;
					if (Math.abs(moved) > 0.5) direction = moved > 0 ? 1 : -1;
					lastY = scrollY;
					heading += (direction - heading) * (1 - Math.exp(-elapsed / 250));
				}

				if (visible && ready) {
					const sign = backwards ? -1 : 1;
					offset += sign * heading * speed * (elapsed / 1000);
					scrolled += (scrollY * scrub - scrolled) * (1 - Math.exp(-elapsed / 120));
					render(offset + sign * scrolled);
				} else if (!visible) {
					// Off screen it keeps up with the page, so it does not have to catch up when it comes into view.
					scrolled = scrollY * scrub;
				}
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
		}

		return () => {
			cancelAnimationFrame(raf);
			resize.disconnect();
			intersect.disconnect();
		};
	});
</script>

<div
	bind:this={frame}
	class="marquee-curve {className ?? ''}"
	role="region"
	aria-label={text}
	style={fixedHeight ? `height: ${fixedHeight}px` : `aspect-ratio: ${aspect}`}
>
	{#if band > 0 && width}
		<svg class="band" {width} {height} viewBox="0 0 {width} {height}" aria-hidden="true">
			{#if borderWidth > 0}
				<path d={bandPath} stroke={borderColor} stroke-width={band} />
			{/if}
			<path d={bandPath} stroke={bandColor} stroke-width={Math.max(0, band - borderWidth * 2)} />
		</svg>
	{/if}

	<div class="glyphs" aria-hidden="true">
		{#each Array.from({ length: poolSize }, (_, slot) => slot) as index (index)}
			<span class="glyph" bind:this={glyphs[index]}></span>
		{/each}
	</div>
</div>

<style lang="scss">
	.marquee-curve {
		position: relative;
		width: 100%;
		overflow: clip;
		font-family: var(--font-mono);
		font-size: 44px;
		line-height: 1;
	}

	.band {
		position: absolute;
		inset: 0;

		path {
			fill: none;
			stroke-linecap: butt;
			stroke-linejoin: round;
		}
	}

	.glyphs {
		position: absolute;
		inset: 0;
	}

	.glyph {
		position: absolute;
		top: 0;
		left: 0;
		visibility: hidden;
		white-space: pre;
		will-change: transform;
	}
</style>
