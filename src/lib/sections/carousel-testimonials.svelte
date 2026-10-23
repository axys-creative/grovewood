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
		/** Renders nothing. */
		hidden?: boolean;
		/** Skips the scroll entrance, for the CMS preview. */
		static?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { animate } from '$lib/attachments/animate';
	import { textReveal } from '$lib/attachments/text-reveal';
	import { onMount } from 'svelte';
	import { carouselDrag } from '$lib/attachments/carousel-drag';
	import { magnet } from '$lib/attachments/magnet';
	import Button from '$lib/components/button.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		testimonials,
		label = 'Testimonials',
		fullScreen = false,
		hidden = false,
		static: isStatic = false,
		id,
		class: className,
		...copy
	}: CarouselTestimonialsProps = $props();

	const reveal = textReveal({ type: 'words', duration: 0.64, ease: 'back.out(2)' });
	const stagger = animate({ variant: 'scale', stagger: 0.1, once: false, duration: 0.5 });

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

	const arrowPull = () =>
		magnet({ x: 0.32, y: 0.32, returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)' });

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

{#if !hidden}
	<section {id} class="carousel-testimonials {className ?? ''}" class:full-screen={fullScreen}>
		<div class="inner">
			<header class="header">
				<SectionCopy {...copy} titleAttach={isStatic ? undefined : reveal} />
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
				{@attach isStatic ? undefined : stagger}
			>
				{#each testimonials as item, index (index)}
					<figure class="card">
						<blockquote><p><RichText text={item.quote} /></p></blockquote>
						<figcaption>
							<span class="who">
								<span class="name">{item.name}</span>
								{#if item.role}<span class="role">{item.role}</span>{/if}
							</span>
							{#if item.image?.src}
								<img
									{...imageProps(item.image.src, { sizes: '64px' })}
									alt={item.image.alt ?? ''}
									loading="lazy"
									draggable="false"
								/>
							{/if}
						</figcaption>
					</figure>
				{/each}
			</div>

			<div class="controls" hidden={!overflowing}>
				<Button
					class="prev"
					type="secondary"
					iconStart="chevron-right"
					textDescription="Previous testimonial"
					disabled={!canPrev}
					onclick={() => move(-1)}
					{@attach arrowPull()}
				/>
				<Button
					type="secondary"
					iconStart="chevron-right"
					textDescription="Next testimonial"
					disabled={!canNext}
					onclick={() => move(1)}
					{@attach arrowPull()}
				/>
			</div>
		</div>
	</section>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.carousel-testimonials {
		// Cards fade in and grow slightly from this size.
		--animate-scale: 0.92;
		--animate-ease: ease;
		// The first card lines up with the copy, and the row runs on past the right edge.
		--content: min(var(--content-width), 100vw - var(--body-padding) * 2);
		--start: calc((100% - var(--content)) / 2);
		--card-width: calc(var(--content) * 0.85);
		--card-gap: 16px;

		overflow-x: clip;

		@include mixins.min-md {
			--card-width: calc(var(--content) * 0.6);
		}

		@include mixins.min-lg {
			--card-gap: 24px;
		}
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	// Small screens: copy, cards, then arrows. From `lg` the arrows sit on the title's row.
	.inner {
		display: flex;
		flex-direction: column;
		gap: 40px;
		width: 100%;
		padding-block: var(--body-padding-double);

		@include mixins.min-lg {
			display: grid;
			grid-template-columns: var(--start) 1fr auto var(--start);
			column-gap: 0;
			row-gap: 96px;
			align-items: end;
		}
	}

	.header {
		width: var(--content);
		margin-inline: auto;

		@include mixins.min-lg {
			grid-column: 2;
			grid-row: 1;
			width: auto;
			max-width: 50%;
			margin-inline: 0;
		}
	}

	.controls {
		display: flex;
		justify-content: center;
		gap: 12px;
		width: var(--content);
		margin-inline: auto;

		@include mixins.min-lg {
			grid-column: 3;
			grid-row: 1;
			justify-content: flex-start;
			width: auto;
			margin: 0;
			gap: 16px;
		}

		&[hidden] {
			display: none;
		}

		:global(.button) {
			padding: 20px;
		}

		:global(.button .icon) {
			--icon-size: 1.5em;
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

		@include mixins.min-lg {
			grid-column: 1 / -1;
			grid-row: 2;
		}

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
		gap: 40px;
		min-height: clamp(320px, 40vh, 460px);
		margin: 0;
		padding: 40px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		scroll-snap-align: start;

		@include mixins.min-lg {
			gap: 48px;
			padding: 48px;
		}

		blockquote,
		p {
			margin: 0;
		}

		blockquote {
			flex: 1;
		}

		p {
			@include mixins.body;
			text-wrap: pretty;

			@include mixins.min-md {
				@include mixins.body-large;
			}
		}
	}

	figcaption {
		display: flex;
		align-items: center;
		gap: 48px;
		width: 100%;

		img {
			flex-shrink: 0;
			width: 64px;
			height: 64px;
			border-radius: 12px;
			object-fit: cover;
		}
	}

	.who {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 8px;
	}

	.name {
		font-weight: 600;
	}

	.role {
		font-size: 14px;
	}
</style>
