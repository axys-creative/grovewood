<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ImageGridImage = { src: string; alt?: string };

	export type ImageGridPortrait = ImageGridImage & {
		/** A line above the name, such as a title or credentials. */
		role?: string;
		name?: string;
		description?: string;
	};

	export type ImageGridProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description'
	> & {
		/** Pictures in cards, such as logos. */
		images?: ImageGridImage[];
		/** People, with a name and a few lines under each picture. Used instead of `images` when set. */
		portraits?: ImageGridPortrait[];
		/** How many cards across on a wide screen. Fewer on smaller ones. Defaults to `4`. */
		columns?: number;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** Skips the scroll entrance, for the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { animate } from '$lib/attachments/animate';
	import { push } from '$lib/attachments/push';
	import { textReveal } from '$lib/attachments/text-reveal';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		images = [],
		portraits = [],
		columns = 4,
		id,
		fullScreen = false,
		static: isStatic = false,
		class: className,
		eyebrowText,
		eyebrowIcon,
		eyebrowDot,
		title,
		description
	}: ImageGridProps = $props();

	const reveal = textReveal({ type: 'words', duration: 0.64, ease: 'back.out(2)' });
	const stagger = animate({
		variant: 'scale',
		stagger: 0.1,
		once: false,
		duration: 0.5
	});
</script>

<section {id} class="image-grid {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<div class="text">
			<SectionCopy {eyebrowText} {eyebrowIcon} {eyebrowDot} />
			<div class="group">
				<div class="title">
					<SectionCopy {title} titleAttach={isStatic ? undefined : reveal} />
				</div>
				<div class="description">
					<SectionCopy {description} />
				</div>
			</div>
		</div>

		{#if portraits.length}
			<ul class="list portraits" style:--columns={columns} {@attach isStatic ? undefined : stagger}>
				{#each portraits as portrait (portrait.src)}
					<li>
						<div class="card portrait">
							<img
								{...imageProps(portrait.src, { sizes: '(min-width: 768px) 25vw, 100vw' })}
								alt={portrait.alt ?? ''}
								loading="lazy"
							/>
						</div>
						<div class="info">
							{#if portrait.role}<p class="role">{portrait.role}</p>{/if}
							{#if portrait.name}<p class="name">{portrait.name}</p>{/if}
							{#if portrait.description}<p class="about">{portrait.description}</p>{/if}
						</div>
					</li>
				{/each}
			</ul>
		{:else if images.length}
			<ul class="list" style:--columns={columns} {@attach isStatic ? undefined : stagger}>
				{#each images as image (image.src)}
					<li>
						<div class="card" {@attach isStatic ? undefined : push()}>
							<img
								{...imageProps(image.src, { sizes: '(min-width: 1024px) 20vw, 40vw' })}
								alt={image.alt ?? ''}
								loading="lazy"
							/>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.image-grid {
		padding: var(--body-padding-double) var(--body-padding);
		// Cards start small and grow in; the grid sets how much.
		--animate-scale: 0.5;
		--animate-ease: ease;
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 64px;
		width: 100%;
		max-width: var(--content-width);
		margin-inline: auto;
	}

	.text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-eyebrow-title);
		width: 100%;
	}

	.group {
		display: flex;
		flex-direction: column;
		width: 100%;

		@include mixins.min-lg {
			flex-direction: row;
			align-items: flex-start;
			gap: 64px;
		}
	}

	.title {
		width: 100%;
		margin-block-end: var(--space-title-paragraph);

		@include mixins.min-lg {
			max-width: 40%;
			margin-block-end: 0;
		}
	}

	.description {
		width: 100%;

		@include mixins.min-lg {
			max-width: 50%;
		}
	}

	.list {
		display: grid;
		grid-template-columns: repeat(max(1, var(--columns) - 2), 1fr);
		gap: 16px;
		width: 100%;
		margin: 0;
		padding: 0;
		list-style: none;

		@include mixins.min-md {
			grid-template-columns: repeat(max(1, var(--columns) - 1), 1fr);
			gap: 24px;
		}

		@include mixins.min-lg {
			grid-template-columns: repeat(var(--columns), 1fr);
		}
	}

	.portraits {
		@include mixins.max-md {
			grid-template-columns: 1fr;
			gap: 64px;
		}
	}

	.card {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1.25 / 1;
		padding: 64px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		overflow: hidden;

		@include mixins.max-lg {
			padding: 48px;
		}

		@include mixins.max-sm {
			padding: 24px;
		}

		img {
			width: 100%;
			height: auto;
			max-height: 100%;
			object-fit: contain;
		}
	}

	.portrait {
		width: 100%;
		max-height: 420px;
		aspect-ratio: 1 / 1.15;
		padding: 0;

		img {
			height: 100%;
			object-fit: cover;
			object-position: top;
		}
	}

	.info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		margin-block-start: 24px;
	}

	.role {
		@include mixins.body-small;
		width: 100%;
		min-height: 64px;
		margin-block-end: 24px;
		border-block-end: 1px solid var(--color-text);
	}

	.name {
		@include mixins.h4;
	}

	.about {
		margin-block-start: 8px;
	}
</style>
