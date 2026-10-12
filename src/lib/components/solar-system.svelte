<script module lang="ts">
	import type { TagProps } from './tag.svelte';

	export type SolarTag = { text: string; icon?: string; type?: TagProps['type'] };

	export type SolarRing = {
		/** Up to six tags, spaced evenly around the ring. */
		tags: SolarTag[];
		/** Seconds for one full turn. Defaults to 40 for the inner ring and 60 for the outer. */
		duration?: number;
		/** Which way the ring turns. Defaults to `left` for the inner ring and `right` for the outer. */
		direction?: 'left' | 'right';
	};

	export type SolarSystemProps = {
		/** The picture in the middle, shown as a circle. */
		image: { src: string; alt: string };
		/** One or two rings: the first orbits close to the image, the second further out. */
		rings: SolarRing[];
		/** The look of every tag. */
		tagType?: TagProps['type'];
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount } from 'svelte';
	import Tag from './tag.svelte';

	const MAX_RINGS = 2;
	const MAX_TAGS = 6;

	let { image, rings, tagType = 'glass', class: className }: SolarSystemProps = $props();

	const shown = $derived(rings.slice(0, MAX_RINGS));
	// A lone ring sits wider, and the picture grows to fill it. Radii are percents of the component's width.
	const radii = $derived(shown.length > 1 ? [28, 42] : [38]);
	const imageSize = $derived(shown.length > 1 ? 32 : 44);

	let system = $state<HTMLElement>();
	let paused = $state(false);

	// Off screen it stops, so it is not turning where nobody can see it.
	onMount(() => {
		const observer = new IntersectionObserver(([entry]) => (paused = !entry.isIntersecting));
		observer.observe(system!);
		return () => observer.disconnect();
	});
</script>

<div bind:this={system} class="solar-system {className ?? ''}" class:paused>
	<div class="stage" style="--image: {imageSize}">
		{#each shown as ring, index (index)}
			{@const tags = ring.tags.slice(0, MAX_TAGS)}
			{@const direction = ring.direction ?? (index === 0 ? 'left' : 'right')}
			<div
				class="ring {direction}"
				style="--radius: {radii[index]}; --duration: {ring.duration ??
					(index === 0 ? 40 : 60)}s; --step: {360 / Math.max(tags.length, 1)}; --start: {index *
					(180 / Math.max(tags.length, 1))}"
			>
				<ul class="tags">
					{#each tags as tag, slot (slot)}
						<li class="item" style="--i: {slot}">
							<div class="upright">
								<Tag text={tag.text} icon={tag.icon} type={tag.type ?? tagType} />
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/each}

		<img
			class="image"
			{...imageProps(image.src, { sizes: '(min-width: 768px) 480px, 80vw' })}
			alt={image.alt}
		/>
	</div>
</div>

<style lang="scss">
	@use 'base/mixins';

	// Everything is sized in cqw (1% of the component's own width) and the component is square, so it scales with its
	// container with no breakpoints. Each tag's place on its ring comes from trigonometry on its angle.
	.solar-system {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		overflow: clip;
		container-type: inline-size;

		&:hover {
			--hold: paused;
		}
	}

	.stage {
		position: absolute;
		inset: 0;
		font-size: clamp(10px, 2.3cqw, 16px);
	}

	.image {
		position: absolute;
		top: 50%;
		left: 50%;
		width: calc(var(--image) * 1cqw);
		aspect-ratio: 1;
		border-radius: 50%;
		object-fit: cover;
		translate: -50% -50%;
	}

	.ring {
		--r: calc(var(--radius) * 1cqw);

		position: absolute;
		top: 50%;
		left: 50%;
		width: calc(var(--r) * 2);
		aspect-ratio: 1;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		translate: -50% -50%;

		@include mixins.mq-motion-allow {
			animation: turn-left var(--duration) linear infinite;
			animation-play-state: var(--hold, running);
		}
	}

	// Keyframe names are written out, not read from a custom property, so Svelte can scope them.
	.right {
		animation-name: turn-right;
	}

	.paused .ring,
	.paused .upright {
		animation-play-state: paused;
	}

	.tags {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		--angle: calc(var(--i) * var(--step) + var(--start));
		--x: calc(var(--r) * sin(var(--angle) * 1deg));
		--y: calc(var(--r) * -1 * cos(var(--angle) * 1deg));

		position: absolute;
		top: 50%;
		left: 50%;
		translate: calc(-50% + var(--x)) calc(-50% + var(--y));
	}

	// Each tag turns against its ring, so it stays upright and readable as it orbits.
	.upright {
		@include mixins.mq-motion-allow {
			animation: turn-right var(--duration) linear infinite;
			animation-play-state: var(--hold, running);
		}
	}

	.right .upright {
		animation-name: turn-left;
	}

	.item :global(.tag) {
		white-space: nowrap;
		font-size: 1em;
	}

	@keyframes turn-left {
		to {
			rotate: -360deg;
		}
	}

	@keyframes turn-right {
		to {
			rotate: 360deg;
		}
	}
</style>
