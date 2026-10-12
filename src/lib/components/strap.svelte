<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type StrapProps = {
		/** Icon name from `static/icons`, or a path to a single-color SVG, centered in the loop. */
		icon?: string;
		/** What sits beside the loop, such as social links. */
		children?: Snippet;
		/** How far the right end runs past the edge it is placed against, in px, hidden from view so the curve is not seen. The padding on the right grows by the same amount, so the content stays in view. */
		bleed?: number;
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from './icon.svelte';

	let { icon, children, bleed = 0, class: className }: StrapProps = $props();
</script>

<div class="strap {className ?? ''}" style="--strap-bleed: {bleed}px">
	<div class="loop" aria-hidden="true">
		{#if icon}<Icon name={icon} class="loop-icon" />{/if}
	</div>

	{#if children}<div class="content">{@render children()}</div>{/if}
</div>

<style lang="scss">
	// The strap has no background of its own. The loop is a transparent circle with an enormous box-shadow, and that
	// shadow is the strap's color everywhere outside the circle. The strap clips it to its rounded shape, so what is
	// left is a pill with a round hole through it that shows the page behind.
	.strap {
		--strap-height: 64px;
		--strap-color: var(--color-accent);
		--loop-inset: 12px;

		display: inline-flex;
		align-items: center;
		height: var(--strap-height);
		padding-inline-end: calc(20px + var(--strap-bleed, 0px));
		overflow: hidden;
		border-radius: 64px;
	}

	.loop {
		display: grid;
		flex: none;
		place-items: center;
		height: calc(100% - var(--loop-inset) * 2);
		margin: var(--loop-inset);
		aspect-ratio: 1;
		border-radius: 50%;
		box-shadow: 0 0 0 100vmax var(--strap-color);
		color: var(--color-text);
	}

	// On the brand color, the icons take the text color, as a solid button's text does, in a roomier hit area.
	.content :global(a) {
		width: 32px;
		height: 32px;
		color: var(--color-text);
	}

	.content :global(ul) {
		gap: 4px;
	}

	.loop :global(.loop-icon) {
		--icon-size: 45%;
	}

	.content {
		display: flex;
		align-items: center;
		gap: 4px;
		// Stays above the shadow, which is painted over everything before it.
		position: relative;
	}
</style>
