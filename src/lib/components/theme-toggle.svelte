<script lang="ts">
	import { toggleSlider } from '$lib/attachments/toggle-slider';
	import Icon from './icon.svelte';
	import { theme, setTheme, type ThemePreference } from '$lib/theme.svelte';

	const options: { value: ThemePreference; label: string; icon: string }[] = [
		{ value: 'system', label: 'System', icon: 'desktop' },
		{ value: 'light', label: 'Light', icon: 'sun' },
		{ value: 'dark', label: 'Dark', icon: 'moon' }
	];
</script>

<fieldset class="theme-toggle" {@attach toggleSlider({ options: 'label' })}>
	<legend class="visually-hidden">Display theme</legend>
	{#each options as { value, label, icon } (value)}
		<label title="{label} theme">
			<input
				type="radio"
				name="theme"
				{value}
				checked={theme.preference === value}
				onchange={() => setTheme(value)}
			/>
			<Icon name={icon} />
			<span class="visually-hidden">{label}</span>
		</label>
	{/each}
</fieldset>

<style lang="scss">
	@use 'base/mixins';

	.theme-toggle {
		display: inline-flex;
		gap: 4px;
		padding: 2px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		--slider-radius: calc(var(--radius) - 2px);
	}

	label {
		position: relative;
		display: inline-flex;
		padding: 6px;
		border-radius: calc(var(--radius) - 2px);
		font-size: 16px;
		cursor: pointer;
		color: var(--color-text-muted);
		opacity: 1;

		@include mixins.mq-motion-allow {
			transition: color var(--duration) var(--ease);
		}

		&:has(input:checked) {
			color: var(--color-text);
		}

		&:has(input:focus-visible) {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 2px;
		}

		@include mixins.mq-mouse {
			&:hover {
				color: var(--color-text);
			}
		}
	}

	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
</style>
