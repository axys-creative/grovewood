<script module lang="ts">
	export type HeroCarouselSlide = Pick<
		SectionCopyProps,
		'title' | 'description' | 'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'cta'
	> & {
		image: { src: string; alt: string };
	};

	export type HeroCarouselProps = Omit<
		SectionCopyProps,
		'title' | 'description' | 'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'cta'
	> & {
		slides: HeroCarouselSlide[];
		/** Insets the hero from the screen edges with rounded corners, like the floating header and footer. */
		float?: boolean;
		/** Milliseconds between slides. `0` turns autoplay off. Pauses while hovered or focused, and is off when motion is reduced. */
		autoplay?: number;
		/** At least the height of the screen, with the copy at the bottom. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		slides,
		float = false,
		autoplay = 0,
		fullScreen = true,
		id,
		class: className,
		...copy
	}: HeroCarouselProps = $props();

	let index = $state(0);
	let paused = $state(false);

	const current = $derived(slides[index]);

	const move = (step: number) => {
		index = (index + step + slides.length) % slides.length;
	};

	// Rerunning on `index` restarts the countdown after a manual change too.
	$effect(() => {
		if (autoplay <= 0 || paused || slides.length < 2) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const timer = setTimeout(() => move(1), autoplay);
		return () => clearTimeout(timer);
	});
</script>

<section
	{id}
	class="hero-carousel {className ?? ''}"
	class:float
	class:full-screen={fullScreen}
	role="group"
	aria-roledescription="carousel"
	onpointerenter={() => (paused = true)}
	onpointerleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	<div class="media">
		{#each slides as slide, i (i)}
			<img
				{...imageProps(slide.image.src, { sizes: '100vw' })}
				alt={i === index ? slide.image.alt : ''}
				aria-hidden={i === index ? undefined : true}
				class:active={i === index}
				loading={i === 0 ? 'eager' : 'lazy'}
				fetchpriority={i === 0 ? 'high' : undefined}
			/>
		{/each}
		<div class="scrim"></div>
	</div>

	<div class="inner">
		<div class="copy" aria-live="polite">
			{#key index}
				<div class="slide">
					<SectionCopy
						level={1}
						{...copy}
						title={current.title}
						description={current.description}
						showEyebrow={false}
						showCta={false}
					/>
				</div>
			{/key}
		</div>

		{#if slides.length > 1}
			<div class="controls">
				<Button
					class="prev"
					iconStart="chevron-right"
					textDescription="Previous slide"
					onclick={() => move(-1)}
				/>
				<Button iconStart="chevron-right" textDescription="Next slide" onclick={() => move(1)} />
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.hero-carousel {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 60lvh;
		overflow: clip;
		color: var(--color-on-accent);
		isolation: isolate;
	}

	.full-screen {
		min-height: 100lvh;
	}

	.float {
		min-height: calc(60lvh - var(--float-offset) * 2);
		width: calc(100% - var(--float-offset) * 2);
		max-width: var(--content-width);
		margin: var(--float-offset) auto;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);

		&.full-screen {
			min-height: calc(100lvh - var(--float-offset) * 2);
		}
	}

	.media {
		position: absolute;
		inset: 0;
		z-index: -1;

		img {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0;
			transition: opacity 0.8s var(--ease);

			&.active {
				opacity: 1;
			}
		}
	}

	.scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgb(0 0 0 / 0.65), rgb(0 0 0 / 0.1) 60%);
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-between;
		gap: 32px;
		width: 100%;
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);

		@include mixins.min-md {
			flex-direction: row;
			align-items: flex-end;
		}
	}

	.copy {
		min-width: 0;

		:global(.description) {
			color: inherit;
			opacity: 0.85;
		}
	}

	.controls {
		display: flex;
		gap: 12px;
		flex-shrink: 0;

		:global(.prev .icon) {
			rotate: 180deg;
		}
	}

	@include mixins.mq-motion-allow {
		.slide {
			animation: slide-in 0.8s var(--ease) both;
		}
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			translate: 0 16px;
		}
	}
</style>
