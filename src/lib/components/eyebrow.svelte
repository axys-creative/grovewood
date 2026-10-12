<script lang="ts">
	import Icon from './icon.svelte';

	type Props = {
		text?: string;
		/** Icon name from `static/icons`. */
		icon?: string;
		direction?: 'row' | 'column';
		/** A status dot before the text, such as "available for work". `true` is `pulse`. */
		dot?: boolean | 'pulse' | 'sonar';
	};

	let { text, icon, direction = 'row', dot = false }: Props = $props();

	const dotStyle = $derived(
		dot === true ? 'pulse' : dot === 'pulse' || dot === 'sonar' ? dot : null
	);
</script>

{#if icon || text}
	<div class="eyebrow" class:column={direction === 'column'}>
		{#if dotStyle}
			<span class="eyebrow-dot {dotStyle}" aria-hidden="true"></span>
		{/if}
		{#if icon}
			<span class="eyebrow-icon"><Icon name={icon} /></span>
		{/if}
		{#if text}
			<span class="eyebrow-text">{text}</span>
		{/if}
	</div>
{/if}

<style lang="scss">
	.eyebrow {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
		color: var(--color-accent-text);
	}

	.eyebrow.column {
		flex-direction: column;
		align-items: flex-start;
	}

	.eyebrow-icon {
		display: inline-flex;
	}

	.eyebrow-dot {
		flex: none;
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
		background: var(--color-success);
		box-shadow: 0 0 0.5rem 0.0625rem var(--color-success);
	}

	.eyebrow-dot.pulse {
		animation: eyebrow-dot-pulse 2.4s ease-in-out infinite;
	}

	.eyebrow-dot.sonar {
		position: relative;

		&::before,
		&::after {
			content: '';
			position: absolute;
			inset: -1px;
			border: 1px solid var(--color-success);
			border-radius: 50%;
			opacity: 0;
			animation: eyebrow-dot-ping 2.8s ease-out infinite;
		}

		&::after {
			animation-delay: 1.4s;
		}
	}

	@keyframes eyebrow-dot-ping {
		0% {
			transform: scale(1);
			opacity: 0.8;
		}
		100% {
			transform: scale(2.6);
			opacity: 0;
		}
	}

	@keyframes eyebrow-dot-pulse {
		50% {
			opacity: 0.4;
			box-shadow: 0 0 0.125rem 0 var(--color-success);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.eyebrow-dot.pulse {
			animation: none;
		}

		.eyebrow-dot.sonar::before,
		.eyebrow-dot.sonar::after {
			display: none;
		}
	}

	.eyebrow-text {
		font-family: var(--font-mono);
		font-size: 14px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
