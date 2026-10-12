<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type FormGroupProps = {
		/** The group's name for screen readers, shown above it. */
		legend: string;
		/** `column` stacks the choices; `row` puts them side by side. */
		direction?: 'column' | 'row';
		disabled?: boolean;
		children: Snippet;
	};
</script>

<script lang="ts">
	let { legend, direction = 'column', disabled = false, children }: FormGroupProps = $props();
</script>

<fieldset {disabled}>
	<legend>{legend}</legend>
	<div class="items {direction}">{@render children()}</div>
</fieldset>

<style lang="scss">
	fieldset {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;

		&:disabled {
			opacity: 0.5;
		}
	}

	legend {
		padding: 0;
		margin-block-end: 12px;
		font-weight: 500;
	}

	.items {
		display: flex;
		gap: 12px 24px;
	}

	.column {
		flex-direction: column;
		align-items: flex-start;
	}

	.row {
		flex-wrap: wrap;
	}
</style>
