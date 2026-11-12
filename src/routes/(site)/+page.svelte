<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte';
	import GoogleReviews from '$lib/sections/google-reviews.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import ImageGrid from '$lib/sections/image-grid.svelte';
	import Stats from '$lib/sections/stats.svelte';
	import TextStack from '$lib/sections/text-stack.svelte';
	import logo from '$lib/content/global/logo.json';
	import hero from '$lib/content/page_home/hero-simple.json';
	import textStack from '$lib/content/page_home/text-stack.json';
	import imageGrid from '$lib/content/page_home/image-grid.json';
	import invite from '$lib/content/page_home/text-stack-invite.json';
	import googleReviews from '$lib/content/page_home/google-reviews.json';
	import stats from '$lib/content/page_home/stats.json';
	import { hasIdentityToken, loadIdentity } from '$lib/utils/identity';

	let { data } = $props();

	// Netlify sends CMS invite and recovery links to the home page.
	onMount(() => {
		if (!hasIdentityToken()) return;
		loadIdentity().then((identity) => identity.on('login', () => location.assign('/admin/')));
	});
</script>

<HeroSimple id="hero" {logo} {...hero as ComponentProps<typeof HeroSimple>} />
<TextStack id="text-stack" {...textStack} />
<ImageGrid id="image-grid" {...imageGrid} />
<TextStack id="text-invite" {...invite as ComponentProps<typeof TextStack>} />
<GoogleReviews
	id="testimonials"
	{...googleReviews as ComponentProps<typeof GoogleReviews>}
	reviews={data.googleReviews.reviews}
	summary={data.googleReviews.summary}
/>
<Stats id="stats" {...stats} />
