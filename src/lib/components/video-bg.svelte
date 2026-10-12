<script module lang="ts">
	import type { Attachment } from 'svelte/attachments';

	export type VideoBgProps = {
		/** The video file. Self-hosted or CDN files are best. */
		src: string;
		/** An image shown before the video plays. Best paired with `autoplay: false`. */
		poster?: string;
		/** Starts playing on its own, muted and looping. Skipped when the visitor prefers reduced motion. */
		autoplay?: boolean;
		/** A dark gradient over the video for contrast with text. `null` removes it. */
		shadow?: 'top' | 'bottom' | null;
		/** Which corner holds the play / pause button. */
		placement?: 'br' | 'bl' | 'tr' | 'tl';
		/** An attachment for the button, such as `magnet()`. */
		toggleAttach?: Attachment<HTMLButtonElement>;
		/** The video's accessible name. */
		title?: string;
	};
</script>

<script lang="ts">
	import Icon from './icon.svelte';

	let {
		src,
		poster,
		autoplay = true,
		shadow = 'bottom',
		placement = 'br',
		toggleAttach,
		title = 'Background video'
	}: VideoBgProps = $props();

	let video = $state<HTMLVideoElement>();
	let paused = $state(true);

	const toggle = () => (video?.paused ? video.play().catch(() => {}) : video?.pause());

	// Starts it here rather than trusting the `autoplay` attribute, which browsers skip when it is set after the
	// element is created.
	const start: Attachment<HTMLVideoElement> = (el) => {
		if (!autoplay || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		el.muted = true;
		el.play().catch(() => {});
	};
</script>

<figure class="video-bg-figure {shadow ? `shadow-${shadow}` : ''}">
	<video
		bind:this={video}
		onplay={() => (paused = false)}
		onpause={() => (paused = true)}
		{src}
		{title}
		poster={autoplay ? undefined : poster}
		muted
		loop={autoplay}
		playsinline
		preload={autoplay ? 'auto' : 'metadata'}
		aria-hidden="true"
		{@attach start}
	></video>
</figure>

<button
	type="button"
	class="toggle {placement}"
	aria-label="{paused ? 'Play' : 'Pause'} background video"
	onclick={toggle}
	{@attach toggleAttach}
>
	<Icon name="play" class="play" />
	<Icon name="pause" class="pause" />
</button>

<style lang="scss">
	@use 'base/mixins';

	// The wrapper holds the video behind its own content, so it must be its own stacking context.
	:global(.video-bg) {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}

	figure {
		position: absolute;
		inset: 0;
		z-index: -1;
		margin: 0;
		background: var(--color-surface);

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(var(--shadow-direction), transparent 0%, black 100%);
		}

		&:not(.shadow-top, .shadow-bottom)::after {
			content: none;
		}
	}

	.shadow-bottom {
		--shadow-direction: 180deg;
	}

	.shadow-top {
		--shadow-direction: 0deg;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.toggle {
		--size: 40px;
		--gap: 24px;

		position: absolute;
		display: grid;
		width: var(--size);
		height: var(--size);
		padding: 10px;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition: scale 0.24s ease;
		}

		@include mixins.max-md {
			--gap: 16px;
		}

		&:active {
			scale: 0.9;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 3px;
		}
	}

	.br {
		right: var(--gap);
		bottom: var(--gap);
	}

	.bl {
		bottom: var(--gap);
		left: var(--gap);
	}

	.tr {
		top: var(--gap);
		right: var(--gap);
	}

	.tl {
		top: var(--gap);
		left: var(--gap);
	}

	// Shows the action a press will do: play while paused, pause while playing.
	.toggle :global(.play),
	.toggle :global(.pause) {
		--icon-size: 100%;

		grid-area: 1 / 1;
		width: 100%;
		height: 100%;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s var(--ease),
				scale 0.3s var(--ease);
		}
	}

	.toggle :global(.pause),
	.toggle[aria-label^='Play'] :global(.play) {
		opacity: 1;
		scale: 1;
	}

	.toggle[aria-label^='Play'] :global(.pause),
	.toggle:not([aria-label^='Play']) :global(.play) {
		opacity: 0;
		scale: 0.5;
	}
</style>
