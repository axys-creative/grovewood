<script module lang="ts">
	export type ShuffleImage = {
		src: string;
		alt: string;
		/** Makes the image a link. */
		url?: string;
		width?: number;
		height?: number;
	};

	export type ImageShuffleProps = {
		images: ShuffleImage[];
		/** `roll` slides the new image up from below, as the old one leaves upward. `fade` crossfades. */
		type?: 'roll' | 'fade';
		/** Milliseconds between swaps. One cell changes each time. */
		interval?: number;
		/** How many cells change each interval: `1` one at a time, `3` three together, and a number as big as the grid (or more) changes them all. */
		shuffle?: number;
		columns?: number;
		rows?: number;
		/** `light` draws every cell on a light tile in both themes, for logos made for white backgrounds; `surface` follows the theme, for white or transparent logos. */
		tiles?: 'light' | 'surface';
		/** Holds the shuffling while the pointer is over the grid. It always holds while a cell has focus. */
		pauseOnHover?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount, tick } from 'svelte';

	const DURATION = 700;
	const STAGGER = 90;
	const EASE = 'cubic-bezier(0.18, 0.97, 0.47, 1)';

	let {
		images,
		type = 'roll',
		interval = 3000,
		shuffle = 1,
		columns = 4,
		rows = 2,
		tiles = 'surface',
		pauseOnHover = false,
		class: className
	}: ImageShuffleProps = $props();

	type Layer = { key: number; image: number };

	let compact = $state(false);
	const cells = $derived(columns * rows);
	const columnCount = $derived(compact ? 2 : columns);
	const rowCount = $derived(Math.ceil(cells / columnCount));
	const random = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
	const shuffled = (count: number) => {
		const order = Array.from({ length: count }, (_, index) => index);
		for (let i = order.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[order[i], order[j]] = [order[j], order[i]];
		}
		return order;
	};

	// The cells next to one, so a swap can avoid putting the same image beside itself.
	const neighbours = (cell: number) => {
		const row = Math.floor(cell / columnCount);
		const column = cell % columnCount;
		return [
			column > 0 && cell - 1,
			column < columnCount - 1 && cell + 1 < cells && cell + 1,
			row > 0 && cell - columnCount,
			row < rowCount - 1 && cell + columnCount < cells && cell + columnCount
		].filter((value): value is number => value !== false);
	};

	// With enough images every cell starts different. With fewer, they repeat, but never side by side.
	const arrange = () => {
		if (images.length >= cells) return shuffled(images.length).slice(0, cells);
		const used = new Array<number>(images.length).fill(0);
		const placed: number[] = [];
		for (let cell = 0; cell < cells; cell++) {
			const beside = neighbours(cell)
				.filter((other) => other < cell)
				.map((other) => placed[other]);
			const free = images.map((_, index) => index).filter((index) => !beside.includes(index));
			const fewest = Math.min(...(free.length ? free : [0]).map((index) => used[index]));
			const choice = random((free.length ? free : [0]).filter((index) => used[index] === fewest));
			used[choice]++;
			placed.push(choice);
		}
		return placed;
	};

	let slots = $state<Layer[][]>([]);
	let elements: Record<number, HTMLElement> = {};
	let counter = 0;
	let lastCells: number[] = [];
	let lastIncoming: number[] = [];
	let busy: number[] = [];

	const shown = () => slots.map((layers) => layers[layers.length - 1].image);

	// Plans which cells change and what each changes to, one after another so every choice sees the earlier ones. A
	// cell prefers an image that is not on screen, then one that is not beside it, and never one that would make
	// every cell the same. Cells that changed last time sit this round out, unless that would leave too few.
	const plan = (wanted: number) => {
		const planned = shown();
		const all = images.map((_, index) => index);
		const free = Array.from({ length: cells }, (_, index) => index).filter(
			(index) => !busy.includes(index)
		);
		const fresh = free.filter((index) => !lastCells.includes(index));
		const eligible = fresh.length >= wanted ? fresh : free;
		const moves: { cell: number; image: number }[] = [];

		while (moves.length < Math.min(wanted, eligible.length)) {
			const cell = random(eligible.filter((index) => !moves.some((move) => move.cell === index)));
			const beside = neighbours(cell).map((other) => planned[other]);
			const stages = [
				all.filter((index) => !planned.includes(index)),
				all.filter((index) => index !== planned[cell] && !beside.includes(index)),
				all.filter((index) => index !== planned[cell])
			];
			const wouldMatchAll = (index: number) =>
				planned.every((value, at) => (at === cell ? index : value) === index);

			let image: number | undefined;
			for (const stage of stages) {
				const allowed = stage.filter((index) => !wouldMatchAll(index));
				const unused = allowed.filter((index) => !lastIncoming.includes(index));
				const pool = unused.length ? unused : allowed;
				if (pool.length) {
					image = random(pool);
					break;
				}
			}
			if (image === undefined) break;
			planned[cell] = image;
			moves.push({ cell, image });
		}
		return moves;
	};

	async function swap(cell: number, image: number) {
		const leaving = slots[cell][slots[cell].length - 1];
		const key = ++counter;
		slots[cell].push({ key, image });
		await tick();

		if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
			const out =
				type === 'roll'
					? [{ translate: '0 0' }, { translate: '0 -100%' }]
					: [{ opacity: 1 }, { opacity: 0 }];
			const into =
				type === 'roll'
					? [{ translate: '0 100%' }, { translate: '0 0' }]
					: [{ opacity: 0 }, { opacity: 1 }];
			const options = { duration: DURATION, easing: EASE, fill: 'both' } as const;
			await Promise.all([
				elements[leaving.key]?.animate(out, options).finished,
				elements[key]?.animate(into, options).finished
			]);
		}

		slots[cell] = slots[cell].filter((layer) => layer.key !== leaving.key);
		busy = busy.filter((value) => value !== cell);
	}

	let root = $state<HTMLElement>();
	let paused = false;
	let visible = true;

	onMount(() => {
		const query = matchMedia('(max-width: 767px)');
		const onQuery = () => (compact = query.matches);
		onQuery();
		query.addEventListener('change', onQuery);

		slots = arrange().map((image) => [{ key: ++counter, image }]);

		const tickSwap = () => {
			if (paused || !visible || images.length < 2) return;
			const moves = plan(Math.max(1, Math.round(shuffle)));
			lastCells = moves.map((move) => move.cell);
			lastIncoming = moves.map((move) => move.image);
			busy.push(...lastCells);
			// A short stagger makes several changes read as a ripple, not one jump.
			moves.forEach((move, order) =>
				setTimeout(() => swap(move.cell, move.image), order * STAGGER)
			);
		};

		const timer = setInterval(tickSwap, interval);
		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		observer.observe(root!);
		const onVisibility = () => (visible = !document.hidden);
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			clearInterval(timer);
			query.removeEventListener('change', onQuery);
			observer.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});
