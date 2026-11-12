import type { GoogleReview, ReviewCache, ReviewSummary } from '../../google-reviews/types';
import { writeCache } from './store';

export type SyncEnv = Record<string, string | undefined>;
export type SyncResult = { ok: boolean; message: string; count?: number };

const stars = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as const;
const PAGE_SIZE = 50;
const MAX_PAGES = 100;
const timeout = () => AbortSignal.timeout(15_000);

type RawReview = {
	reviewId?: string;
	reviewer?: { displayName?: string; profilePhotoUrl?: string };
	starRating?: keyof typeof stars;
	comment?: string;
	createTime?: string;
	updateTime?: string;
};

export function normalize(raw: RawReview): GoogleReview | null {
	const rating = raw.starRating ? stars[raw.starRating] : undefined;
	if (!raw.reviewId || !rating) return null;
	return {
		reviewId: raw.reviewId,
		rating,
		comment: (raw.comment ?? '').trim(),
		displayName: raw.reviewer?.displayName?.trim() || 'A Google user',
		profilePhotoUrl: raw.reviewer?.profilePhotoUrl ?? null,
		createTime: raw.createTime ?? '',
		updateTime: raw.updateTime ?? raw.createTime ?? ''
	};
}

async function accessToken(env: SyncEnv) {
	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: env.GOOGLE_CLIENT_ID!,
			client_secret: env.GOOGLE_CLIENT_SECRET!,
			refresh_token: env.GOOGLE_REFRESH_TOKEN!,
			grant_type: 'refresh_token'
		}),
		signal: timeout()
	});
	const body = (await response.json().catch(() => ({}))) as {
		access_token?: string;
		error?: string;
	};
	if (!response.ok || !body.access_token)
		throw new Error(`Token exchange failed (${response.status} ${body.error ?? 'unknown'})`);
	return body.access_token;
}

export async function fetchReviews(env: SyncEnv): Promise<ReviewCache> {
	const token = await accessToken(env);
	const base = `https://mybusiness.googleapis.com/v4/accounts/${env.GBP_ACCOUNT_ID}/locations/${env.GBP_LOCATION_ID}/reviews`;
	const reviews: GoogleReview[] = [];
	let summary: ReviewSummary | null = null;
	let pageToken = '';

	for (let page = 0; page < MAX_PAGES; page++) {
		const query = new URLSearchParams({ pageSize: String(PAGE_SIZE) });
		if (pageToken) query.set('pageToken', pageToken);
		const response = await fetch(`${base}?${query}`, {
			headers: { Authorization: `Bearer ${token}` },
			signal: timeout()
		});
		if (!response.ok) throw new Error(`Reviews request failed (${response.status})`);
		const body = (await response.json()) as {
			reviews?: RawReview[];
			averageRating?: number;
			totalReviewCount?: number;
			nextPageToken?: string;
		};
		if (!summary && body.averageRating && body.totalReviewCount)
			summary = { rating: body.averageRating, count: body.totalReviewCount };
		for (const raw of body.reviews ?? []) {
			const review = normalize(raw);
			if (review) reviews.push(review);
		}
		if (!body.nextPageToken) break;
		pageToken = body.nextPageToken;
	}

	if (!reviews.length && (summary?.count ?? 0) > 0)
		throw new Error('Google reported reviews but none came back');
	return { syncedAt: new Date().toISOString(), summary, reviews };
}

const required = [
	'GOOGLE_CLIENT_ID',
	'GOOGLE_CLIENT_SECRET',
	'GOOGLE_REFRESH_TOKEN',
	'GBP_ACCOUNT_ID',
	'GBP_LOCATION_ID'
];

/** Fetches every review and replaces the cache. On any failure the last good cache stays. */
export async function syncReviews(env: SyncEnv): Promise<SyncResult> {
	const missing = required.filter((name) => !env[name]);
	if (missing.length)
		return { ok: false, message: `Missing environment variables: ${missing.join(', ')}` };
	try {
		const cache = await fetchReviews(env);
		await writeCache(cache);
		return {
			ok: true,
			message: `Synced ${cache.reviews.length} reviews`,
			count: cache.reviews.length
		};
	} catch (error) {
		return { ok: false, message: error instanceof Error ? error.message : 'Sync failed' };
	}
}
