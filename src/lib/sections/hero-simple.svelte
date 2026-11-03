<script lang="ts">
	import { textFade } from '$lib/attachments/text-fade';
	import { watchScroll } from '$lib/attachments/watch-scroll';
	import Logo, { type LogoProps } from '$lib/components/logo.svelte';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		id,
		compact = false,
		fullScreen = true,
		hidden = false,
		image,
		logo,
		direction = 'column',
		static: isStatic = false,
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
		/** A logo in the eyebrow's place. The header's logo takes over once the page scrolls. */
		logo?: LogoProps;
		/** `column` centers the copy, with a picture below it at full width. `row` aligns it to the start, with the picture beside it from `lg` up. */
		direction?: 'column' | 'row';
		/** Skips the scroll effect on the title, for the CMS preview. */
		static?: boolean;
	} = $props();

	const reveal = textFade();
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
				{#if logo}<div class="logo" {@attach watchScroll()}><Logo {...logo} /></div>{/if}
				<SectionCopy
					level={1}
					align={row ? 'start' : 'center'}
					{...props}
					titleAttach={isStatic ? undefined : reveal}
				/>
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
		flex-direction: column;
		align-items: center;
		gap: var(--space-eyebrow-title);
		width: 100%;
	}

	.logo {
		--logo-height: clamp(48px, 6vw, 72px);

		display: flex;
		overflow: clip;

		@include mixins.mq-motion-allow {
			:global(.logo) {
				transition: translate 0.5s var(--ease);
			}
		}

		&:global([data-scroll-away]) :global(.logo) {
			translate: 0 -100%;
			visibility: hidden;

			@include mixins.mq-motion-allow {
				transition:
					translate 0.5s var(--ease),
					visibility 0s 0.5s;
			}
		}
	}

	.row.has-image .copy {
		margin-block: 64px;
	}

	.row .copy {
		align-items: flex-start;
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
