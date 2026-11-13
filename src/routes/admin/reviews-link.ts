// Adds a "Google reviews" link to Decap's sidebar by cloning one of its links, so it keeps Decap's own styling.
// Decap's classes are hashed, so elements are found by their stable emotion label.
const mark = 'data-reviews-link';

const add = () => {
	const list = document.querySelector<HTMLElement>('ul[class*="-SidebarNavList"]');
	if (!list || list.querySelector(`[${mark}]`)) return;
	const source = list.querySelector<HTMLAnchorElement>('a[class*="-SidebarNavLink"]');
	if (!source) return;

	const link = source.cloneNode(false) as HTMLAnchorElement;
	link.removeAttribute('aria-current');
	link.classList.remove('active', 'sidebar-active');
	link.setAttribute(mark, '');
	link.href = '/admin/reviews';
	const icon = Object.assign(new Image(16, 16), {
		src: '/images/admin/icon-google.svg',
		alt: ''
	});
	icon.style.cssText = 'display:block;width:100%;height:auto;';
	const wrapper =
		(source.querySelector('span[class*="-IconWrapper"]')?.cloneNode(false) as HTMLElement) ??
		document.createElement('span');
	wrapper.style.cssText = 'margin-inline:4px 8px;width:16px;display:flex;';
	wrapper.append(icon);
	link.append(wrapper, 'Google reviews');

	const item = document.createElement('li');
	item.setAttribute(mark, '');
	item.append(link);
	list.append(item);
};

export function reviewsLink() {
	add();
	const observer = new MutationObserver(add);
	observer.observe(document.body, { childList: true, subtree: true });
	return () => observer.disconnect();
}
