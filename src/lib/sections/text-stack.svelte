<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type TextStackProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** Renders nothing. */
		hidden?: boolean;
		/** Skips the scroll effect on the title, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { textScale } from '$lib/attachments/text-scale';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		id,
		fullScreen = false,
		hidden = false,
		static: isStatic = false,
		class: className,
		...copy
	}: TextStackProps = $props();

	const scale = textScale({
		type: 'words',
		style: 'random',
		from: 0.75,
		duration: 0.15,
		scrub: true,
		start: 'top 100%',
		end: 'bottom 70%'
	});
</script>

{#if !hidden}
	<section {id} class="text-stack {className ?? ''}" class:full-screen={fullScreen}>
		<div class="inner">
			<SectionCopy align="center" {...copy} titleAttach={isStatic ? undefined : scale} />
		</div>
	</section>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.text-stack {
		padding: var(--body-padding-double) var(--body-padding);
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	// The text is 750px wide including the section's side padding.
	.inner {
		display: flex;
		justify-content: center;
		width: 100%;
		max-width: var(--content-width);
		margin: 64px auto;

		@include mixins.min-md {
			max-width: min(var(--content-width), calc(var(--max-width-text) - var(--body-padding) * 2));
		}
	}
</style>
