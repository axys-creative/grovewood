<script lang="ts">
	import '../../styles/styles.scss';
	import AlertStack from '$lib/components/alert-stack.svelte';
	import FooterGnomon, { type FooterGnomonProps } from '$lib/components/footer-gnomon.svelte';
	import FooterScrollReveal, {
		type FooterScrollRevealProps
	} from '$lib/components/footer-scroll-reveal.svelte';
	import FooterSimple, { type FooterSimpleProps } from '$lib/components/footer-simple.svelte';
	import PageTransition from '$lib/components/page-transition.svelte';
	import ScrollProgress from '$lib/components/scroll-progress.svelte';
	import SideShadows from '$lib/components/side-shadows.svelte';
	import SmoothScroll from '$lib/components/smooth-scroll.svelte';
	import HeaderBasic, { type HeaderBasicProps } from '$lib/components/header-basic.svelte';
	import HeaderAbsolute, { type HeaderAbsoluteProps } from '$lib/components/header-absolute.svelte';
	import HeaderIsland, { type HeaderIslandProps } from '$lib/components/header-island.svelte';
	import HeaderSimple, { type HeaderSimpleProps } from '$lib/components/header-simple.svelte';
	import logo from '$lib/content/global/logo.json';
	import social from '$lib/content/global/social-media.json';
	import footer from '$lib/content/global/footer-simple.json';
	import footerGnomon from '$lib/content/global/footer-gnomon.json';
	import footerScrollReveal from '$lib/content/global/footer-scroll-reveal.json';
	import site from '$lib/content/meta/site.json';
	import header from '$lib/content/global/header-simple.json';
	import headerBasic from '$lib/content/global/header-basic.json';
	import headerAbsolute from '$lib/content/global/header-absolute.json';
	import headerIsland from '$lib/content/global/header-island.json';
	import navigation from '$lib/content/global/navigation.json';

	let { children } = $props();
</script>

<SmoothScroll />
<PageTransition name="fade" preserveHeader />

<div class="site">
	{#if site.headerTemplate === 'absolute'}
		<HeaderAbsolute
			{...navigation as HeaderAbsoluteProps}
			{...headerAbsolute as HeaderAbsoluteProps}
			{logo}
			socialLinks={social.links}
		/>
	{:else if site.headerTemplate === 'basic'}
		<HeaderBasic
			{...navigation as HeaderBasicProps}
			{...headerBasic as HeaderBasicProps}
			{logo}
			socialLinks={social.links}
		/>
	{:else if site.headerTemplate === 'island'}
		<HeaderIsland
			{...navigation as HeaderIslandProps}
			{...headerIsland as HeaderIslandProps}
			{logo}
			socialLinks={social.links}
		/>
	{:else}
		<HeaderSimple
			{...navigation as HeaderSimpleProps}
			{...header as HeaderSimpleProps}
			{logo}
			socialLinks={social.links}
		/>
	{/if}
	<main id="main" tabindex="-1">
		{@render children()}
	</main>
	{#if site.footerTemplate === 'gnomon'}
		<FooterGnomon {...footerGnomon as FooterGnomonProps} socialLinks={social.links} />
	{:else if site.footerTemplate === 'scroll-reveal'}
		<FooterScrollReveal
			{...footerScrollReveal as FooterScrollRevealProps}
			socialLinks={social.links}
		/>
	{:else}
		<FooterSimple {...footer as FooterSimpleProps} {logo} socialLinks={social.links} />
	{/if}
</div>

<SideShadows />
<ScrollProgress />
<AlertStack />

<style lang="scss">
	.site {
		display: flex;
		flex-direction: column;
		min-height: 100lvh;
	}

	main {
		flex: 1;

		&:focus {
			outline: none;
		}
	}
</style>
