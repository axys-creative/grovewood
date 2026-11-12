import { dev } from '$app/environment';

/** True for a signed-in CMS user. The token is checked with Netlify Identity itself; local dev skips it. */
export async function isCmsUser(request: Request, origin: string) {
	if (dev) return true;
	const header = request.headers.get('authorization');
	if (!header?.startsWith('Bearer ')) return false;
	try {
		const response = await fetch(`${origin}/.netlify/identity/user`, {
			headers: { Authorization: header },
			signal: AbortSignal.timeout(8_000)
		});
		return response.ok;
	} catch {
		return false;
	}
}
