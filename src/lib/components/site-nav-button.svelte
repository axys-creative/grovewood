<script module lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type SiteNavButtonProps = {
		/** `burger` is two lines, `oreo` is two lines with the outer corners rounded that twirl into the X, `stairs` is three stepped lines (short, long, short) that form the X, `chocolate` is nine dots, `kebab` is three vertical dots. */
		symbol?: 'burger' | 'oreo' | 'stairs' | 'chocolate' | 'kebab';
		shape?: 'square' | 'round';
		/** `button` puts the symbol in a bordered box. */
		type?: 'icon' | 'button';
		/** Optional text beside the symbol, e.g. "menu". */
		text?: string;
		expanded?: boolean;
		controls?: string;
	} & Omit<HTMLButtonAttributes, 'children' | 'type'>;
</script>

<script lang="ts">
	import { magnet } from '$lib/attachments/magnet';

	let {
		symbol = 'burger',
		shape = 'square',
		type = 'icon',
		text,
		expanded = false,
		controls,
		class: className,
		...rest
	}: SiteNavButtonProps = $props();

	const strokes = $derived({ burger: 2, oreo: 2, stairs: 3, chocolate: 9, kebab: 3 }[symbol]);
</script>

{#snippet lines()}
	{#each Array.from({ length: strokes }, (_, i) => i + 1) as number (number)}
		<span class="stroke stroke-{number}"></span>
	{/each}
{/snippet}

<button
	{...rest}
	class="site-nav-button type-{type} {className ?? ''}"
	type="button"
	aria-label={expanded ? 'Close navigation menu' : 'Open navigation menu'}
	aria-expanded={expanded}
	aria-controls={controls}
>
	{#if text}<span class="text">{text}</span>{/if}
	<span
		class="magnet"
		{@attach magnet({
			x: 1,
			y: 1,
			followDuration: 500,
			returnDuration: 350,
			returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
		})}
	>
		<span class="icon {symbol} {shape}" aria-hidden="true">
			{#if symbol === 'stairs'}
				<span class="lines">{@render lines()}</span>
			{:else}
				{@render lines()}
			{/if}
		</span>
	</span>
</button>

<style lang="scss">
	@use 'base/mixins';

	.site-nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-text);
		font: inherit;
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition: 0.24s ease;
		}

		@include mixins.desktop-hover {
			.text {
				margin-inline-end: 16px;
			}

			.icon {
				scale: 1.1;
			}
		}

		&:active .icon {
			scale: 0.98;
		}
	}

	.magnet {
		display: flex;
	}

	.text {
		color: var(--color-text);

		@include mixins.mq-motion-allow {
			transition: 0.24s ease;
		}
	}

	.icon {
		aspect-ratio: 1;

		@include mixins.mq-motion-allow {
			transition: 0.24s ease;
		}
	}

	.stroke {
		background: var(--color-text);

		@include mixins.mq-motion-allow {
			transition: 0.24s ease;
		}
	}

	.burger {
		position: relative;
		width: 20px;

		.stroke {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 100%;
			height: 2px;
		}

		.stroke-1 {
			translate: -50% calc(-50% - 3px);
		}

		.stroke-2 {
			translate: -50% calc(-50% + 3px);
		}
	}

	.chocolate {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 5px;

		.stroke {
			width: 3px;
			height: 3px;
		}
	}

	.kebab {
		position: relative;
		width: 24px;

		.stroke {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 4px;
			height: 4px;
		}

		.stroke-1 {
			translate: -50% calc(-50% - 8px);
		}

		.stroke-2 {
			translate: -50% -50%;
		}

		.stroke-3 {
			translate: -50% calc(-50% + 8px);
		}
	}

	.round .stroke {
		border-radius: 24px;
	}

	.oreo {
		position: relative;
		width: 20px;

		@include mixins.mq-motion-allow {
			transition:
				0.24s ease,
				rotate 0.5s var(--ease);
		}

		.stroke {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 100%;
			height: 3px;

			@include mixins.mq-motion-allow {
				transition:
					0.5s var(--ease),
					translate 0.3s ease;
			}
		}

		.stroke-1 {
			translate: -50% calc(-50% - 3px);
			border-radius: 64px 64px 0 0;
		}

		.stroke-2 {
			translate: -50% calc(-50% + 3px);
			border-radius: 0 0 64px 64px;
		}
	}

	// Three lines stepped like stairs: the top one short on the left, the middle one full, the bottom one short on the
	// right. Open, the button turns a quarter (its lines turn back the other way, so only the background seems to), then the lines follow one after another: the top and bottom lines lie
	// end to end on one diagonal (together as long as the line they cross) and the middle one crosses them at a right
	// angle, which makes the X. Lengths are in px so the lines can be moved along the diagonal.
	.stairs {
		--full: 20px;
		--inset: 0px;
		--short: calc(var(--full) * 0.6);
		// How far each short line sits from the center, in x and y, to lie end to end on a 45deg line: half the
		// difference in length, times cos(45deg).
		--along: calc((var(--full) - var(--short)) / 2 * 0.7071);
		--lines-ease: var(--ease);

		// The front-loaded desktop curve reads as instant on touch screens.
		@media (hover: none), (pointer: coarse) {
			--lines-ease: cubic-bezier(0.45, 0, 0.25, 1);
		}

		position: relative;
		width: 20px;

		@include mixins.mq-motion-allow {
			transition:
				0.24s ease,
				rotate 0.5s var(--ease);
		}

		// The lines sit in a layer that turns the opposite way to the button, so only the background seems to turn.
		.lines {
			position: absolute;
			inset: 0;

			@include mixins.mq-motion-allow {
				transition: rotate 0.5s var(--ease);
			}
		}

		.stroke {
			position: absolute;
			top: 50%;
			left: var(--inset);
			width: var(--short);
			height: 2px;
			translate: 0 -50%;

			@include mixins.mq-motion-allow {
				transition:
					translate 0.5s var(--lines-ease),
					rotate 0.5s var(--lines-ease);
			}
		}

		// The same stagger plays both ways, opening and closing, a beat after the button starts to turn.
		@include mixins.mq-motion-allow {
			.stroke-1 {
				transition-delay: 0.08s;
			}

			.stroke-2 {
				transition-delay: 0.15s;
			}

			.stroke-3 {
				transition-delay: 0.22s;
			}
		}

		.stroke-1 {
			translate: 0 calc(-50% - 6px);
		}

		.stroke-2 {
			width: var(--full);
		}

		.stroke-3 {
			translate: calc(var(--full) - var(--short)) calc(-50% + 6px);
		}
	}

	// Open state: the burger crosses into an X, the chocolate keeps its corners and center.
	[aria-expanded='true'] {
		.burger .stroke {
			translate: -50% -50%;
		}

		.burger .stroke-1 {
			rotate: 45deg;
		}

		.burger .stroke-2 {
			rotate: -45deg;
		}

		.stairs {
			rotate: 90deg;

			.lines {
				rotate: -90deg;
			}

			.stroke-1 {
				translate: calc((var(--full) - var(--short)) / 2 - var(--along)) calc(-50% - var(--along));
				rotate: 45deg;
			}

			.stroke-2 {
				translate: 0 -50%;
				rotate: -45deg;
			}

			.stroke-3 {
				translate: calc((var(--full) - var(--short)) / 2 + var(--along)) calc(-50% + var(--along));
				rotate: 45deg;
			}
		}

		.oreo {
			rotate: 90deg;

			.stroke {
				translate: -50% -50%;
				border-radius: 64px;
			}

			.stroke-1 {
				rotate: 45deg;
			}

			.stroke-2 {
				rotate: -225deg;
			}
		}

		.chocolate {
			.stroke-2,
			.stroke-4,
			.stroke-6,
			.stroke-8 {
				scale: 0;
			}
		}
	}

	// In a box, the symbol sits inside the button's own icon padding (`--btn-padding-icon`, with some room added so the
	// lines sit well inside the border instead of reaching it).
	.type-button .icon {
		--symbol-gap: calc(var(--btn-padding-icon) * 1.5);

		width: 40px;
		height: 40px;
		padding: var(--symbol-gap);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-btn);
		background: var(--color-accent);
	}

	// The box has the accent color in both themes, so its lines are a fixed dark color too.
	.type-button .stroke {
		background: var(--color-on-accent);
	}

	// The lines are as wide as the space inside that padding, whatever the padding is set to.
	.type-button .burger .stroke,
	.type-button .oreo .stroke {
		width: calc(100% - var(--symbol-gap) * 1.5);
	}

	// The lines are positioned inside the button's padding box: its 40px less the 1px border on each side.
	.type-button .stairs {
		--full: calc(38px - var(--symbol-gap) * 1.5);
		--inset: calc(var(--symbol-gap) * 0.75);
	}

	.type-button .kebab,
	.type-button .chocolate {
		width: 40px;
	}
</style>
