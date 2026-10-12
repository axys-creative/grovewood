<script module lang="ts">
	import type { ButtonProps } from './button.svelte';
	import type { SocialLink } from './social-links.svelte';

	export type FooterGnomonProps = {
		/** The heading at the top left. */
		title?: string;
		/** `2` or `3`. Which heading level the title is. */
		level?: 2 | 3;
		/** The one button under the title. */
		cta?: ButtonProps;
		/** Sit in the notch at the top right, and above the copyright on small screens. */
		socialLinks?: SocialLink[];
		/** The social links in the solid Button style, a box each. */
		socialSolid?: boolean;
		/** Up to three columns of links, at the bottom right. */
		linksets?: { title?: string; links: ButtonProps[] }[];
		copyright?: string;
		/** The notch at the top right, in px. These are minimums: it grows to hold the social links, however many. */
		notch?: { width?: number; height?: number };
		/** The corner curve in px. */
		radius?: number;
		/** The stroke width in px. */
		borderWidth?: number;
		/** At least the height of the screen, with the content spread over it. */
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { textRoll } from '$lib/attachments/text-roll';
	import site from '$lib/content/meta/site.json';
	import { notchedBoxPath, roundedBoxPath } from '$lib/utils/gnomon';
	import Button from './button.svelte';
	import MenuLinks from './menu-links.svelte';
	import SocialLinks from './social-links.svelte';

	const NOTCH_PADDING = { x: 36, y: 24 };

	let {
		title,
		level = 2,
		cta,
		socialLinks = [],
		socialSolid = false,
		linksets = [],
		copyright,
		notch,
		radius = 28,
		borderWidth = 2,
		fullScreen = false,
		class: className
	}: FooterGnomonProps = $props();

	const copyrightText = $derived(
		copyright || `© ${new Date().getFullYear()} ${site.siteName}. All rights reserved.`
	);

	let width = $state(0);
	let height = $state(0);
	let linksWidth = $state(0);
	let linksHeight = $state(0);
	// Below the md breakpoint there is no notch: a plain rounded box, with the social links above the copyright.
	let compact = $state(false);

	$effect(() => {
		const query = matchMedia('(max-width: 767px)');
		const update = () => (compact = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	const notched = $derived(!compact && socialLinks.length > 0);

	// The notch is at least as big as asked, and grows to hold the social links: wider for more icons, and taller once
	// they no longer fit on one row inside the most the notch may take, about half the footer.
	const notchMax = $derived(width * 0.55);
	const notchWidth = $derived(
		Math.min(Math.max(notch?.width ?? 0, linksWidth + NOTCH_PADDING.x * 2), notchMax)
	);
	const notchHeight = $derived(Math.max(notch?.height ?? 80, linksHeight + NOTCH_PADDING.y * 2));
	const shape = $derived(
		width && height
			? notched
				? notchedBoxPath(width, height, notchWidth, notchHeight, radius)
				: roundedBoxPath(width, height, radius)
			: ''
	);
</script>

<footer class="footer-gnomon page-grid {className ?? ''}" class:full-screen={fullScreen}>
	<div
		class="shell"
		style="--border-width: {borderWidth}px; --notch-width: {notched
			? notchWidth
			: 0}px; --notch-height: {notched ? notchHeight : 0}px"
		bind:clientWidth={width}
		bind:clientHeight={height}
	>
		{#if shape}
			<svg class="stroke" viewBox="0 0 {width} {height}" aria-hidden="true">
				<path d={shape} />
			</svg>
			<div class="surface" style="clip-path: path('{shape}')"></div>
		{/if}

		{#if notched}
			<div class="notch">
				<div
					class="notch-links"
					style="max-width: {Math.max(notchMax - NOTCH_PADDING.x * 2, 0)}px"
					bind:clientWidth={linksWidth}
					bind:clientHeight={linksHeight}
				>
					<SocialLinks links={socialLinks} solid={socialSolid} />
				</div>
			</div>
		{/if}

		<div class="content">
			<div class="head">
				{#if title}
					<svelte:element this={`h${level}`} class="title h3">{title}</svelte:element>
				{/if}
				{#if cta}<Button {...cta} {@attach textRoll()} />{/if}
			</div>

			{#if linksets.length}
				<div class="linksets">
					{#each linksets.slice(0, 3) as { title, links } (title ?? links[0]?.url)}
						<div class="linkset">
							{#if title}<strong>{title}</strong>{/if}
							<MenuLinks {links} label={title ?? 'Footer'} direction="column" />
						</div>
					{/each}
				</div>
			{/if}

			{#if socialLinks.length && compact}
				<div class="social"><SocialLinks links={socialLinks} solid={socialSolid} /></div>
			{/if}

			<p class="copyright">{copyrightText}</p>
		</div>
	</div>
</footer>

<style lang="scss">
	@use 'base/mixins';

	.footer-gnomon {
		margin-block-start: var(--body-padding);
		padding-block-end: var(--body-padding);
	}

	.full-screen {
		min-height: 100lvh;
		align-content: end;
	}

	.shell {
		position: relative;
		grid-column: content;
		min-height: max(560px, calc(var(--notch-height) + 440px));

		@include mixins.max-md {
			min-height: 0;
		}
	}

	// The stroke follows the same outline as the fill, which is clipped to it, so the fill's edge sits on the line.
	.stroke {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;

		path {
			fill: none;
			stroke: var(--color-border);
			stroke-width: var(--border-width);
		}
	}

	.surface {
		position: absolute;
		inset: 0;
		background: var(--color-surface);
	}

	// The notch is empty page, so the social links sit in it, not on the footer.
	.notch {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--notch-width);
		height: var(--notch-height);
	}

	.notch-links {
		width: max-content;
	}

	.content {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: 1fr auto;
		// A wide gap between the top (title, button) and the bottom (links, copyright) makes the footer tall on desktop.
		gap: 120px 32px;
		align-items: end;
		height: 100%;
		min-height: inherit;
		padding: 40px;

		@include mixins.max-md {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto auto auto;
			gap: 32px;
			min-height: 520px;
			padding: 32px 24px;
		}
	}

	.head {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		align-self: start;
		gap: 24px;
		grid-area: 1 / 1 / 2 / 3;
		// Beside the notch, not under it.
		max-width: calc(100% - var(--notch-width) - 32px);

		@include mixins.max-md {
			grid-area: 1 / 1;
			max-width: none;
		}
	}

	.title {
		margin: 0;
		text-wrap: balance;
		max-width: 480px;
	}

	.copyright {
		grid-area: 2 / 1;
		margin: 0;
		color: var(--color-text-muted);
		font-size: 14px;

		@include mixins.max-md {
			grid-area: 5 / 1;
		}
	}

	.social {
		grid-area: 4 / 1;
		padding-block: 8px 16px;
	}

	.linksets {
		display: grid;
		grid-area: 2 / 2;
		grid-template-columns: repeat(3, max-content);
		gap: 32px 64px;
		justify-self: end;

		@include mixins.max-md {
			grid-area: 3 / 1;
			grid-template-columns: repeat(2, max-content);
			justify-self: start;
		}

		@include mixins.max-xs {
			grid-template-columns: max-content;
		}
	}

	.linkset strong {
		display: block;
		margin-block-end: 12px;
		color: var(--color-text-muted);
	}
</style>
