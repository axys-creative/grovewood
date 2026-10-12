<script module lang="ts">
	import type { ButtonProps } from './button.svelte';
	import type { NavLink } from './menu-links.svelte';
	import type { SocialLink } from './social-links.svelte';

	export type SiteNavProps = {
		id: string;
		open: boolean;
		links?: NavLink[];
		/** Small links along the bottom. */
		footerLinks?: ButtonProps[];
		socialLinks?: SocialLink[];
		/** The social links in the solid Button style, a box each. */
		socialSolid?: boolean;
		/** Buttons under the links, for a header that hides them from its own bar on small screens. With `always` they only show below the `lg` breakpoint. */
		ctas?: ButtonProps[];
		/** Shows at every screen size. Without it, it is for small screens only (a header shows its own links above that). */
		always?: boolean;
		/** `center` fades in over the whole screen with the links centered in a column and the social links, under a small label, at the bottom. `overlay` fills the screen. `slide` is a panel that slides in from the right, over about three quarters of the screen (all of it on the smallest), with no backdrop, and the social links in a strap at its bottom right. */
		variant?: 'overlay' | 'slide' | 'center';
		/** The small label above the social links, for the `center` variant. */
		socialLabel?: string;
		/** The icon in the strap's loop, for the `slide` variant. */
		strapIcon?: string;
		/** The panel's background: a solid color, a translucent blur, or the glass attachment (refraction in Chrome, blur elsewhere). */
		surface?: 'solid' | 'blur' | 'glass';
		/** Called when a link inside is chosen. */
		onlink?: () => void;
	};
</script>

<script lang="ts">
	import { glass } from '$lib/attachments/glass';
	import { push } from '$lib/attachments/push';
	import { scribble } from '$lib/attachments/scribble';
	import { textRoll } from '$lib/attachments/text-roll';
	import { imageProps } from '$lib/utils/image';
	import Button from './button.svelte';
	import Eyebrow from './eyebrow.svelte';
	import MenuLinks from './menu-links.svelte';
	import SocialLinks from './social-links.svelte';
	import Strap from './strap.svelte';

	let {
		id,
		open,
		links = [],
		footerLinks = [],
		socialLinks = [],
		socialSolid = false,
		ctas = [],
		always = false,
		variant = 'overlay',
		strapIcon = 'orbit',
		socialLabel = 'Connect with us',
		surface = 'solid',
		onlink
	}: SiteNavProps = $props();

	// While the navigation is open, everything behind it is out of reach for keyboards and screen readers, and the page
	// does not scroll.
	$effect(() => {
		if (!open) return;

		const behind = document.querySelectorAll<HTMLElement>('main, footer');
		behind.forEach((el) => (el.inert = true));
		document.body.style.overflow = 'hidden';

		return () => {
			behind.forEach((el) => (el.inert = false));
			document.body.style.overflow = '';
		};
	});

	// The center variant shows the hovered link's pictures. They are put in the page, and so start loading, the first
	// time the navigation opens, so each is already there to transition when its link is first pointed at.
	let active = $state<number | null>(null);
	let loaded = $state(false);

	$effect(() => {
		if (open) loaded = true;
		else active = null;
	});

	const onclick = (event: MouseEvent) => {
		if ((event.target as Element).closest('a')) onlink?.();
	};
</script>

