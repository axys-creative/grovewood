<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ScrollTimelineEvent = {
		/** Shown under its circle on the timeline, e.g. `2019` or `March 2021`. */
		date: string;
		title: string;
		description?: string;
		/** The event's card on the circle. Needed for every event in the `circle` variant. */
		image?: { src: string; alt?: string };
	};

	export type ScrollTimelineProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		/** Two or more, in order. */
		events: ScrollTimelineEvent[];
		/** `details` shows the active event's title and text under the timeline. `circle` shows a ring of the events' images instead, and the event's details take the place of the section copy. */
		variant?: 'details' | 'circle';
		/** `center` stacks the copy in the middle. `split` puts the eyebrow and title on the left and the description on the right. */
		copyLayout?: 'center' | 'split';
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ImageCircle from '$lib/components/image-circle.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { loadGsap } from '$lib/utils/gsap';

	let {
		events,
		variant = 'details',
		copyLayout = 'center',
		id,
		class: className,
		...copy
	}: ScrollTimelineProps = $props();

	// How much scroll each step gets, as a share of the screen height.
	const DWELL = 0.7;

	const circle = $derived(variant === 'circle');
	const count = $derived(events.length);
	// The circle variant opens on the section's own copy, so it has one more step than it has events.
	const steps = $derived(count + (circle ? 1 : 0));
	const layout = $derived(copyLayout === 'split' ? 'row' : 'column');
	const align = $derived(copyLayout === 'split' ? 'start' : 'center');

	const hasCopy = $derived(Object.values(copy).some(Boolean));
	// The ring is an arc, not a full circle: cards sit this many degrees apart however many events there are, so a few
	// events do not wrap round and meet. The active card is at the top, and the neighbors fan out each side of it.
	const ARC = 30;
	// Cards sized so the two cards two steps either side of the active one end at the edge of the ring's box, which is
	// as wide as the screen. The radius follows from the chord between cards (1.15 cards wide), as in Image Circle.
	const sine = Math.sin((ARC / 2) * (Math.PI / 180));
	const cardWidth = 48 / ((1.15 * Math.sin(2 * ARC * (Math.PI / 180))) / (2 * sine) + 0.55);

	let pin = $state<HTMLElement>();
	let armed = $state(false);
	let step = $state(0);
	let trigger: ScrollTrigger | undefined;

	const active = $derived(circle ? Math.max(0, step - 1) : step);
	const intro = $derived(circle && step === 0);

	// A pinned frame steps through the events as the page scrolls: the timeline slides to the active one, and the
	// details (or the circle) follow. Without JavaScript or with reduced motion it is a plain list of events.
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches || events.length < 2) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then(async (gsap) => {
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			if (cancelled || !pin) return;
			armed = true;
			await tick();

			const context = gsap.context(() => {
				trigger = ScrollTrigger.create({
					trigger: pin,
					// The details view starts as its frame is centered, so the copy above is still in view when it pins.
					start: circle ? 'top top' : 'center center',
					end: () => `+=${steps * innerHeight * DWELL}`,
					pin: true,
					invalidateOnRefresh: true,
					onUpdate: (self) => (step = Math.min(steps - 1, Math.floor(self.progress * steps)))
				});
			}, pin);
			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
			trigger = undefined;
		};
	});

	// Scrolls to the middle of an event's step.
	function jumpTo(index: number) {
		if (!trigger) return;
		const at = (index + (circle ? 1 : 0) + 0.5) / steps;
		scrollTo({ top: trigger.start + (trigger.end - trigger.start) * at, behavior: 'smooth' });
	}
</script>

