// LIBRARY: DELETE ME. Only the documentation pages use this lookup for their eyebrow icons.
import header from '$lib/content/global/navigation.json';

type NavItem = { text: string; url?: string; iconStart?: string; links?: NavItem[] };

/** Finds a page in the header navigation so its icon and group can be reused (e.g. in a page's eyebrow). */
export function navEntry(path: string): { icon?: string; group?: string } {
	for (const link of header.links as NavItem[]) {
		if (link.url === path) return { icon: link.iconStart };

		const child = link.links?.find((item) => item.url === path);
		if (child) return { icon: child.iconStart, group: link.text };
	}
	return {};
}
