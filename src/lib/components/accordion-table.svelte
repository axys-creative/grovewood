<script module lang="ts">
	import type { ButtonProps } from './button.svelte';

	export type AccordionTableColumn = {
		/** The field read off each item. */
		key: string;
		label: string;
		/** `image` reads an `{ src, alt }`; anything else is shown as text. */
		type?: 'text' | 'image';
		/** Any CSS grid track size. Defaults to `1fr`. */
		width?: string;
	};

	export type AccordionTableCell = string | number | { src: string; alt?: string };

	export type AccordionTableItem = {
		/** Trusted HTML from the CMS, shown when the row is open. */
		content: string;
		/** A carousel of images shown under the content. */
		images?: { src: string; alt?: string }[];
		/** Slides shown at once in this row's carousel. Overrides the table's. */
		slidesPerView?: number;
		/** A button under the carousel. */
		cta?: ButtonProps;
		/** Starts this row open. */
		defaultOpen?: boolean;
		/** One field per column `key`. */
		[key: string]: unknown;
	};

	export type AccordionTableProps = {
		columns: AccordionTableColumn[];
		items: AccordionTableItem[];
		/** Icon name from `static/icons`, shown along the right edge of each row and flipped when open. */
		icon?: string;
		singleOpen?: boolean;
		/** Which rows start open: `true` for all, a row's number (from 0), or a list of them. With `singleOpen` only the first opens. */
		defaultOpen?: boolean | number | number[];
		/** Pins the header row while scrolling through the rows. */
		sticky?: boolean;
		/** The 1-indexed column the opened content lines up with. */
		contentColumn?: number;
		/** Slides shown at once in each row's image carousel. */
		slidesPerView?: number;
		/** Loop each row's image carousel. */
		loopImages?: boolean;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { createDisclosure, startingOpen } from '$lib/utils/disclosure.svelte';
	import Carousel from './carousel.svelte';
	import Icon from './icon.svelte';
	import RichText from './rich-text.svelte';

	let {
		columns,
		items,
		icon,
		singleOpen = false,
		defaultOpen = false,
		sticky = false,
		contentColumn = 2,
		slidesPerView = 1,
		loopImages = true
	}: AccordionTableProps = $props();

	const id = $props.id();
	const disclosure = createDisclosure(
		() => items.length,
		() => singleOpen,
		() => startingOpen(items, defaultOpen)
	);

	const tracks = $derived(columns.map((column) => column.width ?? '1fr').join(' '));
	const isImage = (value: unknown): value is { src: string; alt?: string } =>
		typeof value === 'object' && value !== null && 'src' in value;
</script>

<div
	class="accordion-table"
	class:sticky
	class:has-icon={icon}
	style="--cols: {tracks}; --content-col: {contentColumn}"
>
	<div class="head" aria-hidden="true">
		{#each columns as column (column.key)}
			<span>{column.label}</span>
		{/each}
	</div>

	{#each items as item, index (index)}
		{@const open = disclosure.isOpen(index)}
		<div class="item">
			<h3 class="heading">
				<button
					type="button"
					class="row"
					aria-expanded={open}
					aria-controls="{id}-panel-{index}"
					id="{id}-trigger-{index}"
					onclick={() => disclosure.toggle(index)}
				>
					{#each columns as column (column.key)}
						{@const value = item[column.key]}
						<span class="cell" class:image={column.type === 'image'}>
							{#if column.type === 'image'}
								{#if isImage(value)}<img
										{...imageProps(value.src, { sizes: '120px' })}
										alt={value.alt ?? ''}
									/>{/if}
							{:else}
								{value ?? ''}
							{/if}
						</span>
					{/each}
					{#if icon}<Icon name={icon} class="marker" />{/if}
				</button>
			</h3>
			<div
				class="panel"
				id="{id}-panel-{index}"
				role="region"
				aria-labelledby="{id}-trigger-{index}"
				inert={!open}
			>
				<div class="content">
					{#each columns as column (column.key)}
						{@const value = item[column.key]}
						{#if column.type === 'image' && isImage(value)}
							<img
								class="media"
								{...imageProps(value.src, { sizes: '(min-width: 1024px) 400px, 100vw' })}
								alt={value.alt ?? ''}
								loading="lazy"
							/>
						{/if}
					{/each}
					<div class="body">
						<div><RichText text={item.content} /></div>
						{#if item.images?.length}
							<Carousel
								label="Images"
								slides={item.images.map(({ src, alt }) => ({ img: src, alt }))}
								slidesPerView={item.slidesPerView ?? slidesPerView}
								loop={loopImages}
								cta={item.cta}
							/>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	@use 'base/mixins';

	.accordion-table {
		--gap: 24px;
		--sticky-top: 0px;
		--img-size: 64px;
		--icon-size: 2.5ch;

		width: 100%;

		@include mixins.max-sm {
			--gap: 12px;
			--img-size: 48px;
		}
	}

	.head,
	.row,
	.content {
		display: grid;
		grid-template-columns: var(--cols);
		align-items: center;
		column-gap: var(--gap);
		width: 100%;
	}

	.has-icon {
		.head,
		.row,
		.content {
			padding-inline-end: calc(var(--icon-size) + var(--gap));
		}
	}

	.head {
		@include mixins.body-small;
		padding-block: 12px;
		border-bottom: 1px solid var(--color-border);
		text-transform: uppercase;
	}

	.sticky .head {
		position: sticky;
		top: var(--sticky-top);
		z-index: 1;
		background: var(--color-bg);
	}

	.item {
		border-bottom: 1px solid var(--color-border);

		@include mixins.mq-motion-allow {
			transition: border-color var(--duration) var(--ease);
		}

		&:has(.row:hover),
		&:has(.row:focus-visible) {
			@media (hover: hover) and (pointer: fine) {
				border-color: var(--color-accent);
			}
		}
	}

	.heading {
		font: inherit;
		letter-spacing: normal;
	}

	.row {
		@include mixins.body-large;
		position: relative;
		padding: 12px 0;
		border: 0;
		background: none;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.row :global(.marker) {
		position: absolute;
		inset-block: 0;
		inset-inline-end: 0;
		width: var(--icon-size);
		height: var(--icon-size);
		margin-block: auto;

		@include mixins.mq-motion-allow {
			transition: scale var(--duration) var(--ease);
		}
	}

	.row[aria-expanded='true'] :global(.marker) {
		scale: 1 -1;
	}

	.cell {
		min-width: 0;
	}

	.cell img {
		width: 100%;
		height: var(--img-size);
		object-fit: cover;
	}

	.panel {
		display: grid;
		grid-template-rows: 0fr;
		visibility: hidden;

		@include mixins.mq-motion-allow {
			transition:
				grid-template-rows var(--duration) var(--ease),
				visibility var(--duration);
		}

		&:not([inert]) {
			grid-template-rows: 1fr;
			visibility: visible;
			padding-block-end: 12px;
		}
	}

	.content {
		overflow: hidden;
		align-items: start;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		grid-column: var(--content-col);
		min-width: 0;
	}

	.media {
		display: none;
	}

	@include mixins.max-md {
		.head,
		.cell.image {
			display: none;
		}

		.row {
			display: flex;
			justify-content: space-between;
			gap: var(--gap);

			.cell {
				flex: 1 1 0;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			gap: var(--gap);
		}

		.media {
			display: block;
			width: 100%;
			max-width: 240px;
			height: auto;
			aspect-ratio: 1;
			object-fit: cover;
		}
	}
</style>
