<!-- LIBRARY: DELETE ME. Documentation only; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import Button from '$lib/components/button.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	type Props = {
		/** The background effect, applied to the mock section. */
		effect: Attachment<HTMLElement>;
		/** Text for the button, which carries the class `demo-button` so an effect can be told about it. */
		button?: string;
	};

	let { effect, button = 'A button on the page' }: Props = $props();
</script>

<div class="frame">
	<div class="bar" aria-hidden="true">
		<span class="dots"><i></i><i></i><i></i></span>
		<span class="path">/mock-section</span>
	</div>

	<div class="stage" {@attach effect}>
		<SectionCopy
			level={3}
			align="center"
			eyebrowText="A mock section"
			title="Content sits in front"
			description="Move the mouse over this frame. The effect is drawn behind everything in the section."
		/>
		<div class="demo-button"><Button text={button} type="outline" /></div>
	</div>
</div>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	.frame {
		display: flex;
		flex-direction: column;
		width: min(max(60vw, 320px), calc(100vw - var(--body-padding) * 2));
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-bg);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.dots {
		display: flex;
		gap: 6px;

		i {
			width: 9px;
			height: 9px;
			border-radius: 50%;
			background: var(--color-border);
		}
	}

	.path {
		color: var(--color-text-muted);
	}

	.stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24px;
		min-height: 360px;
		padding: 48px 32px;
	}
</style>
