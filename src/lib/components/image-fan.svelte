<script module lang="ts">
	export type FanImage = { src: string; alt?: string; width?: number; height?: number };

	export type ImageFanProps = {
		images: FanImage[];
		/** Degrees the fan wraps: 0 is a flat row, 90 a quarter circle, 180 a semicircle, 360 a full ring. */
		arc?: number;
		/** Space between cards as a multiple of card width: 1 touches, more spaces them, less overlaps. */
		gap?: number;
		/** Spread the cards evenly around a full 360 ring. Ignores `arc`. */
		closed?: boolean;
		/** `up` is a rainbow with the middle card highest; `down` is a valley. */
		direction?: 'up' | 'down';
		/** Card width as a percent of the component's own width. */
		itemWidth?: number;
		/** `sequence` stacks in array order; `pyramid` puts the middle card on top and steps down to the ends. */
		stack?: 'sequence' | 'pyramid';
		/** Reveal the fan when it scrolls into view. */
		animateIn?: boolean;
		/** Pixels each ring of cards drops below the one inside it, outward from the middle. */
		chop?: number;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount } from 'svelte';

	let {
		images,
		arc = 90,
		gap = 1.15,
		closed = false,
		direction = 'up',
		itemWidth = 22,
		stack = 'sequence',
		animateIn = false,
		chop = 0,
		class: className
	}: ImageFanProps = $props();

	const count = $derived(images.length);
	const divisor = $derived(Math.max(1, closed ? count : count - 1));
	const step = $derived(closed ? 360 / divisor : arc / divisor);
	const half = $derived((count - 1) / 2);

	let fan = $state<HTMLElement>();
	let animated = $state(false);

	// With `animateIn` the fan is hidden or collapsed until it is in view, and again whenever it leaves.
	onMount(() => {
		if (!animateIn || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			animated = true;
			return;
		}

		const observer = new IntersectionObserver(([entry]) => (animated = entry.isIntersecting), {
			rootMargin: '0px 0px -2% 0px'
		});
		observer.observe(fan!);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={fan}
	class="image-fan {direction} {stack} {className ?? ''}"
	class:animate-in={animateIn}
	class:animated={!animateIn || animated}
	style="--step: {step}; --half: {half}; --gap: {gap}; --item-width: {itemWidth}; --chop: {chop}"
>
	<div class="stage">
		{#each images as image, index (index)}
			<div class="item" style="--i: {index}">
				<div class="reveal">
					<figure class="card">
						<img
							{...imageProps(image.src, { sizes: '200px' })}
							alt={image.alt ?? ''}
							width={image.width ?? 400}
							height={image.height ?? 533}
							loading="lazy"
						/>
					</figure>
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use 'base/mixins';

	// Everything scales with the container. Card size and the arc radius are both in cqw (1% of the component's
	// own width), so the fan resizes with no breakpoints.
	//
	//   --step   degrees between neighbouring cards (arc / (count - 1), or 360 / count when closed)
	//   --half   (count - 1) / 2, to center the fan
	//   --gap    card spacing as a multiple of card width
	//   --item-width  card width as a % of the component width
	.image-fan {
		--step: 45;
		--half: 2;
		--gap: 1.15;
		--item-width: 22;
		--chop: 0;
		--dir: 1;
		--ease: cubic-bezier(0.33, 1.13, 0.44, 1.5);
		--ease-duration: 0.32s;

		// How far the nearest sibling shifts and turns away from a hovered card. Further rings scale down.
		--push: 5cqw;
		--splay: 5deg;
		--falloff-2: 0.5;
		--falloff-3: 0.25;
		--ripple: 45ms;

		// Reveal on scroll: cards rise and fade in, staggered by order.
		--in-offset: 7cqw;
		--in-duration: 0.55s;
		--in-stagger: 55ms;
		--in-ease: cubic-bezier(0.02, 1.14, 0.7, 1.24);

		// Pyramid reveal: the fan starts collapsed on the center card and opens one ring at a time.
		--in-rise: 9cqw;
		--open-duration: 0.48s;
		--open-stagger: 0.32s;
		--open-ease: ease;

		--_step: max(var(--step), 0.01);
		--_w: calc(var(--item-width) * 1cqw);
		--_chord: calc(var(--_w) * var(--gap));
		--_radius: calc(var(--_chord) * 180 / (var(--_step) * 3.14159265));
		--_drop: calc(var(--_radius) * (1 - cos(var(--half) * var(--_step) * 1deg)));

		width: 100%;
		isolation: isolate;
		container-type: inline-size;
	}

	.stage {
		position: relative;
		width: 100%;
		// Grows with the arc so a semicircle or ring is never clipped, with room for the chop staircase.
		min-height: calc(var(--_drop) + var(--_w) * 1.7 + var(--chop) * var(--half) * 1px);
	}

	// The item carries the arc and the sibling response, and is the hover target. It never moves under its own
	// hover (the lift is on the card), so the pointer cannot slide off it and flicker.
	.item {
		--_phi: calc((var(--i, 0) - var(--half)) * var(--_step));
		--_x: calc(var(--_radius) * sin(var(--_phi) * 1deg));
		--_y: calc(var(--_radius) * (1 - cos(var(--_phi) * 1deg)) * var(--dir));

		// Rings out from the center card: 0 at the center, 1 for the first pair, and so on.
		--_d: max(calc(var(--i, 0) - var(--half)), calc(var(--half) - var(--i, 0)));
		--_chop: calc(var(--chop, 0) * var(--_d) * 1px);

		--_push: 0cqw;
		--_splay: 0deg;

		position: absolute;
		top: 6%;
		left: 50%;
		z-index: var(--i, 0);
		width: var(--_w);
		aspect-ratio: 2.75 / 4;
		transform: translate(-50%, 0) translate(var(--_x), var(--_y)) translateX(var(--_push))
			translateY(var(--_chop)) rotate(calc((var(--_phi) * 1deg + var(--_splay)) * var(--dir)));

		@include mixins.mq-motion-allow {
			transition:
				transform var(--ease-duration) var(--ease),
				width 0s;
		}

		&:hover,
		&:focus-within {
			--lift: -3.5cqw;
		}
	}

	// The reveal wrapper is idle by default. The pyramid reveal drives its transform so the scroll animation never
	// touches the arc, the hover chain, or the card's lift.
	.reveal {
		position: absolute;
		inset: 0;
	}

	.card {
		position: relative;
		width: 100%;
		height: 100%;
		margin: 0;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: min(calc(4px + 2vw), var(--radius));
		background: var(--color-surface);
		transform: translateY(var(--lift, 0cqw));

		@include mixins.mq-motion-allow {
			transition: transform var(--ease-duration) var(--ease);
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

	.down {
		--dir: -1;

		.item {
			top: auto;
			bottom: 6%;
		}
	}

	// `pyramid` puts the center card on top and steps down evenly to the ends. `* 2` keeps the z-index a whole number
	// when the count is even.
	.pyramid .item {
		z-index: calc((var(--half) - var(--_d)) * 2);
	}

	// Rise and fade in, staggered by order. `translate` and `opacity` keep it apart from the hover `transform`.
	.animate-in .item {
		@include mixins.mq-motion-allow {
			translate: 0 var(--in-offset);
			opacity: 0;
			transition:
				transform var(--ease-duration) var(--ease),
				width 0s,
				opacity var(--in-duration) ease calc(var(--i, 0) * var(--in-stagger)),
				translate var(--in-duration) var(--in-ease) calc(var(--i, 0) * var(--in-stagger));
		}
	}

	.animate-in.animated .item {
		opacity: 1;
		translate: 0 0;
	}

	// Pyramid reveal, run entirely on `.reveal`: while collapsed it holds the exact inverse of its item's arc offset
	// and rotation, so every card sits stacked on the center (the center card also dips). When the fan comes into
	// view the transform drops away and each card eases out to its spot, ring by ring.
	.pyramid.animate-in {
		.item {
			opacity: 1;
			translate: none;
		}

		.reveal {
			--_rise: calc(var(--in-rise) * clamp(0, calc(1 - var(--_d)), 1));

			@include mixins.mq-motion-allow {
				transition: transform var(--open-duration) var(--open-ease)
					calc(var(--_d) * var(--open-stagger));
			}
		}

		&:not(.animated) .reveal {
			@include mixins.mq-motion-allow {
				transform: rotate(calc(var(--_phi) * -1deg * var(--dir)))
					translate(calc(var(--_x) * -1), calc(var(--_y) * -1))
					translateY(calc(var(--_rise) - var(--_chop)));
			}
		}

		// No cursor until the fan has finished opening: a hover half way would stack the shift and lift onto cards
		// still travelling and leave it stuck. An animation (not a transition) runs even when the fan is in view on
		// load, with a delay of the last ring landing.
		@include mixins.mq-motion-allow {
			&:not(.animated) {
				pointer-events: none;
			}

			&.animated {
				animation: unlock 0s linear calc(var(--half) * var(--open-stagger) + var(--open-duration))
					both;
			}
		}
	}

	// Cards near a hovered one shift and turn away, opening a gap around it. The effect fades out fast, at 1, 2 and 3
	// cards away. `:has()` covers the earlier side, since CSS has no previous-sibling selector. The delay steps up per
	// ring so the parting ripples outward, and only on the way in.
	.item:hover + .item {
		--_push: var(--push);
		--_splay: var(--splay);
		transition-delay: var(--ripple);
	}

	.item:hover + .item + .item {
		--_push: calc(var(--push) * var(--falloff-2));
		--_splay: calc(var(--splay) * var(--falloff-2));
		transition-delay: calc(var(--ripple) * 2);
	}

	.item:hover + .item + .item + .item {
		--_push: calc(var(--push) * var(--falloff-3));
		--_splay: calc(var(--splay) * var(--falloff-3));
		transition-delay: calc(var(--ripple) * 3);
	}

	.item:has(+ .item:hover) {
		--_push: calc(var(--push) * -1);
		--_splay: calc(var(--splay) * -1);
		transition-delay: var(--ripple);
	}

	.item:has(+ .item + .item:hover) {
		--_push: calc(var(--push) * var(--falloff-2) * -1);
		--_splay: calc(var(--splay) * var(--falloff-2) * -1);
		transition-delay: calc(var(--ripple) * 2);
	}

	.item:has(+ .item + .item + .item:hover) {
		--_push: calc(var(--push) * var(--falloff-3) * -1);
		--_splay: calc(var(--splay) * var(--falloff-3) * -1);
		transition-delay: calc(var(--ripple) * 3);
	}

	@keyframes unlock {
		from {
			pointer-events: none;
		}

		to {
			pointer-events: auto;
		}
	}
</style>
