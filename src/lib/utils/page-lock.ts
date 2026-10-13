// Temporary: while the design is finalized, every page except the ones below answers 404.
// Set `lockPages` to false to bring them all back.
export const lockPages = true;

const open = ['/', '/admin', '/form-submit', '/robots.txt', '/sitemap.xml'];

export const isLocked = (pathname: string) => {
	if (!lockPages) return false;
	const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
	return !open.some(
		(entry) => path === entry || (entry === '/admin' && path.startsWith('/admin/'))
	);
};
