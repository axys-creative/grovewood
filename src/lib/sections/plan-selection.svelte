<script module lang="ts">
	import type { ButtonProps } from '$lib/components/button.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type Plan = {
		title: string;
		/** The price per month on monthly billing, e.g. `1,995`. */
		priceMonthly: string;
		/** The price per month on quarterly billing. */
		priceQuarterly?: string;
		/** What a quarterly payment adds up to. */
		totalQuarterly?: string;
		/** What quarterly billing saves, shown in the message once it is picked, e.g. `$900`. */
		savingsQuarterly?: string;
		/** A line of text, or `{ text, strong }` to make it bold. */
		features: (string | { text: string; strong?: boolean })[];
		ctaMonthly: Pick<ButtonProps, 'text' | 'textDescription' | 'url' | 'newTab'>;
		ctaQuarterly?: Pick<ButtonProps, 'text' | 'textDescription' | 'url' | 'newTab'>;
		/** Stands out from the others with an accent background. */
		featured?: boolean;
	};

	export type PlanSelectionProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description'
	> & {
		plans: Plan[];
		/** Shows the Monthly / Quarterly switch. Plans then need their quarterly fields. */
		priceToggle?: boolean;
		/** The saving named in the switch's tooltip and the cards' message, e.g. `15%`. */
		discount?: string;
		/** The billing that starts selected. */
		defaultBilling?: 'monthly' | 'quarterly';
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import Button from '$lib/components/button.svelte';
	import Icon from '$lib/components/icon.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import { animate } from '$lib/attachments/animate';
	import { toggleSlider } from '$lib/attachments/toggle-slider';
	import { preloadScramble, scrambleTo } from '$lib/utils/scramble';

	let {
		plans,
		priceToggle = false,
		discount = '20%',
		defaultBilling = 'monthly',
		id,
		class: className,
		...copy
	}: PlanSelectionProps = $props();

	const name = $props.id();
	let billing = $state<'monthly' | 'quarterly'>(untrack(() => defaultBilling));
	const quarterly = $derived(priceToggle && billing === 'quarterly');

	const initial = untrack(() => billing);
	const priceOf = (plan: Plan, period: 'monthly' | 'quarterly') =>
		period === 'quarterly' ? (plan.priceQuarterly ?? plan.priceMonthly) : plan.priceMonthly;
	const messageOf = (plan: Plan, period: 'monthly' | 'quarterly') =>
		period === 'quarterly'
			? `You’re saving ${plan.savingsQuarterly ?? discount} quarterly!`
			: `Save ${discount} with quarterly billing!`;

	// Scrambles the text into the new one whenever the billing changes. The first run keeps the text the server sent.
	const swap =
		(text: () => string): Attachment<HTMLElement> =>
		(el) => {
			const next = text();
			if (el.textContent?.trim() === next) return;
			if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
				el.textContent = next;
				return;
			}
			preloadScramble();
			scrambleTo(el, next, { duration: 0.6 });
		};

	const featureText = (feature: Plan['features'][number]) =>
		typeof feature === 'string' ? feature : feature.text;
	const featureStrong = (feature: Plan['features'][number]) =>
		typeof feature !== 'string' && !!feature.strong;
</script>

