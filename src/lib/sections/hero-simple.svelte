<script lang="ts">
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		id,
		compact = false,
		fullScreen = true,
		hidden = false,
		image,
		direction = 'column',
		...props
	}: SectionCopyProps & {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		compact?: boolean;
		fullScreen?: boolean;
		/** Renders nothing. */
		hidden?: boolean;
		/** A picture beside the copy (below it on small screens), or below it at full width with `column`. */
		image?: { src: string; alt?: string };
		/** `column` centers the copy, with a picture below it at full width. `row` aligns it to the start, with the picture beside it from `lg` up. */
		direction?: 'column' | 'row';
	} = $props();

	const row = $derived(direction === 'row');
	const stacked = $derived(!!image && !row);
</script>

{#if !hidden}
	<section
		{id}
		class="hero-simple"
		class:compact
		class:full-screen={fullScreen && !compact}
		class:row
		class:stacked
		class:has-image={!!image}
	>
		<div class="inner">
			<div class="copy">
				<SectionCopy level={1} align={row ? 'start' : 'center'} {...props} />
			</div>

			{#if image?.src}
				<div class="media">
					<img
						{...imageProps(image.src, {
							sizes: stacked
								? '(min-width: 1440px) 1344px, 100vw'
								: '(min-width: 1024px) 50vw, 100vw'
						})}
						alt={image.alt ?? ''}
						loading="eager"
						fetchpriority="high"
					/>
				</div>
			{/if}
		</div>
	</section>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.hero-simple {
		--section-height: clamp(625px, 90vh, 1100px);
		--media-max: 650px;

		display: grid;
		place-items: center;
		min-height: 80lvh;
		padding: var(--body-padding-double) var(--body-padding);

		@include mixins.min-xxl {
			--section-height: clamp(750px, 90vh, 1250px);
			--media-max: 750px;
		}
	}

	.compact {
		min-height: 40lvh;
	}

	.full-screen {
		min-height: var(--section-height);

		@include mixins.max-lg {
			min-height: 500px;
		}
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 64px;
		width: 100%;
		max-width: var(--content-width);
	}

	.copy {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.row.has-image .copy {
		margin-block: 64px;
	}

	.row .copy {
		justify-content: flex-start;
	}

	.media {
		width: 100%;
		max-height: var(--media-max);
		border-radius: var(--radius);
		overflow: hidden;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	// Centered copy with room around it, then the picture across the whole width. It may run past the bottom of the
	// screen; the top of it shows.
	.stacked {
		align-items: start;
		min-height: 0;
		padding-block: clamp(96px, 14vh, 176px) var(--body-padding-double);

		.inner {
			gap: clamp(64px, 9vh, 112px);
		}

		.media {
			max-height: none;

			img {
				height: auto;
			}
		}
	}

	@include mixins.min-lg {
		.row .inner {
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
		}

		.row.has-image .copy,
		.row.has-image .media {
			flex: 1 1 auto;
			width: 100%;
			max-width: 50%;
		}

		.row.has-image.full-screen .media {
			height: min(var(--media-max), calc(var(--section-height) - var(--body-padding-double) * 2));
		}
	}
</style>
