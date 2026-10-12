<script module lang="ts">
	import type { ButtonProps } from './button.svelte';
	import type { HeaderNavProps } from './header-types';

	export type HeaderAbsoluteProps = HeaderNavProps & {
		/** Where the logo sits along the top. */
		logoPlacement?: 'start' | 'center' | 'end';
		/** Where the buttons and menu button sit along the top. Not the same side as the logo, or they overlap. */
		controlsPlacement?: 'start' | 'center' | 'end';
		/** `fixed` stays on screen while the page scrolls. `absolute` is part of the top of the page and scrolls away with it. */
		position?: 'fixed' | 'absolute';
		/** Slides out of view while scrolling down, and back as you scroll up. Only with `fixed`. */
		hideOnScroll?: boolean;
		/** Draws over the page in inverted colors (`mix-blend-mode: difference`), so it stays readable over any picture or color. */
		blend?: boolean;
		/** `links` shows the navigation links in the middle from the `lg` breakpoint up, with a strap of social links in the top corner, and the menu button only on smaller screens. `controls` keeps the buttons and the menu button on every size, and the links are only in the full-screen menu. */
		desktopLayout?: 'links' | 'controls';
		/** The navigation on smaller screens: `slide` is a panel from the right over about three quarters of the screen, with no backdrop. `overlay` fills the screen. */
		mobileNav?: 'slide' | 'overlay';
		/** The navigation panel's background: `solid`, a translucent `blur`, or `glass` (refraction in Chrome, blur elsewhere). */
		navSurface?: 'solid' | 'blur' | 'glass';
		/** The icon in the strap's loop. A placeholder until a site picks its own. Empty for none. */
		strapIcon?: string;
		/** Shows the buttons beside the menu button from the `lg` breakpoint up. Only with the `controls` layout. */
		showCtas?: boolean;
	};
</script>

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { textRoll } from '$lib/attachments/text-roll';
	import { watchScroll } from '$lib/attachments/watch-scroll';
	import Button from './button.svelte';
	import Logo from './logo.svelte';
	import MenuLinks from './menu-links.svelte';
	import SiteNav from './site-nav.svelte';
	import SiteNavButton from './site-nav-button.svelte';
	import SocialLinks from './social-links.svelte';
	import Strap from './strap.svelte';

	let {
		logo,
		links = [],
		ctas = [],
		socialLinks = [],
		navFooterLinks = [],
		adminLogin = false,
		showSkipLink = true,
		navButton = {},
		logoPlacement = 'start',
		controlsPlacement = 'end',
		position = 'fixed',
		hideOnScroll = false,
		blend = false,
		desktopLayout = 'links',
		mobileNav = 'slide',
		strapIcon = 'orbit',
		navSurface = 'solid',
		showCtas = true
	}: HeaderAbsoluteProps = $props();

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

	// The slide-out has no backdrop, so a press anywhere on the page beside it closes it.
	const onPointerdown = (event: PointerEvent) => {
		if (!open || mobileNav !== 'slide') return;
		const target = event.target as Element | null;
		if (!target?.closest('.site-nav, .controls')) close();
	};

	afterNavigate(close);
</script>

<svelte:window onkeydown={onKeydown} onpointerdown={onPointerdown} />

<!-- The header itself is a bar with no size, and nothing in it catches the pointer except the logo and the controls,
so a link or button anywhere else on the page stays clickable, even right under it. -->
<header
	class="header {position} layout-{desktopLayout}"
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
		<div class="logo place-{logoPlacement}"><Logo {...logo} url="/" /></div>
	{/if}

	{#if desktopLayout === 'links'}
		<div class="links">
			<MenuLinks {links} label="Primary" dropdownSurface="solid" />
		</div>

		<div class="strap place-end">
			<Strap icon={strapIcon} bleed={40}><SocialLinks links={socialLinks} /></Strap>
		</div>
	{/if}

	<div class="controls place-{controlsPlacement}" bind:this={controls}>
		{#if showCtas && ctas.length}
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
	always={desktopLayout === 'controls'}
	variant={mobileNav}
	{strapIcon}
	surface={navSurface}
	onlink={close}
/>

<style lang="scss">
	@use 'base/mixins';

	.header {
		--top: 20px;
		--bar: 56px;
		--bleed: 40px;
		--strap-height: 64px;

		top: 0;
		left: 0;
		z-index: var(--z-header);
		width: 100%;
		height: 0;
		pointer-events: none;

		@include mixins.max-md {
			--top: 12px;
		}

		// With the links and the strap, the row is as tall as the strap.
		@include mixins.min-lg {
			--top: 32px;
			--bar: var(--strap-height);
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

	// The logo and the menu button slide away on the way down, if asked, unless the menu is open or focus is inside.
	// The header has no height of its own, so they move by a distance that clears their tallest piece.
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

	// The logo, links, strap and controls are the only things that catch the pointer. They share one row, so they line
	// up whatever their own heights.
	.logo,
	.links,
	.strap,
	.controls {
		position: absolute;
		top: var(--top);
		display: flex;
		align-items: center;
		height: var(--bar);
		pointer-events: auto;
	}

	.links,
	.strap {
		display: none;

		@include mixins.min-lg {
			display: flex;
		}
	}

	.links {
		left: 50%;
		translate: -50% 0;

		@include mixins.mq-motion-allow {
			transition: translate var(--duration) var(--ease);
		}
	}

	// Scrolling down, away from the top, the links lift off the screen. They come back as you scroll up, or when focus
	// is in the links themselves. Focus in the strap brings back only the strap.
	.header:global([data-scroll-down]) .links:not(:focus-within) {
		translate: -50% calc(-1 * (var(--top) + 96px));
	}

	// With the links layout, the menu button is only for screens too small for the links.
	.layout-links .controls {
		@include mixins.min-lg {
			display: none;
		}
	}

	.layout-links .ctas {
		display: none;
	}

	.controls {
		gap: 2ch;
	}

	.ctas {
		display: none;
		align-items: center;
		gap: 2ch;

		@include mixins.min-lg {
			display: flex;
		}
	}

	.place-start {
		@include mixins.left-spacing;
	}

	.place-end {
		@include mixins.right-spacing;
	}

	// The strap runs past the right edge of the screen, so only the loop end and the links show, and the curve at its
	// far end is never seen. On an ultra-wide screen (above the content width) it is placed against the content
	// instead, with its whole pill in view, and it stays put when scrolling.
	.strap {
		right: calc(var(--bleed) * -1);

		@include mixins.mq-motion-allow {
			transition: translate 0.6s var(--ease);
		}

		@include mixins.min-xl {
			@include mixins.right-spacing;

			// The padding that hid the far end is not needed.
			:global(.strap) {
				--strap-bleed: 0px !important;
			}
		}
	}

	// Scrolling down, away from the top, it slides right until only the loop and its icon are left, and comes back
	// as you scroll up or when focus is in it.
	.header:global([data-scroll-down]) .strap:not(:focus-within) {
		translate: calc(100% - var(--bleed) - var(--strap-height)) 0;

		@include mixins.min-xl {
			translate: none;
		}
	}

	.place-center {
		left: 50%;
		translate: -50% 0;
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
