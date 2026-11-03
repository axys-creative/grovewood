import { json } from '@sveltejs/kit';
import { createRequest, issueTicket } from '$lib/server/booking';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	json({ ticket: issueTicket() }, { headers: { 'Cache-Control': 'no-store' } });

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin)
		return json({ ok: false, error: 'forbidden' }, { status: 403 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid' }, { status: 400 });
	}

	const { status, body: result } = await createRequest(body, getClientAddress(), url.origin);
	return json(result, { status, headers: { 'Cache-Control': 'no-store' } });
};
