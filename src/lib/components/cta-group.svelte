<script lang="ts">
	import Button, { type ButtonProps } from './button.svelte';
	import { magnet } from '$lib/attachments/magnet';
	import { textRoll } from '$lib/attachments/text-roll';

	type Props = {
		primary: ButtonProps;
		secondary?: ButtonProps;
		justify?: 'start' | 'center';
	};

	let { primary, secondary, justify = 'start' }: Props = $props();

	const pull = () =>
		magnet({
			x: 0.24,
			y: 0.64,
			returnDuration: 350,
			returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
		});
</script>

<div class="cta-group {justify}">
	<Button {...primary} type={primary.type ?? 'solid'} {@attach textRoll()} {@attach pull()} />
	{#if secondary}
		<Button
			{...secondary}
			type={secondary.type ?? 'outline'}
			{@attach textRoll()}
			{@attach pull()}
		/>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.cta-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cta-group-gap);

		@include mixins.max-sm {
			flex-direction: column;
			align-items: stretch;
			width: 100%;
		}
	}

	.center {
		justify-content: center;
	}
</style>
