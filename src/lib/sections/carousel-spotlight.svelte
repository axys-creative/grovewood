<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CarouselSpotlightSlide = {
		title: string;
		description?: string;
		image?: { src: string; alt?: string };
	};

	export type CarouselSpotlightProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		/** Two or more. */
		slides: CarouselSpotlightSlide[];
		/** The accessible name of the carousel. Defaults to `Featured`. */
		label?: string;
		/** An endless loop, so the last slide sits before the first. Defaults to `true`. */
		loop?: boolean;
		/** Moves on by itself. It waits while focus is inside the carousel (and the pointer, with `pauseOnHover`), while it is off screen, and with reduced motion. Defaults to `true`. */
		autoplay?: boolean;
		/** Holds autoplay while the mouse is over the carousel. Focus inside it always holds it. Defaults to `false`. */
		pauseOnHover?: boolean;
		/** Milliseconds between slides when it plays. Defaults to `2400`. */
		interval?: number;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { carouselDrag } from '$lib/attachments/carousel-drag';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	const SETTLE_MS = 120;
	const SNAP_TOLERANCE = 2;

	let {
		slides,
		label = 'Featured',
		loop = true,
		autoplay = true,
		pauseOnHover = false,
		interval = 2400,
		fullScreen = false,
		id,
		class: className,
		...copy
	}: CarouselSpotlightProps = $props();

	const count = $derived(slides.length);
	const looping = $derived(loop && count > 1);
	// Three copies of the slides when looping, so the row always has some on each side of the middle one.
	const sets = $derived(looping ? [-1, 0, 1] : [0]);
	const offset = $derived(looping ? count : 0);

	let track = $state<HTMLElement>();
	let raw = $state(0);
	let visible = false;
	let hovering = false;
	let focused = false;
	let touched = 0;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;

	const active = $derived(count ? (((raw - offset) % count) + count) % count : 0);

	const step = () => {
		const cards = track!.children;
		return cards.length > 1
			? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
			: track!.clientWidth;
	};
	const dragging = () => track!.hasAttribute('data-dragging');
	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
	const current = () => Math.round(track!.scrollLeft / step());

	function goTo(index: number) {
		const last = count * sets.length - 1;
		track!.scrollTo({
			left: Math.min(last, Math.max(0, index)) * step(),
			behavior: reduced() ? 'auto' : 'smooth'
		});
	}

	// Keeps the row inside the middle copy, which looks the same as the others.
	function normalize() {
		if (!looping || dragging()) return;
		const width = count * step();
		const left = track!.scrollLeft;
		if (left < width - SNAP_TOLERANCE) track!.scrollLeft = left + width;
		else if (left >= width * 2 - SNAP_TOLERANCE) track!.scrollLeft = left - width;
	}

	function settle() {
		clearTimeout(settleTimer);
		settleTimer = setTimeout(() => (dragging() ? settle() : normalize()), SETTLE_MS);
	}

	function onScroll() {
		raw = current();
		if (looping) settle();
	}

	function goToSlide(index: number) {
		let delta = index - active;
		if (looping && Math.abs(delta) > count / 2) delta -= Math.sign(delta) * count;
		goTo(current() + delta);
	}

	function onKeydown(event: KeyboardEvent) {
		touched = Date.now();
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		goTo(current() + (event.key === 'ArrowRight' ? 1 : -1));
	}

	function advance() {
		if (!track || !visible || hovering || focused || dragging() || document.hidden) return;
		if (reduced() || Date.now() - touched < interval) return;
		if (looping) goTo(current() + 1);
		else goTo(active + 1 >= count ? 0 : active + 1);
	}

	$effect(() => {
		if (!autoplay || count < 2) return;
		const timer = setInterval(advance, interval);
		return () => clearInterval(timer);
	});

	onMount(() => {
		const element = track!;
		let width = element.clientWidth;
		if (looping) element.scrollLeft = count * step();
		raw = current();

		const resize = new ResizeObserver(() => {
			if (element.clientWidth === width) return;
			width = element.clientWidth;
			element.scrollLeft = (offset + active) * step();
		});
		resize.observe(element);

		const view = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		view.observe(element);

		return () => {
			resize.disconnect();
			view.disconnect();
			clearTimeout(settleTimer);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
	{id}
	class="carousel-spotlight {className ?? ''}"
	class:full-screen={fullScreen}
	onpointerenter={(event) => (hovering = pauseOnHover && event.pointerType === 'mouse')}
	onpointerleave={() => (hovering = false)}
	onpointerdown={() => (touched = Date.now())}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
>
	<div class="inner">
		<header class="header"><SectionCopy {...copy} align="center" /></header>

		<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
		<div
			class="track"
			role="group"
			aria-roledescription="carousel"
			aria-label={label}
			tabindex="0"
			bind:this={track}
			onscroll={onScroll}
			onkeydown={onKeydown}
			{@attach carouselDrag()}
		>
			{#each sets as set (set)}
				{#each slides as slide, index (index)}
					<div
						class="slide"
						class:active={index === active}
						role="group"
						aria-roledescription="slide"
						aria-label="{index + 1} of {count}"
						aria-hidden={set === 0 ? undefined : 'true'}
						inert={set !== 0}
					>
						{#if slide.image?.src}
							<img
								{...imageProps(slide.image.src, {
									sizes: '(min-width: 1280px) 1100px, 75vw'
								})}
								alt={slide.image.alt ?? ''}
								loading={set === 0 && index === 0 ? 'eager' : 'lazy'}
								draggable="false"
							/>
						{/if}
						<div class="panel">
							<h3 class="h4">{slide.title}</h3>
							{#if slide.description}<p><RichText text={slide.description} /></p>{/if}
						</div>
					</div>
				{/each}
			{/each}
		</div>

		<div class="dots" hidden={count < 2}>
			{#each slides as slide, index (index)}
				<button
					type="button"
					class="dot"
					aria-label="Go to slide {index + 1}: {slide.title}"
					aria-current={index === active ? 'true' : undefined}
					onclick={() => goToSlide(index)}
				></button>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.carousel-spotlight {
		--slide-width: clamp(280px, 75vw, 1100px);
		--slide-gap: 24px;
		--slide-radius: 32px;
		--slide-aspect: 16 / 10;
		--inactive-opacity: 0.4;
		--panel-offset: 24px;
		--panel-radius: 20px;
		--panel-width: 440px;
		--content: min(var(--content-width), 100% - var(--body-padding) * 2);

		overflow-x: clip;
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: 48px;
		width: 100%;
		padding-block: var(--body-padding-double);
	}

	.header {
		width: var(--content);
		margin-inline: auto;
	}

	.track {
		display: flex;
		gap: var(--slide-gap);
		padding-inline: calc((100% - var(--slide-width)) / 2);
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		touch-action: pan-y;
		cursor: grab;
		user-select: none;

		&::-webkit-scrollbar {
			display: none;
		}

		&[data-dragging] {
			cursor: grabbing;
			scroll-snap-type: none;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: -2px;
		}
	}

	.slide {
		position: relative;
		flex: 0 0 var(--slide-width);
		aspect-ratio: var(--slide-aspect);
		overflow: clip;
		border-radius: var(--slide-radius);
		background: var(--color-surface);
		opacity: var(--inactive-opacity);
		scroll-snap-align: center;

		@include mixins.mq-motion-allow {
			transition: opacity 0.5s var(--ease);
		}

		&.active {
			opacity: 1;
		}

		img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.panel {
		position: absolute;
		inset: auto auto var(--panel-offset) var(--panel-offset);
		width: min(var(--panel-width), 100% - var(--panel-offset) * 2);
		padding: 20px 24px;
		border-radius: var(--panel-radius);
		background: var(--color-glass);
		backdrop-filter: blur(20px) saturate(1.4);

		h3,
		p {
			margin: 0;
		}

		p {
			margin-block-start: 8px;
		}
	}

	.dots {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;

		&[hidden] {
			display: none;
		}
	}

	.dot {
		width: 12px;
		height: 12px;
		padding: 0;
		border: 0;
		border-radius: 12px;
		background: var(--color-accent);
		opacity: 0.3;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				width 0.4s var(--ease),
				opacity var(--duration) var(--ease),
				var(--transition-scale);
		}

		&[aria-current='true'] {
			width: 40px;
			opacity: 1;
		}

		&:focus-visible {
			scale: 1.25;
			outline: 2px solid var(--color-accent-text);
			outline-offset: 4px;
		}

		@include mixins.mq-mouse {
			&:hover {
				scale: 1.25;
			}
		}
	}
</style>
