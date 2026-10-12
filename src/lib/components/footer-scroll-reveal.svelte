<script module lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { ButtonProps } from './button.svelte';
	import type CtaGroup from './cta-group.svelte';
	import type { SocialLink } from './social-links.svelte';

	export type FooterScrollRevealProps = {
		title?: string;
		/** Buttons under the title. */
		cta?: ComponentProps<typeof CtaGroup>;
		message?: string;
		/** A large link beside the title, such as an email address. */
		bigLink?: Pick<ButtonProps, 'text' | 'textDescription' | 'url' | 'newTab'>;
		socialLinks?: SocialLink[];
		showThemeToggle?: boolean;
		copyright?: string;
		/** A credit line, such as "Made in collaboration with axys creative". */
		credit?: { text: string; linkText: string; url: string };
		/** The content rises and grows into place as the footer is revealed. */
		parallax?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { glitchHover } from '$lib/attachments/glitch-hover';
	import { textRoll } from '$lib/attachments/text-roll';
	import site from '$lib/content/meta/site.json';
	import { loadGsap, refreshScrollTriggers } from '$lib/utils/gsap';
	import Button from './button.svelte';
	import CtaGroupComponent from './cta-group.svelte';
	import SocialLinks from './social-links.svelte';
	import ThemeToggle from './theme-toggle.svelte';

	let {
		title,
		cta,
		message,
		bigLink,
		socialLinks = [],
		showThemeToggle = false,
		copyright,
		credit,
		parallax = true,
		class: className
	}: FooterScrollRevealProps = $props();

	const copyrightText = $derived(
		copyright || `© ${new Date().getFullYear()} ${site.siteName}. All rights reserved.`
	);

	let reveal = $state<HTMLElement>();
	let inner = $state<HTMLElement>();
	let height = $state(0);
	// Without JavaScript the footer is an ordinary one at the end of the page. Once armed it is fixed to the
	// bottom of the screen and clipped to a box at the end of the page that is exactly as tall as it is, so
	// scrolling to the end slides the page away to show it, whatever the page is made of.
	let armed = $state(false);

	onMount(() => {
		armed = true;
		if (!parallax || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		// The footer lives in the layout, so it outlasts every page. Its trigger measures the end of the page, which
		// moves whenever the page changes height: on a new page, or as images load. Measure again each time.
		const pageHeight = new ResizeObserver(() => refreshScrollTriggers());
		pageHeight.observe(document.body);

		loadGsap('scrollTrigger').then((gsap) => {
			if (cancelled || !reveal || !inner) return;
			const context = gsap.context(() => {
				gsap.from(inner!, {
					y: 320,
					scale: 0.8,
					ease: 'none',
					scrollTrigger: {
						trigger: reveal,
						start: 'top bottom',
						end: 'bottom bottom',
						scrub: true
					}
				});
			}, reveal);
			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			pageHeight.disconnect();
			revert?.();
		};
	});
</script>

<div
	class="reveal {className ?? ''}"
	class:armed
	style:height={armed && height ? `${height}px` : undefined}
	bind:this={reveal}
>
	<footer class="footer page-grid" bind:clientHeight={height}>
		<div class="inner" bind:this={inner}>
			<div class="top-left">
				{#if title}<h2>{title}</h2>{/if}
				{#if cta}<CtaGroupComponent {...cta} />{/if}
			</div>

			<div class="top-right">
				{#if message}<p class="message">{message}</p>{/if}
				{#if bigLink?.text}
					<div class="big-link">
						<Button {...bigLink} type="underline" {@attach textRoll()} />
					</div>
				{/if}
			</div>

			<div class="bottom">
				<p class="copyright">{copyrightText}</p>

				<div class="bottom-right">
					{#if credit}
						<p class="credit">
							{credit.text}
							<Button
								text={credit.linkText}
								url={credit.url}
								newTab
								type="underline"
								{@attach glitchHover()}
							/>
						</p>
					{/if}
					<SocialLinks links={socialLinks} />
					{#if showThemeToggle}<ThemeToggle />{/if}
				</div>
			</div>
		</div>
	</footer>
</div>

<style lang="scss">
	@use 'base/mixins';

	.footer {
		--left-size: 40%;
		--right-size: 50%;

		background: var(--color-surface);
	}

	.armed {
		// Clipping the box clips the fixed footer inside it too, which is what makes it show only as the end of the
		// page scrolls past.
		clip-path: inset(0);
	}

	.armed .footer {
		position: fixed;
		inset: auto 0 0;
	}

	.inner {
		display: flex;
		flex-wrap: wrap;
		padding-block: var(--body-padding);

		@include mixins.max-lg {
			gap: 48px;
		}

		@include mixins.max-sm {
			padding-block: var(--body-padding-double);
		}
	}

	.top-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 48px;

		@include mixins.min-lg {
			width: var(--left-size);
			margin-inline-end: auto;
		}

		h2 {
			margin: 0;
		}
	}

	.top-right {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 48px;

		@include mixins.min-lg {
			width: var(--right-size);
		}

		.message {
			margin: 0;
			color: var(--color-text-muted);
		}
	}

	.big-link {
		--btn-font-size: min(6.4vw, 36px);

		@include mixins.min-lg {
			--btn-font-size: min(3.2vw, 50px);
		}
	}

	.bottom {
		display: flex;
		align-items: end;
		justify-content: space-between;
		width: 100%;

		@include mixins.min-lg {
			margin-block-start: 96px;
		}

		@include mixins.max-lg {
			flex-flow: column-reverse wrap;
			align-items: flex-start;
			gap: 24px;
		}

		p {
			margin: 0;
		}
	}

	.copyright {
		font-size: 14px;
	}

	.bottom-right {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		align-items: center;
		justify-content: space-between;

		@include mixins.min-lg {
			width: var(--right-size);
		}

		@include mixins.max-lg {
			flex-direction: column-reverse;
			align-items: flex-start;
			gap: 24px;
		}
	}

	.credit {
		font-size: 14px;
		color: var(--color-text-muted);
		flex-shrink: 0;
		order: 1;
	}
</style>
