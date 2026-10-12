<script module lang="ts">
	import type { ComponentProps } from 'svelte';
	import type CtaGroup from '$lib/components/cta-group.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ScrollStackPanel = {
		title: string;
		description?: string;
		/** Icon name from `static/icons`. */
		icon?: string;
		/** A button along the bottom of the panel. */
		cta?: ComponentProps<typeof CtaGroup>['primary'];
	};

	export type ScrollStackProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'eyebrowDot' | 'title' | 'description' | 'cta'
	> & {
		/** Two or more panels that stack as the page scrolls. */
		panels: ScrollStackPanel[];
		/** A row of links above the stack that jump to a panel and show which one is on top. */
		nav?: boolean;
		/** `full` panels fill the width. `half` panels are half as wide from the `lg` breakpoint up. */
		size?: 'full' | 'half';
		/** Which side the panels sit on. The copy sits on the other side, pinned beside them. */
		placement?: 'left' | 'center' | 'right';
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import CtaGroupComponent from '$lib/components/cta-group.svelte';
	import Icon from '$lib/components/icon.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { loadGsap } from '$lib/utils/gsap';

	let {
		panels,
		nav = false,
		size = 'full',
		placement = 'center',
		id,
		class: className,
		...copy
	}: ScrollStackProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
	// Copy sits beside the panels only when they leave room for it.
	const beside = $derived(hasCopy && size === 'half' && placement !== 'center');

	let pin = $state<HTMLElement>();
	let armed = $state(false);
	let current = $state(0);
	let timeline: gsap.core.Timeline | undefined;

	// Each panel slides up over the one before it, which shrinks a little as it is covered. It is all one scrubbed
	// timeline on one pinned frame, so nothing below it has to be told how long the stack lasts. It does nothing
	// without JavaScript or with reduced motion, and the panels are then an ordinary column of cards.
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches || panels.length < 2) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then(async (gsap) => {
			if (cancelled || !pin) return;
			armed = true;
			await tick();

			const cards = Array.from(pin.querySelectorAll<HTMLElement>('.panel'));
			const navEl = pin.querySelector<HTMLElement>('.nav');
			// A short pause on the last panel before the pin lets go.
			const linger = 0.3;
			const length = cards.length - 1 + linger;
			const sliding = () => innerHeight * 0.8;

			const context = gsap.context(() => {
				timeline = gsap.timeline({
					scrollTrigger: {
						trigger: pin,
						// Room for the links above the stack, only while they show.
						start: () =>
							navEl && getComputedStyle(navEl).display !== 'none' ? 'top top+=64' : 'top top',
						end: () => `+=${length * sliding()}`,
						pin: true,
						scrub: 0.5,
						invalidateOnRefresh: true
					},
					onUpdate: () => {
						current = Math.min(cards.length - 1, Math.max(0, Math.round(timeline!.time())));
					}
				});

				cards.forEach((card, at) => {
					if (!at) return;
					timeline!.fromTo(
						card,
						{ y: () => pin!.offsetHeight },
						{ y: 0, ease: 'none', duration: 1 },
						at - 1
					);
					timeline!.to(cards[at - 1], { scale: 0.9, ease: 'none', duration: 0.75 }, at - 1 + 0.25);
				});
				timeline.set({}, {}, length);
			}, pin);

			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
			timeline = undefined;
		};
	});

	// Scrolls to where the panel has just finished sliding in.
	function jumpTo(at: number) {
		const trigger = timeline?.scrollTrigger;
		if (!trigger) return;
		const length = panels.length - 1 + 0.3;
		scrollTo({
			top: trigger.start + ((trigger.end - trigger.start) * at) / length,
			behavior: 'smooth'
		});
	}
</script>

{#snippet text(pinned: boolean)}
	{#if hasCopy}
		<div class="copy" class:pinned class:unpinned={!pinned} class:beside>
			<SectionCopy level={2} {...copy} />
		</div>
	{/if}
{/snippet}

<section {id} class="scroll-stack {size} {placement} {className ?? ''}" class:armed class:beside>
	<div class="inner">
		{@render text(false)}

		<div class="pin" bind:this={pin}>
			{#if nav && armed}
				<nav class="nav" aria-label="Panels">
					{#each panels as panel, at (at)}
						<button
							type="button"
							class="nav-link"
							aria-current={current === at ? 'true' : undefined}
							onclick={() => jumpTo(at)}
						>
							{panel.title}
						</button>
					{/each}
				</nav>
			{/if}

			{@render text(true)}

			<div class="panels">
				{#each panels as panel, at (at)}
					<article class="panel">
						{#if panel.icon}<Icon name={panel.icon} class="panel-icon" />{/if}
						<h3 class="h4">{panel.title}</h3>
						{#if panel.description}<p class="panel-description">{panel.description}</p>{/if}
						{#if panel.cta}
							<div class="panel-cta"><CtaGroupComponent primary={panel.cta} /></div>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.scroll-stack {
		--panel-to-top: 200px;

		@include mixins.max-sm {
			--panel-to-top: 96px;
		}
	}

	.inner {
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
	}

	.copy {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-block-end: 48px;
	}

	// Beside the panels the copy is pinned in the frame. Anywhere else, or on a small screen, it sits above.
	.pinned {
		display: none;
	}

	.armed.beside .pinned {
		@include mixins.min-lg {
			display: flex;
			position: absolute;
			top: 50%;
			max-width: 40%;
			margin: 0;
			translate: 0 -50%;
		}
	}

	.armed.beside .unpinned {
		@include mixins.min-lg {
			display: none;
		}
	}

	.armed.beside.right .pinned {
		left: 0;
	}

	.armed.beside.left .pinned {
		right: 0;
	}

	.panels {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.panel {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 24px;
		padding: 40px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-bg);

		h3 {
			margin: 0;
		}

		@include mixins.max-sm {
			padding: 24px;
		}
	}

	.panel :global(.panel-icon) {
		--icon-size: 48px;
	}

	.panel-description {
		margin: 0;
		color: var(--color-text-muted);
	}

	// Armed, the frame is as tall as the screen and the panels are stacked on top of each other inside it.
	.armed .pin {
		position: relative;
		height: 100svh;
		min-height: 500px;
		overflow: clip;

		@include mixins.max-md {
			min-height: 350px;
		}
	}

	.armed .panels {
		display: block;
	}

	.armed .panel {
		position: absolute;
		top: var(--panel-to-top);
		right: 0;
		left: 0;
		height: max(calc(100svh - var(--panel-to-top) * 2), 400px);
		margin-inline: auto;
		overflow: hidden;
		transform-origin: top center;
	}

	.armed.half .panel {
		@include mixins.min-lg {
			right: auto;
			left: auto;
			width: max(500px, 50%);
		}
	}

	.armed.half.right .panel {
		@include mixins.min-lg {
			margin-inline: auto 0;
			right: 0;
		}
	}

	.armed.half.left .panel {
		@include mixins.min-lg {
			margin-inline: 0 auto;
			left: 0;
		}
	}

	.panel-cta {
		margin-block-start: auto;
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 16px;
		padding-block-start: calc(var(--panel-to-top) / 2);

		@include mixins.max-sm {
			display: none;
		}
	}

	.nav-link {
		opacity: 0.5;

		@include mixins.mq-motion-allow {
			transition: opacity var(--duration) var(--ease);
		}

		@include mixins.max-md {
			font-size: 14px;
		}

		&:hover,
		&:focus-visible,
		&[aria-current='true'] {
			opacity: 1;
		}
	}
</style>
