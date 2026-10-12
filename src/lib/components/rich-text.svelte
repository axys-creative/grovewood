<script module lang="ts">
	export type RichTextProps = {
		/** Plain text. `[words]{.primary .scribble}` styles words, `{.br}` is a line break. Classes: `italic`, `primary`, `scribble`, `secondary`, `stroke`, `strong`. */
		text: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { richTextBehaviors } from '$lib/attachments/rich-text';
	import { richText } from '$lib/utils/rich-text';

	let { text, class: className }: RichTextProps = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<span class={className} {@attach richTextBehaviors(text)}>{@html richText(text)}</span>
