<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';
	import type { TextEffect } from '$lib/utils/text-effect';

	export type CarouselTunnelSlide = {
		img: { src: string; alt?: string };
		eyebrow?: string;
		title?: string;
	};

	export type CarouselTunnelConfig = {
		/** Total scroll distance of the section, e.g. `220svh`. */
		sectionHeight?: string;
		/** The resting slide width, which sets how much of the next slides peek in, e.g. `min(25vw, 720px)`. */
		slideWidth?: string;
		slideGap?: string;
		/** A CSS aspect ratio, e.g. `2 / 1.25`. */
		slideAspect?: string;
		/** The share of the scroll (0–1) spent zooming out. The copy, captions and arrows reveal, and autoplay starts, when it ends. */
		scaleDuration?: number;
		/** Seconds for the fade of that reveal. */
		revealDuration?: number;
		/** Space between a caption and the slide's bottom left corner, e.g. `12px`. */
		captionOffset?: string;
	};

	export type CarouselTunnelProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title'
	> & {
		description?: string;
		slides: CarouselTunnelSlide[];
		autoplay?: {
			/** Milliseconds between slides. `0` turns autoplay off. */
			interval?: number;
			/** Advances one slide as soon as it reveals, instead of waiting a full interval. */
			quickStart?: boolean;
		};
		titleEffect?: TextEffect;
		descriptionEffect?: TextEffect;
		/** The share of a slide's width a drag must cross to change slides. Lower is more sensitive. */
		dragThreshold?: number;
		pagination?: 'arrows' | 'dots' | 'both';
		config?: CarouselTunnelConfig;
		/** The carousel's accessible name. */
		label?: string;
		/** Skips the scroll-driven zoom and autoplay, so everything shows and the arrows still work. For previews. */
		static?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount, tick } from 'svelte';
	import Button from '$lib/components/button.svelte';
	import Eyebrow from '$lib/components/eyebrow.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { loadGsap, refreshScrollTriggers } from '$lib/utils/gsap';
	import { prepareTextEffect } from '$lib/utils/text-effect';

	let {
		slides,
		eyebrowText,
		eyebrowIcon,
		eyebrowDot,
		title,
		description,
		autoplay,
		titleEffect = 'reveal',
		descriptionEffect = 'none',
		dragThreshold = 0.1,
		pagination = 'arrows',
		config,
		label = 'Featured work',
		static: still = false,
		id,
		class: className
	}: CarouselTunnelProps = $props();

	const interval = $derived(autoplay?.interval ?? 4500);
	const quickStart = $derived(autoplay?.quickStart ?? false);
	const scaleDuration = $derived(config?.scaleDuration ?? 0.6);

	// Only what is set becomes a custom property, so the stylesheet's own defaults (including the smaller mobile
	// slide width) stay in charge of the rest.
	const style = $derived(
		(
			[
				['--section-height', config?.sectionHeight],
				['--slide-width', config?.slideWidth],
				['--slide-gap', config?.slideGap],
				['--slide-aspect', config?.slideAspect],
				['--reveal-duration', config?.revealDuration && `${config.revealDuration}s`],
				['--caption-offset', config?.captionOffset]
			] as const
		)
			.filter(([, value]) => value)
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ')
	);

	let pin = $state<HTMLElement>();
	let viewport = $state<HTMLElement>();
	let scaler = $state<HTMLElement>();
	let track = $state<HTMLElement>();
	let content = $state<HTMLElement>();

	// `armed` is the scroll-driven version: pinned and zooming, with the copy hidden until the zoom ends. Without
	// JavaScript, or with reduced motion, it stays a plain carousel with everything showing.
	let armed = $state(false);
	let revealed = $state(false);
	let dragging = $state(false);
	let paused = $state(false);
	// With reduced motion nothing advances on its own.
	let calm = $state(false);
	let cloneCount = $state(0);
	let index = $state(0);

	const count = $derived(slides.length);
	const canLoop = $derived(count > 1);
	const active = $derived((((index - cloneCount) % count) + count) % count);
	const shown = $derived(
		cloneCount
			? [
					...slides.slice(-cloneCount).map((slide, at) => ({ slide, clone: true, key: `a${at}` })),
					...slides.map((slide, at) => ({ slide, clone: false, key: `r${at}` })),
					...slides.slice(0, cloneCount).map((slide, at) => ({ slide, clone: true, key: `b${at}` }))
				]
			: slides.map((slide, at) => ({ slide, clone: false, key: `r${at}` }))
	);

	let gsap: Awaited<ReturnType<typeof loadGsap>> | undefined;
	let animating = false;
	let timer: ReturnType<typeof setInterval> | undefined;

	const step = () => {
		const first = track!.children[0] as HTMLElement;
		return first.offsetWidth + (parseFloat(getComputedStyle(track!).columnGap) || 0);
	};

	// Slides are placed in the track's own pixels, so the zoom (on the scaler around it) never moves the active one.
	function goTo(to: number, animate = true) {
		if (!gsap || !track || !viewport || !track.children.length) return;
		if (animate && animating) return;

		const slideWidth = (track.children[0] as HTMLElement).offsetWidth;
		const x = viewport.offsetWidth / 2 - (to * step() + slideWidth / 2);
		const move = animate && !matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (move) animating = true;

		gsap.to(track, {
			x,
			duration: move ? 0.7 : 0,
			ease: 'power2.inOut',
			onComplete: () => {
				animating = false;
				if (!canLoop) return;
				// Landed on a clone: snap to the real slide it copies, with no transition, so the loop is unseen.
				if (to >= cloneCount + count) {
					index = to - count;
					goTo(index, false);
				} else if (to < cloneCount) {
					index = to + count;
					goTo(index, false);
				}
			}
		});
		index = to;
	}

	const next = () => goTo(index + 1);
	const previous = () => goTo(index - 1);

	function restart() {
		clearInterval(timer);
		timer = undefined;
		if (revealed && !paused && !calm && canLoop && interval > 0 && !document.hidden) {
			timer = setInterval(next, interval);
		}
	}

	$effect(() => {
		// Rerun whenever any of these change.
		void [revealed, paused, calm, interval, canLoop];
		restart();
		return () => clearInterval(timer);
	});

	// Enough clones on each end to fill half the viewport, so no gap shows at the loop's edge.
	async function measure() {
		if (!viewport || !track || !canLoop) return;
		const first = track.children[cloneCount] as HTMLElement | undefined;
		if (!first) return;
		const perSide = Math.ceil(viewport.offsetWidth / 2 / step()) + 1;
		const wanted = Math.min(Math.max(perSide, 1), count);
		const here = cloneCount ? active : 0;

		if (wanted !== cloneCount) {
			cloneCount = wanted;
			index = wanted + here;
			await tick();
		}
		goTo(index, false);
	}

	let startX = 0;
	let startTrackX = 0;

	function onpointerdown(event: PointerEvent) {
		if (!revealed || !gsap || !track) return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		dragging = true;
		startX = event.clientX;
		startTrackX = gsap.getProperty(track, 'x') as number;
		gsap.killTweensOf(track);
		animating = false;
		track.setPointerCapture(event.pointerId);
		clearInterval(timer);
	}

	function onpointermove(event: PointerEvent) {
		if (dragging && gsap && track) gsap.set(track, { x: startTrackX + (event.clientX - startX) });
	}

	function onpointerup(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;

		const dragged = -(event.clientX - startX);
		const maxJump = canLoop ? cloneCount : 0;
		// Crossing the threshold's share of one slide advances it, and each whole slide after that advances another.
		const crossed = Math.floor(Math.abs(dragged) / step() + (1 - dragThreshold));
		const delta = Math.max(-maxJump, Math.min(maxJump, Math.sign(dragged) * crossed));
		goTo(index + delta);
		restart();
	}

	onMount(() => {
		let cancelled = false;
		let cleanups: (() => void)[] = [];

		const motion = !still && !matchMedia('(prefers-reduced-motion: reduce)').matches;
		calm = !motion;

		(async () => {
			const core = await loadGsap(...(motion ? (['scrollTrigger'] as const) : []));
			gsap = core;
			if (cancelled) return;

			await measure();
			const onResize = () => measure();
			addEventListener('resize', onResize);
			cleanups.push(() => removeEventListener('resize', onResize));

			if (!motion || !pin || !scaler) {
				revealed = true;
				return;
			}

			armed = true;
			await tick();

			const titleEl = content?.querySelector<HTMLElement>('h2');
			const descriptionEl = content?.querySelector<HTMLElement>('.description');
			const [titlePlay, descriptionPlay] = await Promise.all([
				titleEl ? prepareTextEffect(titleEl, titleEffect) : undefined,
				descriptionEl ? prepareTextEffect(descriptionEl, descriptionEffect) : undefined
			]);
			if (cancelled) {
				titlePlay?.revert();
				descriptionPlay?.revert();
				return;
			}
			cleanups.push(() => {
				titlePlay?.revert();
				descriptionPlay?.revert();
			});

			// Enough zoom that the active slide covers the whole frame, whatever its size and shape.
			const slide = track!.children[cloneCount] as HTMLElement;
			const start = Math.max(
				pin.offsetWidth / slide.offsetWidth,
				pin.offsetHeight / slide.offsetHeight,
				1
			);
			core.set(scaler, { scale: start });

			const context = core.context(() => {
				const timeline = core.timeline({
					scrollTrigger: {
						trigger: pin,
						start: 'top top',
						end: '+=125%',
						pin: true,
						scrub: 1,
						invalidateOnRefresh: true,
						// The copy, captions and arrows reveal, and autoplay starts, once the zoom has finished.
						onUpdate: (self) => {
							const done = self.progress >= scaleDuration;
							if (done === revealed) return;
							revealed = done;
							if (done) {
								titlePlay?.play();
								descriptionPlay?.play();
								if (quickStart && canLoop && interval > 0) next();
							}
						}
					}
				});
				timeline.to(scaler!, { scale: 1, ease: 'power2.out', duration: scaleDuration }, 0);
				// Pads the timeline so the scrub keeps its dwell time after the zoom, instead of ending with it.
				timeline.set({}, {}, 1);
			}, pin);
			cleanups.push(() => context.revert());
			refreshScrollTriggers();
		})();

		const onVisibility = () => restart();
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			cancelled = true;
			document.removeEventListener('visibilitychange', onVisibility);
			cleanups.forEach((cleanup) => cleanup());
			clearInterval(timer);
			if (gsap && track) gsap.killTweensOf(track);
		};
	});