</script>

<!-- Focusing the grid (and hovering it, with `pauseOnHover`) holds the shuffling, so a logo can be read or clicked. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={root}
	class="image-shuffle {type} {tiles} {className ?? ''}"
	style="--columns: {columns}; --rows: {rows}"
	onpointerenter={() => pauseOnHover && (paused = true)}
	onpointerleave={() => pauseOnHover && (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	{#each slots as layers, cell (cell)}
		<div class="cell">
			{#each layers as layer (layer.key)}
				{@const image = images[layer.image]}
				<div
					class="layer"
					aria-hidden={layer.key === layers[layers.length - 1].key ? undefined : 'true'}
					bind:this={elements[layer.key]}
				>
					{#if image.url}
						<a href={image.url} target="_blank" rel="noopener noreferrer">
							<img
								{...imageProps(image.src, { sizes: '(min-width: 1024px) 280px, 50vw' })}
								alt={image.alt}
								width={image.width}
								height={image.height}
							/>
						</a>
					{:else}
						<img
							{...imageProps(image.src, { sizes: '(min-width: 1024px) 280px, 50vw' })}
							alt={image.alt}
							width={image.width}
							height={image.height}
						/>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
	@use 'base/mixins';

	.image-shuffle {
		display: grid;
		grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
		grid-template-rows: repeat(var(--rows), auto);
		gap: 16px;
		width: 100%;

		@include mixins.max-md {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-template-rows: none;
			gap: 8px;
		}
	}

	// The cell clips, so a roll shows the old image leaving and the new one arriving from below.
	.light .cell {
		border-color: #e4e4e4;
		background: #fafafa;
	}

	.cell {
		position: relative;
		aspect-ratio: 3 / 2;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.layer {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 12% 14%;

		a {
			display: grid;
			place-items: center;
			width: 100%;
			height: 100%;
		}
	}

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
</style>
