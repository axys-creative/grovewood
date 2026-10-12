<script lang="ts">
	import Button from './button.svelte';

	type Props = {
		open?: boolean;
		src: string;
		title?: string;
		poster?: string;
		captions?: string;
		captionsLang?: string;
	};

	const TEARDOWN_MS = 300;

	let {
		open = $bindable(false),
		src,
		title = 'Video',
		poster,
		captions,
		captionsLang = 'en'
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	let video = $state<HTMLVideoElement>();
	let loaded = $state(false);
	let teardown: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			clearTimeout(teardown);
			loaded = true;
			dialog.showModal();
			document.dispatchEvent(new CustomEvent('top-layer-open'));
			video?.play().catch(() => {});
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	const onclose = () => {
		open = false;
		video?.pause();
		teardown = setTimeout(() => (loaded = false), TEARDOWN_MS);
	};

	// The dialog fills the viewport, so a click on itself is a backdrop click.
	const onclick = (event: MouseEvent) => {
		if (event.target === dialog) dialog.close();
	};
</script>

<dialog
	bind:this={dialog}
	class="video-overlay"
	aria-label={title}
	data-lenis-prevent
	{onclose}
	{onclick}
>
	{#if loaded}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			bind:this={video}
			class="video"
			{src}
			{poster}
			controls
			playsinline
			preload="metadata"
			autoplay
		>
			{#if captions}
				<track kind="captions" src={captions} srclang={captionsLang} label="Captions" default />
			{/if}
		</video>
	{/if}
	<Button
		iconStart="x-lg"
		textDescription="Close video"
		autofocus
		onclick={() => dialog?.close()}
	/>
</dialog>

<style lang="scss">
	@use 'base/mixins';

	.video-overlay {
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 24px;
		width: 100vw;
		max-width: 100vw;
		height: 100dvh;
		max-height: 100dvh;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		opacity: 0;

		&[open] {
			display: flex;
			opacity: 1;

			@starting-style {
				opacity: 0;
			}
		}

		&::backdrop {
			background-color: color-mix(in srgb, var(--color-border) 0%, transparent);
		}

		&[open]::backdrop {
			background-color: color-mix(in srgb, var(--color-border) 90%, transparent);

			@starting-style {
				background-color: color-mix(in srgb, var(--color-border) 0%, transparent);
			}
		}

		@include mixins.mq-motion-allow {
			&,
			&::backdrop {
				transition:
					opacity 0.3s ease,
					background-color 0.3s ease,
					display 0.3s allow-discrete,
					overlay 0.3s allow-discrete;
			}
		}
	}

	.video {
		width: min(90vw, var(--content-width));
		max-height: 80dvh;
		aspect-ratio: 16 / 9;
		background: black;
		object-fit: contain;
	}
</style>
