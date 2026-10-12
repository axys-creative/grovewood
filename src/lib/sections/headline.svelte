<script module lang="ts">
	export type HeadlineProps = {
		/** The statement, which flips in word by word. Takes `[words]{.primary}` tokens, see Rich Text. */
		text: string;
		eyebrowText?: string;
		/** Icon name from `static/icons`. Works without `eyebrowText` too. */
		eyebrowIcon?: string;
		eyebrowDot?: boolean | 'pulse' | 'sonar';
		/** With a `name` the headline is wrapped in quotes and credited beneath. */
		quote?: { name: string; role?: string; image?: { src: string; alt?: string } };
		/** At least the height of the screen, with the statement centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import RichText from '$lib/components/rich-text.svelte';
	import { imageProps } from '$lib/utils/image';
	import Eyebrow from '$lib/components/eyebrow.svelte';
	import { textFlip } from '$lib/attachments/text-flip';

	let {
		text,
		eyebrowText,
		eyebrowIcon,
		eyebrowDot = false,
		quote,
		fullScreen = false,
		id,
		class: className
	}: HeadlineProps = $props();

	const quoted = $derived(!!quote?.name);
	const flip = textFlip({
		type: 'words',
		duration: 2.5,
		stagger: 0.1,
		ease: 'elastic.out(1.5, 0.3)'
	});
</script>

{#snippet statement()}
	<!-- A statement, not a section title, so it is a paragraph that looks like a heading. -->
	<p class="h2 text" {@attach flip}>
		{#if quoted}“{/if}<RichText {text} />{#if quoted}”{/if}
	</p>
{/snippet}

<section {id} class="headline {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<Eyebrow text={eyebrowText} icon={eyebrowIcon} dot={eyebrowDot} />

		{#if quoted && quote}
			<figure class="quote">
				<blockquote>{@render statement()}</blockquote>
				<figcaption class="giver">
					{#if quote.image?.src}
						<img
							{...imageProps(quote.image.src, { sizes: '48px' })}
							alt={quote.image.alt ?? ''}
							width="48"
							height="48"
							loading="lazy"
						/>
					{/if}
					<span class="info">
						<strong>{quote.name}</strong>
						{#if quote.role}<small>{quote.role}</small>{/if}
					</span>
				</figcaption>
			</figure>
		{:else}
			{@render statement()}
		{/if}
	</div>
</section>

<style lang="scss">
	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-eyebrow-title);
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
		text-align: center;
	}

	.text {
		display: block;
		max-width: 1000px;
		opacity: 1;
		text-wrap: balance;
	}

	.quote,
	blockquote {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
	}

	.quote {
		gap: 24px;
	}

	.giver {
		display: flex;
		align-items: center;
		gap: 12px;
		text-align: start;
	}

	img {
		flex: none;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.info {
		display: flex;
		flex-direction: column;
	}

	small {
		color: var(--color-text-muted);
	}
</style>
