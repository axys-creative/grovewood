<!-- LIBRARY: DELETE ME. Documentation only; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import { tick } from 'svelte';
	import Button from '$lib/components/button.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import {
		isCover,
		playTiles,
		playTransition,
		prefersReducedMotion,
		type PageTransitionName,
		type PageTransitionOptions
	} from '$lib/utils/page-transition';

	let { name, ...options }: PageTransitionOptions & { name: PageTransitionName } = $props();

	let stage = $state<HTMLElement>();

	const pages = [
		{
			path: '/page-one',
			eyebrowText: 'Page one',
			title: 'The first page',
			description: 'A mock page. Use the links below to see the transition play.'
		},
		{
			path: '/page-two',
			eyebrowText: 'Page two',
			title: 'The second page',
			description: 'Another mock page, arriving as the first one leaves.'
		}
	];

	let layers = $state([{ key: 0, page: 0 }]);
	let elements: Record<number, HTMLElement> = {};
	let counter = 0;
	let busy = false;

	const current = $derived(layers[layers.length - 1].page);

	async function go(page: number) {
		if (busy || page === current) return;
		busy = true;

		const leaving = layers[layers.length - 1];
		const key = ++counter;
		const reduced = prefersReducedMotion();

		if (isCover(name) && stage && !reduced) {
			await playTiles(
				stage,
				() => {
					layers = [{ key, page }];
				},
				options
			);
		} else {
			layers.push({ key, page });
			await tick();
			if (!isCover(name) && !reduced) {
				await playTransition(elements[leaving.key], elements[key], name, options.duration);
			}
			layers = layers.filter((layer) => layer.key !== leaving.key);
		}
		busy = false;
	}
</script>

<div class="frame">
	<div class="bar" aria-hidden="true">
		<span class="dots"><i></i><i></i><i></i></span>
		<span class="path">{pages[current].path}</span>
	</div>

	<div class="stage" bind:this={stage}>
		{#each layers as layer (layer.key)}
			<div class="page" bind:this={elements[layer.key]}>
				<SectionCopy
					level={3}
					align="center"
					eyebrowText={pages[layer.page].eyebrowText}
					title={pages[layer.page].title}
					description={pages[layer.page].description}
				/>
			</div>
		{/each}
	</div>

	<nav class="links" aria-label="Demo pages">
		{#each pages as page, index (page.path)}
			<Button
				text={page.eyebrowText}
				type="underline"
				current={index === current}
				onclick={() => go(index)}
			/>
		{/each}
	</nav>
</div>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	.frame {
		display: flex;
		flex-direction: column;
		width: min(max(60vw, 320px), calc(100vw - var(--body-padding) * 2));
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-bg);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.dots {
		display: flex;
		gap: 6px;

		i {
			width: 9px;
			height: 9px;
			border-radius: 50%;
			background: var(--color-border);
		}
	}

	.path {
		color: var(--color-text-muted);
	}

	.stage {
		position: relative;
		display: grid;
		min-height: 280px;
		overflow: hidden;
	}

	.page {
		grid-area: 1 / 1;
		display: grid;
		place-items: center;
		padding: 32px;
	}

	.links {
		display: flex;
		justify-content: center;
		gap: 24px;
		padding: 16px;
		border-top: 1px solid var(--color-border);
	}
</style>
