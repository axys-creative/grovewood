<script module lang="ts">
	import type { LogoProps } from '$lib/components/logo.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CircleHighlightSlice = { title: string; description?: string };

	export type CircleHighlightProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description'
	> & {
		/** One slice of the ring each, highlighted in turn clockwise as the page scrolls. */
		slices: CircleHighlightSlice[];
		/** 0-99, the hole as a percent of the ring's radius. A bigger hole is a thinner ring, and `0` draws solid pie slices. */
		holeSize?: number;
		/** The curve on every slice corner, in the ring's own 0-100 units. */
		radius?: number;
		/** The space between slices, in the same units. */
		gap?: number;
		/** `outside` places each caption around the ring. `inside` shows only the active one, in the hole. `cards` (with no copy beside the ring) puts glass cards beside it with a line drawn to each slice, stacked under it below `lg`. */
		captionPlacement?: 'outside' | 'inside' | 'cards';
		/** `default` centers the first slice at 12 o'clock. `tilted` puts a division there with the first slice on its right, `tilted-left` on its left. */
		orientation?: 'default' | 'tilted' | 'tilted-left';
		/** Sits in the hole and shows until the section pins. A Logo's props, so it can change with the theme. */
		image?: Pick<LogoProps, 'src' | 'srcLight' | 'srcDark' | 'alt'>;
		/** How far a slice moves straight out from the center while it is highlighted or hovered, in the ring's own 0-100 units. `0` is off. */
		nudge?: number;
		/** Scales the image in the hole, with `1` its normal size. */
		imageScale?: number;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from '$lib/components/logo.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { donutSlice } from '$lib/utils/donut';
	import { loadGsap } from '$lib/utils/gsap';

	// Blank space around the ring inside its box, so a stroke on the active slice is never cut off, and the share of
	// the box the ring itself fills. The hole image is sized from both.
	const PADDING = 4;
	const RING_SHARE = 68;
	// How much scroll each slice gets, as a percent of the screen height.
	const DWELL = 60;
	// Without copy beside the ring, each caption becomes a card out to the side with a leader line to its slice. All in the
	// ring box's own units, with the box 100 wide: how far the card's near edge and the line's bend sit from the center, and
	// how far the card sits above or below it.
	const CARD_EDGE = 50;
	const CARD_BEND = 40;
	const CARD_RISE = 44;

	let {
		slices,
		holeSize = 55,
		radius = 0,
		gap = 0,
		captionPlacement = 'outside',
		nudge = 1.6,
		orientation = 'default',
		image,
		imageScale = 1,
		id,
		class: className,
		...copy
	}: CircleHighlightProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
	const shapes = $derived(
		slices.map((slice, index) =>
			donutSlice({ index, count: slices.length, holeSize, radius, gap, orientation })
		)
	);
	const nudges = $derived(
		shapes.map(({ middle }) => {
			const angle = (middle * Math.PI) / 180;
			return { x: (Math.sin(angle) * nudge).toFixed(2), y: (-Math.cos(angle) * nudge).toFixed(2) };
		})
	);
	const callouts = $derived(captionPlacement === 'cards' && !hasCopy);
	const leaders = $derived(
		shapes.map(({ middle }) => {
			const angle = (middle * Math.PI) / 180;
			const side = Math.sin(angle) < -0.01 ? -1 : 1;
			const radius = (RING_SHARE / 2) * (1 + holeSize / 100) * 0.5;
			const y = 50 - CARD_RISE * Math.cos(angle);
			const tip = { x: 50 + radius * Math.sin(angle), y: 50 - radius * Math.cos(angle) };
			const path = `M ${50 + side * CARD_EDGE} ${y} H ${50 + side * CARD_BEND} L ${tip.x} ${tip.y}`;
			return { side, y, path, tip };
		})
	);
	const hole = $derived(((RING_SHARE * holeSize) / (100 + PADDING * 2)).toFixed(2));

	let pin = $state<HTMLElement>();
	let armed = $state(false);
	let started = $state(false);
	let finale = $state(false);
	let active = $state(0);
	let seek: ((index: number) => void) | undefined;

	// A click, tap or keyboard focus on a slice scrolls the pin to that slice's step, so the page scroll and the ring never
	// disagree. The state is set at once because the scrolled position only catches up a frame later.
	function select(index: number) {
		if (!armed) return;
		started = true;
		finale = false;
		active = index;
		// After the browser's own scroll-into-view on focus, which would otherwise win.
		setTimeout(() => seek?.(index));
	}

	function onSliceKey(event: KeyboardEvent, index: number) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		select(index);
	}

	// The pinned frame steps through the slices clockwise, then one more step where every slice lights at once and
	// the caption hides, so the sequence ends on a finish instead of stopping on the last slice. Without
	// JavaScript, or with reduced motion, every slice and caption just shows.
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches || !slices.length) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then((gsap) => {
			if (cancelled || !pin) return;
			armed = true;
			const steps = slices.length + 1;

			const context = gsap.context(() => {
				const tween = gsap.to(pin!, {
					scrollTrigger: {
						trigger: pin,
						start: 'top top',
						end: `+=${steps * DWELL}%`,
						pin: true,
						scrub: 1,
						onEnter: () => (started = true),
						onLeaveBack: () => (started = false),
						onUpdate: (self) => {
							const step = Math.min(steps - 1, Math.floor(self.progress * steps));
							finale = step === slices.length;
							if (step < slices.length) active = step;
						}
					}
				});

				seek = (index) => {
					const trigger = tween.scrollTrigger;
					if (!trigger) return;
					const top = trigger.start + ((index + 0.5) / steps) * (trigger.end - trigger.start);
					window.scrollTo({ top, behavior: 'instant' });
				};
			}, pin);
			revert = () => {
				seek = undefined;
				context.revert();
			};
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	});
</script>

