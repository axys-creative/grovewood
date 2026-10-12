<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import BlogArticleBody from '$lib/sections/blog-article-body.svelte';
	import BlogArticleHero from '$lib/sections/blog-article-hero.svelte';

	let { data } = $props();
</script>

<BlogArticleHero {...data.post} />
<BlogArticleBody html={data.html} />

<footer class="back">
	<Button text="Back to blog" url="/blog" type="underline" iconStart="chevron-left" />
</footer>

<style lang="scss">
	.back {
		max-width: calc(var(--max-width-text) + 2 * var(--body-padding));
		margin-inline: auto;
		padding: 0 var(--body-padding) var(--body-padding-double);
	}
</style>
