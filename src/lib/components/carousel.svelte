<script module lang="ts">
	import type { ButtonProps } from './button.svelte';

	export type CarouselSlide = {
		img?: string;
		/** Falls back to the title. */
		alt?: string;
		title?: string;
		desc?: string;
	};

	export type CarouselProps = {
		slides: CarouselSlide[];
		/** The accessible name of the carousel. */
		label?: string;
		pagination?: 'arrows' | 'dots' | 'none';
		/** A non-interactive line that fills as the carousel advances. */
		progress?: boolean;
		/** A button shown at the left of the footer, with the pagination moved to the right. */
		cta?: ButtonProps;
		/** An endless loop. */
		loop?: boolean;
		/** Slides shown at once from the `md` breakpoint up. Always one below it. */
		slidesPerView?: number;
		autoplay?: { enabled?: boolean; /** Milliseconds between slides. */ interval?: number };
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount } from 'svelte';
	import Button from './button.svelte';

	const DRAG_THRESHOLD = 5;
	const SWIPE_FRACTION = 0.1;
	const RELEASE_FALLBACK_MS = 700;
	const SETTLE_MS = 120;
	const SNAP_TOLERANCE = 2;

	let {
		slides,
		label = 'Carousel',
		pagination = 'arrows',
		progress = false,
		cta,
		loop = false,
		slidesPerView = 1,
		autoplay,
		class: className
	}: CarouselProps = $props();

	const count = $derived(slides.length);
	const looping = $derived(loop && count > 1);
	const sets = $derived(looping ? [-1, 0, 1] : [0]);
	const showFooter = $derived(progress || !!cta?.text || pagination !== 'none');

	let track = $state<HTMLElement>();
	let page = $state(0);
	let pageTotal = $state(1);
	let fill = $state(0);
	let canPrev = $state(false);
	let canNext = $state(true);
	let dragging = $state(false);

	let timer: ReturnType<typeof setInterval> | undefined;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;
	let paused = false;
	let lastWidth = 0;
	let moved = false;
	let pointerDown = false;
	let startX = 0;
	let startScroll = 0;

	const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
	const step = () => {
		const children = track!.children;
		return children.length > 1
			? children[1].getBoundingClientRect().left - children[0].getBoundingClientRect().left
			: 1;
	};
	const maxScroll = () => track!.scrollWidth - track!.clientWidth;
	const rawIndex = () => Math.round(track!.scrollLeft / step());
	const pageCount = () =>
		looping ? count : maxScroll() > 1 ? Math.round(maxScroll() / step()) + 1 : 1;
	const currentPage = () => {
		const raw = rawIndex();
		return looping
			? (((raw - count) % count) + count) % count
			: Math.min(pageCount() - 1, Math.max(0, raw));
	};

	// Keeps the viewport inside the middle set of slides, which looks identical.
	const normalize = () => {
		if (!looping) return;
		const setWidth = count * step();
		const position = track!.scrollLeft;
		if (position < setWidth - SNAP_TOLERANCE) track!.scrollLeft = position + setWidth;
		else if (position >= setWidth * 2 - SNAP_TOLERANCE) track!.scrollLeft = position - setWidth;
	};

	const goToRaw = (raw: number) => {
		const max = Math.round(maxScroll() / step());
		track!.scrollTo({
			left: Math.min(max, Math.max(0, raw)) * step(),
			behavior: reducedMotion() ? 'auto' : 'smooth'
		});
	};
	const goToPage = (target: number) => {
		if (!looping) return goToRaw(target);
		normalize();
		goToRaw(target + count * Math.round((rawIndex() - target) / count));
	};
	const move = (delta: number) => {
		if (looping) {
			normalize();
			return goToRaw(rawIndex() + delta);
		}
		goToRaw(currentPage() + delta);
	};

	const progressValue = () => {
		if (looping) {
			const setWidth = count * step();
			return ((((track!.scrollLeft - setWidth) / setWidth) % 1) + 1) % 1;
		}
		return maxScroll() > 1 ? track!.scrollLeft / maxScroll() : 0;
	};

	const update = () => {
		if (!track) return;
		pageTotal = pageCount();
		page = currentPage();
		canPrev = looping || page > 0;
		canNext = looping || page < pageTotal - 1;
		fill = Math.min(1, Math.max(0, progressValue()));
	};

	const autoplayOn = () => !!autoplay?.enabled && !reducedMotion();
	const advance = () => {
		if (looping) return move(1);
		const current = currentPage();
		goToRaw(current >= pageCount() - 1 ? 0 : current + 1);
	};
	const stopAutoplay = () => {
		clearInterval(timer);
		timer = undefined;
	};
	const startAutoplay = () => {
		if (!autoplayOn() || paused || timer) return;
		timer = setInterval(advance, autoplay?.interval ?? 4000);
	};
	const restartAutoplay = () => {
		stopAutoplay();
		startAutoplay();
	};
	const pause = () => {
		paused = true;
		stopAutoplay();
	};
	const resume = () => {
		paused = false;
		startAutoplay();
	};

	const onScroll = () => {
		update();
		if (!looping) return;
		clearTimeout(settleTimer);
		settleTimer = setTimeout(() => {
			if (!pointerDown) normalize();
		}, SETTLE_MS);
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		move(event.key === 'ArrowRight' ? 1 : -1);
		restartAutoplay();
	};

	// Snap stays off until the smooth scroll ends, or it would jump instantly.
	const releaseSnap = () => {
		const done = () => {
			clearTimeout(fallback);
			track!.removeEventListener('scrollend', done);
			dragging = false;
		};
		const fallback = setTimeout(done, RELEASE_FALLBACK_MS);
		track!.addEventListener('scrollend', done);
	};

	const onPointerdown = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse' || event.button !== 0) return;
		pointerDown = true;
		moved = false;
		startX = event.clientX;
		startScroll = track!.scrollLeft;
	};

	// A drag should not click whatever the pointer ends on.
	const onClickCapture = (event: MouseEvent) => {
		if (moved) event.stopPropagation();
		moved = false;
	};

	onMount(() => {
		const element = track!;

		const onPointermove = (event: PointerEvent) => {
			if (!pointerDown) return;
			const dx = event.clientX - startX;
			if (!moved && Math.abs(dx) < DRAG_THRESHOLD) return;
			moved = true;
			dragging = true;
			element.scrollLeft = startScroll - dx;
		};
		const onPointerup = () => {
			if (!pointerDown) return;
			pointerDown = false;
			if (moved) {
				const shift = (element.scrollLeft - startScroll) / step();
				const from = Math.round(startScroll / step());
				goToRaw(from + (Math.abs(shift) >= SWIPE_FRACTION ? Math.sign(shift) : 0));
				releaseSnap();
			} else {
				dragging = false;
			}
			restartAutoplay();
		};
		const onVisibility = () => (document.hidden ? pause() : resume());

		const observer = new ResizeObserver(() => {
			if (looping && element.clientWidth !== lastWidth) {
				element.scrollLeft = (count + (lastWidth ? currentPage() : 0)) * step();
			}
			lastWidth = element.clientWidth;
			update();
		});
		observer.observe(element);

		addEventListener('pointermove', onPointermove);
		addEventListener('pointerup', onPointerup);
		document.addEventListener('visibilitychange', onVisibility);

		if (looping) {
			lastWidth = element.clientWidth;
			element.scrollLeft = count * step();
		}
		update();
		startAutoplay();

		return () => {
			observer.disconnect();
			removeEventListener('pointermove', onPointermove);
			removeEventListener('pointerup', onPointerup);
			document.removeEventListener('visibilitychange', onVisibility);
			stopAutoplay();
			clearTimeout(settleTimer);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="carousel {className ?? ''}"
	class:loop={looping}
	role="region"
	aria-roledescription="carousel"
	aria-label={label}
	style="--per-view-lg: {slidesPerView}; --progress: {fill.toFixed(4)}"
	onmouseenter={autoplay?.enabled ? pause : undefined}
	onmouseleave={autoplay?.enabled ? resume : undefined}
	onfocusin={autoplay?.enabled ? pause : undefined}
	onfocusout={autoplay?.enabled ? resume : undefined}
>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="track"
		class:dragging
		role="group"
		aria-label="Slides"
		tabindex="0"
		bind:this={track}
		onscroll={onScroll}
		onkeydown={onKeydown}
		onpointerdown={onPointerdown}
		onclickcapture={onClickCapture}
	>
		{#each sets as set (set)}
			{#each slides as slide, index (index)}
				<div
					class="slide"
					role="group"
					aria-roledescription="slide"
					aria-label="{index + 1} of {count}"
					aria-hidden={set === 0 ? undefined : 'true'}
					inert={set !== 0}
				>
					{#if slide.img}
						<img
							{...imageProps(slide.img, { sizes: '(min-width: 768px) 50vw, 100vw' })}
							alt={slide.alt ?? slide.title ?? ''}
							draggable="false"
							loading="lazy"
						/>
					{/if}
					{#if slide.title}<h3 class="title">{slide.title}</h3>{/if}
					{#if slide.desc}<p>{slide.desc}</p>{/if}
				</div>
			{/each}
		{/each}
	</div>

	{#if showFooter}
		<div class="footer" class:split={(progress || cta?.text) && pagination !== 'none'}>
			{#if cta?.text}<Button {...cta} />{/if}

			{#if progress}
				<div class="progress" aria-hidden="true"><span></span></div>
			{/if}

			{#if pagination === 'arrows'}
				<div class="controls">
					<Button
						class="prev"
						iconStart="chevron-right"
						textDescription="Previous slide"
						disabled={!canPrev}
						onclick={() => {
							move(-1);
							restartAutoplay();
						}}
					/>
					<Button
						iconStart="chevron-right"
						textDescription="Next slide"
						disabled={!canNext}
						onclick={() => {
							move(1);
							restartAutoplay();
						}}
					/>
				</div>
			{:else if pagination === 'dots'}
				<div class="controls" hidden={pageTotal < 2}>
					{#each Array.from({ length: pageTotal }, (_, dot) => dot) as index (index)}
						<button
							type="button"
							class="dot"
							aria-label="Go to slide {index + 1}"
							aria-current={index === page ? 'true' : undefined}
							onclick={() => {
								goToPage(index);
								restartAutoplay();
							}}
						></button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.carousel {
		--gap: 16px;
		--per-view: 1;
		--dot-size: 12px;
		--progress-width: 320px;
		--progress-height: 3px;

		width: 100%;
		min-width: 0;
		max-width: 100%;

		@include mixins.min-md {
			--per-view: var(--per-view-lg, 1);
		}
	}

	.track {
		display: flex;
		gap: var(--gap);
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		cursor: grab;
		user-select: none;

		&::-webkit-scrollbar {
			display: none;
		}

		&.dragging {
			cursor: grabbing;
			scroll-snap-type: none;
		}
	}

	.slide {
		display: flex;
		flex: 0 0 calc((100% - var(--gap) * (var(--per-view) - 1)) / var(--per-view));
		flex-direction: column;
		gap: 12px;
		min-width: 0;
		scroll-snap-align: start;
	}

	.loop .slide {
		scroll-snap-stop: always;
	}

	img {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.title {
		font: inherit;
		font-size: 22px;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24px;
		margin-block-start: 24px;

		&.split {
			justify-content: space-between;
		}
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 12px;

		&[hidden] {
			display: none;
		}

		:global(.prev .icon) {
			rotate: 180deg;
		}
	}

	.progress {
		position: relative;
		flex: 1;
		max-width: var(--progress-width);
		height: var(--progress-height);
		overflow: hidden;
		background: color-mix(in srgb, var(--color-accent) 30%, transparent);

		span {
			position: absolute;
			inset: 0;
			background: var(--color-accent);
			transform: scaleX(var(--progress));
			transform-origin: left;
		}
	}

	.dot {
		width: var(--dot-size);
		height: var(--dot-size);
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--color-accent);
		opacity: 0.3;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition: opacity var(--duration) var(--ease);
		}

		&[aria-current='true'] {
			opacity: 1;
		}
	}
</style>
