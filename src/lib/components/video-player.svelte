<script module lang="ts">
	import type { HTMLVideoAttributes } from 'svelte/elements';

	export type VideoSideControls = {
		side?: 'left' | 'right';
		/** A mute button with a volume slider. */
		volume?: boolean;
		fullscreen?: boolean;
	};

	export type VideoPlayerProps = {
		/** The video file, a Mux playback ID or a Dropbox share link. Self-hosted or CDN files are best. */
		src: string;
		/** An image shown before the video plays. */
		poster?: string;
		/** A `.vtt` captions file. */
		captions?: string;
		captionsLang?: string;
		/** The video's accessible name. */
		title?: string;
		/** The icon on the play button: a name from `static/icons`, or a path to any single-color SVG. */
		playIcon?: string;
		/** The play button's accessible name. */
		playLabel?: string;
		/** The shape of the frame, as a CSS aspect ratio. */
		aspect?: string;
		/** The custom track under the video. Ignored while `controls` shows the browser's own. */
		track?: 'solid' | 'ticks' | 'glass';
		pauseIcon?: string;
		pauseLabel?: string;
		/** The big play button follows the mouse over the video. Pass `cursor-field` options to tune it. */
		followCursor?: boolean | Omit<CursorFieldOptions, 'child'>;
		/** Glass for the big play button and side buttons. Follows `track` (on for `glass`) unless set. */
		glass?: boolean;
		/** The big play button resting on the video while it is not playing. */
		playButton?: boolean;
		/** Buttons straddling the video's edge, kept in view while it scrolls past. */
		sideControls?: VideoSideControls;
		class?: string;
	} & Omit<HTMLVideoAttributes, 'src' | 'poster' | 'title' | 'class' | 'children'>;
</script>

<script lang="ts">
	import { cursorField, type CursorFieldOptions } from '$lib/attachments/cursor-field';
	import { glass } from '$lib/attachments/glass';
	import { isHls, videoPoster, videoUrl } from '$lib/utils/video-url';
	import Icon from './icon.svelte';

	const TICK_GAP = 8;
	const SEEK_STEP = 5;

	let {
		src,
		poster,
		captions,
		captionsLang = 'en',
		title,
		playIcon = 'play',
		playLabel = 'Play video',
		aspect = '16 / 9',
		track = 'solid',
		pauseIcon = 'pause',
		pauseLabel = 'Pause video',
		playButton = true,
		glass: glassProp,
		followCursor = false,
		sideControls,
		class: className,
		controls = false,
		preload = 'metadata',
		...rest
	}: VideoPlayerProps = $props();

	const url = $derived(videoUrl(src));
	const hls = $derived(isHls(url));
	const posterUrl = $derived(poster ?? videoPoster(src));

	const frosted = $derived(glassProp ?? track === 'glass');

	let video = $state<HTMLVideoElement>();

	// hls.js goes first: Chrome says "maybe" to native HLS but can't play it, so native playback is the fallback.
	$effect(() => {
		if (!video || !hls) return;
		const element = video;
		let cancelled = false;
		let destroy: (() => void) | undefined;
		import('hls.js').then(({ default: Hls }) => {
			if (cancelled) return;
			if (!Hls.isSupported()) {
				element.src = url;
				return;
			}
			const instance = new Hls();
			instance.loadSource(url);
			instance.attachMedia(element);
			destroy = () => instance.destroy();
		});
		return () => {
			cancelled = true;
			destroy?.();
		};
	});

	let paused = $state(true);
	let ended = $state(false);
	let volume = $state(1);
	let muted = $state(false);
	let player = $state<HTMLElement>();

	$effect(() => {
		if (!player || !video || rest.autoplay) return;
		const element = video;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting || element.paused) return;
			if (document.fullscreenElement || document.pictureInPictureElement === element) return;
			element.pause();
		});
		observer.observe(player);
		return () => observer.disconnect();
	});
	let fullscreen = $state(false);

	const volumeIcon = $derived(
		muted ? 'volume-off' : volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-down' : 'volume-up'
	);

	// iPhone Safari has no element fullscreen, only the video's own native player.
	const toggleFullscreen = () => {
		if (document.fullscreenElement) return document.exitFullscreen();
		if (player?.requestFullscreen) return player.requestFullscreen().catch(() => {});
		(
			video as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | undefined
		)?.webkitEnterFullscreen?.();
	};

	// The button follows the video's own state, so it is right however playback started: the button, the native
	// controls, the keyboard or autoplay.
	const resting = $derived(paused || ended);

	let currentTime = $state(0);
	let duration = $state(0);
	let trackWidth = $state(0);
	let scrubbing = false;
	// While dragging, the track follows the pointer; a paused video only reports its time once each seek lands.
	let scrubTime = $state<number | null>(null);
	const shownTime = $derived(scrubTime ?? currentTime);
	let hovered = $state<number | null>(null);

	// Heights in px by distance from the hovered tick; the ones past the list keep the resting height.
	const TICK_LIFT = [30, 26, 22, 19];
	const tickHeight = (index: number) =>
		hovered === null ? undefined : TICK_LIFT[Math.abs(index - hovered)];

	const progress = $derived(duration ? Math.min(shownTime / duration, 1) : 0);
	const tickCount = $derived(Math.max(2, Math.floor(trackWidth / TICK_GAP)));
	const playedTicks = $derived(Math.round(progress * tickCount));

	const format = (seconds: number) => {
		const total = Math.floor(seconds || 0);
		return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
	};

	const play = () => {
		video?.play().catch(() => {});
		// Hands keyboard users straight to the native controls.
		if (controls) video?.focus();
	};

	const toggle = () => (resting ? play() : video?.pause());

	const seek = (time: number) => {
		if (!video || !duration) return;
		const clamped = Math.min(Math.max(time, 0), duration);
		if (scrubbing) scrubTime = clamped;
		video.currentTime = clamped;
	};

	const seekTo = (event: PointerEvent) => {
		const { left, width } = (event.currentTarget as HTMLElement).getBoundingClientRect();
		seek(((event.clientX - left) / width) * duration);
	};

	const onPointerdown = (event: PointerEvent) => {
		scrubbing = true;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		seekTo(event);
	};
	const onPointermove = (event: PointerEvent) => {
		if (track === 'ticks') {
			const { left, width } = (event.currentTarget as HTMLElement).getBoundingClientRect();
			hovered = Math.floor(((event.clientX - left) / width) * tickCount);
		}
		if (scrubbing) seekTo(event);
	};
	const onPointerup = () => {
		scrubbing = false;
		if (video?.seeking) video.addEventListener('seeked', () => (scrubTime = null), { once: true });
		else scrubTime = null;
	};

	const onKeydown = (event: KeyboardEvent) => {
		const steps: Record<string, number> = {
			ArrowRight: currentTime + SEEK_STEP,
			ArrowUp: currentTime + SEEK_STEP,
			ArrowLeft: currentTime - SEEK_STEP,
			ArrowDown: currentTime - SEEK_STEP,
			Home: 0,
			End: duration
		};
		if (!(event.key in steps)) return;
		event.preventDefault();
		seek(steps[event.key]);
	};
