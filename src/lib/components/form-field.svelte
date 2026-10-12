<script module lang="ts">
	export type FormFieldOption =
		| string
		| { value: string; label?: string; disabled?: boolean }
		| {
				group: string;
				options: (string | { value: string; label?: string; disabled?: boolean })[];
		  };

	export type FormFieldProps = {
		/** The field's `name`, sent with the form. */
		name: string;
		label: string;
		type?:
			| 'text'
			| 'email'
			| 'tel'
			| 'number'
			| 'password'
			| 'search'
			| 'url'
			| 'date'
			| 'time'
			| 'textarea'
			| 'select';
		/** `underline` is a line under the field; `outline` is a full border. */
		variant?: 'underline' | 'outline';
		required?: boolean;
		disabled?: boolean;
		/** Helper text under the field. */
		hint?: string;
		/** Error text under the field. It also marks the field invalid. */
		error?: string;
		/** Limits a textarea and shows how many characters are left. */
		maxLength?: number;
		/** The choices of a `select`. A `{ group, options }` entry makes an `optgroup`. */
		options?: FormFieldOption[];
		/** Suggestions for a text field, shown natively as the visitor types. */
		datalist?: string[];
		autocomplete?: AutoFill;
		inputmode?: 'text' | 'numeric' | 'tel' | 'email';
		/** Two or more fields in a flex row share it. */
		class?: string;
		value?: string;
	};
</script>

<script lang="ts">
	import Icon from './icon.svelte';

	let {
		name,
		label,
		type = 'text',
		variant = 'underline',
		required = true,
		disabled = false,
		hint,
		error,
		maxLength,
		options = [],
		datalist,
		autocomplete,
		inputmode,
		class: className,
		value = $bindable('')
	}: FormFieldProps = $props();

	const id = $props.id();
	// A date, time or select always shows something, so its label never rests inside it.
	const floated = $derived(type === 'date' || type === 'time' || type === 'select');
	const remaining = $derived(maxLength === undefined ? undefined : maxLength - value.length);
	const counter = $derived(
		remaining === undefined
			? ''
			: remaining === maxLength
				? `Max — ${maxLength} characters`
				: `${remaining} character${remaining === 1 ? '' : 's'} remaining`
	);
	const describedBy = $derived(
		[counter && `${id}-count`, hint && `${id}-hint`, error && `${id}-error`]
			.filter(Boolean)
			.join(' ') || undefined
	);

	// A phone number is digits only.
	const oninput = () => {
		if (type === 'tel') value = value.replace(/\D/g, '');
	};

	const normalize = (option: string | { value: string; label?: string; disabled?: boolean }) =>
		typeof option === 'string' ? { value: option, label: option, disabled: false } : option;
</script>

