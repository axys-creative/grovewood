<script module lang="ts">
	import type { AccordionProps } from '$lib/components/accordion.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CommonQuestionsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		items: AccordionProps['items'];
		/** A plus sign at the end of each question that turns into a minus when open. */
		plus?: boolean;
		/** Opening a question closes the others. */
		singleOpen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** Renders nothing. */
		hidden?: boolean;
		/** Skips the scroll entrance, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { animate } from '$lib/attachments/animate';
	import { textFade } from '$lib/attachments/text-fade';
	import Accordion from '$lib/components/accordion.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		items = [],
		plus = false,
		singleOpen = false,
		id,
		fullScreen = false,
		hidden = false,
		static: isStatic = false,
		class: className,
		...copy
	}: CommonQuestionsProps = $props();

	const reveal = textFade();
	const slideIn = animate({ variant: 'right', once: false });
</script>

{#if !hidden}
	<section {id} class="common-questions {className ?? ''}" class:full-screen={fullScreen}>
		<div class="inner">
			<header class="header">
				<SectionCopy {...copy} align="center" titleAttach={isStatic ? undefined : reveal} />
			</header>

			{#if items.length}
				<div class="questions">
					<Accordion {items} {plus} {singleOpen} itemAttach={isStatic ? undefined : slideIn} />
				</div>
			{/if}
		</div>
	</section>
{/if}

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
		--animate-distance: 64px;
		width: 100%;
		max-width: var(--max-width-text);
		margin-inline: auto;
	}
</style>
