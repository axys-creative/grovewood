<script lang="ts">
	import { page } from '$app/state';
	import site from '$lib/content/meta/site.json';
	import { pages } from '$lib/content/meta/pages.json';
	import { imageUrl as optimized } from '$lib/utils/image';

	// A page can pass its own `seo` in its load data (a blog post does); otherwise pages.json decides.
	type PageSeo = {
		title: string;
		description?: string;
		ogImage?: string;
		type?: string;
		/** `YYYY-MM-DD`, for an article. */
		published?: string;
		author?: string;
	};

	// An error page uses its own entry (the 404 one for a missing page) and is never indexed.
	const failed = $derived(page.status >= 400);
	const entry = $derived(
		pages.find((p) => p.path === (failed ? (page.status === 404 ? '/404' : '') : page.url.pathname))
	);
	const seo = $derived(page.data.seo as PageSeo | undefined);
	const title = $derived(seo?.title || entry?.title || site.siteName);
	const description = $derived(seo?.description || entry?.description);
	const ogImage = $derived(seo?.ogImage || entry?.ogImage);
	const crawlPage = $derived(!failed && (entry?.crawlPage ?? true));
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	const fullTitle = $derived(`${title} | ${site.siteName}`);
	const metaDescription = $derived(description || site.description);
	const image = $derived(ogImage || site.ogImage);
	const origin = $derived(site.url || page.url.origin);
	const canonical = $derived(origin + page.url.pathname);
	// Share previews want a JPEG at 1200 by 630, whatever was uploaded.
	const imageUrl = $derived(
		image
			? new URL(optimized(image, { width: 1200, height: 630, fit: 'cover', format: 'jpg' }), origin)
					.href
			: ''
	);
	// Structured data that search engines and AI answer engines read: who the site is, and for a post, what it says.
	const schema = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'Organization',
					'@id': `${origin}/#organization`,
					name: site.siteName,
					url: origin,
					...(site.contactEmail && { email: site.contactEmail })
				},
				...(seo?.type === 'article'
					? [
							{
								'@type': 'Article',
								headline: title,
								description: metaDescription,
								mainEntityOfPage: canonical,
								...(imageUrl && { image: imageUrl }),
								...(seo.published && { datePublished: seo.published }),
								...(seo.author && { author: { '@type': 'Person', name: seo.author } }),
								publisher: { '@id': `${origin}/#organization` }
							}
						]
					: [])
			]
		}).replaceAll('<', '\\u003c')
	);
	const schemaTag = $derived(`<script type="application/ld+json">${schema}</${'script'}>`);
</script>

<svelte:head>
	{#if !isAdmin}
		{#if site.themeColor}<meta name="theme-color" content={site.themeColor} />{/if}
		{#if site.author}<meta name="author" content={site.author} />{/if}
		{#if site.faviconLight}
			<link rel="icon" href={site.faviconLight} media="(prefers-color-scheme: light)" />
		{/if}
		{#if site.faviconDark}
			<link rel="icon" href={site.faviconDark} media="(prefers-color-scheme: dark)" />
		{/if}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html schemaTag}
		<title>{fullTitle}</title>
		{#if !crawlPage}
			<meta name="robots" content="noindex, nofollow" />
		{/if}
		{#if !failed}<link rel="canonical" href={canonical} />{/if}
		{#if metaDescription}
			<meta name="description" content={metaDescription} />
			<meta property="og:description" content={metaDescription} />
		{/if}
		<meta property="og:type" content={seo?.type ?? 'website'} />
		<meta property="og:site_name" content={site.siteName} />
		<meta property="og:title" content={fullTitle} />
		{#if !failed}<meta property="og:url" content={canonical} />{/if}
		{#if imageUrl}
			<meta property="og:image" content={imageUrl} />
		{/if}
		<meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
	{/if}
</svelte:head>
