<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { glass } from '$lib/attachments/glass';
	import { textRoll } from '$lib/attachments/text-roll';
	import Button, { type ButtonProps } from './button.svelte';

	type Props = {
		text: string;
		links: ButtonProps[];
		type?: ButtonProps['type'];
		mode?: 'popover' | 'accordion';
		/** The popover's background: the glass attachment, a plain blur, or a solid color. */
		surface?: 'glass' | 'blur' | 'solid';
		/** An attachment for the button that opens it, such as a hover effect. */
		triggerAttach?: Attachment<HTMLElement>;
	};

	let {
		text,
		links,
		type = 'underline',
		mode = 'popover',
		surface = 'glass',
		triggerAttach
	}: Props = $props();

	const id = $props.id();
	let root = $state<HTMLElement>();
	let open = $state(false);
	let openedByHover = false;

	const onpointerenter = (event: PointerEvent) => {
		if (mode !== 'popover' || event.pointerType !== 'mouse') return;
		open = true;
		openedByHover = true;
	};

	const onpointerleave = (event: PointerEvent) => {
		if (mode !== 'popover' || event.pointerType !== 'mouse') return;
		open = false;
		openedByHover = false;
	};

	// Scrolling down hides the header, so the menu closes; scrolling up keeps it, as the header stays in view.
	let lastY = 0;
	const onscroll = () => {
		const y = scrollY;
		if (mode === 'popover' && y > lastY) open = false;
		lastY = y;
	};

	const toggle = () => {
		if (openedByHover) openedByHover = false;
		else open = !open;
	};

	const onkeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !open) return;
		open = false;
		root?.querySelector('button')?.focus();
	};

	const onfocusout = (event: FocusEvent) => {
		if (!root?.contains(event.relatedTarget as Node | null)) open = false;
	};

	const onclick = (event: MouseEvent) => {
		if ((event.target as Element).closest('.panel a')) open = false;
	};
</script>

<svelte:window {onscroll} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={root}
	class="dropdown {mode}"
	class:open
	{onpointerenter}
	{onpointerleave}
	{onkeydown}
	{onfocusout}
	{onclick}
>
	<Button
		{text}
		{type}
		iconEnd="chevron-down"
		expanded={open}
		controls={id}
		onclick={toggle}
		{@attach textRoll()}
		{@attach triggerAttach}
	/>

	<div
		class="panel {mode === 'popover' && surface !== 'glass' ? surface : ''}"
		{id}
		{@attach mode === 'popover' && surface === 'glass'
			? glass({ blur: 12, tint: 'rgb(0 0 0 / 0.45)' })
			: undefined}
	>
		<ul class="list">
			{#each links as link (`${link.url}|${link.text}`)}
				<li><Button {...link} type={link.type ?? 'text'} {@attach textRoll()} /></li>
			{/each}
		</ul>
	</div>
</div>

<style lang="scss">
	@use 'base/mixins';

	.dropdown {
		position: relative;
	}

	.list {
		--btn-font-size: 16px;

		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		white-space: nowrap;
	}

	.panel {
		visibility: hidden;

		@include mixins.mq-motion-allow {
			transition:
				opacity var(--duration) var(--ease),
				translate var(--duration) var(--ease),
				grid-template-rows var(--duration) var(--ease),
				visibility var(--duration);
		}
	}

	.open .panel {
		visibility: visible;
	}

	.popover {
		.panel {
			--offset: 24px;

			position: absolute;
			top: calc(100% + var(--offset));
			left: -24px;
			padding: 24px;
			border: 1px solid var(--color-border);
			border-radius: var(--radius-btn);
			opacity: 0;
			translate: 0 16px;

			// Keeps the menu open while the pointer crosses the gap.
			&::after {
				content: '';
				position: absolute;
				bottom: 100%;
				left: 0;
				width: 100%;
				height: var(--offset);
			}
		}

		&.open .panel {
			opacity: 1;
			translate: 0 0;
		}

		.panel.blur {
			@include mixins.glass;
		}

		.panel.solid {
			background: var(--color-bg);
		}
	}

	.accordion {
		.panel {
			display: grid;
			grid-template-rows: 0fr;
		}

		&.open .panel {
			grid-template-rows: 1fr;
			margin-block-start: 12px;
		}

		.list {
			min-height: 0;
			padding: 0 12px;
			overflow: hidden;
			border-radius: var(--radius-btn);
			background: var(--color-surface);

			@include mixins.mq-motion-allow {
				transition: padding var(--duration) var(--ease);
			}
		}

		&.open .list {
			padding: 12px;
		}
	}
</style>
