<script module lang="ts">
	export type CarouselAccordionItem = {
		title: string;
		description?: string;
		/** Shown beside the list while this item is open. */
		image?: { src: string; alt?: string };
	};

	export type CarouselAccordionProps = {
		/** Two or more. One is open at a time, and each opens its own picture. */
		items: CarouselAccordionItem[];
		/** How long each item stays open, in milliseconds. Defaults to `6000`. */
		interval?: number;
		/** Moves to the next item when the interval ends. Without it the list is a plain one-open accordion. */
		autoplay?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/icon.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		items,
		interval = 6000,
		autoplay = true,
		class: className
	}: CarouselAccordionProps = $props();

	const uid = $props.id();

	let active = $state(0);
	let root = $state<HTMLElement>();
	let visible = $state(false);
	let hovering = $state(false);
	let focused = $state(false);
	let reduced = $state(true);

	const running = $derived(autoplay && !reduced && items.length > 1);
	const paused = $derived(!visible || hovering || focused);

	onMount(() => {
		const query = matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = query.matches);
		sync();
		query.addEventListener('change', sync);

		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		if (root) observer.observe(root);

		return () => {
			query.removeEventListener('change', sync);
			observer.disconnect();
		};
	});

	function next() {
		active = (active + 1) % items.length;
	}
</script>

<div bind:this={root} class="carousel-accordion {className ?? ''}" style="--interval: {interval}ms">
	<div class="layout">
		<div class="pictures">
			{#each items as item, index (index)}
				{#if item.image?.src}
					<img
						class="picture"
						class:current={index === active}
						{...imageProps(item.image.src, {
							sizes: '(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw'
						})}
						alt={index === active ? (item.image.alt ?? '') : ''}
						loading={index === 0 ? 'eager' : 'lazy'}
						fetchpriority={index === 0 ? 'high' : undefined}
						draggable="false"
					/>
				{/if}
			{/each}
		</div>

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="list"
			class:paused
			onpointerenter={(event) => (hovering = event.pointerType === 'mouse')}
			onpointerleave={() => (hovering = false)}
			onfocusin={() => (focused = true)}
			onfocusout={() => (focused = false)}
		>
			{#each items as item, index (index)}
				{@const open = index === active}
				<div class="item" class:open>
					<h3 class="heading">
						<button
							type="button"
							class="trigger"
							aria-expanded={open}
							aria-controls="{uid}-panel-{index}"
							id="{uid}-trigger-{index}"
							onclick={() => (active = index)}
						>
							<span class="title h3">{item.title}</span>
							<Icon name="chevron-down" class="marker" />
						</button>
					</h3>
					<div
						class="panel"
						id="{uid}-panel-{index}"
						role="region"
						aria-labelledby="{uid}-trigger-{index}"
						inert={!open}
					>
						<div class="body">
							{#if item.description}<p><RichText text={item.description} /></p>{/if}
						</div>
					</div>
					{#if open && running}
						<span class="progress" aria-hidden="true" onanimationend={next}></span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	@use 'base/mixins';

	.carousel-accordion {
		--carousel-accordion-gap: 24px;

		width: 100%;
	}

	.layout {
		display: grid;
		gap: var(--carousel-accordion-gap);

		@include mixins.min-md {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.pictures {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: clip;
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.picture {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;

		@include mixins.mq-motion-allow {
			transition: opacity 0.6s var(--ease);
		}

		&.current {
			opacity: 1;
		}
	}

	// From md up the picture sets the height and the list fills exactly that, with the open item taking what is left.
	.list {
		display: flex;
		flex-direction: column;

		@include mixins.min-md {
			contain: size;
			overflow-y: auto;
		}
	}

	.item {
		position: relative;
		border-bottom: 1px solid var(--color-border);

		&:first-child .trigger {
			padding-block-start: 0;
		}

		@include mixins.min-md {
			&.open {
				flex: 1;
			}
		}
	}

	.heading {
		font: inherit;
		letter-spacing: normal;
	}

	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		width: 100%;
		padding: 16px 0;
		border: 0;
		background: none;
		color: var(--color-text-muted);
		text-align: left;
		cursor: pointer;
		opacity: 0.6;

		@include mixins.mq-motion-allow {
			transition:
				color var(--duration) var(--ease),
				opacity var(--duration) var(--ease);
		}

		@include mixins.mq-mouse {
			&:hover {
				opacity: 1;
			}
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 4px;
			border-radius: var(--radius-btn);
		}
	}

	.open .trigger {
		color: var(--color-accent-text);
		opacity: 1;
	}

	.trigger :global(.marker) {
		flex-shrink: 0;
		width: 32px;
		height: 32px;

		@include mixins.mq-motion-allow {
			transition: scale var(--duration) var(--ease);
		}
	}

	.trigger[aria-expanded='true'] :global(.marker) {
		scale: 1 -1;
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
		}
	}

	.body {
		overflow: hidden;

		p {
			margin: 0;
			padding-block-end: 20px;
			color: var(--color-text-muted);
		}
	}

	.progress {
		position: absolute;
		inset: auto 0 -1px;
		height: 2px;
		background: var(--color-accent);
		transform-origin: left;
		animation: progress var(--interval) linear forwards;
	}

	.paused .progress {
		animation-play-state: paused;
	}

	@keyframes progress {
		from {
			transform: scaleX(0);
		}

		to {
			transform: scaleX(1);
		}
	}
</style>
