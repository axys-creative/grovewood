<script lang="ts">
	import { onMount } from 'svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import hero from '$lib/content/page_home/hero-simple.json';
	import { hasIdentityToken, loadIdentity } from '$lib/utils/identity';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};

	// Netlify sends CMS invite and recovery links to the home page.
	onMount(() => {
		if (!hasIdentityToken()) return;
		loadIdentity().then((identity) => identity.on('login', () => location.assign('/admin/')));
	});
</script>

<HeroSimple id="hero" {...hero} {cta} />
