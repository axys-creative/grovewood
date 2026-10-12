<script module lang="ts">
	import type { ImageWaveProps } from '$lib/components/image-wave.svelte';

	export type HeroImageWaveProps = SectionCopyProps & {
		images: ImageWaveProps['images'];
		/** Decorative handwritten text beside the copy. Hidden below the `lg` breakpoint. */
		accent?: string;
		/** Image Wave props: `repeat`, `speed`, `duration`, `amplitude`, `waves`, `scrub` and `reverse`. */
		wave?: Omit<ImageWaveProps, 'images' | 'class'>;
		/** At least the height of the screen: the copy is centered above the wave. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import ImageWave from '$lib/components/image-wave.svelte';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';

	let {
		images,
		accent,
		wave,
		fullScreen = true,
		id,
		class: className,
		...copy
	}: HeroImageWaveProps = $props();
</script>

<section {id} class="hero-image-wave {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<div class="copy">
			{#if accent}<span class="accent" aria-hidden="true">{accent}</span>{/if}
			<SectionCopy level={1} align="center" {...copy} />
		</div>
	</div>

	<ImageWave {...wave} {images} />
</section>

<style lang="scss">
	@use 'base/mixins';

	// The wave runs past the sides of the screen, so only the sides are clipped.
	.hero-image-wave {
		overflow-x: clip;
		padding-block-end: var(--body-padding-double);
	}

	.full-screen {
		display: flex;
		flex-direction: column;
		min-height: 100lvh;

		.inner {
			flex: 1;
			align-items: center;
			width: 100%;
		}
	}

	.inner {
		display: flex;
		justify-content: center;
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
	}

	.copy {
		position: relative;
		display: flex;
		justify-content: center;
		width: min(100%, var(--max-width-text));
	}

	.accent {
		position: absolute;
		bottom: 0;
		left: 0;
		translate: -100% 100%;
		rotate: -8deg;
		font-family: cursive;
		pointer-events: none;

		@include mixins.max-lg {
			display: none;
		}
	}
</style>
