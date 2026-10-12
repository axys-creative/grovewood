<script module lang="ts">
	export type ScrollProgressProps = {
		/** Where the bar sits: `bottom` is a short bar that fills left to right; `right` and `left` are bars down a side that fill downward. */
		placement?: 'bottom' | 'right' | 'left';
		/** Clicking the bar scrolls the page to that point. */
		allowClick?: boolean;
		/** Hides the browser's own scrollbar, since the bar takes its place. */
		hideScrollbar?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { cursorHide } from '$lib/attachments/cursor-hide';
	import { watchScroll } from '$lib/attachments/watch-scroll';

	let {
		placement = 'right',
		allowClick = true,
		hideScrollbar = true,
		class: className
	}: ScrollProgressProps = $props();

	let bar = $state<HTMLElement>();
	let track = $state<HTMLElement>();

	let probe: HTMLElement | undefined;

	// Mobile toolbars resize innerHeight while scrolling, so the large viewport is measured instead.
	const viewportHeight = () => probe?.offsetHeight || innerHeight;

	onMount(() => {
		probe = document.createElement('div');
		probe.style.cssText =
			'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
		document.body.append(probe);

		const update = () => {
			const scrollable = document.documentElement.scrollHeight - viewportHeight();
			const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
			bar!.style.setProperty('--progress', String(progress));
		};

		update();
		addEventListener('scroll', update, { passive: true });
		addEventListener('resize', update);
		return () => {
			removeEventListener('scroll', update);
			removeEventListener('resize', update);
			probe?.remove();
		};
	});

	$effect(() => {
		if (!hideScrollbar) return;
		document.documentElement.classList.add('hide-scrollbar');
		return () => document.documentElement.classList.remove('hide-scrollbar');
	});

	// Scrolls to the point that was clicked, measured along the bar.
	const seek = (event: PointerEvent, behavior: ScrollBehavior) => {
		const rect = track!.getBoundingClientRect();
		const fraction =
			placement === 'bottom'
				? (event.clientX - rect.left) / rect.width
				: (event.clientY - rect.top) / rect.height;
		const scrollable = document.documentElement.scrollHeight - viewportHeight();
		scrollTo({
			top: scrollable * Math.min(1, Math.max(0, fraction)),
			behavior:
				behavior === 'smooth' && !matchMedia('(prefers-reduced-motion: reduce)').matches
					? 'smooth'
					: 'auto'
		});
	};

	const onpointerdown = (event: PointerEvent) => {
		track!.setPointerCapture(event.pointerId);
		seek(event, 'smooth');
	};

	const onpointermove = (event: PointerEvent) => {
		if (track!.hasPointerCapture(event.pointerId)) seek(event, 'auto');
	};
</script>

<!-- The page's own scrollbar and keyboard already do this job, so the bar is decorative for assistive tech. -->
<div
	bind:this={track}
	class="scroll-progress {placement} {className ?? ''}"
	class:clickable={allowClick}
	aria-hidden="true"
	onpointerdown={allowClick ? onpointerdown : undefined}
	onpointermove={allowClick ? onpointermove : undefined}
	{@attach watchScroll({ idle: 500 })}
	{@attach allowClick ? cursorHide() : undefined}
>
	<div class="bar" bind:this={bar}></div>
</div>

<style lang="scss">
	@use 'base/mixins';

	:global(html.hide-scrollbar) {
		scrollbar-width: none;
	}

	:global(html.hide-scrollbar::-webkit-scrollbar) {
		width: 0;
		height: 0;
	}

	.scroll-progress {
		position: fixed;
		z-index: var(--z-scroll-progress, 5);
		border-radius: 24px;
		background: var(--color-surface);
		pointer-events: none;
		touch-action: none;

		@include mixins.mq-motion-allow {
			transition:
				width 0.5s var(--ease),
				height 0.5s var(--ease),
				opacity 0.3s ease;
		}

		// After a moment without scrolling it fades back, and returns on hover.
		&:global([data-scroll-idle]) {
			opacity: 0.25;
		}

		&:hover {
			opacity: 1;
		}
	}

	.clickable {
		cursor: pointer;
		pointer-events: auto;

		&::before {
			content: '';
			position: absolute;
			inset: -12px;

			@media (pointer: coarse) {
				inset: -20px;
			}
		}
	}

	.bar {
		--progress: 0;

		width: 100%;
		height: 100%;
		background: var(--color-accent);
		pointer-events: none;

		@include mixins.mq-motion-allow {
			transition: clip-path 0.25s ease-out;

			@media (pointer: coarse) {
				transition: none;
			}
		}
	}

	.bottom {
		bottom: 12px;
		left: 50%;
		width: 128px;
		height: 4px;
		translate: -50% 0;

		.bar {
			clip-path: inset(0 calc((1 - var(--progress)) * 100%) 0 0 round 24px);
		}

		&.clickable:hover {
			height: 12px;
		}
	}

	.right,
	.left {
		top: 50svh;
		width: 4px;
		height: 128px;
		translate: 0 -50%;

		.bar {
			clip-path: inset(0 0 calc((1 - var(--progress)) * 100%) 0 round 24px);
		}

		&.clickable:hover {
			width: 12px;
		}
	}

	.right {
		right: 12px;
	}

	.left {
		left: 12px;
	}
</style>
