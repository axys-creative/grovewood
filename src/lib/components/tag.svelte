<script module lang="ts">
	export type TagProps = {
		text: string;
		/** Icon name from `static/icons`, shown before the text. */
		icon?: string;
		/** `solid` is filled, `outline` is just a border, `glass` is a blurred, translucent pill. */
		type?: 'solid' | 'outline' | 'glass';
		class?: string;
	};
</script>

<script lang="ts">
	import Icon from './icon.svelte';

	let { text, icon, type = 'solid', class: className }: TagProps = $props();
</script>

<span class="tag {type} {className ?? ''}">
	{#if icon}<Icon name={icon} style="--icon-size: 12px" />{/if}
	<span>{text}</span>
</span>

<style lang="scss">
	@use 'base/mixins';

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border: 1px solid var(--color-accent);
		border-radius: 296px;
		color: var(--color-accent-text);
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 400;
		letter-spacing: 0; // so it doesn't inherit a heading's spacing
		line-height: 1.2;
		vertical-align: middle;
	}

	.solid {
		background: var(--color-accent);
		color: var(--color-text);
	}

	.outline {
		background: transparent;
	}

	.glass {
		@include mixins.glass;

		border-color: var(--color-glass);
		color: var(--color-text);
	}
</style>