</script>

<!-- Hovering or focusing the carousel holds autoplay, so a slide can be looked at. -->
<section
	{id}
	class="carousel-tunnel {className ?? ''}"
	class:armed
	class:revealed
	aria-roledescription="carousel"
	aria-label={label}
	{style}
	onpointerenter={() => (paused = true)}
	onpointerleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	<div class="pin" bind:this={pin}>
		{#if eyebrowText || eyebrowIcon || title || description}
			<div class="content" bind:this={content}>
				<SectionCopy
					level={2}
					align="center"
					{eyebrowText}
					{eyebrowIcon}
					{eyebrowDot}
					{title}
					{description}
				/>
			</div>
		{/if}

		<div class="viewport" bind:this={viewport}>
			<div class="scaler" bind:this={scaler}>
				<!-- Dragging with a pointer is an extra; the arrows and dots do the same with a keyboard. -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="track"
					class:dragging
					bind:this={track}
					{onpointerdown}
					{onpointermove}
					{onpointerup}
					onpointercancel={onpointerup}
				>
					{#each shown as { slide, clone, key } (key)}
						<div
							class="slide"
							role={clone ? undefined : 'group'}
							aria-roledescription={clone ? undefined : 'slide'}
							aria-hidden={clone ? 'true' : undefined}
						>
							<img
								{...imageProps(slide.img.src, { sizes: '100vw' })}
								alt={slide.img.alt ?? ''}
								draggable="false"
							/>
							{#if slide.eyebrow || slide.title}
								<div class="caption">
									{#if slide.eyebrow}<Eyebrow text={slide.eyebrow} />{/if}
									{#if slide.title}<h3 class="h6">{slide.title}</h3>{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>

		{#if canLoop}
			<div class="pagination">
				{#if pagination !== 'dots'}
					<Button
						type="solid"
						iconStart="chevron-right"
						textDescription="Previous slide"
						class="arrow previous"
						onclick={() => {
							previous();
							restart();
						}}
					/>
				{/if}
				{#if pagination !== 'arrows'}
					<div class="dots">
						{#each slides as slide, at (at)}
							<button
								type="button"
								class="dot"
								class:current={at === active}
								aria-label="Go to slide {at + 1}{slide.title ? `: ${slide.title}` : ''}"
								aria-current={at === active ? 'true' : undefined}
								onclick={() => {
									goTo(cloneCount + at);
									restart();
								}}
							></button>
						{/each}
					</div>
				{/if}
				{#if pagination !== 'dots'}
					<Button
						type="solid"
						iconStart="chevron-right"
						textDescription="Next slide"
						class="arrow"
						onclick={() => {
							next();
							restart();
						}}
					/>
				{/if}
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	// Zooms out of a full-screen image into a carousel with the next slides peeking in. Nothing is cropped on the
	// way: the scaler shrinks everything inside it, track and slides together. The track is a separate element
	// so sliding (x) and zooming (scale) never fight over one transform.
	.carousel-tunnel {
		--section-height: 220svh;
		--slide-width: min(25vw, 720px);
		--slide-gap: 24px;
		--slide-aspect: 2 / 1.25;
		--reveal-duration: 0.6s;
		--caption-offset: 12px;

		position: relative;

		@include mixins.max-md {
			--slide-width: min(84vw, 480px);
		}
	}

	.armed {
		height: var(--section-height);
	}

	.pin {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 32px;
		width: 100%;
		padding-block: 64px;
		overflow: hidden;
	}

	.armed .pin {
		height: 100svh;
		padding-block: 0;
	}

	.viewport {
		width: 100%;
	}

	.scaler {
		display: flex;
		align-items: center;
		width: 100%;
		transform-origin: center;
		will-change: transform;
	}

	.track {
		display: flex;
		align-items: center;
		gap: var(--slide-gap);
		user-select: none;
		touch-action: pan-y;
		will-change: transform;
	}

	.revealed .track {
		cursor: grab;
	}

	.dragging {
		cursor: grabbing;
	}

	.slide {
		position: relative;
		flex: 0 0 auto;
		width: var(--slide-width);
		aspect-ratio: var(--slide-aspect);
		overflow: hidden;
		border-radius: var(--radius);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
	}

	.caption {
		position: absolute;
		inset: auto var(--caption-offset) var(--caption-offset);
		color: #fff;
		text-shadow: 0 1px 4px rgb(0 0 0 / 0.8);
		pointer-events: none;

		h3 {
			margin: 0;
		}
	}

	// Hidden until the zoom ends, then faded in. It is a played fade, not tied to the scroll.
	.armed {
		.content,
		.pagination,
		.caption {
			visibility: hidden;
			opacity: 0;
			pointer-events: none;
			user-select: none;

			@include mixins.mq-motion-allow {
				transition:
					opacity var(--reveal-duration) var(--ease),
					visibility var(--reveal-duration);
			}
		}

		&.revealed {
			.content,
			.pagination,
			.caption {
				visibility: visible;
				opacity: 1;
			}

			.pagination {
				pointer-events: auto;
			}
		}
	}

	.content {
		z-index: 2;
		width: 100%;
		padding-inline: var(--body-padding);
	}

	.pagination {
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		width: 100%;
		padding-inline: var(--body-padding);
	}

	.pagination :global(.previous .icon) {
		rotate: 180deg;
	}

	.dots {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.dot {
		width: 8px;
		height: 8px;
		padding: 0;
		border-radius: 50%;
		background: var(--color-border);

		@include mixins.mq-motion-allow {
			transition:
				background var(--duration) var(--ease),
				scale var(--duration) var(--ease);
		}

		&.current {
			background: var(--color-text);
			scale: 1.3;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 3px;
		}
	}
</style>
