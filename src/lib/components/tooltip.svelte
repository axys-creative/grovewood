<script module lang="ts">
	export type TooltipPlace =
		'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'left' | 'right';

	export type TooltipProps = {
		message: string;
		/** Text that triggers the tooltip. Without it, an icon does. */
		text?: string;
		/** Icon name from `static/icons`, used when there is no `text`. */
		icon?: string;
		/** Where the message sits on desktop. */
		place?: TooltipPlace;
		/** Where the message sits below the lg breakpoint. Left and right would run off small screens. */
		placeSm?: Exclude<TooltipPlace, 'left' | 'right'>;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		/** Adds a small pointer to the message bubble. */
		includePoint?: boolean;
	};
</script>

<script lang="ts">
	import Icon from './icon.svelte';

	let {
		message,
		text,
		icon = 'info-circle',
		place = 'top',
		placeSm = 'top',
		size = 'md',
		includePoint = false
	}: TooltipProps = $props();

	const id = $props.id();

	let hovered = $state(false);
	let focused = $state(false);
	let dismissed = $state(false);

	const open = $derived((hovered || focused) && !dismissed);

	// Escape closes the message until the pointer or focus comes back.
	const onkeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && open) dismissed = true;
	};

	$effect(() => {
		if (!hovered && !focused) dismissed = false;
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	class="tooltip"
	class:open
	class:point={includePoint}
	data-place={place}
	data-place-sm={placeSm}
	data-size={size}
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
	{onkeydown}
>
	<button
		class="trigger"
		type="button"
		aria-describedby={id}
		aria-label={text ? undefined : 'More information'}
	>
		{#if text}
			<span class="trigger-text">{text}</span>
		{:else}
			<Icon name={icon} />
		{/if}
	</button>
	<span class="message" {id} role="tooltip">{message}</span>
</span>

<style lang="scss">
	@use 'base/mixins';

	.tooltip {
		--void: 12px; // gap between the trigger and the message
		--slide: 12px; // how far the message travels while appearing
		--point: 16px;
		--tx: 0px;
		--ty: 0px;
		--hx: 0px;
		--hy: 0px;

		position: relative;
		display: inline-block;
	}

	.trigger {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-size: 20px;
		cursor: help;
		vertical-align: middle;
	}

	.trigger-text {
		padding-inline: 0.5ch;
		font-size: var(--btn-font-size);
		text-decoration: underline dotted var(--color-secondary);
		text-underline-offset: 0.5ch;
	}

	.message {
		position: absolute;
		z-index: 1;
		width: 100vw;
		padding: var(--btn-padding);
		border-radius: var(--radius-btn);
		background: var(--color-surface);
		font-size: 14px;
		text-align: start;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		translate: calc(var(--tx) + var(--hx)) calc(var(--ty) + var(--hy));

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.24s ease,
				translate 0.24s ease,
				visibility 0.24s;
		}

		// Keeps the message open while the pointer crosses the gap to it.
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
		}
	}

	.open .message {
		--hx: 0px;
		--hy: 0px;

		opacity: 1;
		visibility: visible;
		pointer-events: all;
	}

	.point .message::after {
		content: '';
		position: absolute;
		z-index: -1;
		border-top: var(--point) solid var(--color-surface);
		border-left: var(--point) solid transparent;
		border-radius: 2px;
		background: inherit;
		pointer-events: none;
	}

	// Placements. `--t*` is the resting position, `--h*` the extra offset it slides in from.
	@mixin top($align: center) {
		bottom: calc(100% + var(--void));
		--ty: 0px;
		--hy: var(--slide);

		@if $align == center {
			left: 50%;
			--tx: -50%;
			text-align: center;
		} @else if $align == right {
			left: 0;
			--tx: calc(var(--point) / -4);
		} @else {
			right: 0;
			--tx: calc(var(--point) / 4);
		}

		&::before {
			margin-block-end: calc(var(--void) * -1);
		}

		&::after {
			bottom: 0;
			rotate: 135deg;

			@if $align == center {
				left: 50%;
				translate: -50% 15%;
			} @else if $align == right {
				left: calc(var(--point) / 2);
				translate: 0 15%;
			} @else {
				right: calc(var(--point) / 2);
				translate: 0 15%;
			}
		}
	}

	@mixin bottom($align: center) {
		top: calc(100% + var(--void));
		--ty: 0px;
		--hy: calc(var(--slide) * -1);

		@if $align == center {
			left: 50%;
			--tx: -50%;
			text-align: center;
		} @else if $align == right {
			left: 0;
			--tx: calc(var(--point) / -4);
		} @else {
			right: 0;
			--tx: calc(var(--point) / 4);
		}

		&::before {
			margin-block-start: calc(var(--void) * -1);
		}

		&::after {
			top: 0;
			rotate: -45deg;

			@if $align == center {
				left: 50%;
				translate: -50% -15%;
			} @else if $align == right {
				left: calc(var(--point) / 2);
				translate: 0 -15%;
			} @else {
				right: calc(var(--point) / 2);
				translate: 0 -15%;
			}
		}
	}

	@mixin right {
		left: calc(100% + var(--void));
		top: 50%;
		--tx: 0px;
		--ty: -50%;
		--hx: calc(var(--slide) * -1);

		&::before {
			margin-inline-start: calc(var(--void) * -1);
		}

		&::after {
			top: 50%;
			left: 0;
			translate: -15% -50%;
			rotate: -135deg;
		}
	}

	@mixin left {
		right: calc(100% + var(--void));
		top: 50%;
		--tx: 0px;
		--ty: -50%;
		--hx: var(--slide);
		text-align: center;

		&::before {
			margin-inline-end: calc(var(--void) * -1);
		}

		&::after {
			top: 50%;
			right: 0;
			translate: 15% -50%;
			rotate: 45deg;
		}
	}

	@include mixins.min-lg {
		.tooltip[data-place='top'] .message {
			@include top(center);
		}
		.tooltip[data-place='top-right'] .message {
			@include top(right);
		}
		.tooltip[data-place='top-left'] .message {
			@include top(left);
		}
		.tooltip[data-place='bottom'] .message {
			@include bottom(center);
		}
		.tooltip[data-place='bottom-right'] .message {
			@include bottom(right);
		}
		.tooltip[data-place='bottom-left'] .message {
			@include bottom(left);
		}
		.tooltip[data-place='right'] .message {
			@include right;
		}
		.tooltip[data-place='left'] .message {
			@include left;
		}
	}

	@include mixins.max-lg {
		.tooltip[data-place-sm='top'] .message {
			@include top(center);
		}
		.tooltip[data-place-sm='top-right'] .message {
			@include top(right);
		}
		.tooltip[data-place-sm='top-left'] .message {
			@include top(left);
		}
		.tooltip[data-place-sm='bottom'] .message {
			@include bottom(center);
		}
		.tooltip[data-place-sm='bottom-right'] .message {
			@include bottom(right);
		}
		.tooltip[data-place-sm='bottom-left'] .message {
			@include bottom(left);
		}
	}

	// Must come after the placements so the open state wins.
	.tooltip.open .message {
		--hx: 0px;
		--hy: 0px;
	}

	.tooltip[data-size='xs'] .message {
		max-width: 140px;
	}

	.tooltip[data-size='sm'] .message {
		max-width: 250px;
	}

	.tooltip[data-size='md'] .message {
		max-width: 420px;

		@include mixins.max-md {
			max-width: 360px;
		}

		@include mixins.max-sm {
			max-width: 250px;
		}
	}

	.tooltip[data-size='lg'] .message {
		max-width: 650px;

		@include mixins.max-lg {
			max-width: 450px;
		}

		@include mixins.max-md {
			max-width: 360px;
		}

		@include mixins.max-sm {
			max-width: 250px;
		}
	}
</style>
