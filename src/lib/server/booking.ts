import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getStore } from '@netlify/blobs';
import config from '$lib/content/global/booking.json';
import site from '$lib/content/meta/site.json';

export const contactMethods = ['Phone call', 'Text message', 'Email'];

const { step1, step2 } = config.form;
const shown = {
	firstName: step1.showFirstName ?? true,
	lastName: step1.showLastName ?? true,
	email: step1.showEmail ?? true,
	phone: step1.showPhone ?? true,
	interest: step2.showInterest ?? true,
	contactMethod: step2.showContactMethod ?? true,
	message: step2.showMessage ?? true
};

const MIN_AGE_MS = 4_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;
const IP_LIMIT = 5;
const EMAIL_LIMIT = 3;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Local dev and a deploy with BOOKING_RATE_LIMIT=off skip the limits, so testing is never blocked.
const limited = !dev && env.BOOKING_RATE_LIMIT !== 'off';

const secret = () => env.BOOKING_SECRET || env.RECAPTCHA_SECRET || 'dev-secret';
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('hex');

/** A signed timestamp handed out when the popover opens. A real visitor needs seconds to fill the form. */
export const issueTicket = () => {
	const stamp = String(Date.now());
	return `${stamp}.${sign(stamp)}`;
};

function ticketAge(ticket: string) {
	const [stamp, signature] = ticket.split('.');
	if (!stamp || !signature) return null;
	const expected = Buffer.from(sign(stamp));
	const given = Buffer.from(signature);
	if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
	return Date.now() - Number(stamp);
}

/** Counts an attempt under `key` for the current window. Returns true while still within `max`. A storage failure lets it through, so a lead is never lost to it. */
async function allow(key: string, max: number, windowMs: number) {
	if (!limited) return true;
	try {
		const store = getStore({ name: 'limits', consistency: 'strong' });
		const slot = `${createHash('sha256').update(key).digest('hex').slice(0, 24)}/${Math.floor(Date.now() / windowMs)}`;
		const used = Number(
			((await store.get(slot, { type: 'json' })) as { count?: number } | null)?.count ?? 0
		);
		if (used >= max) return false;
		await store.setJSON(slot, { count: used + 1 });
		return true;
	} catch (error) {
		console.error('Rate limit check failed', error);
		return true;
	}
}

const text = (value: unknown, max: number) =>
	typeof value === 'string' ? value.trim().slice(0, max) : '';

export type RequestResult = {
	status: number;
	body: { ok: boolean; error?: string; emailed?: boolean };
};

const fail = (status: number, error: string): RequestResult => ({
	status,
	body: { ok: false, error }
});

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

async function verifyCaptcha(token: string, ip: string) {
	if (!env.RECAPTCHA_SECRET) return true;
	if (!token) return false;
	try {
		const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET, response: token, remoteip: ip })
		});
		return ((await response.json()) as { success?: boolean }).success === true;
	} catch {
		return false;
	}
}

/** Emails the visitor through Resend. Returns false when it is not set up or the send fails. */
async function sendConfirmation(details: { to: string; firstName: string; interest: string }) {
	if (!env.RESEND_API_KEY || !env.BOOKING_FROM) {
		console.warn('Confirmation email skipped: RESEND_API_KEY or BOOKING_FROM is not set');
		return false;
	}

	const lines = [
		details.firstName ? `Hi ${details.firstName},` : 'Hi,',
		`Thank you for reaching out to ${site.siteName}. We received your request${details.interest ? ` about ${details.interest}` : ''} and will be in touch soon to set up your initial consultation.`
	];

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: env.BOOKING_FROM,
				to: [details.to],
				reply_to: env.BOOKING_REPLY_TO || undefined,
				subject: 'We received your request',
				text: lines.join('\n\n'),
				html: lines.map((line) => `<p>${escape(line)}</p>`).join('')
			})
		});
		if (!response.ok)
			console.error('Resend rejected the email', response.status, await response.text());
		return response.ok;
	} catch (error) {
		console.error('Resend request failed', error);
		return false;
	}
}

export async function createRequest(
	input: unknown,
	ip: string,
	origin: string
): Promise<RequestResult> {
	const data = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

	// A bot that fills the hidden field is told it worked, so it does not adapt.
	if (text(data.botField, 100)) return { status: 200, body: { ok: true } };

	// A field the popover does not show is ignored, whatever was sent.
	const firstName = shown.firstName ? text(data.firstName, 60) : '';
	const lastName = shown.lastName ? text(data.lastName, 60) : '';
	const email = shown.email ? text(data.email, 120).toLowerCase() : '';
	const phone = shown.phone ? text(data.phone, 20).replace(/\D/g, '') : '';
	const interest = shown.interest ? text(data.interest, 80) : '';
	const contactMethod = shown.contactMethod ? text(data.contactMethod, 20) : '';
	const message = shown.message ? text(data.message, 1000) : '';

	if (shown.firstName && !firstName) return fail(400, 'invalid');
	if (shown.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, 'invalid');
	const phoneValid = phone.length >= 7 && phone.length <= 15;
	if (shown.phone && (phone ? !phoneValid : !shown.email)) return fail(400, 'invalid');
	if (interest && !step2.interests.includes(interest)) return fail(400, 'invalid');
	if (contactMethod && !contactMethods.includes(contactMethod)) return fail(400, 'invalid');

	if (limited) {
		const age = ticketAge(text(data.ticket, 200));
		if (age === null || age > MAX_AGE_MS) return fail(400, 'expired');
		if (age < MIN_AGE_MS) return fail(429, 'too-fast');
	}

	if (!(await verifyCaptcha(text(data.captcha, 4000), ip))) return fail(400, 'captcha');

	const within =
		(await allow(`ip:${ip}`, IP_LIMIT, HOUR)) &&
		(!email || (await allow(`email:${email}`, EMAIL_LIMIT, DAY)));
	if (!within) return fail(429, 'rate-limit');

	// Netlify Forms keeps the request and emails the site owner, so a failed post is a lost lead. The post goes to
	// the static page that holds the form, since the site's other paths are answered by the server, not Netlify Forms.
	if (!dev) {
		try {
			const response = await fetch(`${origin}/booking-form.html`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					'form-name': 'booking',
					firstName,
					lastName,
					email,
					phone,
					interest,
					contactMethod,
					message
				}).toString()
			});
			if (!response.ok) {
				console.error('Netlify form post failed', response.status);
				return fail(502, 'unavailable');
			}
		} catch (error) {
			console.error('Netlify form post failed', error);
			return fail(502, 'unavailable');
		}
	}

	// One confirmation per address a day, so the form cannot be used to flood someone's inbox.
	const emailed =
		!!email &&
		(await allow(`confirm:${email}`, 1, DAY)) &&
		(await sendConfirmation({ to: email, firstName, interest }));

	return { status: 200, body: { ok: true, emailed } };
}
