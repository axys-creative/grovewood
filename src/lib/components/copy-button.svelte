<script module lang="ts">
	import type { CopyOptions } from '$lib/attachments/copy';

	export type CopyButtonProps = Pick<
		CopyOptions,
		'text' | 'target' | 'copiedText' | 'copiedTime' | 'alert' | 'onCopy'
	> & {
		/** The button's label. */
		label?: string;
		/** Icon name from `static/icons`, shown before the label. */
		icon?: string;
		type?: 'solid' | 'outline' | 'underline' | 'text';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	};
</script>

<script lang="ts">
	import { copy } from '$lib/attachments/copy';
	import Button from './button.svelte';

	let {
		text,
		target,
		copiedText = 'Copied!',
		copiedTime,
		alert,
		onCopy,
		label = 'Copy',
		icon = 'copy',
		type = 'outline',
		size = 'sm',
		class: className
	}: CopyButtonProps = $props();
</script>

<Button
	text={label}
	iconStart={icon}
	{type}
	{size}
	class={className}
	{@attach copy({ text, target, copiedText, copiedTime, alert, onCopy })}
/>
