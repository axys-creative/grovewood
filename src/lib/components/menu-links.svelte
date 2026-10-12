<script module lang="ts">
	import type { ButtonProps } from './button.svelte';

	export type NavLinkImage = { src: string; alt?: string };

	export type NavLink = ButtonProps & {
		links?: ButtonProps[];
		/** Pictures tied to this link. The center navigation shows them beside the links while it is hovered. */
		images?: NavLinkImage[];
	};
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { textRoll } from '$lib/attachments/text-roll';
	import Button from './button.svelte';
	import DropdownLink from './dropdown-link.svelte';

	type Props = {
		links: NavLink[];
		label: string;
		type?: ButtonProps['type'];
		direction?: 'row' | 'column';
		/** Render a `<nav>` landmark. Turn off when an ancestor is already the navigation landmark. */
		landmark?: boolean;
		/** The background of dropdown panels, so they can match their header. */
		dropdownSurface?: 'glass' | 'blur' | 'solid';
		/** Called with a link's index while the pointer or keyboard focus is on it, and with `null` when it leaves. */
		onactive?: (index: number | null) => void;
		/** An attachment for every plain link, such as a hover effect. */
		linkAttach?: Attachment<HTMLElement>;
		class?: string;
	};

	let {
		links,
		label,
		type = 'underline',
		direction = 'row',
		landmark = true,
		dropdownSurface,
		onactive,
		linkAttach,
		class: className
	}: Props = $props();
</script>

{#if links.length}
	<svelte:element
		this={landmark ? 'nav' : 'div'}
		aria-label={landmark ? label : undefined}
		class={className}
	>
		<ul class="menu-links {direction}">
			{#each links as { links: children, images, ...link }, index (`${link.url}|${link.text}`)}
				<li
					onpointerenter={onactive ? () => onactive(index) : undefined}
					onpointerleave={onactive ? () => onactive(null) : undefined}
					onfocusin={onactive ? () => onactive(index) : undefined}
					onfocusout={onactive ? () => onactive(null) : undefined}
				>
					{#if children?.length}
						<DropdownLink
							text={link.text ?? ''}
							links={children}
							type={link.type ?? type}
							mode={direction === 'column' ? 'accordion' : 'popover'}
							surface={dropdownSurface}
							triggerAttach={linkAttach}
						/>
					{:else}
						<Button {...link} type={link.type ?? type} {@attach textRoll()} {@attach linkAttach} />
					{/if}
				</li>
			{/each}
		</ul>
	</svelte:element>
{/if}

<style lang="scss">
	.menu-links {
		display: flex;
		gap: 24px;
		padding: 0;
		list-style: none;
	}

	.column {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}
</style>
