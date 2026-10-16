<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import hero from '$lib/content/page_assessment/hero-simple.json';
</script>

<HeroSimple id="hero" {...hero as ComponentProps<typeof HeroSimple>} />
