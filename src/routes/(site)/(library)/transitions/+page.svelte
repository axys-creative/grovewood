<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import LibrarySection from '$lib/library/library-section.svelte';
	import TransitionFrame from '$lib/library/transition-frame.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import { navEntry } from '$lib/utils/nav';

	const nav = navEntry('/transitions');
</script>

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Transitions"
	description="How the site changes from one page to the next. Each demo is a mock page in a small frame: use its two links to see the transition play."
/>

<div class="transitions page-grid">
	<LibrarySection
		title="Fade"
		type="Transition"
		description="The page you leave drifts up and fades out, then the new one rises into place and fades in. To use it on the site, mount `<PageTransition />` once in `routes/(site)/+layout.svelte`. It wraps every in-app navigation in a view transition, so browsers without them simply change pages as normal, and it is off with reduced motion. To remove it, delete the tag, `components/page-transition.svelte` and `utils/page-transition.ts`."
		props={[
			{
				name: 'name',
				description: "`'fade'`. Which transition plays between pages. Defaults to `fade`."
			},
			{
				name: 'preserveHeader',
				description:
					'A boolean. Keeps the header in place and on top while the page changes, for every transition. Defaults to `false`.'
			},
			{
				name: 'duration',
				description:
					'A number, milliseconds. The total for both halves. Defaults to `600` for fade.'
			}
		]}
		propsLabel="props"
	>
		<TransitionFrame name="fade" />
	</LibrarySection>
	<LibrarySection
		title="Tiles"
		type="Transition"
		description="A grid of tiles fades in over the whole screen, the page changes underneath, then the tiles fade away in the same order. The page is divided into as many tiles as fit `tileSize`, so a bigger screen has more. It is off with reduced motion. Mount it like Fade: `<PageTransition name=&quot;tiles&quot; />`."
		props={[
			{
				name: 'preserveHeader',
				description:
					'A boolean. Keeps the header in place and on top while the page changes, for every transition. Defaults to `false`.'
			},
			{
				name: 'tileSize',
				description:
					'A number, the approximate width and height of a tile in px. Smaller tiles make a finer grid. Defaults to `160`.'
			},
			{
				name: 'sequence',
				description:
					"`'linear' | 'circle' | 'checkers'`. The order tiles appear and disappear: reading order from the top left, outward from the center, or a checkerboard in two waves. Defaults to `linear`."
			},
			{
				name: 'duration',
				description: 'A number, milliseconds each tile takes to fade. Defaults to `200`.'
			},
			{
				name: 'spread',
				description:
					'A number, milliseconds from the first tile starting to the last. A bigger number is a slower sweep. Defaults to `600`.'
			},
			{
				name: 'color',
				description:
					'A string, any CSS color. Defaults to the surface color, which follows light and dark themes.'
			}
		]}
		propsLabel="props"
	>
		<LibrarySection
			level={3}
			title="Linear, large tiles"
			description="`tileSize: 90`. Tiles sweep in from the top left."
		>
			<TransitionFrame name="tiles" sequence="linear" tileSize={40} duration={500} />
		</LibrarySection>
		<LibrarySection
			level={3}
			title="Circle, small tiles"
			description="`sequence: 'circle'`, `tileSize: 50`. Tiles spread outward from the center."
		>
			<TransitionFrame name="tiles" sequence="circle" tileSize={50} spread={700} duration={1000} />
		</LibrarySection>
		<LibrarySection
			level={3}
			title="Checkers"
			description="`sequence: 'checkers'`, `tileSize: 70`. Half the squares appear, then the rest."
		>
			<TransitionFrame name="tiles" sequence="checkers" tileSize={70} />
		</LibrarySection>
	</LibrarySection>
</div>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	.transitions {
		row-gap: 128px;
		padding-block: var(--body-padding);
	}
</style>
