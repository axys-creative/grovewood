<script lang="ts">
	import { page } from '$app/state';
	import notFound from '$lib/content/page_404/hero-simple.json';
	import HeroSimple from '$lib/sections/hero-simple.svelte';

	const problem = {
		title: 'Something went wrong',
		description: 'Please try again in a moment.',
		cta: notFound.cta
	};
</script>

<HeroSimple {...page.status === 404 ? notFound : problem} />
