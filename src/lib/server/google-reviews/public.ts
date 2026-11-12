import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import mock from '../../google-reviews/mock.json';
import type { AdminReviews, GoogleReview, ReviewSummary } from '../../google-reviews/types';
import { readApprovals, readCache } from './store';

// Sample reviews only ever show in local dev, or on a deploy that opts in with GOOGLE_REVIEWS_MOCK=on.
const allowMock = dev || env.GOOGLE_REVIEWS_MOCK === 'on';

export async function loadAdminReviews(): Promise<AdminReviews> {
	const cache = await readCache();
	const approved = await readApprovals();
	if (cache) return { ...cache, source: 'google', approvedIds: approved ?? [] };
	if (allowMock)
		return {
			...(mock as typeof mock & AdminReviews),
			source: 'mock',
			approvedIds: approved ?? mock.approvedIds
		} as AdminReviews;
	return { syncedAt: '', summary: null, reviews: [], source: 'none', approvedIds: approved ?? [] };
}

export type PublicReviews = { reviews: GoogleReview[]; summary: ReviewSummary | null };

/** Only handpicked reviews with a message. Never throws, so a storage hiccup cannot break the page. */
export async function loadPublicReviews(): Promise<PublicReviews> {
	try {
		const data = await loadAdminReviews();
		const approved = new Set(data.approvedIds);
		const reviews = data.reviews
			.filter((review) => approved.has(review.reviewId) && review.comment)
			.sort((a, b) => b.createTime.localeCompare(a.createTime));
		return { reviews, summary: reviews.length ? data.summary : null };
	} catch (error) {
		console.error('Could not load Google reviews', error);
		return { reviews: [], summary: null };
	}
}