{#snippet choice(option: string | { value: string; label?: string; disabled?: boolean })}
	{@const item = normalize(option)}
	<option value={item.value} disabled={item.disabled}>{item.label ?? item.value}</option>
{/snippet}

<div class="field {variant} {className ?? ''}" class:floated class:textarea={type === 'textarea'}>
	{#if type === 'textarea'}
		<textarea
			{id}
			{name}
			{required}
			{disabled}
			{autocomplete}
			maxlength={maxLength}
			spellcheck="true"
			placeholder=" "
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			bind:value></textarea>
	{:else if type === 'select'}
		<select
			{id}
			{name}
			{required}
			{disabled}
			{autocomplete}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			bind:value
		>
			<option value="" disabled hidden></option>
			{#each options as option, index (index)}
				{#if typeof option === 'object' && 'group' in option}
					<optgroup label={option.group}>
						{#each option.options as grouped, groupedIndex (groupedIndex)}
							{@render choice(grouped)}
						{/each}
					</optgroup>
				{:else}
					{@render choice(option)}
				{/if}
			{/each}
		</select>
		<Icon name="chevron-down" class="chevron" />
	{:else}
		<input
			{id}
			{name}
			{required}
			{disabled}
			{type}
			{autocomplete}
			{inputmode}
			list={datalist ? `${id}-list` : undefined}
			placeholder=" "
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			{oninput}
			bind:value
		/>
		{#if datalist}
			<datalist id="{id}-list">
				{#each datalist as suggestion (suggestion)}<option value={suggestion}></option>{/each}
			</datalist>
		{/if}
	{/if}
	<label for={id}>
		{label}{#if required}<span class="visually-hidden"> (required)</span>{/if}
		{#if counter}
			<span class="count" class:out={remaining === 0} id="{id}-count" aria-live="polite">
				{counter}
			</span>
		{/if}
	</label>
	{#if hint && !error}<p class="message" id="{id}-hint">{hint}</p>{/if}
	{#if error}<p class="message error" id="{id}-error">{error}</p>{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.field {
		--border: color-mix(in srgb, var(--color-text) 45%, transparent);

		position: relative;
		flex: 1;
		width: 100%;
		min-width: 0;
		padding-block-start: 0.5em;
	}

	input,
	textarea,
	select {
		display: block;
		width: 100%;
		margin: 0;
		border: 1px solid var(--border);
		background: transparent;
		color: inherit;
		font: inherit;
		appearance: none;

		@include mixins.mq-motion-allow {
			transition: border-color 0.25s ease;
		}

		&:hover {
			border-color: var(--color-text);
		}

		&:focus-visible {
			outline: none;
			border-color: var(--color-accent);
		}

		&[aria-invalid='true'] {
			border-color: var(--color-error);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	textarea {
		min-height: 7em;
		resize: vertical;
	}

	select {
		padding-inline-end: 2.5em;
		cursor: pointer;
	}

	option {
		background: var(--color-bg);
		color: var(--color-text);
	}

	.field :global(.chevron) {
		position: absolute;
		right: 0.75em;
		bottom: 0.9em;
		pointer-events: none;
	}

	// Underline: a line under the field, with the label above it.
	.underline {
		input,
		textarea,
		select {
			padding: 1.2em 0 0.35em;
			border-width: 0 0 1px;
			border-radius: 0;
			border-color: var(--color-text);
		}

		select {
			padding-inline-end: 1.75em;
		}

		:global(.chevron) {
			right: 0;
		}

		label {
			top: calc(0.5em + 1.2em);
			left: 0;
		}
	}

	// Outline: a full border, with the label moving onto the border line.
	.outline {
		input,
		textarea,
		select {
			padding: 0.85em 1em;
			border-radius: var(--radius-btn);
		}

		label {
			top: calc(0.5em + 0.85em);
			left: 1em;
		}

		input:focus ~ label,
		input:not(:placeholder-shown) ~ label,
		textarea:focus ~ label,
		textarea:not(:placeholder-shown) ~ label,
		&.floated label {
			top: 0.5em;
			left: 0.75em;
			padding-inline: 0.35em;
			translate: 0 -50%;
			background: var(--color-bg);
		}
	}

	label {
		position: absolute;
		display: flex;
		gap: 8px;
		max-width: calc(100% - 1em);
		overflow: hidden;
		line-height: 1.2;
		white-space: nowrap;
		opacity: 0.75;
		pointer-events: none;

		@include mixins.mq-motion-allow {
			transition:
				top 0.25s ease,
				left 0.25s ease,
				translate 0.25s ease,
				font-size 0.25s ease,
				opacity 0.25s ease;
		}
	}

	.field:hover label,
	.field:focus-within label {
		opacity: 1;
	}

	.underline {
		input:focus ~ label,
		input:not(:placeholder-shown) ~ label,
		textarea:focus ~ label,
		textarea:not(:placeholder-shown) ~ label,
		&.floated label {
			top: calc(0.5em + 0.2em);
		}
	}

	input:focus ~ label,
	input:not(:placeholder-shown) ~ label,
	textarea:focus ~ label,
	textarea:not(:placeholder-shown) ~ label,
	.floated label {
		font-size: 0.8em;
	}

	.count {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: max(0.9em, 13px);
		font-style: oblique;
		opacity: 0;
		visibility: hidden;

		&.out {
			color: var(--color-error);
		}
	}

	input:focus ~ label .count,
	input:not(:placeholder-shown) ~ label .count,
	textarea:focus ~ label .count,
	textarea:not(:placeholder-shown) ~ label .count {
		opacity: 1;
		visibility: visible;
	}

	.message {
		margin-block-start: 6px;
		color: var(--color-text-muted);
		@include mixins.body-small;

		&.error {
			color: var(--color-error);
		}
	}
</style>
