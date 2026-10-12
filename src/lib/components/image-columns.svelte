<script module lang="ts">
	import type { CardGnomonProps } from './card-gnomon.svelte';

	/** Shared by every card when `gnomon` is set. The caption fills the first notch. */
	export type ColumnsGnomon = Pick<
		CardGnomonProps,
		'depth' | 'length' | 'radius' | 'angle' | 'borderWidth' | 'cutouts'
	>;

	export type ColumnImage = {
		src: string;
		alt?: string;
		/** A small handwritten note on the image's corner. */
		accent?: string;
		/** Text along the bottom of a plain image, or inside the first notch of a gnomon card. */
		caption?: string;
		/** Overrides for this card's `gnomon` settings. */
		gnomon?: Partial<ColumnsGnomon>;
	};

	export type ImageColumnsProps = {
		/** The images the slots draw from, in order. Fewer images than slots loops them. */
		images: ColumnImage[];
		/** How many slots each column holds at the widest size. Uneven counts are fine, e.g. `[4, 5, 4, 5]`. */
		columns?: number[];
		/** Column counts for tablet widths. Defaults to an even split in one fewer column. */
		columnsMd?: number[];
		/** Column counts for mobile widths. Defaults to an even split in two fewer columns. */
		columnsSm?: number[];
		/** A ScrollTrigger start, `"element-point viewport-point"`, for when the columns begin moving. */
		start?: string;
		/** Where moving columns start, as px (`40` or `"40px"`) or a percent of the shortest column's height. */
		startOffset?: number | string;
		/** Show GSAP's start and end markers for debugging. */
		markers?: boolean;
		/** Draw every image as a Card Gnomon with these settings. */
		gnomon?: ColumnsGnomon;
		class?: string;
	};

	const evenCounts = (total: number, columnCount: number) => {
		if (!total || !columnCount) return [];
		const base = Math.floor(total / columnCount);
		const extra = total % columnCount;
		return Array.from({ length: columnCount }, (_, index) => (index < extra ? base + 1 : base));
	};

	const resolveCounts = (
		custom: number[] | undefined,
		fallbackTotal: number,
		fallbackCount: number
	) =>
		custom?.length
			? custom.map((count) => Math.max(0, Number(count) || 0))
			: evenCounts(fallbackTotal, fallbackCount);

	// One { col, row } per slot, filling column 1 first.
	const placementOf = (counts: number[]) =>
		counts.flatMap((count, column) =>
			Array.from({ length: count }, (_, row) => ({ col: column + 1, row: row + 1 }))
		);
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount } from 'svelte';
	import { loadGsap } from '$lib/utils/gsap';
	import CardGnomon from './card-gnomon.svelte';

	let {
		images,
		columns,
		columnsMd,
		columnsSm,
		start = 'top 95%',
		startOffset,
		markers = false,
		gnomon,
		class: className
	}: ImageColumnsProps = $props();

	const total = $derived(images.length);
	const wide = $derived(resolveCounts(columns, total, 4));
	const widestSlots = $derived(wide.reduce((sum, count) => sum + count, 0));
	const medium = $derived(resolveCounts(columnsMd, widestSlots, Math.max(2, wide.length - 1)));
	const narrow = $derived(resolveCounts(columnsSm, widestSlots, Math.max(2, wide.length - 2)));
	const placement = $derived(placementOf(wide));
	const placementMd = $derived(placementOf(medium));
	const placementSm = $derived(placementOf(narrow));
	const slots = $derived(Math.max(placement.length, placementMd.length, placementSm.length));

	const style = (slot: { col: number; row: number } | undefined, suffix: string) =>
		`--col${suffix}: ${slot?.col ?? 'auto'}; --row${suffix}: ${slot?.row ?? 'auto'}; --display${suffix}: ${slot ? 'block' : 'none'}`;

	const cutoutsFor = (image: ColumnImage) => {
		const base = image.gnomon?.cutouts ?? gnomon?.cutouts;
		const cutouts = base?.length ? base : [{ from: 'top-right' as const }];
		return cutouts.map((cutout, index) => ({
			from: cutout.from,
			text: index === 0 && image.caption ? image.caption : cutout.text
		}));
	};

	let grid = $state<HTMLElement>();

	// Each column moves up as the page scrolls until its bottom lines up with the shortest column, which never moves.
	// The grid's height is pinned to the shortest column so the longer ones hang below it. It is rebuilt whenever the
	// breakpoint changes, since the columns regroup.
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then(async (gsap) => {
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			if (cancelled || !grid) return;

			const match = gsap.matchMedia();
			match.add(
				{ maxMd: '(max-width: 767px)', maxLg: '(max-width: 1023px)', minLg: '(min-width: 1024px)' },
				() => {
					// Slots hidden at this size (display: none) are not part of any column.
					const items = Array.from(grid!.querySelectorAll<HTMLElement>('.item')).filter(
						(item) => getComputedStyle(item).display !== 'none'
					);
					if (items.length < 2) return;

					const byColumn: Record<string, HTMLElement[]> = {};
					items.forEach((item) => {
						const column = getComputedStyle(item).gridColumnStart;
						(byColumn[column] ??= []).push(item);
					});

					const groups = Object.entries(byColumn)
						.sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
						.map(([, elements]) => elements);
					if (groups.length < 2) return;

					const heightOf = (elements: HTMLElement[]) => {
						const tops = elements.map((element) => element.getBoundingClientRect().top);
						const bottoms = elements.map((element) => element.getBoundingClientRect().bottom);
						return Math.max(...bottoms) - Math.min(...tops);
					};
					const heights = () => groups.map(heightOf);
					const shortest = () => groups[heights().indexOf(Math.min(...heights()))];
					const delta = (index: number) => heights()[index] - Math.min(...heights());

					const syncHeight = () => {
						grid!.style.height = `${Math.min(...heights())}px`;
					};
					syncHeight();
					ScrollTrigger.addEventListener('refreshInit', syncHeight);

					const offset = String(startOffset ?? '').trim();
					const offsetPx = () => {
						const number = parseFloat(offset);
						if (!number) return 0;
						return offset.endsWith('%') ? (number / 100) * Math.min(...heights()) : number;
					};
					const trigger = shortest()[0];
					const endBottom = () =>
						Math.max(...shortest().map((element) => element.getBoundingClientRect().bottom)) +
						scrollY;

					groups.forEach((elements, index) => {
						if (delta(index) <= 0) return;
						gsap.fromTo(
							elements,
							{ y: () => offsetPx() },
							{
								y: () => -delta(index),
								ease: 'none',
								scrollTrigger: {
									trigger,
									start,
									end: () => endBottom() - innerHeight * 0.75,
									scrub: 0.8,
									invalidateOnRefresh: true,
									markers
								}
							}
						);
					});

					return () => {
						ScrollTrigger.removeEventListener('refreshInit', syncHeight);
						grid!.style.height = '';
					};
				}
			);
			revert = () => match.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	});
