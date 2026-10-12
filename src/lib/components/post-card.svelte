<script module lang="ts">
	import type { Post } from '$lib/blog';

	export type PostCardProps = {
		post: Omit<Post, 'body'> & { slug: string };
		/** Lays the card out wide, with the image beside the text. */
		featured?: boolean;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { formatDate } from '$lib/utils/collection';
	import Tag from './tag.svelte';

	let { post, featured = false }: PostCardProps = $props();
</script>

<a class="post-card" class:featured href="/blog/{post.slug}">
	{#if post.coverImage}
		<figure>
			<img
				{...imageProps(post.coverImage, { sizes: '(min-width: 1024px) 560px, 100vw' })}
				alt={post.coverAlt ?? ''}
				loading="lazy"
			/>
		</figure>
	{/if}

	<div class="info">
		{#if post.tag}<Tag text={post.tag} type="outline" />{/if}
		<h2 class="title">{post.title}</h2>
		<p class="meta">
			<time datetime={post.date}>{formatDate(post.date)}</time>
			{#if post.author}<span>by {post.author}</span>{/if}
		</p>
		{#if post.description}<p class="description">{post.description}</p>{/if}
	</div>
</a>

<style lang="scss">
	@use 'base/mixins';

	.post-card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-surface);
		color: inherit;
		text-decoration: none;

		@include mixins.mq-motion-allow {
			transition: scale var(--duration) var(--ease);
		}

		@include mixins.desktop-hover {
			scale: 1.0125;
		}
	}

	figure {
		max-height: 180px;
		overflow: hidden;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.info {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		padding: 24px;
	}

	.title {
		@include mixins.h4;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1ch;
		color: var(--color-text-muted);
		@include mixins.body-small;
	}

	.description {
		color: var(--color-text-muted);
	}

	.featured {
		@include mixins.min-md {
			flex-direction: row;
			grid-column: span 2;

			figure {
				width: 50%;
				max-height: 320px;
			}
		}
	}
</style>
