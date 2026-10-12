<script module lang="ts">
	export type TunnelProps = {
		/** A picture. Use this or `video`. */
		img?: { src: string; alt?: string };
		/** A video file, played muted and looping. Use this or `img`. */
		video?: string;
		/** Text that fills in over the end of the section. */
		message?: string;
		/** A taller section, so the media is on screen longer. */
		extended?: boolean;
		/** Pins the media to the middle of the screen and grows it to fill the screen as you scroll. */
		centered?: boolean;
		/** Plays the change backwards: it starts full width (or full screen, if centered) and shrinks. */
		reversed?: boolean;
		parallax?: {
			/** How far the media starts from where it rests, as a CSS translate like `-75%`. */
			offset?: string;
			/** Seconds the motion takes to catch up with the scroll. `0` plays it once, when it is reached. */
			scrub?: number;
		};
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import type { Attachment } from 'svelte/attachments';
	import { textFill } from '$lib/attachments/text-fill';
	import { loadGsap } from '$lib/utils/gsap';

	let {
		img,
		video,
		message,
		extended = false,
		centered = false,
		reversed = false,
		parallax,
		id,
		class: className
	}: TunnelProps = $props();

	const offset = $derived(parallax?.offset ?? '-75%');
	const scrub = $derived(parallax?.scrub ?? 0);

	const play: Attachment<HTMLVideoElement> = (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		el.muted = true;
		el.play().catch(() => {});
	};

	// Everything is a ScrollTrigger tween, made in one context so leaving the page undoes it all. Sections are made
	// in page order, which is what lets a trigger below a pinned one measure itself after the pin's spacer.
	const motion: Attachment<HTMLElement> = (section) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then((gsap) => {
			const clip = section.querySelector<HTMLElement>('.clip');
			const pin = section.querySelector<HTMLElement>('.pin');
			const media = section.querySelector<HTMLElement>('.media');
			if (cancelled || !clip || !media) return;

			const context = gsap.context(() => {
				if (centered && pin) {
					gsap.to(pin, {
						scrollTrigger: { trigger: pin, start: 'center center', end: '+=100%', pin: true }
					});

					// `from` plays the same change backwards without a second set of values.
					const tween = reversed ? 'from' : 'to';
					gsap[tween](clip, {
						width: '100%',
						height: '100svh',
						borderRadius: 0,
						ease: 'none',
						scrollTrigger: { trigger: section, start: 'top top', end: '+=100%', scrub }
					});
					gsap[tween](media, {
						filter: 'brightness(1)',
						scrollTrigger: { trigger: pin, start: 'top top', end: '+=100%', scrub }
					});
				} else if (reversed) {
					gsap.to(clip, {
						width: '80%',
						ease: 'none',
						scrollTrigger: { trigger: section, start: 'top top', end: 'bottom 30%', scrub }
					});
					gsap.to(media, {
						y: offset,
						filter: 'brightness(0.75)',
						ease: 'none',
						scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub }
					});
				} else {
					gsap.to(clip, {
						width: '100%',
						ease: 'none',
						scrollTrigger: { trigger: section, start: 'top 70%', end: 'top top', scrub }
					});
				}

				if (!centered && !reversed) {
					gsap.from(media, {
						y: offset,
						filter: 'brightness(0.75)',
						ease: 'none',
						scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub }
					});
				}
			}, section);

			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	};
</script>

{#snippet frame()}
	<div class="clip">
		{#if img?.src}
			<img class="media" {...imageProps(img.src, { sizes: '100vw' })} alt={img.alt ?? ''} />
		{:else if video}
			<video class="media" src={video} muted loop playsinline aria-hidden="true" {@attach play}
			></video>
		{/if}
	</div>
{/snippet}

<section
	{id}
	class="tunnel {className ?? ''}"
	class:extended
	class:centered
	class:reversed
	{@attach motion}
>
	{#if centered}
		<div class="pin">{@render frame()}</div>
	{:else}
		{@render frame()}
	{/if}

	{#if message}
		<div class="message-box">
			<p class="message" {@attach textFill({ end: 'bottom 80%' })}>{message}</p>
		</div>
	{/if}
</section>

<style lang="scss">
	@use 'base/mixins';

	// The media is clipped by a box that the scroll resizes, so it looks like the picture opens up as you reach it.
	.tunnel {
		--section-height: 105svh;
		--clip-width: 80%;
		--clip-height: 50svh;
		--clip-radius: var(--radius);

		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: var(--section-height);
		container-type: inline-size;
	}

	.clip {
		width: var(--clip-width);
		overflow: hidden;
		border-radius: var(--clip-radius) var(--clip-radius) 0 0;
	}

	// The media keeps the section's full width whatever the clip's, so the clip only crops it and never resizes it.
	.media {
		display: block;
		width: 100cqw;
		max-width: none;
		height: var(--section-height);
		margin-inline: calc((100% - 100cqw) / 2);
		object-fit: cover;
		filter: brightness(1);
	}

	// The text sits on a dark fade that runs the full width of the section.
	.message-box {
		position: absolute;
		inset: auto 0 0;
		padding: var(--body-padding-double) var(--body-padding);
		background: linear-gradient(0deg, rgb(0 0 0 / 0.5), transparent);
		text-align: center;
		text-wrap: balance;
	}

	.message {
		@include mixins.h1;

		max-width: var(--content-width);
		margin: 0 auto;
		color: #fff;
		font-weight: 900;
		text-transform: uppercase;

		@include mixins.max-md {
			@include mixins.h6;

			font-weight: 900;
		}
	}

	.extended {
		--section-height: 125svh;

		@include mixins.max-md {
			--section-height: 110svh;
		}
	}

	// A reversed tunnel starts full width, then narrows.
	.reversed {
		--clip-width: 100%;
	}

	.centered {
		--clip-width: 72%;
		--clip-height: 72svh;
		--section-height: 200svh;

		flex-direction: column;
		justify-content: flex-start;

		.pin {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100svh;
			container-type: size;
		}

		.clip {
			position: relative;
			width: var(--clip-width);
			height: var(--clip-height);
			border-radius: var(--clip-radius);
		}

		.media {
			position: absolute;
			top: 50%;
			left: 50%;
			z-index: -1;
			width: 100cqw;
			height: 100cqh;
			margin: calc(-50cqh) 0 0 calc(-50cqw);
			filter: brightness(0.75);
		}
	}
</style>
