<script lang="ts">
	import Button, { type ButtonProps } from './button.svelte';
	import { magnet } from '$lib/attachments/magnet';

	type Props = {
		primary: Omit<ButtonProps, 'type'>;
		secondary?: Omit<ButtonProps, 'type'>;
		justify?: 'start' | 'center';
	};

	let { primary, secondary, justify = 'start' }: Props = $props();
</script>

<div class="cta-group {justify}">
	<Button
		{...primary}
		type="solid"
		{@attach magnet({
			x: 0.5,
			y: 0.75,
			returnDuration: 350,
			returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
		})}
	/>
	{#if secondary}
		<Button {...secondary} type="text" />
	{/if}
</div>

<style lang="scss">
	.cta-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cta-group-gap);
	}

	.center {
		justify-content: center;
	}
</style>
