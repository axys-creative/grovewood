<script module lang="ts">
	export type CounterProps = {
		/** The number to count to. */
		digit: number;
		/** Separate thousands with commas. */
		comma?: boolean;
		/** Text before the number, e.g. `$`. */
		prefix?: string;
		/** Text after the number, e.g. `M`. */
		suffix?: string;
		/** Describes what the number measures. */
		label?: string;
		/** What screen readers say. Defaults to the final number and the label. */
		spokenLabel?: string;
		/** Milliseconds to count. Not used by `ticker`. */
		duration?: number;
		/** Only count the first time it scrolls into view. */
		once?: boolean;
		/** Roll each digit up a column instead of counting. */
		ticker?: boolean;
		/** Where the number and label sit. Defaults to `center`. */
		align?: 'start' | 'center';
		/** A line between the number and its label that draws in when it scrolls into view. */
		divider?: boolean;
		/** `lg` is the size of a section title. Defaults to `md`. */
		size?: 'md' | 'lg';
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let {
		digit,
		comma = false,
		prefix = '',
		suffix = '',
		label,
		spokenLabel,
		duration = 2400,
		once = false,
		ticker = false,
		align = 'center',
		divider = false,
		size = 'md',
		class: className
	}: CounterProps = $props();

	const whole = $derived(Number.isInteger(digit));
	const format = (value: number) =>
		comma
			? value.toLocaleString('en-US', {
					minimumFractionDigits: whole ? 0 : 1,
					maximumFractionDigits: whole ? 0 : 1
				})
			: whole
				? Math.round(value).toString()
				: value.toFixed(1);

	const finalText = $derived(format(digit));
	const spoken = $derived(spokenLabel || `${prefix}${finalText}${suffix} ${label ?? ''}`.trim());

	let el = $state<HTMLElement>();
	let shown = $state(0);
	let ready = $state(false);
	let played = $state(false);
	let viewed = $state(false);

	// Without script the final number shows; with it, the count starts from zero once it scrolls into view.
	const display = $derived(ready ? format(shown) : finalText);

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let frame = 0;
		let hasPlayed = false;
		ready = true;
		shown = 0;

		const play = () => {
			cancelAnimationFrame(frame);
			const start = performance.now();
			const tick = (now: number) => {
				const t = Math.min(1, (now - start) / duration);
				const eased = 1 - (1 - t) * (1 - t);
				const value = digit * eased;
				shown = whole ? Math.round(value) : Math.round(value * 10) / 10;
				if (t < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		};

		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				viewed = true;
				if (once && hasPlayed) return;
				hasPlayed = true;
				if (ticker) played = true;
				else play();
			} else if (!once) {
				viewed = false;
				cancelAnimationFrame(frame);
				shown = 0;
				played = false;
			}
		});
		observer.observe(el!);

		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	});

	const characters = $derived([...finalText]);
</script>

<div
	bind:this={el}
	class="counter {align} {size} {className ?? ''}"
	class:armed={ready}
	class:viewed
	role="img"
	aria-label={spoken}
	style="--width: {prefix.length + finalText.length + suffix.length + 0.25}ch"
>
	<span class="value" aria-hidden="true">
		<span>{prefix}</span>
		{#if ticker}
			<span class="ticker" class:played={ready ? played : true}>
				{#each characters as character, index (index)}
					{#if /\d/.test(character)}
						<span class="digit" class:narrow={character === '1'} style="--i: {index}">
							<span class="sequence" style="--value: {character}">
								{#each Array.from({ length: 10 }, (_, number) => number) as number (number)}
									<span>{number}</span>
								{/each}
							</span>
						</span>
					{:else}
						<span>{character}</span>
					{/if}
				{/each}
			</span>
		{:else}
			<span class="number">{display}</span>
		{/if}
		<span>{suffix}</span>
	</span>
	{#if divider}<span class="divider" aria-hidden="true"></span>{/if}
	{#if label}<span class="label" aria-hidden="true">{label}</span>{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.start {
		align-items: flex-start;
	}

	.value {
		@include mixins.h4;
		display: inline-flex;
		justify-content: center;
		width: var(--width);
	}

	.lg {
		--row: 2ch;
	}

	.lg .value {
		@include mixins.h2;
		font-family: var(--font-body);
		line-height: 1.2;
	}

	.divider {
		display: block;
		width: 100%;
		height: 1px;
		margin-block: 48px 24px;
		background: var(--color-border);
	}

	.armed .divider {
		width: 0;

		@include mixins.mq-motion-allow {
			transition: width 1.24s var(--ease) 0.24s;
		}
	}

	.armed.viewed .divider {
		width: 100%;
	}

	.value:has(.ticker) {
		width: auto;
	}

	.number {
		font-variant-numeric: tabular-nums;
	}

	.label {
		@include mixins.body;
	}

	.ticker {
		display: flex;
		height: var(--row, 1lh);
		overflow: hidden;
		font-variant-numeric: tabular-nums;
	}

	.digit {
		display: block;
		width: var(--digit-width, 1ch);
		overflow: hidden;
		text-align: center;

		&.narrow {
			width: var(--digit-width-narrow, 0.9ch);
		}
	}

	.sequence {
		display: flex;
		flex-direction: column;
		translate: 0 0;

		span {
			height: var(--row, 1lh);
		}
	}

	.played .sequence {
		translate: 0 calc(var(--value) * var(--row, 1lh) * -1);

		@include mixins.mq-motion-allow {
			transition: translate 1.24s cubic-bezier(0.8, 0, 0.3, 1.05) calc(var(--i) * 0.16s);
		}
	}
</style>
