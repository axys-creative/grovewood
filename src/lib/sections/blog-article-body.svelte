<script module lang="ts">
	export type BlogArticleBodyProps = {
		/** HTML rendered from the post's Markdown by `renderMarkdown`, which escapes raw HTML. */
		html: string;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
	};
</script>

<script lang="ts">
	let { html, id }: BlogArticleBodyProps = $props();
</script>

<section {id} class="blog-article-body">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<article>{@html html}</article>
</section>

<style lang="scss">
	@use 'base/mixins';

	.blog-article-body {
		padding: var(--body-padding-double) var(--body-padding);
	}

	article {
		max-width: var(--max-width-text);
		margin-inline: auto;

		> :global(* + *) {
			margin-block-start: 1.25em;
		}

		> :global(* + h2),
		> :global(* + h3),
		> :global(* + h4) {
			margin-block-start: 2em;
		}

		:global(h2) {
			@include mixins.h3;
		}

		:global(h3) {
			@include mixins.h4;
		}

		:global(h4) {
			@include mixins.h5;
		}

		:global(ul),
		:global(ol) {
			padding-inline-start: 1.8ch;
		}

		:global(li + li) {
			margin-block-start: 0.5ch;
		}

		:global(blockquote) {
			padding-inline-start: 2ch;
			border-inline-start: 2px solid var(--color-border);
			color: var(--color-text-muted);
		}

		:global(code) {
			padding: 2px 6px;
			border-radius: var(--radius-btn);
			background: var(--color-surface);
			font-family: var(--font-mono);
			font-size: 0.875em;
		}

		// Links in running text keep their underline, so they can be told from the words around them.
		:global(a) {
			text-decoration: underline;
			text-underline-offset: 0.2em;
		}

		:global(img) {
			border-radius: var(--radius);
		}
	}
</style>
