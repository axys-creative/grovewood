<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type WorkGalleryItem = {
		title: string;
		/** What was done, shown under the image, e.g. `Design + Development`. */
		type?: string;
		/** Shown in a glass tag on the image's corner. */
		year?: string | number;
		img: { src: string; alt?: string };
		/** Makes the image a link. A full URL opens in a new tab. */
		url?: string;
	};

	export type WorkGalleryProps = Omit<SectionCopyProps, 'level' | 'layout'> & {
		items: WorkGalleryItem[];
		/** `default` is two columns. `alternate` is three, where the images take turns being two columns wide. */
		grid?: 'default' | 'alternate';
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import Tag from '$lib/components/tag.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { animate } from '$lib/attachments/animate';
	import { cursorContent } from '$lib/attachments/cursor-content';
	import { glitchTarget } from '$lib/attachments/glitch-target';

	let { items, grid = 'alternate', id, class: className, ...copy }: WorkGalleryProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
	const external = (url: string) => /^https?:\/\//.test(url);

	let types = $state<HTMLElement[]>([]);
</script>

{#snippet picture(item: WorkGalleryItem)}
	<div class="frame">
		<img
			{...imageProps(item.img.src, {
				sizes: '(min-width: 1280px) 760px, (min-width: 1024px) 50vw, 100vw'
			})}
			alt={item.img.alt ?? ''}
			loading="lazy"
		/>
		{#if item.year}<Tag class="year" text={String(item.year)} type="glass" />{/if}
	</div>
{/snippet}

<section {id} class="work-gallery {className ?? ''}">
	<div class="inner">
		{#if hasCopy}
			<header class="header">
				<SectionCopy level={2} layout="row" rowAlign="center" {...copy} />
			</header>
		{/if}

		<div class="layout {grid}">
			{#each items as item, index (index)}
				<figure
					class="figure"
					{@attach animate({ variant: 'scale', delay: index % 2 ? 0.125 : 0 })}
				>
					{#if item.url}
						<a
							class="link"
							href={item.url}
							aria-label={item.title}
							target={external(item.url) ? '_blank' : undefined}
							rel={external(item.url) ? 'noopener noreferrer' : undefined}
							{@attach cursorContent({ icon: 'arrow-tr', iconSize: 'md', variant: 'content-1' })}
							{@attach glitchTarget({ target: () => types[index] ?? null })}
						>
							{@render picture(item)}
						</a>
					{:else}
						{@render picture(item)}
					{/if}

					<figcaption>
						<h3 class="h5">{item.title}</h3>
						{#if item.type}
							<p class="type" bind:this={types[index]}>{item.type}</p>
						{/if}
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.inner {
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
	}

	.header {
		margin-block-end: var(--body-padding-double);
	}

	.layout {
		--row-height: clamp(280px, 28vw, 420px);

		display: grid;
		gap: 16px;
		grid-template-columns: 1fr;

		@include mixins.min-xl {
			gap: 48px;
		}

		@include mixins.min-lg {
			grid-template-columns: 1fr 1fr;
		}
	}

	// From `xl` the images take turns: wide then narrow, narrow then wide.
	.alternate {
		@include mixins.min-xl {
			grid-template-columns: repeat(3, 1fr);

			.figure:nth-child(4n + 1) {
				grid-column: 1 / 3;
			}

			.figure:nth-child(4n + 2) {
				grid-column: 3;
			}

			.figure:nth-child(4n + 3) {
				grid-column: 1;
			}

			.figure:nth-child(4n + 4) {
				grid-column: 2 / 4;
			}
		}
	}

	.figure {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		margin: 0;
	}

	.link {
		display: block;
	}

	.frame {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-radius: var(--radius);

		@include mixins.min-xl {
			aspect-ratio: auto;
			height: var(--row-height);
		}

		:global(.year) {
			position: absolute;
			top: 12px;
			left: 12px;
		}
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		// Slightly zoomed in at rest, and settles on hover.
		scale: 1.05;

		@include mixins.mq-motion-allow {
			transition: scale 0.6s var(--ease);
		}
	}

	.link:hover img,
	.link:focus-visible img {
		scale: 1;
	}

	.link:focus-visible {
		outline: 2px solid var(--color-accent-text);
		outline-offset: 4px;
		border-radius: var(--radius);
	}

	figcaption {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;

		h3,
		p {
			margin: 0;
		}
	}
</style>
