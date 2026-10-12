<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'role' | 'aria-label'> & {
		name: string;
		label?: string;
		size?: 'sm' | 'md' | 'lg';
	};

	let { name, label, size = 'md', class: className, style, ...rest }: Props = $props();
</script>

<span
	class="icon {size} {className ?? ''}"
	style="mask-image: url('{name.startsWith('/') ? name : `/icons/${name}.svg`}'); {style ?? ''}"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	{...rest}
></span>

<style lang="scss">
	.icon {
		--icon-size: 1em;

		display: inline-block;
		flex-shrink: 0;
		width: var(--icon-size);
		height: var(--icon-size);
		background: currentColor;
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		vertical-align: middle;
	}

	.sm {
		--icon-size: 0.75em;
	}

	.lg {
		--icon-size: 1.5em;
	}
</style>
