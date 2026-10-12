<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';
	import type { CounterProps } from '$lib/components/counter.svelte';

	export type StatsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description'
	> & {
		stats: Pick<
			CounterProps,
			'digit' | 'prefix' | 'suffix' | 'label' | 'spokenLabel' | 'ticker' | 'comma'
		>[];
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** Skips the scroll entrance, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { animate } from '$lib/attachments/animate';
	import Counter from '$lib/components/counter.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		stats = [],
		id,
		fullScreen = false,
		static: isStatic = false,
		class: className,
		...copy
	}: StatsProps = $props();

	const stagger = animate({ variant: 'up', stagger: 0.24, once: false, duration: 0.5 });
</script>

<section {id} class="stats {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy {...copy} />

		{#if stats.length}
			<ul class="list" {@attach isStatic ? undefined : stagger}>
				{#each stats as stat (`${stat.digit}|${stat.label}`)}
					<li>
						<Counter {...stat} size="lg" align="start" divider />
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.stats {
		--animate-ease: ease;

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
		align-items: flex-start;
		gap: 96px;
		width: 100%;
		max-width: var(--content-width);
		margin: 64px auto;

		@include mixins.min-md {
			gap: 164px;
		}
	}

	.list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
		width: 100%;
		margin: 0;
		padding: 0;
		list-style: none;

		@include mixins.min-md {
			grid-template-columns: repeat(3, 1fr);
			gap: 24px;
			max-width: 1000px;
		}
	}
</style>
