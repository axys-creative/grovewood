export type GoogleReview = {
	reviewId: string;
	rating: 1 | 2 | 3 | 4 | 5;
	comment: string;
	displayName: string;
	profilePhotoUrl: string | null;
	createTime: string;
	updateTime: string;
};

export type ReviewSummary = { rating: number; count: number };

export type ReviewCache = {
	syncedAt: string;
	summary: ReviewSummary | null;
	reviews: GoogleReview[];
};

export type AdminReviews = ReviewCache & {
	source: 'google' | 'mock' | 'none';
	approvedIds: string[];
};
