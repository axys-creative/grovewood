import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isCmsUser } from '$lib/server/identity-auth';
import { syncReviews } from '$lib/server/google-reviews/sync';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	if (!(await isCmsUser(request, url.origin)))
		return json({ error: 'unauthorized' }, { status: 401 });
	const result = await syncReviews(env);
	return json(result, { status: result.ok ? 200 : 502, headers: { 'Cache-Control': 'no-store' } });
};
