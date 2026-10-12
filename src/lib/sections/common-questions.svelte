<script module lang="ts">
	import type { AccordionProps } from '$lib/components/accordion.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CommonQuestionsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		items: AccordionProps['items'];
		/** An icon name from `static/icons` at the end of each question. */
		icon?: string;
		/** Opening a question closes the others. */
		singleOpen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Accordion from '$lib/components/accordion.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		items = [],
		icon,
		singleOpen = false,
		id,
		fullScreen = false,
		class: className,
		...copy
	}: CommonQuestionsProps = $props();
</script>

<section {id} class="common-questions {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<header class="header"><SectionCopy {...copy} align="center" /></header>

		{#if items.length}
			<div class="questions">
				<Accordion {items} {icon} {singleOpen} />
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.common-questions {
		padding: var(--body-padding-double) var(--body-padding);
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: var(--content-width);
		margin-inline: auto;
	}

	.header {
		margin-block-end: 64px;

		@include mixins.min-lg {
			margin-block-end: 96px;
		}
	}

	// The head is centered; the questions read left to right, row to row.
	.questions {
		width: 100%;
		max-width: var(--max-width-text);
		margin-inline: auto;
	}
</style>
