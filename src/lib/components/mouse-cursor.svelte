<script lang="ts">
	import { onMount } from 'svelte';
	import { cursor, type CursorVariant } from '$lib/utils/cursor.svelte';
	import { damp } from '$lib/utils/easing';
	import { createFollower, followEase, type Ease } from '$lib/utils/follow';
	import { hasMouse, pointer, trackPointer } from '$lib/utils/pointer';
	import { imageProps } from '$lib/utils/image';
	import { createVelocityTilt, type VelocityTiltOptions } from '$lib/utils/velocity-tilt';

	type Props = {
		/** Stretches and rotates the shape in the direction of movement. */
		elastic?: boolean;
		/** Tilts the whole cursor by how fast the mouse moves sideways. */
		tilt?: boolean | VelocityTiltOptions;
		/** Named looks that attachments can switch to, e.g. `{ menu: { size: 64 } }`. */
		variants?: Record<string, CursorVariant>;
		/** Icon name used when an element asks for an icon without naming one. */
		defaultIcon?: string;
		/** Milliseconds the cursor takes to catch up with the mouse. */
		duration?: number;
		/** Maps catch-up progress (0-1) to how far the cursor has travelled (0-1, may overshoot). */
		ease?: Ease;
	};

	let {
		elastic = false,
		tilt = false,
		variants = {},
		defaultIcon = 'bolt',
		duration = 333,
		ease = followEase
	}: Props = $props();

	let el = $state<HTMLElement>();
	let body = $state<HTMLElement>();
	let layer = $state<HTMLElement>();
	let layerBody = $state<HTMLElement>();
	let shape = $state<HTMLElement>();
	let visible = $state(false);
	let lastIcon = $state('bolt');
	let lastImage = $state('');
	let lastLayer = $state<'front' | 'behind'>('behind');
	let controls = $state.raw<{ sync: (snapped: boolean) => void }>();

	const variant = $derived(variants[cursor.variant ?? ''] ?? {});
	const content = $derived(cursor.content);
	const iconName = $derived(content?.icon === true ? defaultIcon : content?.icon);

	$effect(() => {
		if (iconName) lastIcon = iconName;
	});

	$effect(() => {
		if (content?.image) {
			lastImage = content.image;
			lastLayer = content.imageLayer ?? 'behind';
		}
	});

	// When a snap target is claimed or released, wake the loop or glide back to the mouse.
	$effect(() => {
		controls?.sync(!!cursor.target);
	});

	const style = $derived(
		[
			variant.size !== undefined && `--cursor-size: ${variant.size}px`,
			variant.opacity !== undefined && `--cursor-opacity: ${variant.opacity}`,
			variant.background && `--cursor-bg: ${variant.background}`,
			variant.border && `--cursor-border: ${variant.border}`,
			variant.color && `--cursor-color: ${variant.color}`,
			variant.transition && `--cursor-transition: ${variant.transition}`
		]
			.filter(Boolean)
			.join('; ')
	);

	onMount(() => {
		el?.showPopover();
		const raise = () => {
			el?.hidePopover();
			el?.showPopover();
		};
		document.addEventListener('top-layer-open', raise);

		if (!el || !hasMouse() || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const mainTilt = tilt ? createVelocityTilt(tilt === true ? {} : tilt) : null;
		let claimTilt: ReturnType<typeof createVelocityTilt> | null = null;
		let claimTiltKey = '';

		let previousX = 0;
		let previousY = 0;
		let scale = 0;
		let angle = 0;

		const follower = createFollower({
			duration,
			ease,
			onFrame({ x, y, targetX, targetY, seconds }) {
				const snapped = cursor.target?.();
				if (
					snapped &&
					(Math.abs(snapped.x - targetX) > 0.5 || Math.abs(snapped.y - targetY) > 0.5)
				) {
					follower.moveTo(snapped.x, snapped.y);
				}

				const transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
				el!.style.transform = transform;
				if (layer) layer.style.transform = transform;

				const elasticOn = elastic && variant.elastic !== false;
				if (shape) {
					if (elasticOn) {
						const perFrame = 1 / 60 / Math.max(seconds, 1 / 240);
						const dx = (x - previousX) * perFrame;
						const dy = (y - previousY) * perFrame;
						const velocity = Math.min(Math.hypot(dx, dy) * 4, 150);
						if (velocity > 20) {
							const heading = (Math.atan2(dy, dx) * 180) / Math.PI;
							const turn = ((((heading - angle) % 360) + 540) % 360) - 180;
							angle += turn * damp(0.5, seconds);
						}
						scale += ((velocity / 150) * 0.5 - scale) * damp(0.075, seconds);
						shape.style.rotate = `${angle}deg`;
						shape.style.scale = `${1 + scale} ${1 - scale}`;
					} else if (scale !== 0 || shape.style.scale) {
						scale = 0;
						shape.style.rotate = '';
						shape.style.scale = '';
					}
				}
				previousX = x;
				previousY = y;

				const claimed = cursor.tilt;
				const key = claimed ? JSON.stringify(claimed) : '';
				if (key !== claimTiltKey) {
					claimTiltKey = key;
					claimTilt = claimed ? createVelocityTilt(claimed) : null;
				}
				const activeTilt = claimTilt ?? mainTilt;
				const tiltAngle = activeTilt ? activeTilt.update(targetX, targetY) : 0;
				const rotate = activeTilt ? `${tiltAngle}deg` : '';
				body!.style.rotate = rotate;
				if (layerBody) layerBody.style.rotate = rotate;

				return Math.abs(scale) >= 0.001 || Math.abs(tiltAngle) >= 0.001 || !!cursor.target;
			}
		});

		const stopTracking = trackPointer((event) => {
			visible = true;
			if (!cursor.target) follower.moveTo(event.clientX, event.clientY);
			else follower.wake();
		});

		controls = {
			sync(snapped) {
				if (snapped) follower.wake();
				else if (visible) follower.moveTo(pointer.x, pointer.y);
			}
		};
		cursor.mounted = true;

		return () => {
			document.removeEventListener('top-layer-open', raise);
			stopTracking();
			controls = undefined;
			follower.stop();
			cursor.mounted = false;
		};
	});
</script>

<div
	bind:this={el}
	class="mouse-cursor"
	popover="manual"
	class:visible
	class:hidden={cursor.hidden}
	class:has-image={!!content?.image}
	aria-hidden="true"
	{style}
>
	<!-- Tilt rotates this wrapper so it turns around the cursor's own center, not the screen corner. -->
	<div class="body" bind:this={body}>
		<div class="shape" bind:this={shape}></div>
		{#if content?.message}<span class="message">{content.message}</span>{/if}
		{#if lastImage && lastLayer === 'front'}
			<img
				class="image"
				class:show={!!content?.image}
				{...imageProps(lastImage, { sizes: '240px' })}
				alt=""
			/>
		{/if}
		<span
			class="icon {content?.iconSize ?? 'sm'}"
			class:show={!!iconName}
			style="mask-image: url('/icons/{lastIcon}.svg'); background: {content?.iconColor ??
				'currentColor'}"
		></span>
	</div>
</div>

{#if lastImage && lastLayer === 'behind'}
	<div bind:this={layer} class="cursor-layer" class:visible aria-hidden="true">
		<div class="body" bind:this={layerBody}>
			<img
				class="image"
				class:show={!!content?.image}
				{...imageProps(lastImage, { sizes: '240px' })}
				alt=""
			/>
		</div>
	</div>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.mouse-cursor {
		position: fixed;
		inset: 0 auto auto 0;
		z-index: var(--z-cursor);
		margin: 0;
		padding: 0;
		border: 0;
		background: none;
		overflow: visible;
		color: var(--color-text);
		opacity: 0;
		pointer-events: none;
		will-change: transform;
		transition: opacity 0.3s ease 0.2s;

		@include mixins.mq-touch {
			display: none;
		}

		@include mixins.mq-motion-reduce {
			display: none;
		}

		&.visible {
			opacity: 1;
		}
	}

	.cursor-layer {
		position: fixed;
		inset: 0 auto auto 0;
		z-index: var(--z-cursor-behind);
		opacity: 0;
		pointer-events: none;
		will-change: transform;
		transition: opacity 0.3s ease 0.2s;

		@include mixins.mq-touch {
			display: none;
		}

		@include mixins.mq-motion-reduce {
			display: none;
		}

		&.visible {
			opacity: 1;
		}
	}

	.body {
		position: relative;
	}

	.shape {
		width: var(--cursor-size, 48px);
		height: var(--cursor-size, 48px);
		border: var(--cursor-border, 2px solid var(--color-text));
		border-radius: 50%;
		background: var(--cursor-bg, transparent);
		opacity: var(--cursor-opacity, 0.25);
		transition: var(
			--cursor-transition,
			background 0.24s ease,
			opacity 0.24s ease,
			width 0.5s ease,
			height 0.5s ease
		);
	}

	.hidden .shape,
	.has-image .shape {
		width: 0;
		height: 0;
		opacity: 0;
	}

	.message,
	.icon,
	.image {
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
	}

	.message {
		color: var(--cursor-color, inherit);
		font-size: 14px;
		text-align: center;
		white-space: nowrap;
	}

	.image {
		width: 15rem;
		aspect-ratio: 4 / 3;
		border-radius: 0.75rem;
		max-width: none;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.24s ease;

		&.show {
			opacity: 1;
		}
	}

	.icon {
		--icon-size: 2.5ch;

		width: var(--icon-size);
		height: var(--icon-size);
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		opacity: 0;
		transition: opacity 0.24s ease;

		&.md {
			--icon-size: 4ch;
		}

		&.lg {
			--icon-size: 6ch;
		}

		&.show {
			opacity: 1;
		}
	}
</style>