</script>

<div
	bind:this={player}
	class="video-player {className ?? ''}"
	style="--aspect: {aspect}"
	onfullscreenchange={() => (fullscreen = document.fullscreenElement === player)}
>
	<div class="stage">
		<div
			class="frame"
			{@attach followCursor
				? cursorField({ child: '.play', ...(followCursor === true ? {} : followCursor) })
				: undefined}
		>
			<video
				bind:this={video}
				bind:paused
				bind:ended
				bind:volume
				bind:muted
				bind:currentTime
				bind:duration
				src={hls ? undefined : url}
				poster={posterUrl}
				{controls}
				{preload}
				{title}
				playsinline
				{...rest}
			>
				{#if captions}
					<track kind="captions" src={captions} srclang={captionsLang} label="Captions" default />
				{/if}
			</video>

			{#if playButton}
				<button
					type="button"
					class="play"
					class:hidden={!resting}
					class:frosted
					{@attach frosted ? glass() : undefined}
					aria-label={playLabel}
					onclick={play}
				>
					<Icon name={playIcon} class="play-icon" />
				</button>
			{/if}
		</div>

		{#if sideControls}
			<div class="side side-{sideControls.side ?? 'right'}">
				<div class="side-stack">
					{#if sideControls.volume}
						<div class="volume-slot">
							<div class="volume" class:frosted {@attach frosted ? glass() : undefined}>
								<button
									type="button"
									class="side-button"
									aria-label={muted ? 'Unmute' : 'Mute'}
									onclick={() => (muted = !muted)}
								>
									<Icon name={volumeIcon} />
								</button>
								<input
									type="range"
									class="volume-range"
									aria-label="Volume"
									min="0"
									max="1"
									step="0.05"
									value={muted ? 0 : volume}
									style="--value: {(muted ? 0 : volume) * 100}%"
									oninput={(event) => {
										volume = event.currentTarget.valueAsNumber;
										muted = false;
									}}
								/>
							</div>
						</div>
					{/if}
					{#if sideControls.fullscreen}
						<button
							type="button"
							class="side-button"
							class:frosted
							{@attach frosted ? glass() : undefined}
							aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
							onclick={toggleFullscreen}
						>
							<Icon name={fullscreen ? 'fullscreen-exit' : 'fullscreen'} />
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	{#if !controls}
		<div class="controls">
			<button
				type="button"
				class="toggle"
				aria-label={resting ? playLabel : pauseLabel}
				onclick={toggle}
			>
				<Icon name={resting ? playIcon : pauseIcon} />
			</button>

			<div
				class="track track-{track}"
				role="slider"
				tabindex="0"
				aria-label="Seek"
				aria-valuemin={0}
				aria-valuemax={Math.floor(duration) || 0}
				aria-valuenow={Math.floor(shownTime)}
				aria-valuetext="{format(shownTime)} of {format(duration)}"
				style="--progress: {progress}"
				bind:clientWidth={trackWidth}
				onpointerdown={onPointerdown}
				onpointermove={onPointermove}
				onpointerleave={() => (hovered = null)}
				onpointerup={onPointerup}
				onpointercancel={onPointerup}
				onkeydown={onKeydown}
			>
				{#if track === 'ticks'}
					<div class="ticks" aria-hidden="true">
						{#each { length: tickCount }, index (index)}
							<span
								class="tick"
								class:played={index < playedTicks}
								style:height={tickHeight(index) && `${tickHeight(index)}px`}
							></span>
						{/each}
					</div>
					<span
						class="knob"
						class:lifted={hovered !== null && Math.abs(hovered - playedTicks) <= 1}
						aria-hidden="true"
					></span>
				{:else}
					<div class="rail" aria-hidden="true"><span class="fill"></span></div>
					<span class="knob" aria-hidden="true" {@attach track === 'glass' ? glass() : undefined}
					></span>
				{/if}
			</div>

			<span class="time">{format(shownTime)}</span>
		</div>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.video-player {
		--play-size: 80px;
		--play-bg: var(--color-accent);
		--play-color: var(--color-on-accent);

		width: 100%;

		@include mixins.max-md {
			--play-size: 56px;
		}
	}

	.video-player:fullscreen {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 16px;
		background: black;
	}

	.stage {
		position: relative;
	}

	.frame {
		position: relative;
		overflow: hidden;
		border-radius: var(--radius);
		background: black;
	}

	video {
		display: block;
		width: 100%;
		aspect-ratio: var(--aspect);
		object-fit: contain;
	}

	// Only the circle is a button, not a full-size layer, so the native controls along the bottom stay clickable.
	.play {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		width: var(--play-size);
		height: var(--play-size);
		margin: auto;
		padding: calc(var(--play-size) * 0.3);
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-btn);
		background: var(--play-bg);
		color: var(--play-color);
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s var(--ease),
				scale 0.3s var(--ease),
				background var(--duration) var(--ease),
				color var(--duration) var(--ease),
				visibility 0.3s;
		}

		@include mixins.desktop-hover {
			scale: 1.1;
			background: transparent;
			color: var(--color-accent-text);
		}

		&.frosted {
			border-color: transparent;
			background: var(--glass-tint, var(--color-glass));
			color: var(--color-text);

			@include mixins.desktop-hover {
				background: var(--glass-tint, var(--color-glass));
				color: var(--color-text);
			}
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 3px;
		}

		// While playing it fades out. `visibility` also takes it out of the tab order once the fade ends.
		&.hidden {
			visibility: hidden;
			opacity: 0;
			pointer-events: none;
		}

		:global(.play-icon) {
			--icon-size: 100%;

			width: 100%;
			height: 100%;
		}
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-block-start: 12px;
	}

	.toggle {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		padding: 10px;
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-btn);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: 20px;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				background var(--duration) var(--ease),
				color var(--duration) var(--ease);
		}

		@include mixins.desktop-hover {
			background: transparent;
			color: var(--color-accent-text);
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 3px;
		}
	}

	.time {
		flex-shrink: 0;
		min-width: 5ch;
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
		text-align: end;
	}

	.track {
		--track-height: 4px;
		--knob-size: 16px;
		--knob-width: var(--knob-size);

		position: relative;
		display: flex;
		flex: 1;
		align-items: center;
		min-width: 0;
		height: 32px;
		cursor: pointer;
		touch-action: none;

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 4px;
		}
	}

	.track-glass {
		--track-height: 12px;
		--knob-size: 24px;
		--knob-width: 44px;
	}

	.track-ticks {
		--knob-size: 2px;
	}

	.rail {
		width: 100%;
		height: var(--track-height);
		overflow: hidden;
		border-radius: var(--track-height);
		background: var(--color-border);
	}

	.fill {
		display: block;
		width: 100%;
		height: 100%;
		background: var(--color-text);
		transform: scaleX(var(--progress));
		transform-origin: left;
	}

	// The knob's center sits on the progress point, held inside the track by half its width at each end.
	.knob {
		position: absolute;
		top: 50%;
		left: calc(var(--knob-width) / 2 + (100% - var(--knob-width)) * var(--progress));
		width: var(--knob-width);
		height: var(--knob-size);
		border-radius: 50%;
		background: var(--color-accent);
		translate: -50% -50%;
		pointer-events: none;
	}

	.track-glass .knob {
		border-radius: var(--radius-btn);
		background: none;
	}

	.track-ticks .knob {
		height: 24px;
		border-radius: 1px;

		@include mixins.mq-motion-allow {
			transition: height 0.4s var(--ease);
		}
	}

	.track-ticks .knob.lifted {
		height: 34px;
	}

	.ticks {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.tick {
		width: 1px;
		height: 16px;
		background: var(--color-border);

		@include mixins.mq-motion-allow {
			transition:
				height 0.4s var(--ease),
				background-color 0.3s var(--ease);
		}

		&.played {
			background: var(--color-text);
		}
	}

	// The strip is as tall as the video, and its stack sticks inside it, so the buttons ride along until the video leaves.
	.side {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 44px;
		padding-block: 24px;
		z-index: 1;
		pointer-events: none;
	}

	.side-left {
		left: 0;
		translate: -50% 0;
	}

	.side-right {
		right: 0;
		translate: 50% 0;
	}

	.video-player:fullscreen .side {
		translate: 0;
		padding-inline: 16px;
	}

	.side-stack {
		position: sticky;
		top: calc(var(--float-offset) + 80px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;

		> :global(*) {
			pointer-events: auto;
		}
	}

	.side-button {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-btn);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: 22px;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				background var(--duration) var(--ease),
				color var(--duration) var(--ease);
		}

		@include mixins.desktop-hover {
			background: transparent;
			color: var(--color-accent-text);
		}

		&.frosted {
			border-color: transparent;
			background: var(--glass-tint, var(--color-glass));
			color: var(--color-text);

			@include mixins.desktop-hover {
				background: var(--glass-tint, var(--color-glass));
				color: var(--color-text);
			}
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 3px;
		}
	}

	// The slot keeps the button's footprint, so the pill grows inward over the video without moving the stack.
	.volume-slot {
		position: relative;
		width: 44px;
		height: 44px;
	}

	.volume {
		--range-width: 96px;
		--ink: var(--color-on-accent);

		position: absolute;
		top: 0;
		display: flex;
		align-items: center;
		width: 44px;
		height: 44px;
		overflow: hidden;
		border-radius: var(--radius-btn);
		background: var(--color-accent);

		&.frosted {
			--ink: var(--color-text);

			background: var(--glass-tint, var(--color-glass));
			color: var(--color-text);
		}

		.side-button {
			flex-shrink: 0;
			border-color: transparent;
			background: none;
			color: var(--ink);
		}

		@include mixins.mq-motion-allow {
			transition: width 0.3s var(--ease);
		}

		&:hover,
		&:focus-within {
			width: calc(44px + var(--range-width) + 16px);
		}
	}

	.side-left .volume {
		left: 0;

		.volume-range {
			margin-inline-end: 16px;
		}
	}

	.side-right .volume {
		right: 0;
		flex-direction: row-reverse;

		.volume-range {
			margin-inline-start: 16px;
		}
	}

	.volume-range {
		flex: none;
		width: var(--range-width);
		height: 4px;
		margin: 0;
		appearance: none;
		border-radius: 4px;
		background: linear-gradient(
			to right,
			var(--ink) var(--value),
			color-mix(in srgb, var(--ink) 35%, transparent) var(--value)
		);
		cursor: pointer;

		&::-webkit-slider-thumb {
			appearance: none;
			width: 12px;
			height: 12px;
			border: 0;
			border-radius: 50%;
			background: var(--ink);
		}

		&::-moz-range-thumb {
			width: 12px;
			height: 12px;
			border: 0;
			border-radius: 50%;
			background: var(--ink);
		}

		&:focus-visible {
			outline: 2px solid var(--ink);
			outline-offset: 4px;
		}
	}
</style>
