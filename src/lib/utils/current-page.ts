import { page } from '$app/state';

export function isCurrentPage(url?: string) {
	if (!url || url.startsWith('#')) return false;
	const target = new URL(url, page.url);
	return target.origin === page.url.origin && target.pathname === page.url.pathname && !target.hash;
}

export function onCurrentPageClick(event: MouseEvent) {
	if (event.defaultPrevented || event.button !== 0) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	event.preventDefault();
}
