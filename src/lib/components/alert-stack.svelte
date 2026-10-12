<script lang="ts">
	import { flip } from 'svelte/animate';
	import { backOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { alerts } from '$lib/utils/alerts.svelte';
	import Alert from './alert.svelte';

	// Only called while an alert exists, so it never runs during server rendering.
	const duration = (ms: number) =>
		matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
</script>

<!-- Mount once in a layout. Alerts from `alerts.show()` stack here, newest at the bottom. -->
<div class="alert-stack" role="region" aria-label="Notifications">
	{#each alerts.list as alert (alert.id)}
		<div
			class="slot"
			animate:flip={{ duration: duration(300) }}
			in:fly={{ y: 48, duration: duration(500), easing: backOut }}
			out:fade={{ duration: duration(200) }}
		>
			<Alert {...alert} onclose={() => alerts.dismiss(alert.id)} />
		</div>
	{/each}
</div>

<style lang="scss">
	@use 'base/mixins';

	.alert-stack {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: var(--z-alert);
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 12px;
		width: min(420px, calc(100% - 32px));
		pointer-events: none;

		@include mixins.max-sm {
			right: 16px;
			left: 16px;
			width: auto;
		}
	}

	.slot {
		width: 100%;
	}
</style>
