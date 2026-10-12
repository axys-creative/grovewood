<script module lang="ts">
	export type LogoProps = {
		src?: string;
		/** Image shown in the light theme. Use with `srcDark`; the right one shows for the theme. */
		srcLight?: string;
		/** Image shown in the dark theme. */
		srcDark?: string;
		text?: string;
		alt?: string;
		url?: string;
		tint?: boolean;
	};
</script>

<script lang="ts">
	import { isCurrentPage, onCurrentPageClick } from '$lib/utils/current-page';

	let { src, srcLight, srcDark, text, alt = '', url, tint = false }: LogoProps = $props();

	const label = $derived(text ? undefined : alt || undefined);
</script>

{#snippet content()}
	{#if srcLight || srcDark}
		{#if srcLight}<img class="themed light" src={srcLight} alt={text ? '' : alt} />{/if}
		{#if srcDark}<img class="themed dark" src={srcDark} alt={text ? '' : alt} />{/if}
	{:else if src && tint}
		<span class="mark" style="mask-image: url('{src}')" aria-hidden="true"></span>
	{:else if src}
		<img {src} alt={text ? '' : alt} />
	{/if}
	{#if text}<span class="text">{text}</span>{/if}
{/snippet}

{#if url}
	<a
		class="logo"
		href={url}
		aria-label={label}
		aria-current={isCurrentPage(url) ? 'page' : undefined}
		onclick={isCurrentPage(url) ? onCurrentPageClick : undefined}>{@render content()}</a
	>
{:else}
	<div class="logo" role={label ? 'img' : undefined} aria-label={label}>{@render content()}</div>
{/if}

<style lang="scss">
	.logo {
		--logo-size: 20px;

		display: inline-flex;
		align-items: center;
		gap: 12px;
		color: var(--color-text);
		font-family: var(--font-heading);
		font-weight: 700;
		text-decoration: none;
	}

	// A wide logo keeps its shape: its height is set and the width follows.
	.themed {
		width: auto;
		height: var(--logo-height, var(--logo-size));
		max-width: 100%;
	}

	// The theme tokens decide which file shows, so a logo follows the surface it sits on, not only the page.
	.light {
		display: var(--display-light, none);
	}

	.dark {
		display: var(--display-dark, block);
	}

	img:not(.themed),
	.mark {
		width: var(--logo-size);
		height: var(--logo-size);
		object-fit: contain;
	}

	.mark {
		display: block;
		background: currentColor;
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
	}
</style>
