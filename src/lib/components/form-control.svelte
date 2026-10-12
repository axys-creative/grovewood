<script module lang="ts">
	export type FormControlProps = {
		type: 'range' | 'color' | 'file' | 'progress' | 'meter';
		name?: string;
		label: string;
		/** The current value. For `progress` and `meter` it is a number from `0` to `max`. */
		value?: number | string;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		/** Allows several files. */
		multiple?: boolean;
		accept?: string;
	};
</script>

<script lang="ts">
	let {
		type,
		name,
		label,
		value = $bindable(type === 'color' ? '#e48c66' : 50),
		min = 0,
		max = 100,
		step,
		disabled = false,
		multiple = false,
		accept
	}: FormControlProps = $props();

	const id = $props.id();
	const percent = $derived(((Number(value) - min) / (max - min)) * 100);
</script>

<div class="control {type}">
	<label for={id}>
		{label}
		{#if type === 'range' || type === 'progress' || type === 'meter'}
			<span class="value">{value}</span>
		{/if}
	</label>

	{#if type === 'range'}
		<input
			{id}
			{name}
			{min}
			{max}
			{step}
			{disabled}
			type="range"
			style="--percent: {percent}%"
			bind:value
		/>
	{:else if type === 'color'}
		<input {id} {name} {disabled} type="color" bind:value />
	{:else if type === 'file'}
		<input {id} {name} {disabled} {multiple} {accept} type="file" />
	{:else if type === 'progress'}
		<progress {id} {max} value={Number(value)}>{value}</progress>
	{:else}
		<meter {id} {min} {max} low={max * 0.25} high={max * 0.75} optimum={max} value={Number(value)}>
			{value}
		</meter>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.control {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	label {
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}

	.value {
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	input[type='range'] {
		width: 100%;
		height: 1.5em;
		margin: 0;
		background: transparent;
		cursor: pointer;
		appearance: none;

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 4px;
		}

		&::-webkit-slider-runnable-track {
			height: 4px;
			border-radius: 2px;
			background: linear-gradient(
				to right,
				var(--color-accent) var(--percent),
				color-mix(in srgb, var(--color-text) 25%, transparent) var(--percent)
			);
		}

		&::-moz-range-track {
			height: 4px;
			border-radius: 2px;
			background: color-mix(in srgb, var(--color-text) 25%, transparent);
		}

		&::-moz-range-progress {
			height: 4px;
			border-radius: 2px;
			background: var(--color-accent);
		}

		&::-webkit-slider-thumb {
			width: 1.25em;
			height: 1.25em;
			margin-top: calc(2px - 0.625em);
			border: 0;
			border-radius: 50%;
			background: var(--color-accent);
			appearance: none;
		}

		&::-moz-range-thumb {
			width: 1.25em;
			height: 1.25em;
			border: 0;
			border-radius: 50%;
			background: var(--color-accent);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	input[type='color'] {
		width: 3.5em;
		height: 2.5em;
		padding: 2px;
		border: 1px solid color-mix(in srgb, var(--color-text) 45%, transparent);
		border-radius: var(--radius-btn);
		background: transparent;
		cursor: pointer;

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 2px;
		}
	}

	input[type='file'] {
		color: var(--color-text-muted);
		font: inherit;

		&::file-selector-button {
			margin-inline-end: 12px;
			padding: var(--btn-padding);
			border: 1px solid var(--color-accent);
			border-radius: var(--radius-btn);
			background: transparent;
			color: var(--color-text);
			font: inherit;
			font-weight: var(--btn-font-weight);
			cursor: pointer;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 4px;
		}
	}

	progress,
	meter {
		width: 100%;
		height: 8px;
		border: 0;
		border-radius: 4px;
		background: color-mix(in srgb, var(--color-text) 20%, transparent);
		overflow: hidden;
		appearance: none;
	}

	progress::-webkit-progress-bar {
		background: color-mix(in srgb, var(--color-text) 20%, transparent);
	}

	progress::-webkit-progress-value {
		background: var(--color-accent);
	}

	progress::-moz-progress-bar {
		background: var(--color-accent);
	}

	meter::-webkit-meter-bar {
		height: 8px;
		border: 0;
		background: color-mix(in srgb, var(--color-text) 20%, transparent);
	}

	meter::-webkit-meter-optimum-value {
		background: var(--color-success);
	}

	meter::-webkit-meter-suboptimum-value {
		background: var(--color-warning);
	}

	meter::-webkit-meter-even-less-good-value {
		background: var(--color-error);
	}
</style>
