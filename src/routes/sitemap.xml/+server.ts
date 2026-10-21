import { pages } from '$lib/content/meta/pages.json';
import site from '$lib/content/meta/site.json';

export const prerender = true;

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Pages marked "crawl" in pages.json.
export const GET = () => {
	const origin = site.url.replace(/\/$/, '');
	const entries = pages.filter((page) => page.crawlPage).map((page) => ({ path: page.path }));

	const urls = entries
		.map(({ path }) => `  <url>\n    <loc>${escape(origin + path)}</loc>\n  </url>`)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
};
