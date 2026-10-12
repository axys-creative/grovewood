<script module lang="ts">
	export type AvatarCycleItem = {
		src: string;
		alt: string;
		title: string;
		caption: string;
	};

	export type AvatarCycleProps = {
		/** Three or more. Each is a picture with a title and caption. Odd counts look the most balanced. */
		items: AvatarCycleItem[];
		/** Milliseconds between turns. */
		interval?: number;
		/** Turns by itself. */
		autoplay?: boolean;
		/** Holds the turning while the pointer or keyboard focus is on the component, so a caption can be read. */
		pauseOnHover?: boolean;
		/** The most the middle avatar's width can be, in px. It shrinks to fit a narrow container. */
		size?: number;
		/** The width of the caption card in px. By default it is a little wider than the whole row of avatars. The card is wider than it is tall. */
		cardSize?: number;
		/** Any CSS color for the ring around each avatar. Match the background, and it looks as if each one cuts into its neighbors. */
		ringColor?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount, tick } from 'svelte';

	const SHRINK = 0.2;
	const OVERLAP = 0.82;
	const CARD_MARGIN = 1.1;
	const SHRINK_MS = 280;
	const GROW_MS = 520;

	let {
		items,
		interval = 4000,
		autoplay = true,
		pauseOnHover = false,
		size = 120,
		cardSize,
		ringColor = 'var(--color-bg)',
		class: className
	}: AvatarCycleProps = $props();

	const count = $derived(items.length);
	const left = $derived(Math.floor(count / 2));
	const right = $derived(count - 1 - left);

	let active = $state(0);
	let jumping = $state<number[]>([]);
	// Avatars that wrap around keep their old place while they shrink away, then reappear at the far side.
	let held = $state<Record<number, number>>({});
	let paused = $state(false);
	let visible = $state(true);
	let root = $state<HTMLElement>();
	let avatars: HTMLElement[] = [];

	// Each step away from the middle is smaller, and overlaps the one before it a little.
	const scaleAt = (steps: number) => Math.max(0.4, 1 - SHRINK * steps);
	const centerAt = (steps: number) => {
		let x = 0;
		for (let step = 1; step <= steps; step++) {
			x += (scaleAt(step - 1) / 2 + scaleAt(step) / 2) * OVERLAP;
		}
		return x;
	};

	// How far from the middle item i sits: negative to the left, positive to the right, wrapping around.
	const offsetOf = (index: number, from = active) => {
		const turn = (((index - from) % count) + count) % count;
		return turn <= right ? turn : turn - count;
	};

	// The row's width in avatar widths, and how far off center it is when the two sides are not equal.
	const leftReach = $derived(centerAt(left) + scaleAt(left) / 2);
	const rightReach = $derived(centerAt(right) + scaleAt(right) / 2);
	const total = $derived(leftReach + rightReach);
	const shift = $derived((rightReach - leftReach) / 2);

	const go = async (next: number) => {
		const target = ((next % count) + count) % count;
		if (target === active) return;
		const before = active;
		const wrapping = items
			.map((_, index) => index)
			.filter((index) => Math.abs(offsetOf(index, target) - offsetOf(index, before)) > 1);
		const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (calm) {
			jumping = wrapping;
			active = target;
			await tick();
			setTimeout(() => (jumping = []), 40);
			return;
		}

		held = Object.fromEntries(wrapping.map((index) => [index, offsetOf(index, before)]));
		active = target;
		await tick();

		// The one leaving shrinks away where it is, then grows from nothing at the other end.
		await Promise.all(
			wrapping.map(
				(index) =>
					avatars[index]?.animate([{ scale: 0 }], {
						duration: SHRINK_MS,
						easing: 'ease-in',
						fill: 'forwards'
					}).finished
			)
		);
		jumping = wrapping;
		held = {};
		await tick();
		wrapping.forEach((index) => {
			const avatar = avatars[index];
			if (!avatar) return;
			avatar.getAnimations().forEach((animation) => animation.cancel());
			// Both ends are spelled out: a lone keyframe would run toward it, not from it.
			avatar.animate([{ scale: 0 }, { scale: getComputedStyle(avatar).scale }], {
				duration: GROW_MS,
				easing: 'ease-out'
			});
		});
		setTimeout(() => (jumping = []), 40);
	};

	onMount(() => {
		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		observer.observe(root!);

		const timer = setInterval(() => {
			if (autoplay && !paused && visible && count > 1) go(active + 1);
		}, interval);

		return () => {
			observer.disconnect();
			clearInterval(timer);
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={root}
	class="avatar-cycle {className ?? ''}"
	style="--total: {total}; --size: {size}px; --card-margin: {CARD_MARGIN}; --ring: {ringColor}; --shift: {shift}{cardSize
		? `; --card: ${cardSize}px`
		: ''}"
	onpointerenter={pauseOnHover ? () => (paused = true) : undefined}
	onpointerleave={pauseOnHover ? () => (paused = false) : undefined}
	onfocusin={pauseOnHover ? () => (paused = true) : undefined}
	onfocusout={pauseOnHover ? () => (paused = false) : undefined}
>
	<div class="avatars">
		{#each items as item, index (index)}
			{@const steps = held[index] ?? offsetOf(index)}
			{@const distance = Math.abs(steps)}
			<button
				bind:this={avatars[index]}
				type="button"
				class="avatar"
				class:jump={jumping.includes(index)}
				style="--x: {Math.sign(steps) * centerAt(distance)}; --s: {scaleAt(
					distance
				)}; z-index: {count - distance}"
				aria-label={item.title}
				aria-current={steps === 0 ? 'true' : undefined}
				onclick={() => go(index)}
			>
				<img {...imageProps(item.src, { sizes: '96px' })} alt={item.alt} draggable="false" />
			</button>
		{/each}
	</div>

	<div class="cards">
		{#each items as item, index (index)}
			{@const rank = (((index - active) % count) + count) % count}
			<div
				class="card"
				class:front={rank === 0}
				class:leaving={rank === count - 1}
				aria-hidden={rank === 0 ? undefined : 'true'}
				inert={rank !== 0}
			>
				<h3>{item.title}</h3>
				<p>{item.caption}</p>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use 'base/mixins';

	.avatar-cycle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		width: 100%;
		container-type: inline-size;
	}

	// The middle avatar's width, capped by `size` and shrunk if the row would not fit the container.
	.avatar-cycle {
		--glide: cubic-bezier(0.4, 0, 0.2, 1);
		--duration: 0.6s;
		--card-lift: 12px;
	}

	.avatars,
	.cards {
		--diameter: min(var(--size), calc(100cqw / var(--total)));
	}

	.avatars {
		position: relative;
		width: 100%;
		height: var(--diameter);
	}

	.avatar {
		position: absolute;
		top: 0;
		left: 50%;
		width: var(--diameter);
		height: var(--diameter);
		padding: 0;
		overflow: hidden;
		border: 2px solid var(--ring);
		border-radius: 50%;
		background: var(--color-surface);
		cursor: pointer;
		translate: calc(-50% + (var(--x) + var(--shift)) * var(--diameter)) 0;
		scale: var(--s);

		@include mixins.mq-motion-allow {
			transition:
				translate var(--duration) var(--glide),
				scale var(--duration) var(--glide),
				z-index var(--duration) var(--glide);
		}

		&.jump {
			transition: none;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 3px;
		}

		img {
			display: block;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			object-fit: cover;
			user-select: none;
			pointer-events: none;
		}
	}

	// One card is in view. The next one waits just below it, and the one that left drifts up and scales back, fading
	// out quickly, so the change reads as the old card handing over to the new one. A second card edge peeks out above the front one.
	.cards {
		position: relative;
		isolation: isolate;
		// A little wider than the row of avatars above it, whatever their count or size.
		width: min(100%, var(--card, calc(var(--total) * var(--diameter) * var(--card-margin))));
		aspect-ratio: 16 / 10;
		margin-block-start: 28px;

		&::before {
			content: '';
			position: absolute;
			inset: 0 7%;
			z-index: -1;
			border: 1px solid var(--color-border);
			border-radius: 24px;
			background: var(--color-surface);
			translate: 0 -8px;
		}
	}

	.card {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 24px;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: 24px;
		background: var(--color-surface);
		opacity: 0;
		translate: 0 var(--card-lift);
		scale: 0.96;
		visibility: hidden;

		@include mixins.mq-motion-allow {
			transition:
				translate var(--duration) var(--glide),
				scale var(--duration) var(--glide),
				opacity 0.25s var(--glide),
				visibility var(--duration);
		}

		&.leaving {
			translate: 0 calc(var(--card-lift) * -1);
			scale: 0.94;
		}

		&.front {
			opacity: 1;
			translate: 0 0;
			scale: 1;
			visibility: visible;
		}

		h3 {
			font-size: 22px;
			line-height: 1.25;
		}

		p {
			color: var(--color-text-muted);
		}
	}
</style>
