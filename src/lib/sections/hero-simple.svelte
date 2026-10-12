<script lang="ts">
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';

	let {
		id,
		compact = false,
		fullScreen = true,
		...props
	}: SectionCopyProps & {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		compact?: boolean;
		fullScreen?: boolean;
	} = $props();
</script>

<section {id} class="hero-simple" class:compact class:full-screen={fullScreen && !compact}>
	<div class="inner">
		<SectionCopy level={1} align="center" {...props} />
	</div>
</section>

<style lang="scss">
	.hero-simple {
		display: grid;
		place-items: center;
		min-height: 80lvh;
		padding: var(--body-padding-double) var(--body-padding);
	}

	.compact {
		min-height: 40lvh;
	}

	// At least the screen's height: short content is centered, and long content still grows past it.
	.full-screen {
		min-height: 100lvh;
	}

	.inner {
		width: 100%;
		max-width: var(--content-width);
		display: flex;
		justify-content: center;
	}
</style>
