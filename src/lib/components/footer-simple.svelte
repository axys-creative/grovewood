<script module lang="ts">
	import type { BackToTopProps } from './back-to-top.svelte';
	import type { ButtonProps } from './button.svelte';
	import type { LogoProps } from './logo.svelte';
	import type { SocialLink } from './social-links.svelte';

	export type FooterContactLink = {
		/** `{.br}` is a line break. */
		text: string;
		url: string;
		newTab?: boolean;
	};

	export type FooterSimpleProps = {
		logo?: LogoProps;
		message?: string;
		/** Address, phone and email, shown under the logo with a label each. */
		contact?: Partial<Record<'address' | 'phone' | 'email', FooterContactLink>>;
		socialLinks?: SocialLink[];
		/** Up to three columns of links. */
		linksets?: { title?: string; links: ButtonProps[] }[];
		legalLinks?: ButtonProps[];
		/** The button type of the link columns and legal links. Defaults to `underline`. */
		linkType?: ButtonProps['type'];
		returnToTop?: BackToTopProps;
		copyright?: string;
		showThemeToggle?: boolean;
		/** A line along the top edge of the footer (all the way round when it floats). Defaults to `true`. */
		border?: boolean;
		includeTop?: boolean;
		includeBottom?: boolean;
		divider?: boolean;
		float?: boolean;
		/** A translucent, blurred background. */
		blur?: boolean;
		/** The glass attachment's background: refraction in Chrome, blur elsewhere. Wins over `blur`. */
		glass?: boolean;
	};
</script>

<script lang="ts">
	import { glass as glassEffect } from '$lib/attachments/glass';
	import { textRoll } from '$lib/attachments/text-roll';
	import site from '$lib/content/meta/site.json';
	import BackToTop from './back-to-top.svelte';
	import Logo from './logo.svelte';
	import MenuLinks from './menu-links.svelte';
	import RichText from './rich-text.svelte';
	import SocialLinks from './social-links.svelte';
	import ThemeToggle from './theme-toggle.svelte';

	let {
		logo,
		message,
		contact,
		socialLinks = [],
		linksets = [],
		legalLinks = [],
		linkType = 'underline',
		returnToTop,
		copyright,
		showThemeToggle = false,
		border = true,
		includeTop = true,
		includeBottom = true,
		divider = true,
		float = false,
		blur = false,
		glass = false
	}: FooterSimpleProps = $props();

	const copyrightText = $derived(
		copyright || `©${new Date().getFullYear()} ${site.siteName}. All rights reserved`
	);

	const contactRows = $derived(
		[
			{ label: 'Address:', link: contact?.address },
			{ label: 'Phone:', link: contact?.phone },
			{ label: 'Email:', link: contact?.email }
		].flatMap(({ label, link }) => (link?.text && link.url ? [{ label, link }] : []))
	);
</script>

<footer
	class="footer page-grid"
	class:float
	class:bordered={border}
	class:blur={blur && !glass}
	{@attach glass ? glassEffect() : undefined}
>
	<div class="inner">
		{#if includeTop}
			<div class="top">
				<div class="top-left">
					{#if logo}<Logo {...logo} url="/" />{/if}
					{#if message}<p class="message">{message}</p>{/if}
					{#if contactRows.length}
						<div class="contact">
							{#each contactRows as { label, link } (label)}
								<strong>{label}</strong>
								<a
									class="contact-link"
									href={link.url}
									target={link.newTab ? '_blank' : undefined}
									rel={link.newTab ? 'noopener noreferrer' : undefined}
								>
									<RichText text={link.text} />
								</a>
							{/each}
						</div>
					{/if}
					<SocialLinks links={socialLinks} />
				</div>

				{#if linksets.length}
					<div class="linksets">
						{#each linksets.slice(0, 3) as { title, links } (`${title}|${links[0]?.url}`)}
							<div class="linkset">
								{#if title}<strong>{title}</strong>{/if}
								<MenuLinks
									class="links"
									{links}
									type={linkType}
									label={title ?? 'Footer'}
									direction="column"
								/>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		{#if divider && includeTop && includeBottom}<hr />{/if}

		{#if includeBottom}
			<div class="bottom" class:has-start={returnToTop}>
				{#if returnToTop}
					<div class="bottom-start">
						<BackToTop {...returnToTop} {@attach textRoll()} />
					</div>
				{/if}
				<p class="copyright">{copyrightText}</p>
				<div class="bottom-end">
					<MenuLinks class="legal" links={legalLinks} type={linkType} label="Legal" />
					{#if showThemeToggle}<ThemeToggle />{/if}
				</div>
			</div>
		{/if}
	</div>
</footer>

<style lang="scss">
	@use 'base/mixins';

	.footer {
		margin-block-start: auto;
		background: var(--color-bg);
	}

	.bordered {
		border-block-start: 1px solid var(--color-border);
	}

	.float {
		width: calc(100% - var(--float-offset) * 2);
		max-width: var(--content-width);
		margin: auto auto var(--float-offset);
		display: block;
		border-radius: var(--radius);
	}

	.float.bordered {
		border: 1px solid var(--color-border);
	}

	.blur {
		@include mixins.glass;
	}

	.inner {
		padding-block: 64px;
	}

	.float .inner {
		padding-inline: var(--body-padding);
	}

	.top {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 40px;

		@include mixins.min-lg {
			flex-direction: row;
			gap: 48px;
		}
	}

	.top-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 40px;

		@include mixins.min-lg {
			gap: 24px;
		}
	}

	.message {
		max-width: 420px;
		color: var(--color-text-muted);
	}

	.contact {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		max-width: 420px;

		strong {
			font-size: 16px;
			font-weight: 700;
			line-height: normal;
		}
	}

	.contact-link {
		margin-block: 4px 24px;
		color: var(--btn-link);
		font-size: 16px;
		font-weight: var(--btn-font-weight-link);
		line-height: normal;

		@include mixins.desktop-hover {
			color: var(--btn-link-hover);
		}

		@include mixins.mq-motion-allow {
			transition: color var(--duration) var(--ease);
		}
	}

	.linksets {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 40px 96px;

		@include mixins.max-xl {
			gap: 40px 48px;
		}

		@include mixins.max-lg {
			column-gap: 40px;
		}
	}

	.linkset {
		strong {
			display: block;
			margin-block-end: 1ch;
			color: var(--color-accent-text);
		}

		:global(.links) {
			--links-gap: 1ch;

			font-size: 16px;
		}

		:global(li) {
			@include mixins.min-md {
				align-items: flex-start;
				min-height: 24px;
				padding-top: 4px;
			}
		}
	}

	hr {
		margin-block: 64px 63px;
		border: 0;
		height: 1px;
		background: var(--color-border);
	}

	.bottom {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 24px;

		@include mixins.min-lg {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			gap: 48px;
		}

		&.has-start {
			@include mixins.min-xl {
				display: grid;
				grid-template-columns: 1fr auto 1fr;
			}
		}
	}

	.copyright {
		order: 1;
		color: var(--color-text);
		font-size: 16px;
		line-height: normal;

		@include mixins.min-lg {
			order: 0;
		}
	}

	.bottom-end {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;

		@include mixins.min-lg {
			flex-direction: row;
			align-items: center;
		}

		@include mixins.min-xl {
			justify-self: end;
		}

		:global(.legal) {
			--links-gap: 1ch;

			font-size: 16px;
		}

		:global(li) {
			@include mixins.min-md {
				align-items: flex-start;
				min-height: 24px;
				padding-top: 4px;
			}
		}
	}
</style>
