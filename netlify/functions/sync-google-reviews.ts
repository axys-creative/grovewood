import { syncReviews } from '../../src/lib/server/google-reviews/sync';

export const config = { schedule: '@daily' };

export default async () => {
	const result = await syncReviews(process.env);
	if (result.ok) console.log(result.message);
	else console.error(`Google reviews sync failed: ${result.message}`);
	return new Response(result.message, { status: result.ok ? 200 : 500 });
};
