import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getStore } from '@netlify/blobs';
import config from '$lib/content/global/booking.json';
import { isClosed, isIsoDate, slotLabels } from '$lib/utils/booking-rules';

type Entry = Record<string, unknown>;

type Store = {
	get: (key: string) => Promise<Entry | null>;
	set: (key: string, value: Entry) => Promise<void>;
	/** Writes only when the key is free. Returns false when someone else already holds it. */
	create: (key: string, value: Entry) => Promise<boolean>;
	list: (prefix: string) => Promise<string[]>;
};

const memory = new Map<string, Entry>();

// Netlify Blobs is only there on Netlify, so local dev keeps bookings in memory.
const store: Store = dev
	? {
			get: async (key) => memory.get(key) ?? null,
			set: async (key, value) => void memory.set(key, value),
			create: async (key, value) => {
				if (memory.has(key)) return false;
				memory.set(key, value);
				return true;
			},
			list: async (prefix) => [...memory.keys()].filter((key) => key.startsWith(prefix))
		}
	: (() => {
			const blobs = () => getStore({ name: 'bookings', consistency: 'strong' });
			return {
				get: async (key) => (await blobs().get(key, { type: 'json' })) as Entry | null,
				set: async (key, value) => void (await blobs().setJSON(key, value)),
				create: async (key, value) => {
					const result = await blobs().setJSON(key, value, { onlyIfNew: true });
					return result.modified;
				},
				list: async (prefix) => (await blobs().list({ prefix })).blobs.map((blob) => blob.key)
			};
		})();

const when = config.steps.when;
const shown = {
	firstName: config.steps.details.showFirstName ?? true,
	lastName: config.steps.details.showLastName ?? true,
	email: config.steps.details.showEmail ?? true,
	phone: config.steps.details.showPhone ?? true
};
const days = when.days ?? 5;
const labels = slotLabels(when.timeStart ?? 8, when.timeLength ?? 2, when.timeSlots ?? 5);

const MIN_AGE_MS = 4_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;
const IP_LIMIT = 5;
const EMAIL_LIMIT = 3;

const secret = () => env.BOOKING_SECRET || env.RECAPTCHA_SECRET || 'dev-secret';
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('hex');

/** A signed timestamp handed out with the availability. A real visitor needs seconds to fill the form. */
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

/** Taken slots by date: `{ '2026-10-14': [0, 3] }`, the numbers being indexes into the day's time slots. */
export async function takenSlots() {
	const taken: Record<string, number[]> = {};
	for (const key of await store.list('slot/')) {
		const [, date, index] = key.split('/');
		(taken[date] ??= []).push(Number(index));
	}
	return taken;
}

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

/** Counts an attempt under `key` for the current window. Returns true while still within `max`. */
async function allow(key: string, max: number, windowMs: number) {
	const full = `limit/${createHash('sha256').update(key).digest('hex').slice(0, 24)}/${Math.floor(Date.now() / windowMs)}`;
	const used = Number((await store.get(full))?.count ?? 0);
	if (used >= max) return false;
	await store.set(full, { count: used + 1 });
	return true;
}

const text = (value: unknown, max: number) =>
	typeof value === 'string' ? value.trim().slice(0, max) : '';

export type BookingResult = {
	status: number;
	body: { ok: boolean; error?: string; emailed?: boolean };
};

const fail = (status: number, error: string): BookingResult => ({
	status,
	body: { ok: false, error }
});

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Emails the visitor through Resend. Returns false when it is not set up or the send fails. */
async function sendConfirmation(details: {
	to: string;
	firstName: string;
	service: string;
	date: string;
	time: string;
}) {
	if (!env.RESEND_API_KEY || !env.BOOKING_FROM) {
		console.warn('Confirmation email skipped: RESEND_API_KEY or BOOKING_FROM is not set');
		return false;
	}

	const day = new Date(`${details.date}T12:00:00Z`).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	});
	const lines = [
		details.firstName ? `Hi ${details.firstName},` : 'Hi,',
		'Your appointment is scheduled.',
		`Service: ${details.service}`,
		`Date: ${day}`,
		`Time: ${details.time}`
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
				subject: 'Your booking is confirmed',
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

export async function createBooking(
	input: unknown,
	ip: string,
	origin: string
): Promise<BookingResult> {
	const data = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

	// A bot that fills the hidden field is told it worked, so it does not adapt.
	if (text(data.botField, 100)) return { status: 200, body: { ok: true } };

	// A field the popover does not show is ignored, whatever was sent.
	const firstName = shown.firstName ? text(data.firstName, 60) : '';
	const lastName = shown.lastName ? text(data.lastName, 60) : '';
	const email = shown.email ? text(data.email, 120).toLowerCase() : '';
	const phone = shown.phone ? text(data.phone, 20).replace(/\D/g, '') : '';
	const date = text(data.date, 10);
	const service = config.steps.service.services.find((item) => item.title === data.service);
	const slot = typeof data.slot === 'number' ? data.slot : -1;

	if ((shown.firstName && !firstName) || (shown.lastName && !lastName)) return fail(400, 'invalid');
	if (shown.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, 'invalid');
	if (shown.phone && (phone.length < 7 || phone.length > 15)) return fail(400, 'invalid');
	if (!service || !Number.isInteger(slot) || !labels[slot]) return fail(400, 'invalid');
	if (!isIsoDate(date) || isClosed(date, when.closedDays)) return fail(400, 'invalid');

	// A day beyond what the popover offers (with room for time zones) is not bookable.
	const day = new Date(`${date}T12:00:00Z`).getTime();
	const spread = (day - Date.now()) / 86_400_000;
	if (spread < -1 || spread > days + 4) return fail(400, 'invalid');

	const age = ticketAge(text(data.ticket, 200));
	if (age === null || age > MAX_AGE_MS) return fail(400, 'expired');
	if (age < MIN_AGE_MS) return fail(429, 'too-fast');

	if (!(await verifyCaptcha(text(data.captcha, 4000), ip))) return fail(400, 'captcha');

	const within =
		(await allow(`ip:${ip}`, IP_LIMIT, 60 * 60 * 1000)) &&
		(!email || (await allow(`email:${email}`, EMAIL_LIMIT, 24 * 60 * 60 * 1000)));
	if (!within) return fail(429, 'rate-limit');

	const reserved = await store.create(`slot/${date}/${slot}`, {
		service: service.title,
		time: labels[slot],
		firstName,
		lastName,
		email,
		phone,
		bookedAt: new Date().toISOString()
	});
	if (!reserved) return fail(409, 'taken');

	// Tells the site owner through Netlify Forms. A failed notice never undoes the booking. The post goes to the
	// static page that holds the form, since the site's other paths are answered by the server, not Netlify Forms.
	if (!dev) {
		try {
			const response = await fetch(`${origin}/booking-form.html`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					'form-name': 'booking',
					service: service.title,
					date,
					time: labels[slot],
					firstName,
					lastName,
					email,
					phone
				}).toString()
			});
			if (!response.ok) console.error('Netlify form notice failed', response.status);
		} catch (error) {
			console.error('Netlify form notice failed', error);
		}
	}

	const emailed =
		!!email &&
		(await sendConfirmation({
			to: email,
			firstName,
			service: service.title,
			date,
			time: labels[slot]
		}));

	return { status: 200, body: { ok: true, emailed } };
}
