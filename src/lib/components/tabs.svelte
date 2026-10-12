<script module lang="ts">
	export type TabItem = {
		/** The tab's button text. */
		label: string;
		title: string;
		description: string;
		/** An image shown with the text. */
		image?: { src: string; alt?: string };
	};

	export type TabsProps = {
		tabs: TabItem[];
		/** The tab that starts selected, counting from 0. */
		defaultTab?: number;
		/** `underline` draws a line under the selected tab; `solid` fills it. */
		variant?: 'underline' | 'solid';
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { tabs as tabsAttachment } from '$lib/attachments/tabs';
	import { toggleSlider } from '$lib/attachments/toggle-slider';

	let { tabs, defaultTab = 0, variant = 'underline', class: className }: TabsProps = $props();
</script>

<div class="tabs {variant} {className ?? ''}" {@attach tabsAttachment({ defaultTab })}>
	<div class="list" role="tablist" aria-label="Tabs" {@attach toggleSlider({ variant })}>
		{#each tabs as tab, index (index)}
			<button type="button" class="tab" role="tab" aria-selected="false">{tab.label}</button>
		{/each}
	</div>

	{#each tabs as tab, index (index)}
		<div class="panel" role="tabpanel" hidden={index !== defaultTab}>
			{#if tab.image}<img
					{...imageProps(tab.image.src, { sizes: '(min-width: 1024px) 560px, 100vw' })}
					alt={tab.image.alt ?? ''}
					loading="lazy"
				/>{/if}
			<div class="text">
				<h4>{tab.title}</h4>
				<p>{tab.description}</p>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	@use 'base/mixins';

	.tabs {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 100%;
	}

	.list {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		align-self: flex-start;
	}

	.tab {
		padding: 8px 16px;
		border: 0;
		border-radius: var(--radius-btn);
		background: none;
		color: inherit;
		font: inherit;
		font-weight: var(--btn-font-weight);
		opacity: 0.5;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				opacity var(--duration) var(--ease),
				background var(--duration) var(--ease),
				box-shadow var(--duration) var(--ease);
		}

		@include mixins.desktop-hover {
			opacity: 0.75;
		}

		&:global([aria-selected='true']) {
			opacity: 1;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 2px;
		}
	}

	// The slider behind the selected tab is the Toggle Slider attachment.
	.solid .list {
		--slider-color: var(--color-accent);
	}

	.solid .tab:global([data-active]) {
		color: var(--color-text);
	}

	.panel {
		display: grid;
		gap: 24px;
		align-items: center;

		@include mixins.min-md {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		}

		&[hidden] {
			display: none;
		}

		img {
			width: 100%;
			aspect-ratio: 4 / 3;
			border-radius: var(--radius);
			object-fit: cover;
		}

		.text {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		p {
			color: var(--color-text-muted);
		}
	}
</style>
