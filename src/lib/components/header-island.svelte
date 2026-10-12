<script module lang="ts">
	import type { HeaderNavProps } from './header-types';

	export type HeaderIslandProps = HeaderNavProps & {
		/** A translucent, blurred background. */
		blur?: boolean;
		/** The glass attachment's background: refraction in Chrome, blur elsewhere. Wins over `blur`. */
		glass?: boolean;
		hideOnScroll?: boolean;
	};
</script>

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { glass as glassEffect } from '$lib/attachments/glass';
	import { textRoll } from '$lib/attachments/text-roll';
	import { watchScroll } from '$lib/attachments/watch-scroll';
	import Button, { type ButtonProps } from './button.svelte';
	import Logo from './logo.svelte';
	import MenuLinks from './menu-links.svelte';
	import SiteNavButton from './site-nav-button.svelte';
	import SocialLinks from './social-links.svelte';

	let {
		logo,
		links = [],
		ctas = [],
		socialLinks = [],
		navFooterLinks = [],
		adminLogin = false,
		showSkipLink = true,
		navButton = {},
		blur = false,
		glass = false,
		hideOnScroll = true
	}: HeaderIslandProps = $props();

	const id = $props.id();
	const panelId = `${id}-navigation`;
	const footerLinks = $derived<ButtonProps[]>([
		...navFooterLinks,
		...(adminLogin ? [{ text: 'Admin Log In', url: '/admin' }] : [])
	]);

	// The dropdown starts while the island is still widening, so the two steps run into each other.
	const OPEN_DELAY_MS = 250;
	const COLLAPSE_MS = 250;

	// `wide` is the island's first step (full content width), `open` the second (the dropdown).
	let wide = $state(false);
	let open = $state(false);
	let island = $state<HTMLElement>();
	let timer: ReturnType<typeof setTimeout> | undefined;

	const staged = () =>
		matchMedia('(min-width: 768px)').matches &&
		!matchMedia('(prefers-reduced-motion: reduce)').matches;

	const show = () => {
		clearTimeout(timer);
		wide = true;
		if (staged()) timer = setTimeout(() => (open = true), OPEN_DELAY_MS);
		else open = true;
	};

	const close = () => {
		clearTimeout(timer);
		open = false;
		if (!wide) return;
		if (staged()) timer = setTimeout(() => (wide = false), COLLAPSE_MS);
		else wide = false;
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !wide) return;
		close();
		island?.querySelector<HTMLElement>('.bar button')?.focus();
	};

	// A press anywhere else, or focus moving out of the island, closes it.
	const onPointerdown = (event: PointerEvent) => {
		if (wide && island && !island.contains(event.target as Node)) close();
	};
	const onFocusout = (event: FocusEvent) => {
		if (wide && island && !island.contains(event.relatedTarget as Node | null)) close();
	};

	const onPanelClick = (event: MouseEvent) => {
		if ((event.target as Element).closest('a')) close();
	};

	afterNavigate(close);
</script>

<svelte:window onkeydown={onKeydown} onpointerdown={onPointerdown} />

<header
	class="header"
	data-nav-open={wide || undefined}
	{@attach hideOnScroll ? watchScroll() : undefined}
