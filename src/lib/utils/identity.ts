const WIDGET_SRC = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
const TOKEN_PATTERN = /(confirmation|invite|recovery|email_change|access)_token=/;

export type NetlifyIdentity = {
	init: () => void;
	on: (event: string, callback: () => void) => void;
};

type IdentityWindow = { netlifyIdentity?: NetlifyIdentity };

export const hasIdentityToken = () => TOKEN_PATTERN.test(location.hash);

export function loadIdentity(): Promise<NetlifyIdentity> {
	const win = window as IdentityWindow;
	if (win.netlifyIdentity) return Promise.resolve(win.netlifyIdentity);

	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = WIDGET_SRC;
		script.onload = () => resolve(win.netlifyIdentity!);
		script.onerror = () => reject(new Error('Netlify Identity failed to load'));
		document.head.append(script);
	});
}
