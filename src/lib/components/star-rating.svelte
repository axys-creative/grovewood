<script lang="ts">
	type Props = { rating: number; label: string; class?: string };

	let { rating, label, class: className }: Props = $props();

	const stars = [1, 2, 3, 4, 5];
	const path =
		'M12 2.5l2.94 6.2 6.56.84-4.8 4.58 1.2 6.68L12 17.6l-5.9 3.2 1.2-6.68-4.8-4.58 6.56-.84z';
	const percent = $derived(Math.max(0, Math.min(5, rating)) * 20);
</script>

<span class="stars {className ?? ''}" role="img" aria-label={label}>
	<span class="row" aria-hidden="true">
		{#each stars as star (star)}
			<svg viewBox="0 0 24 24"><path d={path} /></svg>
		{/each}
	</span>
	<span class="row fill" style:width="{percent}%" aria-hidden="true">
		{#each stars as star (star)}
			<svg viewBox="0 0 24 24"><path d={path} /></svg>
		{/each}
	</span>
</span>

<style lang="scss">
	.stars {
		--star-size: 1.25rem;
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		color: var(--color-accent);
	}

	.row {
		display: flex;
		overflow: hidden;

		svg {
			flex: none;
			width: var(--star-size);
			height: var(--star-size);
			fill: none;
			stroke: currentColor;
			stroke-width: 1.5;
			stroke-linejoin: round;
		}
	}

	.fill {
		position: absolute;
		inset: 0 auto 0 0;

		svg {
			fill: currentColor;
		}
	}
</style>
