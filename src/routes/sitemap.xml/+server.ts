import { blog } from '$lib/blog';
import { pages } from '$lib/content/meta/pages.json';
import site from '$lib/content/meta/site.json';

export const prerender = true;

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Pages marked "crawl" in pages.json, plus every published post. Library pages are left out.
export const GET = () => {
	const origin = site.url.replace(/\/$/, '');
	const entries: { path: string; lastmod?: string }[] = [
		...pages.filter((page) => page.crawlPage).map((page) => ({ path: page.path })),
		...blog.all.map((post) => ({ path: `/blog/${post.slug}`, lastmod: post.date }))
	];

	const urls = entries
		.map(
			({ path, lastmod }) =>
				`  <url>\n    <loc>${escape(origin + path)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`
		)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
};
