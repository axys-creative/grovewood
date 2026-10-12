<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ScrollHorizontalItem = {
		src: string;
		alt?: string;
		title?: string;
		description?: string;
	};

	export type ScrollHorizontalProps = Omit<SectionCopyProps, 'level' | 'layout'> & {
		/** Images with a caption, sliding sideways. Use this or `message`. */
		items?: ScrollHorizontalItem[];
		/** One long line of large text instead of images. Trusted HTML, so a `<span class="stroke">` outlines a word. */
		message?: string;
		/** The images drift a little within their frames as the row slides. Defaults to `true`. */
		parallax?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { animate } from '$lib/attachments/animate';
	import { scrollSlide } from '$lib/attachments/scroll-slide';

	let {
		items = [],
		message,
		parallax = true,
		id,
		class: className,
		...copy
	}: ScrollHorizontalProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
</script>

<section {id} class="scroll-horizontal {className ?? ''}" class:message={!!message}>
	<div
		class="pin"
		class:with-header={hasCopy}
		{@attach scrollSlide({
			media: 'all',
			scrub: 0.5,
			parallax: parallax && !message ? '.frame img' : undefined
		})}
	>
		{#if hasCopy}
			<header class="header">
				<SectionCopy level={2} layout="row" rowAlign="center" {...copy} />
			</header>
		{/if}

		<div class="container" data-slide-viewport>
			<div class="slider" data-slide-track {@attach animate({ variant: 'scale', stagger: 0.1 })}>
				{#if message}
					<p class="h2 text"><RichText text={message} /></p>
				{:else}
					{#each items as item, index (index)}
						<figure class="figure">
							<div class="frame" class:parallax>
								<img
									{...imageProps(item.src, { sizes: '(min-width: 1280px) 700px, 500px' })}
									alt={item.alt ?? ''}
									loading="lazy"
								/>
							</div>
							{#if item.title || item.description}
								<figcaption>
									{#if item.title}<h3 class="h5">{item.title}</h3>{/if}
									{#if item.title && item.description}•{/if}
									{#if item.description}<small>{item.description}</small>{/if}
								</figcaption>
							{/if}
						</figure>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.scroll-horizontal {
		position: relative;
		overflow-x: clip;
		padding-block: var(--body-padding-double);
	}

	// The pinned box fills most of the screen. With a header it is shared between the header and the track.
	.pin {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 64px;
		height: calc(100lvh - var(--body-padding-double));
		min-height: 850px;

		@include mixins.max-xxl {
			min-height: 650px;
		}
	}

	// The header holds to the content width while the track below runs edge to edge.
	.header {
		width: 100%;
		max-width: var(--content-width);
		margin-inline: auto;
		padding-inline: var(--body-padding);

		:global(.section-copy) {
			max-width: none;
		}
	}

	.container {
		display: flex;
		align-items: center;
		height: 80%;
		overflow-x: auto;
	}

	.with-header .container {
		height: 64%;

		@include mixins.max-md {
			height: 56%;
		}
	}

	.pin:global([data-sliding]) .container {
		overflow: hidden;
	}

	// The first and last items line up with the content width, though the track itself is full width.
	.slider {
		display: flex;
		gap: 24px;
		height: 100%;
		padding-inline: max(
			var(--body-padding),
			calc((100% - var(--content-width)) / 2 + var(--body-padding))
		);
	}

	.figure {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		gap: 16px;
		width: min(25vw, 450px);
		margin: 0;

		@include mixins.max-xl {
			width: 350px;
		}

		@include mixins.max-sm {
			width: 250px;
		}

		figcaption {
			display: flex;
			align-items: center;
			gap: 16px;
		}
	}

	.frame {
		display: flex;
		flex: 1;
		min-height: 0;
		overflow: hidden;
		border-radius: var(--radius);

		// Landscape images in a portrait frame leave room to drift.
		&.parallax {
			justify-content: flex-end;
		}

		img {
			flex: none;
			width: auto;
			min-width: 100%;
			max-width: none;
			height: 100%;
			object-fit: cover;
		}
	}

	.message {
		.slider {
			align-items: center;
		}

		.text {
			font-size: min(10vw, 128px);
			opacity: 1;
			white-space: nowrap;

			:global(.stroke) {
				-webkit-text-stroke: 1px var(--color-text);
				color: transparent;
				font-weight: 500;
			}
		}
	}
</style>