</script>

{#if total}
	<div
		bind:this={grid}
		class="image-columns {className ?? ''}"
		style="--count: {wide.length}; --count-md: {medium.length}; --count-sm: {narrow.length}"
	>
		{#each Array.from({ length: slots }, (_, slot) => slot) as slot (slot)}
			{@const image = images[slot % total]}
			<div
				class="item"
				style="{style(placement[slot], '')}; {style(placementMd[slot], '-md')}; {style(
					placementSm[slot],
					'-sm'
				)}"
			>
				{#if gnomon}
					<CardGnomon
						class="columns-gnomon"
						img={{ src: image.src, alt: image.alt }}
						{...{ ...gnomon, ...image.gnomon }}
						cutouts={cutoutsFor(image)}
					/>
				{:else}
					<img
						{...imageProps(image.src, {
							sizes: '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'
						})}
						alt={image.alt ?? ''}
						loading="lazy"
					/>
					{#if image.caption}<span class="caption">{image.caption}</span>{/if}
				{/if}
				{#if image.accent}<span class="accent" aria-hidden="true">{image.accent}</span>{/if}
			</div>
		{/each}
	</div>
{/if}

<style lang="scss">
	@use 'base/mixins';

	// Items carry an explicit grid column and row, so the number per column can be uneven.
	.image-columns {
		display: grid;
		grid-template-columns: repeat(var(--count), 1fr);
		grid-auto-rows: auto;
		gap: 24px;
		width: 100%;

		@include mixins.max-lg {
			grid-template-columns: repeat(var(--count-md), 1fr);
		}

		@include mixins.max-md {
			grid-template-columns: repeat(var(--count-sm), 1fr);
		}
	}

	.item {
		position: relative;
		display: var(--display);
		grid-column: var(--col);
		grid-row: var(--row);

		@include mixins.max-lg {
			display: var(--display-md);
			grid-column: var(--col-md);
			grid-row: var(--row-md);
		}

		@include mixins.max-md {
			display: var(--display-sm);
			grid-column: var(--col-sm);
			grid-row: var(--row-sm);
		}
	}

	img {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius);
		object-fit: cover;
	}

	// Fills the grid cell instead of the card's own standalone size.
	.item :global(.columns-gnomon.columns-gnomon) {
		--card-size: 100%;

		aspect-ratio: 3 / 4;
	}

	.accent {
		position: absolute;
		top: 0.5em;
		left: 0.75em;
		z-index: 2;
		color: #fff;
		font-family: cursive;
		font-size: clamp(20px, 2vw, 32px);
		line-height: 1;
		text-shadow: 0 1px 4px rgb(0 0 0 / 0.6);
		rotate: -6deg;
		pointer-events: none;
	}

	// For plain images; a gnomon card shows its caption in the notch.
	.caption {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		padding: 2.5em 24px 24px;
		border-radius: 0 0 var(--radius) var(--radius);
		background: linear-gradient(to top, rgb(0 0 0 / 0.55), transparent);
		color: #fff;
		font-size: 14px;
		line-height: 1.2;
		pointer-events: none;
	}
</style>
