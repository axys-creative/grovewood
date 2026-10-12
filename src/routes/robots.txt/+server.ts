import site from '$lib/content/meta/site.json';

export const prerender = true;

// To keep AI crawlers out, add `User-agent: GPTBot` (and others) with `Disallow: /` blocks here.
export const GET = () =>
	new Response(
		`User-agent: *\nDisallow: /admin\nDisallow: /form-submit\n\nSitemap: ${site.url.replace(/\/$/, '')}/sitemap.xml\n`,
		{ headers: { 'Content-Type': 'text/plain' } }
	);