{#snippet copyBlock(props: Partial<SectionCopyProps>, level: 2 | 3)}
	<SectionCopy {...props} {level} {layout} {align} />
{/snippet}

<section {id} class="scroll-timeline variant-{variant} {className ?? ''}" class:armed>
	{#if !circle && hasCopy}
		<header class="intro">{@render copyBlock(copy, 2)}</header>
	{/if}

	<div class="pin" bind:this={pin}>
		{#if circle}
			<!-- The details are announced as they change, since they replace the section's copy. -->
			<div class="swap" aria-live="polite">
				{#key intro ? -1 : active}
					<div class="fade">
						{#if intro}
							{@render copyBlock(copy, 2)}
						{:else}
							{@render copyBlock(
								{ title: events[active].title, description: events[active].description },
								3
							)}
						{/if}
					</div>
				{/key}
			</div>
		{/if}

		{#if armed}
			<div class="timeline" style="--active: {active}">
				<ol class="track">
					{#each events as event, index (index)}
						<li class="stop" class:current={index === active}>
							<button
								type="button"
								class="dot-button"
								aria-label="{event.date}: {event.title}"
								aria-current={index === active ? 'step' : undefined}
								onclick={() => jumpTo(index)}
								onfocus={() => index !== active && jumpTo(index)}
							>
								<span class="dot"></span>
							</button>
							<span class="date">{event.date}</span>
						</li>
					{/each}
				</ol>
			</div>

			{#if circle}
				<div class="circle-wrap">
					<ImageCircle
						images={events.map((event) => event.image ?? { src: '' })}
						itemWidth={cardWidth}
						bloom="top"
						clip={false}
						sizes="(min-width: 1024px) 300px, 150px"
						step={ARC}
						rotation={-active * ARC}
					/>
				</div>
			{:else}
				<div class="details">
					{#each events as event, index (index)}
						<div class="event" class:current={index === active} aria-hidden={index !== active}>
							<h3 class="h4">{event.title}</h3>
							{#if event.description}<p>{event.description}</p>{/if}
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<ol class="list">
				{#each events as event, index (index)}
					<li>
						<span class="list-date">{event.date}</span>
						<h3 class="h4">{event.title}</h3>
						{#if event.description}<p>{event.description}</p>{/if}
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.scroll-timeline {
		--timeline-step: clamp(140px, 20vw, 260px);
		--dot: 24px;

		overflow-x: clip;
	}

	.intro {
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
	}

	.pin {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 48px;
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
	}

	// Armed, the frame runs the full width. The details view is only as tall as its content, so it can pin in the middle
	// of the screen while the copy above is still leaving. The circle view fills the screen.
	.armed .pin {
		justify-content: center;
		max-width: none;
		margin-inline: 0;
		padding: 24px 0 48px;
	}

	.armed .intro {
		padding-block-end: 0;
	}

	.variant-circle.armed .pin {
		height: 100svh;
		overflow: clip;
	}

	.variant-circle.armed .pin {
		justify-content: flex-start;
		gap: 24px;
		padding-block: 96px 0;
	}

	.swap,
	.armed .intro {
		width: 100%;
	}

	.swap {
		max-width: var(--content-width);
		min-height: 168px;
		padding-inline: var(--body-padding);
	}

	.fade {
		@include mixins.mq-motion-allow {
			animation: fade-up 0.5s var(--ease) both;
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			translate: 0 12px;
		}
	}

	// The timeline runs the full width of the screen, but its line only runs from the first circle to the last. The
	// active stop is always the one in the middle, so the track slides under it.
	.timeline {
		position: relative;
		flex: none;
		width: 100%;
		height: calc(var(--dot) * 4);
	}

	.track {
		position: absolute;
		top: 8px;
		left: 50%;
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
		translate: calc((var(--active) + 0.5) * var(--timeline-step) * -1) 0;

		@include mixins.mq-motion-allow {
			transition: translate 0.7s var(--ease);
		}

		// The line, from the middle of the first circle to the middle of the last, moving with them.
		&::before {
			content: '';
			position: absolute;
			inset: calc(var(--dot) / 2) calc(var(--timeline-step) / 2) auto;
			border-block-start: 1px solid var(--color-border);
		}
	}

	.stop {
		display: flex;
		flex: none;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: var(--timeline-step);
	}

	.dot-button {
		display: grid;
		place-items: center;
		width: calc(var(--dot) * 2);
		height: var(--dot);
		cursor: pointer;

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 6px;
			border-radius: var(--radius-btn);
		}
	}

	// The border is the line's color, and the fill is the page's, so the line seems to pass behind it.
	.dot {
		width: var(--dot);
		height: var(--dot);
		border: 1px solid var(--color-border);
		border-radius: 50%;
		background: var(--color-bg);

		@include mixins.mq-motion-allow {
			transition: scale 0.7s var(--ease);
		}
	}

	.current .dot {
		border-color: var(--color-accent);
		scale: 1.6;
	}

	@include mixins.mq-mouse {
		.dot-button:hover .dot {
			scale: 1.25;
		}

		.current .dot-button:hover .dot {
			scale: 1.6;
		}
	}

	.date {
		color: var(--color-text-muted);
		font-size: 14px;
		opacity: 0.6;

		@include mixins.mq-motion-allow {
			transition:
				opacity var(--duration) var(--ease),
				color var(--duration) var(--ease);
		}
	}

	.current .date {
		color: var(--color-text);
		opacity: 1;
	}

	.details {
		display: grid;
		width: 100%;
		max-width: 650px;
		padding-inline: var(--body-padding);
		text-align: center;
	}

	.event {
		grid-area: 1 / 1;
		visibility: hidden;
		opacity: 0;
		translate: 0 12px;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.5s var(--ease),
				translate 0.5s var(--ease),
				visibility 0.5s;
		}

		h3,
		p {
			margin: 0;
		}

		p {
			margin-block-start: 12px;
			color: var(--color-text-muted);
		}
	}

	.event.current {
		visibility: visible;
		opacity: 1;
		translate: 0 0;
	}

	// A ring as wide as the screen (or wider, on a narrow one), with the active card at the top. Nothing clips it: the
	// frame cuts off what hangs below the screen, so the cards on the sides and at the top are never cropped.
	.circle-wrap {
		flex: none;
		width: max(100%, 720px);
		aspect-ratio: 1;
		margin-block-start: 8px;
	}

	// Without the scroll-driven version it is a plain list.
	.list {
		display: flex;
		flex-direction: column;
		gap: 48px;
		width: 100%;
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		h3,
		p {
			margin: 0;
		}

		p {
			color: var(--color-text-muted);
		}
	}

	.list-date {
		color: var(--color-accent-text);
		font-family: var(--font-mono);
		font-size: 14px;
	}
</style>
