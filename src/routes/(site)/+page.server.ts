import { loadPublicReviews } from '$lib/server/google-reviews/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'Netlify-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' });
	return { googleReviews: await loadPublicReviews() };
};
