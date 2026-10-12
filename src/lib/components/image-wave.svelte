<script module lang="ts">
	export type WaveImage = { src: string; alt?: string; width?: number; height?: number };

	export type ImageWaveProps = {
		images: WaveImage[];
		/** Times the images repeat inside one set. One set must be wider than the screen or the loop shows a gap. */
		repeat?: number;
		/** Seconds for the row to pan one full set. Higher is slower. */
		speed?: number;
		/** Seconds for one full up-and-down bob. */
		duration?: number;
		/** Pixels each card travels up and down from center. `0` is a flat row. */
		amplitude?: number;
		/** Crests of the wave across one set, as a whole number. `0` moves every card together. */
		waves?: number;
		/** Ties the wave to scrolling, on top of its own motion: scrolling down pushes the row left and moves the bob ahead. `1` is 1px of pan and a full wave per 1000px scrolled; `0` is off. */
		scrub?: number;
		/** The row and the bob run backwards after the page scrolls up, forwards again after it scrolls down. */
		reverse?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount } from 'svelte';

	let {
		images,
		repeat = 1,
		speed = 60,
		duration = 4,
		amplitude = 32,
		waves = 1,
		scrub = 0,
		reverse = false,
		class: className
	}: ImageWaveProps = $props();

	// One set is the images times `repeat`. Two identical sets sit side by side and the row pans left by exactly
	// one set, so the loop resets unseen. The lag between neighbors is derived (period x waves / cards per set),
	// so the wave's phase also repeats once per set; that only works for a whole number of crests.
	const perSet = $derived(images.length * repeat);
	const wholeWaves = $derived(Math.round(waves) >= 1 ? Math.round(waves) : waves > 0 ? 1 : 0);
	const step = $derived(perSet ? (duration * wholeWaves) / perSet : 0);

	let wave = $state<HTMLElement>();
	let track = $state<HTMLElement>();
	let driven = $state(false);

	// The idle pan is a CSS animation, which cannot take a scroll offset or run backwards and still wrap
	// seamlessly. With `scrub` or `reverse` the script drives the row instead: idle pan plus scroll, wrapped by
	// one set width. The same smoothed scroll offset also moves the bob ahead (`--phase` shifts every card's
	// animation). With `reverse` the bob is driven too, since a CSS animation cannot play backwards: its clock
	// is part of `--phase` and runs with the pan's heading, which eases around when the scroll direction flips.
	onMount(() => {
		if ((scrub <= 0 && !reverse) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const firstSet = wave!.querySelector<HTMLElement>('.set')!;
		let setWidth = firstSet.getBoundingClientRect().width;
		let idle = 0;
		let bobClock = 0;
		let offset = scrollY * scrub;
		let heading = 1;
		let direction = 1;
		let lastY = scrollY;
		let visible = true;
		let last = performance.now();
		let frame = 0;
		driven = true;

		const resize = new ResizeObserver(() => (setWidth = firstSet.getBoundingClientRect().width));
		resize.observe(firstSet);
		const intersect = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		intersect.observe(wave!);

		const tick = (now: number) => {
			const elapsed = now - last;
			last = now;

			if (reverse) {
				const moved = scrollY - lastY;
				if (Math.abs(moved) > 0.5) direction = moved > 0 ? 1 : -1;
				lastY = scrollY;
				heading += (direction - heading) * (1 - Math.exp(-elapsed / 250));
			}

			if (visible && setWidth) {
				offset += (scrollY * scrub - offset) * (1 - Math.exp(-elapsed / 120));
				idle += heading * (setWidth / speed) * (elapsed / 1000);
				bobClock += heading * (elapsed / 1000);
				const x = (((idle + offset) % setWidth) + setWidth) % setWidth;
				track!.style.translate = `${-x}px 0`;
				const clock = reverse ? bobClock : 0;
				wave!.style.setProperty('--phase', `${clock + (offset / 1000) * duration}s`);
			} else if (!visible) {
				// Off screen the offset keeps up with the page, so it does not have to catch up when it comes into view.
				offset = scrollY * scrub;
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			resize.disconnect();
			intersect.disconnect();
		};
	});
</script>

<div
	bind:this={wave}
	class="image-wave {className ?? ''}"
	class:driven
	class:reverse={driven && reverse}
	style="--speed: {speed}s; --duration: {duration}s; --amp: {amplitude}px; --step: {step}s; --total: {perSet *
		2}"
>
	<div class="track" bind:this={track}>
		{#each [0, 1] as set (set)}
			<div class="set" aria-hidden={set === 1 ? 'true' : undefined}>
				{#each Array.from({ length: repeat }, (_, index) => index) as round (round)}
					{#each images as image, index (index)}
						<figure class="item" style="--i: {set * perSet + round * images.length + index}">
							<img
								{...imageProps(image.src, { sizes: '(min-width: 768px) 360px, 240px' })}
								alt={set === 0 && round === 0 ? (image.alt ?? '') : ''}
								width={image.width ?? 400}
								height={image.height ?? 500}
								loading="lazy"
							/>
						</figure>
					{/each}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use 'base/mixins';

	.image-wave {
		--speed: 60s;
		--duration: 4s;
		--amp: 32px;
		--step: 0.5s;
		--total: 16;
		--phase: 0s;
		--gap: 24px;

		width: 100%;
		padding-block: var(--amp);
		overflow: clip;
	}

	.track {
		display: flex;
		width: max-content;

		@include mixins.mq-motion-allow {
			animation: pan var(--speed) linear infinite;
		}
	}

	.driven .track {
		animation: none;
	}

	// A backwards bob cannot be a CSS animation, so it is paused and moved by `--phase`.
	.reverse .item {
		animation-play-state: paused;
	}

	.set {
		display: flex;
		flex: none;
	}

	// A trailing margin, not a flex gap, so the two sets are exactly equal halves.
	.item {
		flex: none;
		width: 240px;
		aspect-ratio: 4 / 5;
		margin: 0;
		margin-inline-end: var(--gap);
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);

		// A negative delay puts every card mid-bob on load; card i runs (total - i) steps ahead of a fresh start.
		@include mixins.mq-motion-allow {
			animation: bob calc(var(--duration) / 2) ease-in-out infinite alternate;
			animation-delay: calc((var(--i, 0) - var(--total)) * var(--step) - var(--phase));
		}

		@include mixins.max-md {
			width: 160px;
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

	@keyframes pan {
		to {
			translate: -50% 0;
		}
	}

	@keyframes bob {
		from {
			translate: 0 calc(var(--amp) * -1);
		}

		to {
			translate: 0 var(--amp);
		}
	}
</style>