{#snippet buttons()}
	{#if ctas.length}
		<div class="ctas">
			{#each ctas as cta (`${cta.url}|${cta.text}`)}
				<Button {...cta} {@attach textRoll()} />
			{/each}
		</div>
	{/if}
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<nav
	{id}
	class="site-nav {variant}"
	class:open
	class:always
	class:blur={surface === 'blur'}
	aria-label="Site navigation"
	inert={!open}
	data-lenis-prevent
	{onclick}
	{@attach surface === 'glass' ? glass({ blur: 16, tint: 'rgb(0 0 0 / 0.6)' }) : undefined}
>
	{#if variant === 'slide'}
		<div class="scroll">
			<MenuLinks
				class="site-nav-links"
				{links}
				label="Primary"
				direction="column"
				landmark={false}
			/>
			{@render buttons()}
		</div>

		<!-- The strap runs past the panel's edge, which clips it, so only its loop end shows. -->
		<div class="corner">
			{#if footerLinks.length}
				<ul class="footer-links">
					{#each footerLinks as link (`${link.url}|${link.text}`)}
						<li><Button {...link} type="underline" size="sm" {@attach textRoll()} /></li>
					{/each}
				</ul>
			{/if}

			<Strap icon={strapIcon} bleed={40}><SocialLinks links={socialLinks} /></Strap>
		</div>
	{:else if variant === 'center'}
		<div class="previews" aria-hidden="true">
			{#each links as link, index (`${link.url}|${link.text}`)}
				{#if loaded && link.images?.length}
					<div class="preview" class:shown={active === index}>
						{#each link.images.slice(0, 4) as image, picture (picture)}
							<div
								class="picture picture-{picture + 1}"
								style="--order: {picture}"
								{@attach push()}
							>
								<img
									class="image"
									{...imageProps(image.src, { sizes: '240px' })}
									alt=""
									draggable="false"
								/>
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>

		<div class="middle">
			<div class="middle-links">
				<MenuLinks
					class="site-nav-links"
					{links}
					label="Primary"
					direction="column"
					landmark={false}
					onactive={(index) => {
						if (index !== null) active = index;
					}}
					linkAttach={scribble({ curve: 'random', hover: true })}
				/>
				{@render buttons()}
			</div>

			{#if socialLinks.length}
				<div class="connect">
					<Eyebrow text={socialLabel} />
					<SocialLinks links={socialLinks} solid={socialSolid} />
				</div>
			{/if}
		</div>
	{:else}
		<div class="constraint">
			<MenuLinks
				class="site-nav-links"
				{links}
				label="Primary"
				direction="column"
				landmark={false}
			/>
			{@render buttons()}

			<div class="footer">
				{#if footerLinks.length}
					<ul class="footer-links">
						{#each footerLinks as link (`${link.url}|${link.text}`)}
							<li><Button {...link} type="underline" size="sm" {@attach textRoll()} /></li>
						{/each}
					</ul>
				{/if}
				<SocialLinks links={socialLinks} />
			</div>
		</div>
	{/if}
</nav>

<style lang="scss">
	@use 'base/mixins';

	// A full-screen navigation that fades in under the header.
	.site-nav {
		position: fixed;
		inset: 0;
		z-index: var(--z-nav);
		display: flex;
		flex-direction: column;
		overflow: auto;
		background: var(--glass-tint, var(--color-bg));
		opacity: 0;
		visibility: hidden;
		pointer-events: none;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.24s ease,
				visibility 0.24s;
		}

		&:not(.always) {
			@include mixins.min-lg {
				display: none;
			}
		}

		&.blur {
			@include mixins.glass;
		}

		&.open {
			opacity: 1;
			visibility: visible;
			pointer-events: all;
		}
	}

	.constraint {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 48px;
		width: 100%;
		max-width: calc(var(--content-width) + var(--body-padding) * 2);
		height: 100dvh;
		min-height: 640px;
		margin: 0 auto var(--body-padding);
		padding: var(--body-padding);

		@include mixins.max-sm {
			min-height: 520px;
		}
	}

	.site-nav :global(.site-nav-links) {
		--btn-font-size: 24px;

		margin-block: max(40vh, 200px) auto;

		@include mixins.max-sm {
			--btn-font-size: 20px;

			margin-block: 32vh auto;
		}
	}

	// The pictures of the hovered link stagger in on either side of the links, two a side, tilted opposite ways. Only
	// where there is a mouse and room.
	.previews {
		position: absolute;
		inset: 0;
		z-index: 0;
		display: none;
		pointer-events: none;

		@include mixins.min-lg {
			@media (hover: hover) {
				display: block;
			}
		}
	}

	.preview {
		position: absolute;
		inset: 0;
	}

	.picture {
		--tilt: 0deg;
		--side: 12%;
		--top: 24%;

		position: absolute;
		top: var(--top);
		width: clamp(140px, 15vw, 240px);
		aspect-ratio: 4 / 5;
		pointer-events: none;
	}

	.image {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: var(--radius-card, 8px);
		object-fit: cover;
		opacity: 0;
		rotate: var(--tilt);
		scale: 0.7;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s ease,
				scale 0.3s ease;
		}
	}

	.picture-1,
	.picture-2 {
		left: var(--side);
	}

	.picture-3,
	.picture-4 {
		right: var(--side);
	}

	.picture-1 {
		--tilt: -7deg;
	}

	.picture-2 {
		--tilt: 6deg;
		--side: 20%;
		--top: 56%;
	}

	.picture-3 {
		--tilt: 7deg;
		--top: 20%;
	}

	.picture-4 {
		--tilt: -6deg;
		--side: 20%;
		--top: 54%;
	}

	.shown .picture {
		pointer-events: auto;
	}

	.shown .image {
		opacity: 1;
		scale: 1;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.5s var(--ease) calc(0.35s + var(--order) * 0.08s),
				scale 0.7s var(--ease) calc(0.35s + var(--order) * 0.08s);
		}
	}

	// The center variant: the links sit in the middle of the screen, and the social links rest at the bottom.
	.middle {
		position: relative;
		z-index: 1;
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		width: 100%;
		min-height: 520px;
		// Lets the pointer reach the pictures behind; what is interactive turns it back on.
		pointer-events: none;
		padding: 112px var(--body-padding) var(--body-padding);

		@include mixins.max-md {
			padding-inline: 24px;
		}
	}

	.middle-links {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 40px;
		text-align: center;
	}

	.site-nav :global(.middle-links .site-nav-links) {
		--btn-font-size: 32px;

		margin-block: 0;

		@include mixins.max-sm {
			--btn-font-size: 24px;
		}
	}

	.middle-links :global(.menu-links) {
		align-items: center;
	}

	.middle-links :global(.menu-links),
	.middle-links .ctas,
	.connect {
		pointer-events: auto;
	}

	.connect {
		display: flex;
		flex: none;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.footer {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 24px;
		width: 100%;

		@include mixins.min-md {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.ctas {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
	}

	.always .ctas {
		@include mixins.min-lg {
			display: none;
		}
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1ch;
		margin: 0;
		padding: 0;
		list-style: none;

		@include mixins.min-md {
			flex-direction: row;
		}
	}

	// The slide variant: a panel from the right with rounded left corners, over the page and not over a backdrop.
	.slide {
		inset: 0 0 0 auto;
		width: min(75vw, 640px);
		overflow: hidden;
		border-radius: 28px 0 0 28px;
		border-inline-start: 1px solid var(--color-border);
		// It only slides: it is fully opaque, and only off the screen when closed.
		opacity: 1;
		translate: 100% 0;

		@include mixins.mq-motion-allow {
			transition:
				translate 0.45s var(--ease),
				visibility 0.45s;
		}

		@include mixins.max-md {
			width: 100%;
			border-radius: 0;
			border-inline-start: 0;
		}

		&.open {
			translate: 0 0;
		}
	}

	.scroll {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		gap: 32px;
		min-height: 0;
		padding: 112px var(--body-padding) 24px;
		overflow: auto;

		@include mixins.max-md {
			padding-inline: 24px;
		}
	}

	.slide :global(.site-nav-links) {
		margin-block: auto;
	}

	// The links rise in one after another once the panel is moving.
	.slide :global(.site-nav-links > ul > li) {
		opacity: 0;
		translate: 64px 0;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s ease,
				translate 0.3s ease;
		}
	}

	.slide.open :global(.site-nav-links > ul > li) {
		opacity: 1;
		translate: 0 0;

		@include mixins.mq-motion-allow {
			@for $i from 1 through 8 {
				&:nth-of-type(#{$i}) {
					transition:
						opacity 1.2s var(--ease) #{0.2s + 0.1s * $i},
						translate 1.2s var(--ease) #{0.2s + 0.1s * $i};
				}
			}
		}
	}

	.corner {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: space-between;
		padding-block-end: 24px;
		padding-inline-start: var(--body-padding);

		@include mixins.max-md {
			padding-inline-start: 24px;
		}
	}

	.slide .footer-links {
		flex-direction: column;
	}

	// Pushed past the panel's right edge by the strap's own bleed, which the panel then clips. It slides in a moment
	// after the panel, from beyond that edge.
	.corner :global(.strap) {
		margin-inline-end: -40px;
		translate: 100% 0;

		@include mixins.mq-motion-allow {
			transition: translate 0.3s ease;
		}
	}

	.slide.open .corner :global(.strap) {
		translate: 0 0;

		@include mixins.mq-motion-allow {
			transition: translate 0.8s var(--ease) 0.25s;
		}
	}
</style>
