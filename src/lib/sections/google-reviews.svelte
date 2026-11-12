<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';
	import type { GoogleReview, ReviewSummary } from '$lib/google-reviews/types';

	export type GoogleReviewsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		/** Handpicked reviews, newest first. Nothing renders without any. */
		reviews: GoogleReview[];
		/** Google's overall rating and review count. */
		summary?: ReviewSummary | null;
		/** The accessible name of the row of reviews. Defaults to `Google reviews`. */
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
	import { onMount } from 'svelte';
	import { animate } from '$lib/attachments/animate';
	import { carouselDrag } from '$lib/attachments/carousel-drag';
	import { magnet } from '$lib/attachments/magnet';
	import { textFade } from '$lib/attachments/text-fade';
	import Button from '$lib/components/button.svelte';
	import GoogleReviewCard from '$lib/components/google-review-card.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import StarRating from '$lib/components/star-rating.svelte';

	let {
		reviews,
		summary = null,
		label = 'Google reviews',
		fullScreen = false,
		hidden = false,
		static: isStatic = false,
		id,
		class: className,
		...copy
	}: GoogleReviewsProps = $props();

	const reveal = textFade();
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

	function move(direction: 1 | -1) {
		const max = track!.scrollWidth - track!.clientWidth;
		const index = Math.round(track!.scrollLeft / step()) + direction;
		track!.scrollTo({
			left: Math.min(max, Math.max(0, index * step())),
			behavior: reduced() ? 'auto' : 'smooth'
		});
	}

	onMount(() => {
		if (!track) return;
		const observer = new ResizeObserver(update);
		observer.observe(track);
		update();
		return () => observer.disconnect();
	});

	const rounded = $derived(summary ? (Math.round(summary.rating * 10) / 10).toString() : '');
</script>

{#if !hidden && reviews.length}
	<section {id} class="google-reviews {className ?? ''}" class:full-screen={fullScreen}>
		<div class="inner">
			<header class="header">
				<SectionCopy {...copy} titleAttach={isStatic ? undefined : reveal} />
				{#if summary}
					<p class="summary">
						<StarRating rating={summary.rating} label="Rated {rounded} out of 5 stars" />
						<span>
							<strong>{rounded}</strong> from {summary.count.toLocaleString('en-US')} Google reviews
						</span>
					</p>
				{:else}
					<p class="summary"><span>Google reviews</span></p>
				{/if}
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
				{#each reviews as review (review.reviewId)}
					<GoogleReviewCard {review} />
				{/each}
			</div>

			<div class="controls" hidden={!overflowing}>
				<Button
					class="prev"
					type="secondary"
					iconStart="chevron-right"
					textDescription="Previous review"
					disabled={!canPrev}
					onclick={() => move(-1)}
					{@attach arrowPull()}
				/>
				<Button
					type="secondary"
					iconStart="chevron-right"
					textDescription="Next review"
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

	.google-reviews {
		--animate-scale: 0.92;
		--animate-ease: ease;
		--content: min(var(--content-width), 100vw - var(--body-padding) * 2);
		--start: calc((100% - var(--content)) / 2);
		--card-width: calc(var(--content) * 0.85);
		--card-gap: 16px;

		overflow-x: clip;

		@include mixins.min-md {
			--card-width: calc(var(--content) * 0.5);
		}

		@include mixins.min-lg {
			--card-width: calc(var(--content) * 0.36);
			--card-gap: 24px;
		}
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

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
			row-gap: 64px;
			align-items: end;
		}
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 24px;
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

	.summary {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin: 0;
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

		&:global([data-dragging]) {
			cursor: grabbing;
			scroll-snap-type: none;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent);
			outline-offset: -2px;
		}
	}
</style>
