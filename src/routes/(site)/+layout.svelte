<script lang="ts">
	import '../../styles/styles.scss';
	import AlertStack from '$lib/components/alert-stack.svelte';
	import CalendarBooking, {
		type CalendarBookingProps
	} from '$lib/components/calendar-booking.svelte';
	import booking from '$lib/content/global/booking.json';
	import FooterSimple, { type FooterSimpleProps } from '$lib/components/footer-simple.svelte';
	import PageTransition from '$lib/components/page-transition.svelte';
	import SmoothScroll from '$lib/components/smooth-scroll.svelte';
	import HeaderSimple, { type HeaderSimpleProps } from '$lib/components/header-simple.svelte';
	import logo from '$lib/content/global/logo.json';
	import social from '$lib/content/global/social-media.json';
	import footer from '$lib/content/global/footer-simple.json';
	import header from '$lib/content/global/header-simple.json';
	import navigation from '$lib/content/global/navigation.json';

	let { children } = $props();
</script>

<SmoothScroll />
<PageTransition name="fade" preserveHeader />

<div class="site">
	<HeaderSimple
		{...navigation as HeaderSimpleProps}
		{...header as HeaderSimpleProps}
		{logo}
		socialLinks={social.links}
	/>
	<main id="main" tabindex="-1">
		{@render children()}
	</main>
	<FooterSimple {...footer as FooterSimpleProps} {logo} socialLinks={social.links} />
</div>

<CalendarBooking {...booking as CalendarBookingProps} />
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