<section {id} class="plan-selection {className ?? ''}" data-billing={billing}>
	<div class="inner">
		<SectionCopy level={2} align="center" {...copy} />

		{#if priceToggle}
			<div class="billing">
				<fieldset class="billing-toggle" {@attach toggleSlider({ options: 'label' })}>
					<legend class="visually-hidden">Billing period</legend>
					{#each ['monthly', 'quarterly'] as const as period (period)}
						<label>
							<input type="radio" {name} value={period} bind:group={billing} />
							{period === 'monthly' ? 'Monthly' : 'Quarterly'}
						</label>
					{/each}
				</fieldset>
				<span class="billing-tip">
					<Tooltip
						message="Save {discount} with quarterly billing!"
						size="xs"
						place="right"
						placeSm="bottom-left"
						includePoint
					/>
				</span>
			</div>
		{/if}

		<div class="plans" {@attach animate({ stagger: 0.125 })}>
			{#each plans as plan (plan.title)}
				<article class="plan" class:featured={plan.featured}>
					<h3 class="h2">{plan.title}</h3>

					<div class="price-group">
						<div class="line" aria-hidden={priceToggle ? 'true' : undefined}>
							<hr />
							<p class="price">
								<span>$</span>
								<span class="cost" {@attach swap(() => priceOf(plan, billing))}
									>{priceOf(plan, initial)}</span
								>
								<span class="frequency">/month</span>
							</p>
							<hr />
						</div>
						{#if priceToggle}
							<span class="visually-hidden">
								${priceOf(plan, billing)} a month, billed {billing}
							</span>
							<p class="total" class:shown={quarterly} aria-hidden="true">
								$<span
									class="amount"
									{@attach swap(() =>
										billing === 'quarterly' ? (plan.totalQuarterly ?? '') : plan.priceMonthly
									)}>{initial === 'quarterly' ? plan.totalQuarterly : plan.priceMonthly}</span
								>
								billed
								<span class="period" {@attach swap(() => billing)}>{initial}</span>
							</p>
						{/if}
					</div>

					<ul class="perks">
						{#each plan.features as feature, index (index)}
							<li>
								<Icon name="check-circle" />
								{#if featureStrong(feature)}
									<strong>{featureText(feature)}</strong>
								{:else}
									<span>{featureText(feature)}</span>
								{/if}
							</li>
						{/each}
					</ul>

					{#if priceToggle}
						<p class="message" {@attach swap(() => messageOf(plan, billing))}>
							{messageOf(plan, initial)}
						</p>
					{/if}

					{#if quarterly && plan.ctaQuarterly}
						<Button {...plan.ctaQuarterly} iconEnd="new-tab" type="solid" />
					{:else}
						<Button {...plan.ctaMonthly} iconEnd="new-tab" type="solid" />
					{/if}
				</article>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
		text-align: center;
	}

	.billing {
		position: relative;
		z-index: 2;
	}

	.billing-toggle {
		display: inline-flex;
		gap: 4px;
		margin: 0;
		padding: 4px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		--slider-radius: calc(var(--radius) - 2px);
		--slider-color: var(--color-accent);
	}

	label {
		position: relative;
		padding: 8px 20px;
		border-radius: calc(var(--radius) - 2px);
		color: var(--color-text-muted);
		cursor: pointer;

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
	}

	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.billing-tip {
		position: absolute;
		top: 50%;
		right: 0;
		translate: calc(100% + 1ch) -50%;

		@include mixins.max-md {
			position: static;
			display: block;
			margin-block-start: 12px;
			translate: none;
		}
	}

	.plans {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
		gap: 16px;
		width: 100%;
		margin-block-start: 32px;
	}

	.plan {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 64px 24px 40px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-bg);

		@include mixins.max-sm {
			padding: 48px 16px 32px;
		}
	}

	.price-group {
		align-self: stretch;
	}

	.line {
		display: flex;
		align-items: center;
		gap: 1ch;

		hr {
			flex: 1;
			height: 1px;
			margin: 0;
			border: 0;
			background: linear-gradient(90deg, transparent, var(--color-border), transparent);
		}
	}

	.price {
		display: inline-flex;
		margin: 0;
		font-size: 24px;
		font-variant-numeric: tabular-nums;

		@include mixins.mq-motion-allow {
			transition: color var(--duration) var(--ease);
		}
	}

	.frequency {
		white-space: nowrap;
	}

	.total {
		margin: 8px 0 0;
		color: var(--color-text-muted);
		font-size: 14px;
		opacity: 0;
		translate: 0 8px;

		@include mixins.mq-motion-allow {
			transition:
				opacity var(--duration) var(--ease),
				translate var(--duration) var(--ease);
		}
	}

	.shown {
		opacity: 1;
		translate: 0 0;
	}

	.perks {
		display: flex;
		flex-direction: column;
		gap: 1ch;
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			display: flex;
			align-items: center;
			gap: 0.5ch;
			text-align: start;
		}
	}

	.message {
		margin: 0;
		color: var(--color-accent-text);
		font-family: var(--font-mono);
		font-size: 14px;
		min-height: 2.8em;

		@include mixins.mq-motion-allow {
			transition: color var(--duration) var(--ease);
		}
	}

	// Quarterly turns the price, the total and the message green.
	[data-billing='quarterly'] {
		.price,
		.total,
		.message {
			color: var(--color-success);
		}

		// Plain green would wash out on the accent, so the featured card uses a deep one.
		.featured {
			.price,
			.total,
			.message {
				color: color-mix(in srgb, var(--color-success) 35%, black);
			}
		}
	}

	// The featured card is always light on a bright gradient, in either theme.
	.featured {
		--featured-text: #0a0a0a;

		border-color: transparent;
		background: linear-gradient(110deg, #fff -50%, var(--color-accent) 30% 70%, #fff 150%);
		color: var(--featured-text);

		.message,
		.price,
		.total {
			color: var(--featured-text);
		}

		hr {
			background: linear-gradient(90deg, transparent, var(--featured-text), transparent);
		}

		&.plan :global(.button.solid) {
			border-color: #fff;
			background: #fff;
			color: var(--featured-text);

			@include mixins.desktop-hover {
				background: transparent;
				color: #fff;
			}
		}
	}
</style>
