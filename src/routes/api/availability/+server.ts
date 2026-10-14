import { json } from '@sveltejs/kit';
import { issueTicket, takenSlots } from '$lib/server/booking';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	json(
		{ taken: await takenSlots(), ticket: issueTicket() },
		{ headers: { 'Cache-Control': 'no-store' } }
	);
