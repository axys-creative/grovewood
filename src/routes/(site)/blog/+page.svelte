<script lang="ts">
	import PostCard from '$lib/components/post-card.svelte';
	import hero from '$lib/content/page_blog/hero-simple.json';
	import HeroSimple from '$lib/sections/hero-simple.svelte';

	let { data } = $props();
</script>

<HeroSimple id="hero" {...hero} />

<section class="posts">
	{#each data.posts as post, index (post.slug)}
		<PostCard {post} featured={index === 0} />
	{:else}
		<p>No posts yet.</p>
	{/each}
</section>

<style lang="scss">
	@use 'base/mixins';

	.posts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 32px;
		max-width: var(--content-width);
		margin-inline: auto;
		padding: 0 var(--body-padding) var(--body-padding-double);

		@include mixins.max-md {
			grid-template-columns: 1fr;
		}
	}
</style>
