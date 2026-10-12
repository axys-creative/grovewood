<script lang="ts">
	type Props = {
		/** How wide each shadow is, as a CSS length. */
		width?: string;
		/** How dark the shadows are at the screen edge, from `0` to `1`. */
		opacity?: number;
	};

	let { width = 'clamp(24px, 6vw, 120px)', opacity = 0.3 }: Props = $props();
</script>

<div class="side-shadows" style="--width: {width}; --opacity: {opacity}" aria-hidden="true"></div>

<style lang="scss">
	.side-shadows {
		position: fixed;
		inset: 0;
		z-index: var(--z-side-shadows, 2);
		pointer-events: none;
		background:
			linear-gradient(90deg, rgb(0 0 0 / var(--opacity)), transparent var(--width)),
			linear-gradient(270deg, rgb(0 0 0 / var(--opacity)), transparent var(--width));
	}

	:global([data-theme='light']) .side-shadows {
		opacity: 0.5;
	}
</style>
