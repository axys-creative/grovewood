<script module lang="ts">
	import type { ButtonProps } from './button.svelte';
	import type { HeaderNavProps } from './header-types';

	export type HeaderSimpleProps = HeaderNavProps & {
		linkPlacement?: 'start' | 'center' | 'end';
		/** `overlay` fills the screen. `slide` is a rounded panel from the right, under the header, with the social links in the corner. */
		mobileNav?: 'overlay' | 'slide';
		/** A line along the bottom edge of the header (all the way round when it floats). Defaults to `true`. */
		border?: boolean;
		/** The button type of the header and mobile navigation links. Defaults to `underline`. */
		linkType?: ButtonProps['type'];
		float?: boolean;
		/** A translucent, blurred background. */
		blur?: boolean;
		/** The glass attachment's background: refraction in Chrome, blur elsewhere. Wins over `blur`. */
		glass?: boolean;
		hideOnScroll?: boolean;
	};
</script>

<script lang="ts">
	import { glass as glassEffect } from '$lib/attachments/glass';
	import { magnet } from '$lib/attachments/magnet';
	import { textRoll } from '$lib/attachments/text-roll';
	import { watchScroll } from '$lib/attachments/watch-scroll';
	import Button from './button.svelte';
	import Logo from './logo.svelte';
	import MenuLinks from './menu-links.svelte';
	import SiteNav from './site-nav.svelte';
	import SiteNavButton from './site-nav-button.svelte';

	let {
		logo,
		links = [],
		ctas = [],
		socialLinks = [],
		linkPlacement = 'end',
		linkType = 'underline',
		mobileNav = 'overlay',
		border = true,
		float = false,
		blur = false,
		glass = false,
		hideOnScroll = true,
		showSkipLink = true,
		navButton = {},
		navFooterLinks = [],
		adminLogin = false
	}: HeaderSimpleProps = $props();

	const navId = 'site-navigation';
	const footerLinks = $derived<ButtonProps[]>([
		...navFooterLinks,
		...(adminLogin ? [{ text: 'Admin Log In', url: '/admin' }] : [])
	]);

	let open = $state(false);
	let buttonWrapper = $state<HTMLElement>();
	let headerElement = $state<HTMLElement>();
	// Where the sliding panel starts: just under the bar, wherever the bar is when it opens.
	let navTop = $state('0px');

	const toggle = () => {
		if (!open && headerElement)
			navTop = `${Math.round(headerElement.getBoundingClientRect().bottom)}px`;
		open = !open;
	};
	const close = () => (open = false);

	// The sliding panel has no backdrop, so a press anywhere beside it closes it.
	const onPointerdown = (event: PointerEvent) => {
		if (!open || mobileNav !== 'slide') return;
		const target = event.target as Element | null;
		if (!target?.closest('.site-nav, .nav-button')) close();
	};

	$effect(() => {
		const query = matchMedia('(min-width: 1024px)');
		const onChange = () => query.matches && close();
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !open) return;
		close();
		buttonWrapper?.querySelector('button')?.focus();
	};
</script>

<svelte:window onkeydown={onKeydown} onpointerdown={onPointerdown} />

{#snippet siteNav()}
	<SiteNav
		id={navId}
		{open}
		{links}
		{footerLinks}
		{socialLinks}
		{linkType}
		socialLabel="Connect with us!"
		variant={mobileNav}
		strap={false}
		top={mobileNav === 'slide' ? navTop : undefined}
		rounded={mobileNav === 'slide'}
		onlink={close}
	/>
{/snippet}

<header
	class="header page-grid {linkPlacement}"
	class:float
	class:bordered={border}
	class:blur={blur && !glass}
	class:has-glass={glass}
	data-nav-open={open || undefined}
	bind:this={headerElement}
	{@attach hideOnScroll ? watchScroll() : undefined}
>
	{#if glass}<div class="glass-layer" aria-hidden="true" {@attach glassEffect()}></div>{/if}

	{#if showSkipLink}
		<a class="skip-link" href="#main">Skip to main content</a>
	{/if}

	<div class="inner">
		{#if logo}<Logo {...logo} url="/" />{/if}

		<MenuLinks
			class="links"
			{links}
			label="Primary"
			type={linkType}
			dropdownSurface={glass ? 'glass' : blur ? 'blur' : 'solid'}
		/>

		{#if ctas.length}
			<div class="ctas">
				{#each ctas as cta (`${cta.url}|${cta.text}`)}
					<Button
						{...cta}
						{@attach textRoll()}
						{@attach cta.type === 'solid' || cta.type === undefined
							? magnet({ x: 0.12, y: 0.48, returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)' })
							: undefined}
					/>
				{/each}
			</div>
		{/if}

		<div class="nav-button" bind:this={buttonWrapper}>
			<SiteNavButton {...navButton} expanded={open} controls={navId} onclick={toggle} />
		</div>
	</div>

	{#if mobileNav === 'slide'}{@render siteNav()}{/if}
</header>

{#if mobileNav !== 'slide'}{@render siteNav()}{/if}

<style lang="scss">
	@use 'base/mixins';

	.header {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		background: var(--color-bg);
		box-shadow: var(--box-shadow);

		@include mixins.mq-motion-allow {
			transition: translate var(--duration) var(--ease);
		}

		&:global([data-scroll-down]):not(:focus-within):not([data-nav-open]) {
			translate: 0 -100%;
		}
	}

	.bordered {
		border-block-end: 1px solid var(--color-border);
	}

	.float {
		top: var(--float-offset);
		width: calc(100% - var(--float-offset) * 2);
		max-width: var(--content-width);
		margin: var(--float-offset) auto 0;
		display: block;
		border-radius: var(--radius);

		&:global([data-scroll-down]):not(:focus-within):not([data-nav-open]) {
			translate: 0 calc(-100% - var(--float-offset) * 2);
		}
	}

	.float.bordered {
		border: 1px solid var(--color-border);
	}

	// The blur sits on a pseudo-element, and glass on its own layer, so dropdown panels can still blur the page behind them.
	.blur,
	.has-glass {
		background: transparent;
	}

	.glass-layer {
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: inherit;
		pointer-events: none;
	}

	.blur {
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			border-radius: inherit;
			@include mixins.glass;
		}
	}

	.inner {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding-block: 12px;
	}

	.float .inner {
		padding-inline: var(--body-padding);
	}

	.header :global(.links) {
		--links-gap: 36px;
	}

	.header :global(.links),
	.ctas {
		display: none;

		@include mixins.min-lg {
			display: flex;
		}
	}

	.ctas {
		align-items: center;
		gap: 2ch;
	}

	.start :global(.links) {
		margin-inline-end: auto;
	}

	.end :global(.links) {
		margin-inline-start: auto;
	}

	.center :global(.links) {
		position: absolute;
		left: 50%;
		translate: -50% 0;
	}

	// Above the slide-in panel, which sits inside the header and covers it.
	.nav-button {
		position: relative;
		z-index: calc(var(--z-nav) + 1);
		margin-inline-start: auto;

		@include mixins.min-lg {
			display: none;
		}
	}

	.skip-link {
		position: absolute;
		top: 100%;
		left: 0;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;

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
