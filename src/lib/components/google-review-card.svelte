<script lang="ts">
	import { onMount } from 'svelte';
	import type { GoogleReview } from '$lib/google-reviews/types';
	import StarRating from './star-rating.svelte';

	let { review }: { review: GoogleReview } = $props();

	const uid = $props.id();
	const date = $derived(
		review.createTime
			? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(
					new Date(review.createTime)
				)
			: ''
	);

	let text = $state<HTMLElement>();
	let expanded = $state(false);
	let clamped = $state(false);

	onMount(() => {
		const measure = () => {
			if (!expanded && text) clamped = text.scrollHeight > text.clientHeight + 1;
		};
		const observer = new ResizeObserver(measure);
		observer.observe(text!);
		measure();
		return () => observer.disconnect();
	});
</script>

<article class="card" aria-label="Review by {review.displayName}">
	<StarRating rating={review.rating} label="Rated {review.rating} out of 5 stars" />
	<blockquote>
		<p id="{uid}-text" class:clamp={!expanded} bind:this={text}>{review.comment}</p>
		{#if clamped || expanded}
			<button
				type="button"
				class="more"
				aria-expanded={expanded}
				aria-controls="{uid}-text"
				onclick={() => (expanded = !expanded)}
			>
				{expanded ? 'Read less' : 'Read more'}
				<span class="visually-hidden"> of {review.displayName}'s review</span>
			</button>
		{/if}
	</blockquote>
	<footer>
		<span class="name">{review.displayName}</span>
		{#if date}<time datetime={review.createTime}>{date}</time>{/if}
	</footer>
</article>

<style lang="scss">
	@use 'base/mixins';

	.card {
		display: flex;
		flex: 0 0 var(--card-width);
		flex-direction: column;
		align-items: flex-start;
		gap: 24px;
		min-height: clamp(280px, 36vh, 420px);
		padding: 32px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		scroll-snap-align: start;

		@include mixins.min-lg {
			padding: 40px;
		}
	}

	blockquote {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		margin: 0;
	}

	p {
		@include mixins.body;
		margin: 0;
		text-wrap: pretty;
		white-space: pre-line;
	}

	.clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 6;
		line-clamp: 6;
		overflow: hidden;
	}

	.more {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;

		&:focus-visible {
			outline: 2px solid var(--color-accent);
			outline-offset: 3px;
		}
	}

	footer {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.name {
		font-weight: 600;
	}

	time {
		font-size: 14px;
	}
</style>
