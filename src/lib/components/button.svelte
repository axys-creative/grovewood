<script module lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';

	export type ButtonProps = {
		text?: string;
		textDescription?: string;
		url?: string;
		newTab?: boolean;
		type?: 'solid' | 'outline' | 'underline' | 'text';
		htmlType?: 'button' | 'submit' | 'reset';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		current?: boolean;
		expanded?: boolean;
		controls?: string;
		iconStart?: string;
		iconEnd?: string;
		/** Draws a ring around the end icon on hover. */
		iconCircle?: boolean;
		/** An attachment for the end icon alone, e.g. `magnet()` to make only the icon follow the mouse. */
		iconEndAttach?: Attachment<HTMLElement>;
		class?: string;
		onclick?: MouseEventHandler<HTMLButtonElement>;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'onclick'>;
</script>

<script lang="ts">
	import { isCurrentPage, onCurrentPageClick } from '$lib/utils/current-page';
	import Icon from './icon.svelte';

	let {
		text,
		textDescription,
		url,
		newTab = false,
		type = 'solid',
		htmlType = 'button',
		size = 'md',
		disabled = false,
		current = false,
		expanded,
		controls,
		iconStart,
		iconEnd,
		iconCircle = false,
		iconEndAttach,
		class: className,
		onclick,
		...rest
	}: ButtonProps = $props();

	const label = $derived(
		textDescription && newTab ? `${textDescription} (opens in a new tab)` : textDescription
	);
	const onCurrentPage = $derived(!newTab && isCurrentPage(url));
	const classes = $derived(`button ${type} ${size} ${text ? '' : 'icon-only'} ${className ?? ''}`);
</script>

{#snippet content()}
	{#if iconStart}<Icon name={iconStart} />{/if}
	{#if text}<span class="label">{text}</span>{/if}
	{#if newTab && !textDescription}
		<span class="visually-hidden">(opens in a new tab)</span>
	{/if}
	{#if iconEnd}
		<span class="end" {@attach iconEndAttach}>
			<Icon name={iconEnd} />
			{#if iconCircle}
				<svg class="circle" viewBox="0 0 48 48" fill="none" aria-hidden="true">
					<path
						pathLength="1"
						d="M24.014 1C36.7101 1.00759 47 11.3021 47 24C47 36.7025 36.7025 47 24 47C11.2975 47 1 36.7025 1 24C1 11.3021 11.2899 1.00759 23.986 1"
					/>
				</svg>
			{/if}
		</span>
	{/if}
{/snippet}

{#if url}
	<a
		{...rest}
		class={classes}
		href={url}
		aria-label={label}
		aria-current={current || onCurrentPage ? 'page' : undefined}
		onclick={onCurrentPage ? onCurrentPageClick : undefined}
		aria-expanded={expanded}
		aria-controls={controls}
		target={newTab ? '_blank' : undefined}
		rel={newTab ? 'noopener noreferrer' : undefined}
	>
		{@render content()}
	</a>
{:else}
	<button
		{...rest}
		class={classes}
		type={htmlType}
		aria-label={label}
		aria-current={current ? 'true' : undefined}
		aria-expanded={expanded}
		aria-controls={controls}
		{disabled}
		{onclick}
	>
		{@render content()}
	</button>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.button {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		gap: var(--btn-gap);
		padding: 0;
		border: 0;
		border-radius: var(--radius-btn);
		background: none;
		font-family: var(--font-body);
		font-size: var(--btn-font-size);
		font-weight: var(--btn-font-weight);
		line-height: 1.2;
		text-decoration: none;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				background var(--duration) var(--ease),
				color var(--duration) var(--ease),
				border-color var(--duration) var(--ease),
				scale var(--duration) var(--ease);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			pointer-events: none;
		}
	}

	.solid,
	.outline {
		padding: var(--btn-padding);
		border: 1px solid var(--color-accent);
	}

	.solid {
		background: var(--color-accent);
		color: var(--color-on-accent);

		@include mixins.desktop-hover {
			background: transparent;
			color: var(--color-accent-text);
		}
	}

	.outline {
		color: var(--color-text);

		@include mixins.desktop-hover {
			color: var(--color-accent-text);

			@include mixins.mq-motion-allow {
				scale: 0.96;
			}
		}
	}

	.label {
		position: relative;
	}

	.end {
		position: relative;
		display: inline-flex;
	}

	.circle {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 1.5em;
		height: 1.5em;
		translate: -50% -50%;
		pointer-events: none;

		path {
			stroke: currentColor;
			stroke-width: 2px;
			stroke-dasharray: 1;
			stroke-dashoffset: 1;

			@include mixins.mq-motion-allow {
				transition: stroke-dashoffset 1.2s var(--ease);
			}
		}
	}

	.button {
		@include mixins.desktop-hover {
			.circle path {
				stroke-dashoffset: 0;
			}
		}
	}

	.button > :global(.icon),
	.end > :global(.icon) {
		@include mixins.mq-motion-allow {
			transition: scale var(--duration) var(--ease);
		}
	}

	.button[aria-expanded='true'] > :global(.icon:last-child),
	.button[aria-expanded='true'] > .end:last-child > :global(.icon) {
		scale: 1 -1;
	}

	.underline {
		color: var(--color-text);

		.label::before {
			content: '';
			position: absolute;
			inset: auto auto 0 0;
			width: 100%;
			height: 1px;
			background: currentColor;

			@include mixins.mq-motion-allow {
				transition:
					width var(--duration) var(--ease),
					inset var(--duration) var(--ease);
			}
		}

		@include mixins.desktop-hover {
			.label::before {
				inset: auto 0 0 auto;
				width: 0;
			}
		}
	}

	.text {
		color: var(--color-accent-text);

		@include mixins.desktop-hover {
			color: var(--color-text);
		}
	}

	.sm {
		--btn-font-size: 13px;
	}

	.lg {
		--btn-font-size: 18px;
	}

	.solid.sm,
	.outline.sm {
		padding: var(--btn-padding-sm);
	}

	.solid.lg,
	.outline.lg {
		padding: var(--btn-padding-lg);
	}

	.button.icon-only {
		padding: var(--btn-padding-icon);
	}
</style>
