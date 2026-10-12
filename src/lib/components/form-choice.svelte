<script module lang="ts">
	export type FormChoiceProps = {
		name: string;
		label: string;
		type?: 'checkbox' | 'radio' | 'switch';
		/** What is sent when it is on. A radio needs one. */
		value?: string;
		checked?: boolean;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		/** For a radio group, the selected value. */
		group?: string;
	};
</script>

<script lang="ts">
	let {
		name,
		label,
		type = 'checkbox',
		value = 'on',
		checked = $bindable(false),
		disabled = false,
		required = false,
		class: className,
		group = $bindable()
	}: FormChoiceProps = $props();
</script>

<label class="choice {type} {className ?? ''}" class:disabled>
	{#if type === 'radio'}
		<input type="radio" {name} {value} {disabled} {required} bind:group />
	{:else}
		<input
			type="checkbox"
			role={type === 'switch' ? 'switch' : undefined}
			{name}
			{value}
			{disabled}
			{required}
			bind:checked
		/>
	{/if}
	<span>{label}</span>
</label>

<style lang="scss">
	@use 'base/mixins';

	.choice {
		--size: 1.25em;
		--border: color-mix(in srgb, var(--color-text) 45%, transparent);

		display: inline-flex;
		align-items: center;
		gap: 0.75em;
		cursor: pointer;

		&.disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	input {
		display: grid;
		flex-shrink: 0;
		place-content: center;
		width: var(--size);
		height: var(--size);
		margin: 0;
		border: 1px solid var(--border);
		background: transparent;
		cursor: inherit;
		appearance: none;

		@include mixins.mq-motion-allow {
			transition:
				background 0.2s ease,
				border-color 0.2s ease;
		}

		&:hover:not(:disabled) {
			border-color: var(--color-text);
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 2px;
		}

		&::before {
			content: '';
			scale: 0;

			@include mixins.mq-motion-allow {
				transition: scale 0.2s ease;
			}
		}

		&:checked {
			border-color: var(--color-accent);

			&::before {
				scale: 1;
			}
		}
	}

	.checkbox input {
		border-radius: 4px;

		&::before {
			width: 0.9em;
			height: 0.9em;
			background: var(--color-text);
			mask: url('/icons/check.svg') center / contain no-repeat;
		}

		&:checked {
			background: var(--color-accent);
		}
	}

	.radio input {
		border-radius: 50%;

		&::before {
			width: 0.6em;
			height: 0.6em;
			border-radius: 50%;
			background: var(--color-accent);
		}
	}

	.switch input {
		--size: 1.5em;

		width: calc(var(--size) * 1.8);
		border-radius: var(--size);
		place-content: center start;
		padding: 2px;

		&::before {
			width: calc(var(--size) - 6px);
			height: calc(var(--size) - 6px);
			border-radius: 50%;
			background: var(--color-text);
			scale: 1;

			@include mixins.mq-motion-allow {
				transition: translate 0.2s ease;
			}
		}

		&:checked {
			background: var(--color-accent);

			&::before {
				translate: calc(var(--size) * 0.8) 0;
			}
		}
	}
</style>