>
	{#if showSkipLink}
		<a class="skip-link" href="#main">Skip to main content</a>
	{/if}

	<div
		class="island"
		class:wide
		class:open
		class:blur={blur && !glass}
		class:has-glass={glass}
		bind:this={island}
		onfocusout={onFocusout}
	>
		{#if glass}<div class="glass-layer" aria-hidden="true" {@attach glassEffect()}></div>{/if}

		<div class="bar">
			<SiteNavButton
				{...navButton}
				expanded={wide}
				controls={panelId}
				onclick={() => (wide ? close() : show())}
			/>
			{#if logo}<div class="bar-logo"><Logo {...logo} url="/" /></div>{/if}
			{#if ctas.length}
				<div class="bar-ctas">
					{#each ctas as cta (`${cta.url}|${cta.text}`)}
						<Button {...cta} {@attach textRoll()} />
					{/each}
				</div>
			{/if}
		</div>

		<!-- The panel is a grid that grows from no height, so the island opens downward. -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<nav
			id={panelId}
			class="panel"
			aria-label="Site navigation"
			inert={!open}
			data-lenis-prevent
			onclick={onPanelClick}
		>
			<div class="content">
				<div class="main">
					<MenuLinks
						class="panel-links"
						{links}
						label="Primary"
						direction="column"
						landmark={false}
					/>

					{#if ctas.length}
						<div class="ctas">
							{#each ctas as cta (`${cta.url}|${cta.text}`)}
								<Button {...cta} {@attach textRoll()} />
							{/each}
						</div>
					{/if}
				</div>

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
		</nav>
	</div>
</header>

<style lang="scss">
	@use 'base/mixins';

	// The header takes no room in the page. It sticks to the top and the island floats over what scrolls beneath.
	.header {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		height: 0;
	}

	.island {
		--island-width: 420px;
		--island-padding: 8px;
		// Collapsing is quicker than expanding: each step uses the time of the state it is moving to.
		--width-time: 0.25s;
		--panel-time: 0.25s;

		@include mixins.min-md {
			--island-width: 760px;
		}

		position: absolute;
		top: var(--float-offset);
		left: 50%;
		display: flex;
		flex-direction: column;
		width: min(calc(100% - var(--float-offset) * 2), var(--island-width));
		max-height: calc(100dvh - var(--float-offset) * 2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-bg);
		translate: -50% 0;
		padding: var(--island-padding);

		@include mixins.mq-motion-allow {
			transition:
				width var(--width-time) var(--ease),
				translate var(--duration) var(--ease);
		}

		&.wide {
			--island-width: 560px;
			--width-time: 0.55s;

			@include mixins.min-md {
				--island-width: min(calc(100% - var(--body-padding) * 2), var(--content-width));
			}
		}
	}

	.header:global([data-scroll-down]):not(:focus-within):not([data-nav-open]) .island {
		translate: -50% calc(-100% - var(--float-offset) * 2);
	}

	// The blur sits on a pseudo-element, and glass on its own layer, so the panel inside stays crisp.
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

	.blur::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: inherit;
		@include mixins.glass;
	}

	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 24px;
		padding: 8px 12px;

		> :global(:first-child) {
			justify-self: start;
		}
	}

	.bar-logo {
		display: flex;
		align-items: center;
		grid-column: 2;
	}

	.bar-ctas {
		display: none;
		grid-column: 3;
		align-items: center;
		justify-self: end;
		gap: 16px;

		@include mixins.min-md {
			display: flex;
		}
	}

	.panel {
		display: grid;
		grid-template-rows: 0fr;
		min-height: 0;
		visibility: hidden;

		@include mixins.mq-motion-allow {
			transition:
				grid-template-rows var(--panel-time) var(--ease),
				visibility var(--panel-time);
		}
	}

	.open {
		--panel-time: 0.4s;
	}

	.open .panel {
		grid-template-rows: 1fr;
		visibility: visible;
		padding-block-start: 24px;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 32px;
		min-height: 0;
		padding-inline: 24px;
		overflow: hidden;
		opacity: 0;

		@include mixins.mq-motion-allow {
			transition:
				padding var(--panel-time) var(--ease),
				opacity calc(var(--panel-time) * 0.75) var(--ease);
		}
	}

	// Open, it scrolls if the links are taller than the screen.
	.open .content {
		padding-block: 8px 24px;
		overflow: auto;
		opacity: 1;
	}

	.main {
		display: flex;
		flex-direction: column;
		gap: 32px;

		@include mixins.min-md {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}
	}

	.panel :global(.panel-links) {
		--btn-font-size: 24px;
	}

	.ctas {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;

		@include mixins.min-md {
			display: none;
		}
	}

	.footer {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 24px;
		padding-block-start: 24px;
		border-block-start: 1px solid var(--color-border);

		@include mixins.min-md {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1ch 24px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.skip-link {
		position: absolute;
		top: var(--float-offset);
		left: var(--float-offset);
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
