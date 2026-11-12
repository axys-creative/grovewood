// One-time helper: bun run google-auth. Prints the refresh token, account ID and location ID.
import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/oauth2callback';
const scope = 'https://www.googleapis.com/auth/business.manage';

if (!clientId || !clientSecret) {
	console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.');
	process.exit(1);
}

const redirect = new URL(redirectUri);
const state = randomBytes(16).toString('hex');
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
	client_id: clientId,
	redirect_uri: redirectUri,
	response_type: 'code',
	scope,
	access_type: 'offline',
	prompt: 'consent',
	state
})}`;

const page = (message: string) =>
	`<!doctype html><meta charset="utf-8"><title>Google auth</title><p style="font:16px system-ui;padding:2rem">${message}</p>`;

const server = createServer(async (request, response) => {
	const url = new URL(request.url ?? '/', redirect.origin);
	if (url.pathname !== redirect.pathname) {
		response.writeHead(404).end();
		return;
	}
	const code = url.searchParams.get('code');
	if (url.searchParams.get('state') !== state || !code) {
		response.writeHead(400, { 'Content-Type': 'text/html' }).end(page('Authorization failed.'));
		console.error('Authorization failed:', url.searchParams.get('error') ?? 'state mismatch');
		server.close();
		process.exitCode = 1;
		return;
	}
	response
		.writeHead(200, { 'Content-Type': 'text/html' })
		.end(page('Done. Return to the terminal.'));
	server.close();
	try {
		await finish(code);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	}
});

async function api<T>(url: string, token: string): Promise<T> {
	const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	const body = await response.json().catch(() => ({}));
	if (!response.ok) {
		const message = (body as { error?: { message?: string } }).error?.message ?? 'no details';
		throw new Error(`${response.status} from ${new URL(url).host}: ${message}`);
	}
	return body as T;
}

async function finish(code: string) {
	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: clientId!,
			client_secret: clientSecret!,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		})
	});
	const tokens = (await response.json()) as {
		access_token?: string;
		refresh_token?: string;
		error?: string;
	};
	if (!response.ok || !tokens.access_token)
		throw new Error(`Token exchange failed: ${tokens.error ?? response.status}`);

	if (tokens.refresh_token) console.log(`\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
	else
		console.warn(
			'\nNo refresh token returned. Remove the app at myaccount.google.com/permissions and run again.\n'
		);

	const { accounts = [] } = await api<{ accounts?: { name: string; accountName?: string }[] }>(
		'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
		tokens.access_token
	);
	if (!accounts.length) console.log('No accounts found for this Google login.');

	for (const account of accounts) {
		const accountId = account.name.replace('accounts/', '');
		console.log(`Account: ${account.accountName ?? '(unnamed)'}  GBP_ACCOUNT_ID=${accountId}`);
		let pageToken = '';
		do {
			const query = new URLSearchParams({ readMask: 'name,title', pageSize: '100' });
			if (pageToken) query.set('pageToken', pageToken);
			const result = await api<{
				locations?: { name: string; title?: string }[];
				nextPageToken?: string;
			}>(
				`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?${query}`,
				tokens.access_token
			);
			for (const location of result.locations ?? []) {
				const locationId = location.name.replace('locations/', '');
				const match = /grovewood/i.test(location.title ?? '') ? '  <-- Grovewood' : '';
				console.log(`  ${location.title ?? '(untitled)'}  GBP_LOCATION_ID=${locationId}${match}`);
			}
			pageToken = result.nextPageToken ?? '';
		} while (pageToken);
	}
}

server.listen(Number(redirect.port) || 80, () => {
	console.log('Opening Google sign-in. If nothing opens, visit:\n' + authUrl + '\n');
	exec(`open "${authUrl}"`);
});
