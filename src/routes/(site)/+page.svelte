<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte';
	import CarouselTestimonials from '$lib/sections/carousel-testimonials.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import ImageGrid from '$lib/sections/image-grid.svelte';
	import Stats from '$lib/sections/stats.svelte';
	import TextStack from '$lib/sections/text-stack.svelte';
	import hero from '$lib/content/page_home/hero-simple.json';
	import textStack from '$lib/content/page_home/text-stack.json';
	import imageGrid from '$lib/content/page_home/image-grid.json';
	import invite from '$lib/content/page_home/text-stack-invite.json';
	import testimonials from '$lib/content/page_home/carousel-testimonials.json';
	import stats from '$lib/content/page_home/stats.json';
	import { hasIdentityToken, loadIdentity } from '$lib/utils/identity';

	// Netlify sends CMS invite and recovery links to the home page.
	onMount(() => {
		if (!hasIdentityToken()) return;
		loadIdentity().then((identity) => identity.on('login', () => location.assign('/admin/')));
	});
</script>

<HeroSimple id="hero" {...hero as ComponentProps<typeof HeroSimple>} />
<TextStack id="text-stack" {...textStack} />
<ImageGrid id="image-grid" {...imageGrid} />
<TextStack id="text-invite" {...invite as ComponentProps<typeof TextStack>} />
<CarouselTestimonials id="testimonials" {...testimonials} />
<Stats id="stats" {...stats} />
