<script module lang="ts">
	export type ComparisonImage = { src: string; alt?: string };

	export type ImageComparisonProps = {
		/** Shown on the left of the divider. */
		before: ComparisonImage;
		/** Shown on the right of the divider. */
		after: ComparisonImage;
		/** `drag` moves the divider by dragging; `hover` makes it follow the mouse. Touch screens always drag. */
		mode?: 'drag' | 'hover';
		/** Where the divider starts, from 0 (all of the after image) to 100 (all of the before image). */
		position?: number;
		/** Small captions in the top corners. */
		beforeLabel?: string;
		afterLabel?: string;
		/** The CSS aspect ratio of the frame. */
		aspectRatio?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import Tag from './tag.svelte';

	let {
		before,
		after,
		mode = 'drag',
		position = $bindable(50),
		beforeLabel,
		afterLabel,
		aspectRatio = '16 / 9',
		class: className
	}: ImageComparisonProps = $props();

	let frame = $state<HTMLElement>();

	const KEY_STEPS: Record<string, number> = {
		ArrowLeft: -5,
		ArrowDown: -5,
		ArrowRight: 5,
		ArrowUp: 5,
		PageDown: -20,
		PageUp: 20
	};

	// The native range would move 0.1 per press, which is the right step for dragging but too fine for a keyboard.
	const onKeydown = (event: KeyboardEvent) => {
		const step = KEY_STEPS[event.key];
		if (step === undefined) return;
		event.preventDefault();
		position = Math.min(100, Math.max(0, position + (event.shiftKey ? step / 5 : step)));
	};

	const follow = (event: PointerEvent) => {
		if (mode !== 'hover' || event.pointerType !== 'mouse' || !frame) return;
		const rect = frame.getBoundingClientRect();
		position = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
	};
</script>

<div
	bind:this={frame}
	class="comparison {mode} {className ?? ''}"
	style="--pos: {position}%; aspect-ratio: {aspectRatio}"
	onpointermove={follow}
	role="group"
	aria-label="Image comparison"
>
	<img
		class="image"
		{...imageProps(after.src, { sizes: '(min-width: 1280px) 1152px, 100vw' })}
		alt={after.alt ?? ''}
		draggable="false"
	/>
	<img
		class="image before"
		{...imageProps(before.src, { sizes: '(min-width: 1280px) 1152px, 100vw' })}
		alt={before.alt ?? ''}
		draggable="false"
	/>

	{#if beforeLabel}
		<span class="label start" aria-hidden="true"><Tag text={beforeLabel} type="glass" /></span>
	{/if}
	{#if afterLabel}
		<span class="label end" aria-hidden="true"><Tag text={afterLabel} type="glass" /></span>
	{/if}

	<div class="divider" aria-hidden="true">
		<span class="handle">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
			</svg>
		</span>
	</div>

	<input
		class="range"
		type="range"
		min="0"
		max="100"
		step="0.1"
		aria-label="Comparison slider: drag to reveal either image"
		aria-valuetext="{Math.round(position)}% of the first image shown"
		bind:value={position}
		onkeydown={onKeydown}
	/>
</div>

<style lang="scss">
	.comparison {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-surface);
		user-select: none;
	}

	.image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.before {
		clip-path: inset(0 calc(100% - var(--pos)) 0 0);
	}

	.label {
		position: absolute;
		top: 12px;
		pointer-events: none;

		&.start {
			left: 12px;
		}

		&.end {
			right: 12px;
		}
	}

	.divider {
		position: absolute;
		inset: 0 auto 0 var(--pos);
		width: 2px;
		background: #fff;
		box-shadow: 0 0 8px rgb(0 0 0 / 0.4);
		translate: -50% 0;
		pointer-events: none;
	}

	.handle {
		position: absolute;
		top: 50%;
		left: 50%;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: #fff;
		color: #111;
		box-shadow: 0 2px 10px rgb(0 0 0 / 0.35);
		translate: -50% -50%;

		svg {
			width: 22px;
			height: 22px;
		}
	}

	// The native range is the control, so the keyboard, touch and screen readers all work.
	.range {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		background: transparent;
		cursor: ew-resize;
		opacity: 0;
		touch-action: pan-y;
		appearance: none;

		&::-webkit-slider-thumb {
			width: 2px;
			height: 100%;
			appearance: none;
		}

		&::-moz-range-thumb {
			width: 2px;
			height: 100%;
			border: 0;
		}
	}

	.comparison:has(.range:focus-visible) .handle {
		outline: 2px solid var(--color-accent-text);
		outline-offset: 3px;
	}

	// With a mouse in hover mode the pointer drives the divider, so the range steps aside.
	@media (hover: hover) and (pointer: fine) {
		.hover .range {
			pointer-events: none;
		}

		.hover {
			cursor: ew-resize;
		}
	}
</style>
