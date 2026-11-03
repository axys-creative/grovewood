// Adds a thumbnail to Decap's grid-view cards from /admin-thumbs/<collection>/<entry>.jpg; a card without a file is left
// as is. Cards are found by their stable emotion label (the class hash changes) and their entry link.
const mark = 'data-thumb';
const entryLink = /#\/collections\/([^/]+)\/entries\/([^/?]+)/;

const attach = (link: HTMLAnchorElement) => {
	link.setAttribute(mark, '');
	const match = entryLink.exec(link.getAttribute('href') ?? '');
	if (!match) return;
	const image = new Image();
	image.alt = '';
	image.style.cssText =
		'display:block;width:calc(100% - 32px);flex:1;min-height:0;margin:0 auto 16px;border-radius:8px;object-fit:cover;object-position:top;';
	image.onload = () => {
		link.style.display = 'flex';
		link.style.flexDirection = 'column';
		link.append(image);
	};
	image.src = `/admin-thumbs/${match[1]}/${match[2]}.jpg`;
};

export function cardThumbnails() {
	const scan = () => {
		document
			.querySelectorAll<HTMLAnchorElement>(`a[class*="-GridCardLink"]:not([${mark}])`)
			.forEach(attach);
	};
	scan();
	const observer = new MutationObserver(scan);
	observer.observe(document.body, { childList: true, subtree: true });
	return () => observer.disconnect();
}
