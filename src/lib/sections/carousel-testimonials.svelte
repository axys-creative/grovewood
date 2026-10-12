<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CarouselTestimonial = {
		quote: string;
		name: string;
		/** Their role or company, shown under the name. */
		role?: string;
		/** A small portrait beside the name. */
		image?: { src: string; alt?: string };
	};

	export type CarouselTestimonialsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		testimonials: CarouselTestimonial[];
		/** The accessible name of the row of cards. Defaults to `Testimonials`. */
		label?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { carouselDrag } from '$lib/attachments/carousel-drag';
	import Button from '$lib/components/button.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		testimonials,
		label = 'Testimonials',
		fullScreen = false,
		id,
		class: className,
		...copy
	}: CarouselTestimonialsProps = $props();

	let track = $state<HTMLElement>();
	let canPrev = $state(false);
	let canNext = $state(false);
	let overflowing = $state(false);

	const step = () => {
		const cards = track!.children;
		return cards.length > 1
			? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
			: track!.clientWidth;
	};

	function update() {
		if (!track) return;
		const max = track.scrollWidth - track.clientWidth;
		overflowing = max > 1;
		canPrev = track.scrollLeft > 1;
		canNext = track.scrollLeft < max - 1;
	}

	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	function goTo(index: number) {
		const max = track!.scrollWidth - track!.clientWidth;
		track!.scrollTo({
			left: Math.min(max, Math.max(0, index * step())),
			behavior: reduced() ? 'auto' : 'smooth'
		});
	}

	function move(direction: 1 | -1) {
		goTo(Math.round(track!.scrollLeft / step()) + direction);
	}

	onMount(() => {
		const observer = new ResizeObserver(update);
		observer.observe(track!);
		update();
		return () => {
			observer.disconnect();
		};
	});
</script>

<section {id} class="carousel-testimonials {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<header class="header">
			<SectionCopy {...copy} />

			<div class="controls" hidden={!overflowing}>
				<Button
					class="prev"
					iconStart="chevron-right"
					textDescription="Previous testimonial"
					disabled={!canPrev}
					onclick={() => move(-1)}
				/>
				<Button
					iconStart="chevron-right"
					textDescription="Next testimonial"
					disabled={!canNext}
					onclick={() => move(1)}
				/>
			</div>
		</header>

		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="track"
			role="group"
			aria-roledescription="carousel"
			aria-label={label}
			tabindex="0"
			bind:this={track}
			onscroll={update}
			{@attach carouselDrag()}
		>
			{#each testimonials as item, index (index)}
				<figure class="card">
					<blockquote><p><RichText text={item.quote} /></p></blockquote>
					<figcaption>
						{#if item.image?.src}
							<img
								{...imageProps(item.image.src, { sizes: '56px' })}
								alt={item.image.alt ?? ''}
								loading="lazy"
								draggable="false"
							/>
						{/if}
						<span class="who">
							<span class="name">{item.name}</span>
							{#if item.role}<span class="role">{item.role}</span>{/if}
						</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.carousel-testimonials {
		// The first card lines up with the copy, and the row runs on past the right edge.
		--content: min(var(--content-width), 100% - var(--body-padding) * 2);
		--start: calc((100% - var(--content)) / 2);
		--card-width: clamp(280px, 80vw, 440px);
		--card-gap: 24px;

		overflow-x: clip;
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: 48px;
		width: 100%;
		padding-block: var(--body-padding-double);
	}

	.header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24px;
		width: var(--content);
		margin-inline: auto;
	}

	.controls {
		display: flex;
		gap: 12px;
		margin-inline-start: auto;

		&[hidden] {
			display: none;
		}

		:global(.prev .icon) {
			rotate: 180deg;
		}
	}

	.track {
		display: flex;
		gap: var(--card-gap);
		padding-inline: var(--start);
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-padding-inline: var(--start);
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		touch-action: pan-y;
		cursor: grab;
		user-select: none;

		&::-webkit-scrollbar {
			display: none;
		}

		&[data-dragging] {
			cursor: grabbing;
			scroll-snap-type: none;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: -2px;
		}
	}

	.card {
		display: flex;
		flex: 0 0 var(--card-width);
		flex-direction: column;
		justify-content: space-between;
		gap: 32px;
		margin: 0;
		padding: 32px;
		border-radius: var(--radius);
		background: var(--color-surface);
		scroll-snap-align: start;

		blockquote,
		p {
			margin: 0;
		}

		p {
			@include mixins.body-large;
		}
	}

	figcaption {
		display: flex;
		align-items: center;
		gap: 16px;

		img {
			flex-shrink: 0;
			width: 56px;
			height: 56px;
			border-radius: 50%;
			object-fit: cover;
		}
	}

	.who {
		display: flex;
		flex-direction: column;
	}

	.name {
		font-weight: 700;
	}

	.role {
		color: var(--color-text-muted);
		font-size: 14px;
	}
</style>
