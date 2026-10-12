<script module lang="ts">
	import type { Post } from '$lib/blog';

	export type BlogArticleHeroProps = Omit<Post, 'body' | 'draft'>;
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { parallax } from '$lib/attachments/parallax';
	import Tag from '$lib/components/tag.svelte';
	import { formatDate } from '$lib/utils/collection';

	let {
		title,
		description,
		author,
		date,
		tag,
		coverImage,
		coverAlt = ''
	}: BlogArticleHeroProps = $props();
</script>

<header class="blog-article-hero">
	<div class="inner">
		<div class="heading">
			<p class="tagline">
				{#if tag}<Tag text={tag} type="outline" />{/if}
				<time datetime={date}>{formatDate(date)}</time>
				{#if author}<span>by {author}</span>{/if}
			</p>
			<h1>{title}</h1>
		</div>

		{#if description}<p class="description">{description}</p>{/if}

		{#if coverImage}
			<figure>
				<img
					{...imageProps(coverImage, { sizes: '(min-width: 1280px) 1152px, 100vw' })}
					alt={coverAlt}
					loading="eager"
					fetchpriority="high"
					{@attach parallax({ from: -5, to: 5 })}
				/>
			</figure>
		{/if}
	</div>
</header>

<style lang="scss">
	@use 'base/mixins';

	.blog-article-hero {
		padding: var(--body-padding-double) var(--body-padding) 0;
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: 32px;
		max-width: var(--content-width);
		margin-inline: auto;
	}

	.tagline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 1ch;
		margin-block-end: 16px;
		color: var(--color-text-muted);
		@include mixins.body-small;
	}

	h1 {
		max-width: 650px;
	}

	.description {
		max-width: 720px;
		color: var(--color-text-muted);
		@include mixins.body-large;
	}

	figure {
		overflow: hidden;
		border-radius: var(--radius);
		aspect-ratio: 2 / 1;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
</style>
