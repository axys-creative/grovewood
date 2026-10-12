<script module lang="ts">
	import type { ButtonProps } from './button.svelte';
	import type { HeaderNavProps } from './header-types';

	export type HeaderBasicProps = HeaderNavProps & {
		/** `fixed` stays on screen while the page scrolls. `absolute` is part of the top of the page and scrolls away with it. */
		position?: 'fixed' | 'absolute';
		/** Slides out of view while scrolling down, and back as you scroll up. Only with `fixed`. */
		hideOnScroll?: boolean;
		/** Draws over the page in inverted colors (`mix-blend-mode: difference`), so it stays readable over any picture or color. */
		blend?: boolean;
		/** The social links at the bottom of the navigation in the solid Button style, a box each. */
		socialSolid?: boolean;
		/** The navigation's background: `solid`, a translucent `blur`, or `glass` (refraction in Chrome, blur elsewhere). */
		navSurface?: 'solid' | 'blur' | 'glass';
	};
</script>

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { textRoll } from '$lib/attachments/text-roll';
	import { watchScroll } from '$lib/attachments/watch-scroll';
	import Button from './button.svelte';
	import Logo from './logo.svelte';
	import SiteNav from './site-nav.svelte';
	import SiteNavButton from './site-nav-button.svelte';

	let {
		logo,
		ctas = [],
		socialLinks = [],
		socialSolid = false,
		links = [],
		navFooterLinks = [],
		adminLogin = false,
		showSkipLink = true,
		navButton = {},
		position = 'fixed',
		hideOnScroll = false,
		blend = false,
		navSurface = 'solid'
	}: HeaderBasicProps = $props();

	const id = $props.id();
	const navId = `${id}-navigation`;
	const footerLinks = $derived<ButtonProps[]>([
		...navFooterLinks,
		...(adminLogin ? [{ text: 'Admin Log In', url: '/admin' }] : [])
	]);

	let open = $state(false);
	let controls = $state<HTMLElement>();

	const close = () => (open = false);

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !open) return;
		close();
		controls?.querySelector('button')?.focus();
	};

	afterNavigate(close);
</script>

<svelte:window onkeydown={onKeydown} />

<!-- The header is a bar with no size, and nothing in it catches the pointer except the logo and the controls, so a
link or button anywhere else on the page stays clickable, even right under it. -->
<header
	class="header {position}"
	class:hide={hideOnScroll}
	class:blend
	data-nav-open={open || undefined}
	data-header-parts
	{@attach position === 'fixed' ? watchScroll() : undefined}
>
	{#if showSkipLink}
		<a class="skip-link" href="#main">Skip to main content</a>
	{/if}

	{#if logo}
		<div class="logo"><Logo {...logo} url="/" /></div>
	{/if}

	<div class="controls" bind:this={controls}>
		{#if ctas.length}
			<div class="ctas">
				{#each ctas as cta (`${cta.url}|${cta.text}`)}
					<Button {...cta} {@attach textRoll()} />
				{/each}
			</div>
		{/if}
		<SiteNavButton {...navButton} expanded={open} controls={navId} onclick={() => (open = !open)} />
	</div>
</header>

<SiteNav
	id={navId}
	{open}
	{links}
	{footerLinks}
	{socialLinks}
	{socialSolid}
	{ctas}
	always
	variant="center"
	surface={navSurface}
	onlink={close}
/>

<style lang="scss">
	@use 'base/mixins';

	.header {
		--top: 20px;
		--bar: 56px;

		top: 0;
		left: 0;
		z-index: var(--z-header);
		width: 100%;
		height: 0;
		pointer-events: none;

		@include mixins.max-md {
			--top: 12px;
		}

		@include mixins.min-lg {
			--top: 32px;
		}

		@include mixins.mq-motion-allow {
			transition: translate var(--duration) var(--ease);
		}
	}

	.fixed {
		position: fixed;
	}

	.absolute {
		position: absolute;
	}

	// The header has no height of its own, so the logo and controls move by a distance that clears their tallest piece.
	.hide:global([data-scroll-down]):not(:focus-within):not([data-nav-open]) {
		.logo,
		.controls {
			translate: 0 calc(-1 * (var(--top) + 96px));
		}
	}

	.blend {
		color: #fff;
		mix-blend-mode: difference;
	}

	.logo,
	.controls {
		position: absolute;
		top: var(--top);
		display: flex;
		align-items: center;
		height: var(--bar);
		pointer-events: auto;

		@include mixins.mq-motion-allow {
			transition: translate var(--duration) var(--ease);
		}
	}

	.logo {
		@include mixins.left-spacing;
	}

	.controls {
		@include mixins.right-spacing;

		gap: 2ch;
	}

	// The buttons are only for screens wide enough for them. Below that they are in the navigation.
	.ctas {
		display: none;
		align-items: center;
		gap: 2ch;

		@include mixins.min-lg {
			display: flex;
		}
	}

	.skip-link {
		position: absolute;
		top: var(--top);
		@include mixins.left-spacing;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		pointer-events: auto;

		&:focus {
			width: auto;
			height: auto;
			padding: 8px 16px;
			clip-path: none;
			border: 1px solid var(--color-border);
			border-radius: var(--radius-btn);
			background: var(--color-bg);
		}
	}
</style>
