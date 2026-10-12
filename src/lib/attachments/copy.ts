import type { Attachment } from 'svelte/attachments';
import { alerts, type AlertOptions } from '$lib/utils/alerts.svelte';

export type CopyOptions = {
	/** The text to copy, or a function that returns it. */
	text?: string | (() => string);
	/** Copy from another element instead: a selector or an element. Its `data-copy-value`, else its text. */
	target?: string | Element;
	/** What the element's label says right after copying. Without it the label does not change. */
	copiedText?: string;
	/** Milliseconds the copied state lasts. */
	copiedTime?: number;
	/** Show an alert when it is copied, using the Alert combo. */
	alert?: Omit<AlertOptions, 'type'> & { type?: AlertOptions['type'] };
	/** Called with the copied text. */
	onCopy?: (text: string) => void;
};

async function write(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Older browsers and non-secure pages have no clipboard API, so fall back to a hidden field.
		const field = document.createElement('textarea');
		field.value = text;
		field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
		document.body.append(field);
		field.select();
		const done = document.execCommand('copy');
		field.remove();
		return done;
	}
}

/** Copies a string to the clipboard when the element is clicked, and says so. */
export function copy({
	text,
	target,
	copiedText,
	copiedTime = 2000,
	alert,
	onCopy
}: CopyOptions): Attachment<HTMLElement> {
	return (el) => {
		const label = el.querySelector<HTMLElement>('.label') ?? el;
		const original = label.textContent;
		let timer: ReturnType<typeof setTimeout> | undefined;

		// Screen readers do not hear a label change, so a polite message says it too.
		const status = document.createElement('span');
		status.className = 'visually-hidden';
		status.setAttribute('role', 'status');
		el.append(status);

		const resolve = () => {
			if (typeof text === 'function') return text();
			if (text !== undefined) return text;
			const source = typeof target === 'string' ? document.querySelector(target) : target;
			const element = source as HTMLElement | null;
			return element?.dataset.copyValue ?? element?.innerText ?? element?.textContent ?? '';
		};

		const onClick = async () => {
			const value = resolve();
			if (!value || !(await write(value))) return;

			onCopy?.(value);
			el.dataset.copied = '';
			status.textContent = 'Copied to clipboard';
			if (copiedText) label.textContent = copiedText;
			if (alert) alerts.show({ type: 'success', ...alert });

			clearTimeout(timer);
			timer = setTimeout(() => {
				delete el.dataset.copied;
				status.textContent = '';
				label.textContent = original;
			}, copiedTime);
		};

		el.addEventListener('click', onClick);

		return () => {
			clearTimeout(timer);
			el.removeEventListener('click', onClick);
			status.remove();
			delete el.dataset.copied;
			label.textContent = original;
		};
	};
}
