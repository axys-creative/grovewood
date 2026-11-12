import { json } from '@sveltejs/kit';
import { isCmsUser } from '$lib/server/identity-auth';
import { loadAdminReviews } from '$lib/server/google-reviews/public';
import { readApprovals, setApproved } from '$lib/server/google-reviews/store';
import mock from '$lib/google-reviews/mock.json';
import type { RequestHandler } from './$types';

const noStore = { 'Cache-Control': 'no-store' };

export const GET: RequestHandler = async ({ request, url }) => {
	if (!(await isCmsUser(request, url.origin)))
		return json({ error: 'unauthorized' }, { status: 401 });
	return json(await loadAdminReviews(), { headers: noStore });
};

export const POST: RequestHandler = async ({ request, url }) => {
	if (!(await isCmsUser(request, url.origin)))
		return json({ error: 'unauthorized' }, { status: 401 });
	const { reviewId, approved } = (await request.json().catch(() => ({}))) as {
		reviewId?: unknown;
		approved?: unknown;
	};
	if (typeof reviewId !== 'string' || typeof approved !== 'boolean')
		return json({ error: 'invalid' }, { status: 400 });

	const data = await loadAdminReviews();
	if (!data.reviews.some((review) => review.reviewId === reviewId))
		return json({ error: 'unknown review' }, { status: 404 });

	const seed = (await readApprovals()) === null && data.source === 'mock' ? mock.approvedIds : [];
	return json({ approvedIds: await setApproved(reviewId, approved, seed) }, { headers: noStore });
};
