<!-- LIBRARY: DELETE ME. Documentation only; remove with the rest of the library (see CLAUDE.md). -->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	export type LibraryProp = {
		name: string;
		/** Plain text. Wrap words in `backticks` to show them as code. */
		description: string;
	};

	export type LibrarySectionProps = {
		title: string;
		/** What it is: Attachment, Component, Combo, Section or Tokens. Shown as "[ Title - Type ]". */
		type?: string;
		/** A sub-block (h3) inside a section: plain title, no brackets. */
		level?: 2 | 3;
		id?: string;
		/** A small label next to a level 3 title, e.g. "Stationary". */
		tag?: string;
		/** Plain text. Wrap words in `backticks` to show them as code. */
		description?: string;
		props?: LibraryProp[];
		/** Introduces the list: "Available options:" or "Available props:". */
		propsLabel?: 'options' | 'props';
		/** An attachment applied to the title text, e.g. an attachment showing itself off. */
		titleAttachment?: Attachment<HTMLElement>;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import Tag from '$lib/components/tag.svelte';

	let {
		title,
		type = 'Component',
		level = 2,
		id,
		tag,
		description,
		props = [],
		propsLabel = 'props',
		titleAttachment,
		children
	}: LibrarySectionProps = $props();

	// Splits "a `b` c" into text and code pieces.
	const pieces = (text: string) =>
		text.split(/`([^`]+)`/).map((value, index) => ({ value, code: index % 2 === 1 }));
</script>

{#snippet rich(text: string)}
	{#each pieces(text) as piece, index (index)}
		{#if piece.code}<code>{piece.value}</code>{:else}{piece.value}{/if}
	{/each}
{/snippet}

<svelte:element this={level === 2 ? 'section' : 'div'} class="library-section level-{level}">
	<svelte:element this={`h${level}`} {id} class="library-title">
		<span {@attach titleAttachment}>
			{#if level === 2}[ {title} - {type} ]{:else}{title}{/if}
		</span>
		{#if tag}<Tag text={tag} type="outline" />{/if}
	</svelte:element>

	{#if description}<p>{@render rich(description)}</p>{/if}

	{#if props.length}
		<p class="props-label">Available {propsLabel}:</p>
		<ul class="classic-list">
			{#each props as prop (prop.name)}
				<li><code>{prop.name}</code> {@render rich(prop.description)}</li>
			{/each}
		</ul>
	{/if}

	{#if children}
		<div class="examples">{@render children()}</div>
	{/if}
</svelte:element>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	// A section spans the whole page grid and lays its own children on the same columns (subgrid), so each one sits in
	// the content column unless it is marked `full`.
	.library-section {
		display: grid;
		grid-column: full;
		grid-template-columns: subgrid;
		justify-items: start;
		gap: 16px 0;

		> :global(*) {
			grid-column: content;
		}

		// Examples sit three times further apart than the copy above them, so each one reads on its own.
		> .examples {
			display: grid;
			grid-column: full;
			grid-template-columns: subgrid;
			justify-items: start;
			gap: 48px 0;
			margin-block-start: 32px;

			> :global(*) {
				grid-column: content;
			}

			> :global(.library-section),
			> :global(.full) {
				grid-column: full;
			}

			> :global(.full) {
				justify-self: stretch;
			}

			// A small heading belongs to the example under it.
			> :global(.plain) {
				position: relative;
				z-index: 1;
				margin-block-end: -32px;
			}
		}

		&.level-3 {
			margin-block-start: 48px;
		}

		:global(p) {
			color: var(--color-text-muted);
		}

		:global(code) {
			padding: 4px 8px;
			border-radius: var(--radius-btn);
			background: var(--color-surface);
			color: var(--color-text);
			font-family: var(--font-mono);
			font-size: 14px;
			font-weight: 700;
		}
	}

	.library-title {
		margin: 0;
	}

	.props-label {
		margin-block-end: -8px;
	}

	.classic-list {
		display: flex;
		flex-direction: column;
		gap: 0.5ch;
		margin: 0;
		padding: 0;

		li {
			margin-inline: 1.8ch;
			text-align: start;
			list-style-type: circle;
		}
	}
</style>
