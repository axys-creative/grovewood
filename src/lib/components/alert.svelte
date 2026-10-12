<script module lang="ts">
	import type { AlertOptions } from '$lib/utils/alerts.svelte';

	export type AlertProps = AlertOptions & {
		/** Called when the close button is pressed or the timer runs out. */
		onclose?: () => void;
	};
</script>

<script lang="ts">
	import Button from './button.svelte';
	import Icon from './icon.svelte';

	const icons = {
		success: 'check-circle',
		info: 'info-circle',
		warning: 'warning-triangle',
		error: 'x-octagon'
	};

	let {
		type = 'info',
		title,
		message,
		links = [],
		autoClose = 0,
		timer = false,
		leftBorder = false,
		onclose
	}: AlertProps = $props();

	let paused = $state(false);

	// Hovering or focusing an alert holds the countdown, so there is time to read it and use its links.
	let remaining: number | undefined;
	$effect(() => {
		if (autoClose <= 0 || paused) return;

		remaining ??= autoClose;
		const startedAt = performance.now();
		const timeout = setTimeout(() => onclose?.(), remaining);
		return () => {
			clearTimeout(timeout);
			remaining! -= performance.now() - startedAt;
		};
	});
</script>

<div
	class="alert {type}"
	class:left-border={leftBorder}
	role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
	onpointerenter={() => (paused = true)}
	onpointerleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	<Icon name={icons[type]} class="icon" />

	<div class="content">
		<strong>{title}</strong>
		{#if message}<p>{message}</p>{/if}
		{#if links.length}
			<div class="links">
				{#each links.slice(0, 2) as link (`${link.url}|${link.text}`)}
					<Button {...link} type="underline" size="sm" />
				{/each}
			</div>
		{/if}
	</div>

	<Button
		class="close"
		iconStart="x-lg"
		textDescription="Close alert"
		type="text"
		onclick={() => onclose?.()}
	/>

	{#if timer && autoClose > 0}
		<div
			class="timer"
			class:paused
			style="animation-duration: {autoClose}ms"
			aria-hidden="true"
		></div>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.alert {
		--accent: var(--color-text);

		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 12px;
		width: 100%;
		padding: 12px 8px 12px 12px;
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-surface);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
		pointer-events: auto;
	}

	.success {
		--accent: var(--color-success);
	}

	.info {
		--accent: var(--color-info);
	}

	.warning {
		--accent: var(--color-warning);
	}

	.error {
		--accent: var(--color-error);
	}

	.left-border {
		border-inline-start: 6px solid var(--accent);
	}

	.alert :global(.icon) {
		--icon-size: 2ch;

		margin-block-start: 2px;
		background: var(--accent);
	}

	.content {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 6px;
		min-width: 0;

		p {
			opacity: 0.85;
		}
	}

	.links {
		display: flex;
		gap: 12px;
	}

	.alert :global(.close) {
		--btn-padding-icon: 4px;

		margin-inline-start: auto;
		color: var(--color-text);
	}

	.timer {
		position: absolute;
		inset: 0 auto auto 0;
		width: 100%;
		height: 3px;
		background: var(--accent);
		transform: scaleX(0);
		transform-origin: left;

		@include mixins.mq-motion-allow {
			animation: run linear forwards;
		}

		&.paused {
			animation-play-state: paused;
		}
	}

	@keyframes run {
		to {
			transform: scaleX(1);
		}
	}
</style>