{#snippet captions()}
	{#each slices as slice, index (index)}
		<div
			class="caption"
			class:current={index === active}
			class:near-left={callouts && leaders[index].side < 0}
			class:past={index < active}
			style="--slice-angle: {shapes[index].middle}; --card-y: {leaders[index].y.toFixed(
				2
			)}; --depth: {active - index}"
		>
			<h3 class="h6">{slice.title}</h3>
			{#if slice.description}<p>{slice.description}</p>{/if}
		</div>
	{/each}
{/snippet}

<section
	{id}
	class="circle-highlight {className ?? ''}"
	class:armed
	class:started
	class:finale
	class:centered={!hasCopy}
	class:callouts
	style="--count: {slices.length}"
>
	<div class="pin" bind:this={pin}>
		{#if hasCopy}
			<div class="content">
				<SectionCopy level={2} {...copy} />
			</div>
		{/if}

		{#if shapes.length}
			<div class="ring-wrap" class:inside={captionPlacement === 'inside'}>
				<svg
					class="ring"
					viewBox="-{PADDING} -{PADDING} {100 + PADDING * 2} {100 + PADDING * 2}"
					role={armed ? 'group' : undefined}
					aria-label={armed ? 'Highlights' : undefined}
					aria-hidden={armed ? undefined : 'true'}
				>
					{#each shapes as shape, index (index)}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<path
							class="slice"
							class:current={index === active}
							d={shape.path}
							style="--dx: {nudges[index].x}; --dy: {nudges[index].y}"
							role={armed ? 'button' : undefined}
							tabindex={armed ? 0 : undefined}
							aria-label={armed ? slices[index].title : undefined}
							onclick={() => select(index)}
							onfocus={() => select(index)}
							onkeydown={(event) => onSliceKey(event, index)}
						/>
					{/each}
				</svg>

				{#if callouts}
					<svg class="leaders" viewBox="0 0 100 100" aria-hidden="true">
						{#each leaders as leader, index (index)}
							<g class="leader" class:current={index === active}>
								<path d={leader.path} pathLength="1" />
								<circle cx={leader.tip.x} cy={leader.tip.y} r="0.8" />
							</g>
						{/each}
					</svg>
				{/if}

				{#if image}
					<div class="hole-image" style="--hole-diameter: {hole}%; --image-scale: {imageScale}">
						<Logo {...image} />
					</div>
				{/if}

				{#if callouts}
					<div class="cards">{@render captions()}</div>
				{:else}
					{@render captions()}
				{/if}
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	// A pinned, scroll-driven donut chart: the ring highlights one slice at a time, always clockwise. Captions sit
	// on the ring's circumference the way Image Circle places its cards, from `--slice-angle` (0 is the top, turning
	// clockwise) and CSS `sin()` / `cos()` against the ring box's own width, so none of it needs script.
	.circle-highlight {
		position: relative;
	}

	.pin {
		// The ring's box is also what the outside captions measure from. They hang past its edge by 15% of its width,
		// so the box keeps that much room to its right.
		--ring-size: min(40vw, 480px);

		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 64px;
		max-width: var(--content-width);
		min-height: 100svh;
		margin-inline: auto;
		padding: 48px var(--body-padding);

		@include mixins.max-lg {
			--ring-size: min(72vw, 420px);

			flex-direction: column;
			gap: 48px;
		}
	}

	.centered .pin {
		--ring-size: min(52vw, 560px);

		justify-content: center;

		@include mixins.max-lg {
			--ring-size: min(72vw, 420px);
		}
	}

	.content {
		flex: 0 1 35%;
		max-width: var(--max-width-text);

		@include mixins.max-lg {
			flex: none;
			width: 100%;
		}
	}

	.ring-wrap {
		position: relative;
		isolation: isolate;
		// Captions measure their distance from the ring against this box's width, not the screen's.
		container-type: inline-size;
		flex: 0 0 auto;
		width: var(--ring-size);
		aspect-ratio: 1;
		margin-inline: auto calc(var(--ring-size) * 0.15);

		@include mixins.max-lg {
			margin-inline: auto;
		}
	}

	// Without copy beside it the captions hang evenly around the ring, so it sits dead center.
	.centered .ring-wrap {
		margin-inline: auto;
	}

	.callouts .pin {
		@include mixins.min-lg {
			// Both cards and their gaps must fit across the screen: each card is up to 320px, 64% of the ring, and starts
			// half a ring out, so the ring shrinks on a narrow desktop.
			--room: calc(100vw - var(--body-padding) * 2);
			--ring-size: min(46vw, 520px, max(var(--room) / 2.28, var(--room) - 640px));
		}
	}

	.ring {
		position: absolute;
		// Leaves room outside the ring, inside the same box, for the captions.
		inset: 16%;
		width: 68%;
		height: 68%;
	}

	.slice {
		fill: var(--color-border);
		outline: none;

		@media (hover: hover) {
			&:hover {
				translate: calc(var(--dx) * 1px) calc(var(--dy) * 1px);
			}
		}

		@include mixins.mq-motion-allow {
			transition:
				fill 0.4s var(--ease),
				translate 0.3s var(--ease);
		}
	}

	.caption {
		// How far from the center a caption sits, past the ring's own edge.
		--distance: 50cqw;
		--angle: calc(var(--slice-angle, 0) * 1deg);
		--x: calc(sin(var(--angle)) * var(--distance));
		--y: calc(-1 * cos(var(--angle)) * var(--distance));

		position: absolute;
		top: 50%;
		left: 50%;
		width: min(34cqw, 240px);
		translate: calc(-50% + var(--x)) calc(-50% + var(--y));
		text-align: center;

		h3,
		p {
			margin: 0;
		}

		p {
			margin-block-start: 4px;
			color: var(--color-text-muted);
			font-size: 14px;
		}

		@include mixins.mq-motion-allow {
			transition: opacity 0.4s var(--ease);
		}
	}

	// Inside, every caption is stacked in the middle of the ring and only the active one shows.
	.inside .caption {
		--distance: 0px;
	}

	.leaders {
		display: none;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;

		@include mixins.min-lg {
			display: block;
		}

		path {
			fill: none;
			stroke: var(--on-background-alt);
			stroke-width: 0.25;
			stroke-dasharray: 1;
			stroke-dashoffset: 0;
			stroke-linejoin: round;
		}

		circle {
			fill: var(--on-background-alt);
			transform-box: fill-box;
			transform-origin: center;
		}
	}

	// Without copy beside the ring the captions are glass cards. Up to `lg` they stack in one spot under the ring and
	// fade in and out one at a time, rising in and sinking out. From `lg` up they sit beside it, the first and last
	// slices' on the left, each with a line drawn from the card to the middle of its slice.
	.callouts .ring-wrap {
		margin-block-end: var(--cards-room, 0px);

		@include mixins.max-lg {
			--cards-room: 240px;
		}
	}

	.callouts:not(.armed) .ring-wrap {
		@include mixins.max-lg {
			margin-block-end: calc(var(--cards-room) * var(--count));
		}
	}

	.cards {
		display: contents;

		@include mixins.max-lg {
			position: absolute;
			top: calc(100% + 48px);
			left: 50%;
			display: grid;
			gap: 12px;
			width: min(560px, calc(100vw - var(--body-padding) * 2));
			translate: -50% 0;
		}
	}

	.callouts .caption {
		padding: 20px 24px;
		border: 1px solid var(--color-border);
		border-radius: 16px;
		background: var(--color-glass);
		backdrop-filter: blur(12px);
		text-align: start;

		@include mixins.max-lg {
			position: static;
			grid-area: 1 / 1;
			width: auto;
			translate: none;
			transform-origin: 50% 0;

			> :global(*) {
				@include mixins.mq-motion-allow {
					transition: opacity 0.4s var(--ease);
				}
			}

			@include mixins.mq-motion-allow {
				transition:
					opacity 0.4s var(--ease),
					transform 0.4s var(--ease);
			}
		}

		@include mixins.min-lg {
			top: calc(var(--card-y) * 1cqw);
			left: calc(50% + 50cqw);
			width: min(64cqw, 320px);
			translate: 0 -50%;

			&.near-left {
				right: calc(50% + 50cqw);
				left: auto;
			}
		}
	}

	.hole-image {
		position: absolute;
		top: 50%;
		left: 50%;
		display: grid;
		place-items: center;
		width: var(--hole-diameter, 40%);
		padding-inline: 12%;
		translate: -50% -50%;
		scale: var(--image-scale, 1);

		@include mixins.mq-motion-allow {
			transition: opacity 0.4s var(--ease);
		}

		--logo-height: auto;

		:global(.logo) {
			width: 100%;
			justify-content: center;
		}

		:global(.logo img) {
			width: 100%;
		}
	}

	// Armed, nothing is highlighted and no caption shows until the scroll reaches the pin (`started`). With
	// captions inside, the logo then gives the hole to the caption.
	.armed {
		&.started:not(.finale) .slice.current {
			translate: calc(var(--dx) * 1px) calc(var(--dy) * 1px);
		}

		.slice {
			cursor: pointer;

			&:focus-visible {
				stroke: var(--on-background-alt);
				stroke-width: 1.2px;
			}
		}

		.caption {
			opacity: 0;
		}

		// Up to `lg` the cards stack: the newest sits in front, and each earlier one rises 12px and shrinks a little behind it,
		// four deep. A fifth back fades out. Only a sliver of each shows, so its text hides.
		&.callouts .caption {
			@include mixins.max-lg {
				transform: translateY(24px);
			}
		}

		&.callouts .caption.past {
			@include mixins.max-lg {
				z-index: calc(10 - var(--depth));
				opacity: calc(1 - max(0, var(--depth) - 3));
				transform: translateY(calc(var(--depth) * -12px)) scale(calc(1 - var(--depth) * 0.05));

				> :global(*) {
					opacity: 0;
				}
			}
		}

		&.started .caption.current {
			opacity: 1;
			transform: none;
		}

		&.callouts .caption.current {
			@include mixins.max-lg {
				z-index: 10;
			}
		}

		.leader path {
			stroke-dashoffset: 1;
		}

		.leader circle {
			scale: 0;
		}

		&.started .leader.current path {
			stroke-dashoffset: 0;
		}

		&.started .leader.current circle {
			scale: 1;
		}

		&.started .inside .hole-image {
			opacity: 0;
		}

		&.started .slice.current,
		&.finale .slice {
			fill: var(--color-accent);
			stroke: var(--color-text);
			stroke-width: 0.5px;
		}

		&.finale .caption.current {
			opacity: 0;
		}

		// The stacked cards stay on screen after the last step, as the section scrolls away.
		&.finale.callouts .caption.current {
			@include mixins.max-lg {
				opacity: 1;
			}
		}

		&.finale .leader.current path {
			stroke-dashoffset: 1;
		}

		&.finale .leader.current circle {
			scale: 0;
		}

		@include mixins.mq-motion-allow {
			// On desktop, leaving goes in order: the dot, then the line, then the card. Arriving draws the line first, then the
			// dot.
			.leader path {
				transition: stroke-dashoffset 0.6s var(--ease) 0.2s;
			}

			.leader circle {
				transition: scale 0.2s var(--ease);
			}

			&.started .leader.current path {
				transition-delay: 0s;
			}

			&.started .leader.current circle {
				transition-delay: 0.5s;
			}

			&.finale .leader.current path {
				transition-delay: 0.2s;
			}

			&.finale .leader.current circle {
				transition-delay: 0s;
			}

			&.callouts:not(.started) .caption {
				@include mixins.min-lg {
					transition-delay: 0.6s;
				}
			}

			&.finale.callouts .caption.current {
				@include mixins.min-lg {
					transition-delay: 0.6s;
				}
			}
		}
	}

	// Without the scroll-driven version every slice and caption just shows, around the ring, even with captions inside.
	.circle-highlight:not(.armed) {
		.slice {
			fill: var(--color-accent);
		}

		.caption {
			--distance: 50cqw;
		}
	}
</style>
