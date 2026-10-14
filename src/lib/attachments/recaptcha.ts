import type { Attachment } from 'svelte/attachments';

export type RecaptchaOptions = {
	/** The reCAPTCHA v2 site key (the public one). */
	siteKey: string;
	/** Called with the response token once the visitor passes. */
	onverify: (token: string) => void;
	/** Called when the token runs out or the check fails, so the form can lock again. */
	onexpire?: () => void;
};

type Grecaptcha = {
	ready: (callback: () => void) => void;
	render: (node: HTMLElement, parameters: Record<string, unknown>) => number;
	reset: (widget?: number) => void;
};

let loading: Promise<Grecaptcha> | undefined;

function load(): Promise<Grecaptcha> {
	const win = window as unknown as { grecaptcha?: Grecaptcha };
	loading ??= new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
		script.async = true;
		script.onload = () => win.grecaptcha!.ready(() => resolve(win.grecaptcha!));
		script.onerror = () => {
			loading = undefined;
			reject(new Error('reCAPTCHA failed to load'));
		};
		document.head.append(script);
	});
	return loading;
}

/** Draws Google's "I'm not a robot" checkbox in the element. The response token is also added to the surrounding form as `g-recaptcha-response`. */
export const recaptcha =
	(options: RecaptchaOptions): Attachment<HTMLElement> =>
	(node) => {
		let gone = false;

		load()
			.then((grecaptcha) => {
				if (gone) return;
				const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
				grecaptcha.render(node, {
					sitekey: options.siteKey,
					theme,
					size: node.clientWidth < 304 ? 'compact' : 'normal',
					callback: options.onverify,
					'expired-callback': () => options.onexpire?.(),
					'error-callback': () => options.onexpire?.()
				});
			})
			.catch(() => options.onexpire?.());

		return () => {
			gone = true;
			node.replaceChildren();
		};
	};
