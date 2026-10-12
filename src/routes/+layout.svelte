<script lang="ts">
	import { onMount } from 'svelte';
	import Seo from '$lib/components/seo.svelte';
	import { initTheme } from '$lib/theme.svelte';

	let { children } = $props();

	onMount(initTheme);
</script>

<Seo />
{@render children()}
