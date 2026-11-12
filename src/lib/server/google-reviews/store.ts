import { getStore } from '@netlify/blobs';
import type { ReviewCache } from '../../google-reviews/types';

const onNetlify = () => !!process.env.NETLIFY || !!process.env.NETLIFY_BLOBS_CONTEXT;
const memory = new Map<string, unknown>();
const blobs = () => getStore({ name: 'google-reviews', consistency: 'strong' });

// Without Netlify (local dev) values live in memory, so the admin can be tried out.
async function read<T>(key: string): Promise<T | null> {
	try {
		return ((await blobs().get(key, { type: 'json' })) as T | null) ?? null;
	} catch (error) {
		if (onNetlify()) throw error;
		return (memory.get(key) as T | undefined) ?? null;
	}
}

async function write(key: string, value: unknown) {
	try {
		await blobs().setJSON(key, value);
	} catch (error) {
		if (onNetlify()) throw error;
		memory.set(key, value);
	}
}

export const readCache = () => read<ReviewCache>('cache');
export const writeCache = (cache: ReviewCache) => write('cache', cache);

/** `null` means nothing was ever approved or hidden. */
export const readApprovals = async () => (await read<{ ids: string[] }>('approvals'))?.ids ?? null;

export async function setApproved(reviewId: string, approved: boolean, seed: string[] = []) {
	const current = new Set((await readApprovals()) ?? seed);
	if (approved) current.add(reviewId);
	else current.delete(reviewId);
	const ids = [...current];
	await write('approvals', { ids });
	return ids;
}
