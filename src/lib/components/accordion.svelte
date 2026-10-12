<script module lang="ts">
	export type AccordionItem = {
		title: string;
		/** Trusted HTML from the CMS, so it can hold links and other markup. */
		content: string;
		/** Starts this item open. */
		defaultOpen?: boolean;
	};

	export type AccordionProps = {
		items: AccordionItem[];
		/** Icon name from `static/icons`, shown at the end of each title and flipped when open. */
		icon?: string;
		/** A plus sign that turns into a minus, instead of an icon. */
		plus?: boolean;
		singleOpen?: boolean;
		/** Which items start open: `true` for all, an item's number (from 0), or a list of them. With `singleOpen` only the first opens. */
		defaultOpen?: boolean | number | number[];
		/** A button that opens or closes every item. Ignored with `singleOpen`. */
		toggleAll?: boolean;
		toggleAllTextOpen?: string;
		toggleAllTextClose?: string;
	};
</script>

<script lang="ts">
	import { createDisclosure, startingOpen } from '$lib/utils/disclosure.svelte';
	import Button from './button.svelte';
	import Icon from './icon.svelte';
	import RichText from './rich-text.svelte';

	let {
		items,
		icon,
		plus = false,
		singleOpen = false,
		defaultOpen = false,
		toggleAll = false,
		toggleAllTextOpen = 'Open All',
		toggleAllTextClose = 'Close All'
	}: AccordionProps = $props();

	const id = $props.id();
	const disclosure = createDisclosure(
		() => items.length,
		() => singleOpen,
		() => startingOpen(items, defaultOpen)
	);

	// Flips only at the extremes, so a mix of open and closed keeps the button's last label.
	let allExpanded = $state(false);
	$effect(() => {
		if (disclosure.allOpen) allExpanded = true;
		else if (disclosure.noneOpen) allExpanded = false;
	});
</script>

<div class="accordion" {id}>
	{#if toggleAll && !singleOpen}
		<Button
			text={allExpanded ? toggleAllTextClose : toggleAllTextOpen}
			type="outline"
			size="sm"
			expanded={allExpanded}
			controls={id}
			onclick={() => (allExpanded ? disclosure.closeAll() : disclosure.openAll())}
		/>
	{/if}

	{#each items as item, index (index)}
		{@const open = disclosure.isOpen(index)}
		<div class="item">
			<h3 class="heading">
				<button
					type="button"
					class="trigger"
					aria-expanded={open}
					aria-controls="{id}-panel-{index}"
					id="{id}-trigger-{index}"
					onclick={() => disclosure.toggle(index)}
				>
					<span class="title">{item.title}</span>
					{#if icon}<Icon name={icon} class="marker" />{/if}
					{#if plus}
						<span class="plus" aria-hidden="true"><span></span><span></span></span>
					{/if}
				</button>
			</h3>
			<div
				class="panel"
				id="{id}-panel-{index}"
				role="region"
				aria-labelledby="{id}-trigger-{index}"
				inert={!open}
			>
				<div class="inner">
					<p><RichText text={item.content} /></p>
				</div>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	@use 'base/mixins';

	.accordion {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
	}

	.accordion > :global(.button) {
		margin-block-end: 12px;
	}

	.item {
		width: 100%;
		border-bottom: 1px solid var(--color-border);

		@include mixins.mq-motion-allow {
			transition: border-color var(--duration) var(--ease);
		}

		&:has(.trigger:hover),
		&:has(.trigger:focus-visible) {
			@media (hover: hover) and (pointer: fine) {
				border-color: var(--color-accent);
			}
		}
	}

	.heading {
		font: inherit;
		letter-spacing: normal;
	}

	.trigger {
		@include mixins.body-large;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		width: 100%;
		padding: 12px 0;
		border: 0;
		background: none;
		color: inherit;
		text-align: left;
		cursor: pointer;

		@include mixins.max-sm {
			gap: 12px;
		}
	}

	.trigger :global(.marker),
	.plus {
		--icon-size: 2.5ch;

		flex-shrink: 0;

		@include mixins.mq-motion-allow {
			transition: scale var(--duration) var(--ease);
		}
	}

	.trigger :global(.marker) {
		width: var(--icon-size);
		height: var(--icon-size);
	}

	.trigger[aria-expanded='true'] :global(.marker) {
		scale: 1 -1;
	}

	.plus {
		position: relative;
		width: var(--icon-size);
		height: var(--icon-size);

		span {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 1.25ch;
			height: 2px;
			background: currentColor;
			translate: -50% -50%;

			@include mixins.mq-motion-allow {
				transition: rotate var(--duration) var(--ease);
			}

			&:last-child {
				rotate: 90deg;
			}
		}
	}

	.trigger[aria-expanded='true'] .plus span:last-child {
		rotate: 0deg;
	}

	.panel {
		display: grid;
		grid-template-rows: 0fr;
		visibility: hidden;

		@include mixins.mq-motion-allow {
			transition:
				grid-template-rows var(--duration) var(--ease),
				visibility var(--duration);
		}

		&:not([inert]) {
			grid-template-rows: 1fr;
			visibility: visible;
			padding-block-end: 12px;
		}
	}

	.inner {
		overflow: hidden;
	}
</style>
