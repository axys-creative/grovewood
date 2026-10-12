<script lang="ts">
	import Seo from '$lib/components/seo.svelte';

	let { children } = $props();
</script>

<Seo />
{@render children()}
