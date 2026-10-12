<script module lang="ts">
	export type CircleImage = { src: string; alt?: string; width?: number; height?: number };

	export type ImageCircleProps = {
		images: CircleImage[];
		/** Card width as a percent of the component's own width. */
		itemWidth?: number;
		/** Space between cards as a multiple of card width: 1 touches, more spaces them, less overlaps. */
		gap?: number;
		/** Which way the ring spins. */
		direction?: 'left' | 'right';
		/** Seconds for one full turn. */
		duration?: number;
		/** Cards turn with the ring like petals instead of staying upright, with this side's card upright. */
		bloom?: 'left' | 'right' | 'top';
		/** Crops the cards that swing past the square. Turn off to let them bleed out of it. */
		clip?: boolean;
		/** How wide the cards are drawn, for choosing the file to download. Defaults to `160px`. */
		sizes?: string;
		/** Degrees between neighboring cards. Defaults to an even split of the full circle. Smaller than that leaves the ring open, as an arc. */
		step?: number;
		/** Holds the ring at this angle (degrees, clockwise) instead of spinning on its own, and eases between angles when it changes. */
		rotation?: number;
		/** A faint ring of thin ticks behind the cards, tracing the path they travel. */
		ticks?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';

	const TICK_GAP = 8;

	let {
		images,
		itemWidth = 24,
		gap = 1.15,
		direction = 'left',
		duration = 40,
		bloom,
		clip = true,
		sizes = '160px',
		step: stepOverride,
		rotation,
		ticks = true,
		class: className
	}: ImageCircleProps = $props();

	let width = $state(0);

	const step = $derived(stepOverride ?? 360 / (images.length > 1 ? images.length : 2));

	// The same chord formula as the radius in the styles, in px, so the ticks sit TICK_GAP apart along the path.
	const tickCount = $derived.by(() => {
		const radius = (width * (itemWidth / 100) * gap) / (2 * Math.sin((step / 2) * (Math.PI / 180)));
		return Math.max(24, Math.floor((2 * Math.PI * radius) / TICK_GAP));
	});
</script>

<div
	class="image-circle {direction} {clip ? 'clip' : ''} {bloom ? `bloom-${bloom}` : ''} {rotation !==
	undefined
		? 'held'
		: ''} {className ?? ''}"
	style="--step: {step}; --gap: {gap}; --item-width: {itemWidth}; --duration: {duration}s{rotation !==
	undefined
		? `; --rotate: ${rotation}deg`
		: ''}"
	bind:clientWidth={width}
>
	{#if ticks && width}
		<div class="ticks" aria-hidden="true">
			{#each { length: tickCount }, index (index)}
				<span class="tick" style="--tick-angle: {(index * 360) / tickCount}deg"></span>
			{/each}
		</div>
	{/if}

	<div class="ring">
		{#each images as image, index (index)}
			<div class="item" style="--i: {index}">
				<figure class="card">
					<img
						{...imageProps(image.src, { sizes })}
						alt={image.alt ?? ''}
						width={image.width ?? 400}
						height={image.height ?? 400}
						loading="lazy"
					/>
				</figure>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use 'base/mixins';

	// A ring of cards on an exact circle. The radius comes from the chord formula (chord / (2 sin(step / 2))),
	// in cqw (1% of the component's own width), and the component is square, so it stays round at any size.
	.image-circle {
		--step: 30;
		--gap: 1;
		--item-width: 24;
		--duration: 40s;

		position: relative;
		width: 100%;
		aspect-ratio: 1;
		container-type: inline-size;
		isolation: isolate;

		--w: calc(var(--item-width) * 1cqw);
		--chord: calc(var(--w) * var(--gap));
		--radius: calc(var(--chord) / (2 * sin(calc(var(--step) / 2 * 1deg))));
	}

	.clip {
		overflow: hidden;
	}

	.ticks {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.tick {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 1px;
		height: 16px;
		background: var(--tick-color, var(--color-surface));
		transform: translate(-50%, -50%) rotate(var(--tick-angle)) translateY(calc(var(--radius) * -1));
	}

	.ring {
		position: absolute;
		inset: 0;

		@include mixins.mq-motion-allow {
			animation: turn-left var(--duration) linear infinite;
		}
	}

	.item {
		--angle: calc(var(--i, 0) * var(--step));
		--x: calc(var(--radius) * sin(var(--angle) * 1deg));
		--y: calc(var(--radius) * -1 * cos(var(--angle) * 1deg));

		position: absolute;
		top: 50%;
		left: 50%;
		// The card sits in the middle of this square, so it stays on the circle's path however the ring is turned.
		display: grid;
		place-items: center;
		width: var(--w);
		aspect-ratio: 1;
		transform: translate(-50%, -50%) translate(var(--x), var(--y));
	}

	// Each card turns against the ring so it stays upright as it orbits.
	.card {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 1.5;
		margin: 0;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card, 8px);
		background: var(--color-surface);

		@include mixins.mq-motion-allow {
			animation: turn-right var(--duration) linear infinite;
		}
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		-webkit-user-drag: none;
	}

	// Held at an angle: no spin. Cards turn against the ring to stay upright, unless a bloom turns them its own way.
	.held {
		.ring {
			animation: none;
			rotate: var(--rotate, 0deg);

			@include mixins.mq-motion-allow {
				transition: rotate 0.9s var(--ease);
			}
		}

		.card {
			animation: none;
			rotate: calc(var(--rotate, 0deg) * -1);

			@include mixins.mq-motion-allow {
				transition: rotate 0.9s var(--ease);
			}
		}
	}

	.right {
		.ring {
			animation-name: turn-right;
		}

		.card {
			animation-name: turn-left;
		}
	}

	// Petals: instead of staying upright, each card turns to its own place on the ring, so they fan out like a flower.
	// The turn is on the card, not the item, because the item carries the move onto the circle and a `rotate` there
	// would swing around the ring's center instead of the card's own.
	.bloom-left,
	.bloom-right,
	.bloom-top {
		.card {
			animation: none;
			rotate: calc((var(--angle) - var(--bloom-ref)) * 1deg);
		}
	}

	.bloom-left {
		--bloom-ref: 270;
	}

	.bloom-right {
		--bloom-ref: 90;
	}

	.bloom-top {
		--bloom-ref: 0;
	}

	@keyframes turn-right {
		to {
			rotate: 360deg;
		}
	}

	@keyframes turn-left {
		to {
			rotate: -360deg;
		}
	}
</style>
