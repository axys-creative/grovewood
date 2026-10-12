<script module lang="ts">
	import type { ButtonProps } from './button.svelte';

	export type BackToTopProps = Omit<ButtonProps, 'url' | 'newTab' | 'htmlType' | 'onclick'>;
</script>

<script lang="ts">
	import Button from './button.svelte';

	let {
		text = 'Back to top',
		type = 'underline',
		iconEnd = 'chevron-up',
		...rest
	}: BackToTopProps = $props();
</script>

<!-- A bare "#" link: smooth-scroll.svelte glides it to the top, and without it the browser jumps there. -->
<Button {...rest} {text} {type} {iconEnd} url="#" />
