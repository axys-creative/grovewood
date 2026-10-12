<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type MarqueeImage = { src: string; alt: string; width?: number; height?: number };

	export type MarqueeProps = {
		/** Plain text to repeat across the row. For rich text (links, styled words), use `children`. */
		text?: string;
		/** Anything to repeat across the row, such as styled words. */
		children?: Snippet;
		/** Images to repeat across the row. */
		images?: MarqueeImage[];
		/** The accessible name. Defaults to `text`. Only one copy of the content is exposed to assistive tech. */
		label?: string;
		/** How many rows are stacked. */
		rows?: number;
		/** Pixels per second the rows move, the same at every screen size. `0` turns the automatic motion off, for a row that only moves as the page scrolls. */
		speed?: number;
		/** Every other row moves the opposite way. */
		alternate?: boolean;
		/** The rows move backwards after the page scrolls up and forwards again after it scrolls down. */
		reverse?: boolean;
		/** Ties the rows to scrolling, on top of their own motion: `1` is 1px per 1px scrolled. */
		scrub?: number;
		/** Holds the motion while the pointer or keyboard focus is on the marquee. */
		pauseOnHover?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount } from 'svelte';

	let {
		text,
		children,
		images,
		label,
		rows = 1,
		speed = 60,
		alternate = true,
		reverse = false,
		scrub = 0,
		pauseOnHover = false,
		class: className
	}: MarqueeProps = $props();

	let marquee = $state<HTMLElement>();
	let copies = $state(2);
	let halfWidth = $state(0);
	let driven = $state(false);
	let still = $state(false);
	let held = $state(false);
	let visible = $state(true);
	let turned = $state(false);

	const name = $derived(label ?? text);
	const duration = $derived(halfWidth && speed > 0 ? halfWidth / speed : 0);
	const reversedRow = (row: number) => alternate && row % 2 === 1;

	onMount(() => {
		still = matchMedia('(prefers-reduced-motion: reduce)').matches;

		// One copy of the content sets the size. The row repeats it enough times to fill the screen, twice over, so
		// the loop (a move of exactly one half) resets without a seam.
		const measure = () => {
			const item = marquee!.querySelector<HTMLElement>('.item');
			if (!item) return;
			const width = item.getBoundingClientRect().width;
			if (!width) return;
			copies = Math.max(1, Math.ceil(marquee!.clientWidth / width));
			halfWidth = width * copies;
		};
		measure();

		const resize = new ResizeObserver(measure);
		resize.observe(marquee!);
		marquee!.querySelectorAll('.item').forEach((item) => resize.observe(item));
		document.fonts?.ready.then(measure);

		const intersect = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		intersect.observe(marquee!);

		// CSS can run a row forwards but not backwards or with a scroll offset and still wrap seamlessly, so with
		// `reverse` or `scrub` the script moves the rows instead, as the Image Wave does.
		let frame = 0;
		if (!still && (reverse || scrub > 0)) {
			driven = true;
			const tracks = Array.from(marquee!.querySelectorAll<HTMLElement>('.track'));
			let idle = 0;
			let offset = scrollY * scrub;
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
					if (turned !== direction < 0) turned = direction < 0;
					lastY = scrollY;
					heading += (direction - heading) * (1 - Math.exp(-elapsed / 250));
				}

				if (visible && halfWidth) {
					offset += (scrollY * scrub - offset) * (1 - Math.exp(-elapsed / 120));
					if (!held) idle += heading * speed * (elapsed / 1000);
					tracks.forEach((track, row) => {
						const sign = reversedRow(row) ? -1 : 1;
						const x = ((((idle + offset) * sign) % halfWidth) + halfWidth) % halfWidth;
						track.style.translate = `${-x}px 0`;
					});
				} else if (!visible) {
					// Off screen the offset keeps up with the page, so it does not have to catch up when it comes into view.
					offset = scrollY * scrub;
				}
				frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		}

		return () => {
			cancelAnimationFrame(frame);
			resize.disconnect();
			intersect.disconnect();
		};
	});
</script>

{#snippet content()}
	{#if children}
		{@render children()}
	{:else if text}
		<span>{text}</span>
	{:else if images}
		{#each images as image, index (index)}
			<img
				{...imageProps(image.src, { sizes: '300px' })}
				alt={image.alt}
				width={image.width}
				height={image.height}
			/>
		{/each}
	{/if}
{/snippet}

<div
	bind:this={marquee}
	class="marquee {className ?? ''}"
	class:images={!!images && !text && !children}
	class:driven
	class:turned
	class:still
	class:paused={!visible || (pauseOnHover && held)}
	role="region"
	aria-label={name}
	style="--duration: {duration ? `${duration}s` : '30s'}"
	onpointerenter={pauseOnHover ? () => (held = true) : undefined}
	onpointerleave={pauseOnHover ? () => (held = false) : undefined}
	onfocusin={pauseOnHover ? () => (held = true) : undefined}
	onfocusout={pauseOnHover ? () => (held = false) : undefined}
>
	{#each Array.from({ length: rows }, (_, index) => index) as row (row)}
		<div class="row">
			<div class="track" class:backwards={reversedRow(row)} class:auto={speed > 0}>
				{#each [0, 1] as half (half)}
					<div class="half" aria-hidden={row > 0 || half > 0 ? 'true' : undefined}>
						{#each Array.from({ length: copies }, (_, index) => index) as copy (copy)}
							<div class="item" aria-hidden={copy > 0 ? 'true' : undefined}>
								{@render content()}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	@use 'base/mixins';

	.marquee {
		--gap: 0.5ch;
		--image-height: 160px;

		@include mixins.h2;
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		width: 100%;
		overflow: clip;
		line-height: 1.5;

		@include mixins.max-md {
			--image-height: 100px;
		}
	}

	.row {
		display: flex;
		width: 100%;
	}

	// Two identical halves side by side. The row moves by exactly one half, then starts over unseen.
	.track {
		display: flex;
		flex: none;
		width: max-content;
	}

	.half {
		display: flex;
		flex: none;
	}

	// The trailing padding, not a flex gap, keeps the two halves exactly equal.
	.item {
		display: flex;
		flex: none;
		gap: var(--gap);
		align-items: center;
		padding-inline-end: var(--gap);
		white-space: nowrap;
	}

	.images .item {
		gap: var(--gap);
	}

	img {
		display: block;
		width: auto;
		height: var(--image-height);
		border-radius: var(--radius);
		object-fit: cover;
		user-select: none;
		-webkit-user-drag: none;
	}

	// The default motion is a CSS animation, which keeps running smoothly when the page is busy.
	.track.auto {
		@include mixins.mq-motion-allow {
			animation: slide var(--duration) linear infinite;
		}
	}

	.track.backwards {
		animation-direction: reverse;
	}

	// Anything marked `marquee-flip` (a right arrow, say) points the way its row travels: a forward row moves left, so
	// it starts turned, and it turns around with the scroll direction and in backwards rows.
	.marquee :global(.marquee-flip) {
		display: inline-block;

		@include mixins.mq-motion-allow {
			transition: scale 0.4s var(--ease);
		}
	}

	.marquee :global(.marquee-flip),
	.turned .backwards :global(.marquee-flip) {
		scale: -1 1;
	}

	.turned :global(.marquee-flip),
	.backwards :global(.marquee-flip) {
		scale: 1;
	}

	.turned .backwards :global(.marquee-flip) {
		scale: -1 1;
	}

	.driven .track {
		animation: none;
	}

	.paused .track {
		animation-play-state: paused;
	}

	@keyframes slide {
		to {
			translate: -50% 0;
		}
	}
</style>
