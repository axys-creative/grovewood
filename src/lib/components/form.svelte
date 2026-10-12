<script module lang="ts">
	export type FormProps = {
		/** Shows success and warning alerts on submit instead of going to another page. */
		feedback?: boolean;
		/** The look of every field: a line under it, or a full border. */
		variant?: 'underline' | 'outline';
		/** The Netlify form name. */
		name?: string;
		/** The page to go to after submitting. Not used with `feedback`. */
		action?: string;
		showPhone?: boolean;
		showAddress?: boolean;
		showMessage?: boolean;
		/** A "how did you hear about us" textarea. */
		showDiscovery?: boolean;
		/** Character limit of the discovery textarea. */
		maxCountDiscovery?: number;
		/** Netlify's reCAPTCHA widget. */
		showRecaptcha?: boolean;
		submitText?: string;
		/** The submit button's accessible name. */
		submitLabel?: string;
		successTitle?: string;
		successMessage?: string;
		errorTitle?: string;
		errorMessage?: string;
		/** Shown when an email that was already used submits again. */
		duplicateMessage?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { magnet } from '$lib/attachments/magnet';
	import { alerts } from '$lib/utils/alerts.svelte';
	import Button from './button.svelte';
	import FormField from './form-field.svelte';

	const STORAGE_KEY = 'submittedEmails';

	let {
		feedback = false,
		variant = 'underline',
		name = feedback ? 'form-feedback' : 'form-redirect',
		action = '/form-submit',
		showPhone = false,
		showAddress = false,
		showMessage = false,
		showDiscovery = false,
		maxCountDiscovery,
		showRecaptcha = false,
		submitText = feedback ? 'Send message' : 'Submit',
		submitLabel,
		successTitle = 'Message received!',
		successMessage = 'We’ll get back to you shortly.',
		errorTitle = 'Something went wrong',
		errorMessage = 'Please try again.',
		duplicateMessage = 'This email has already been submitted.',
		class: className
	}: FormProps = $props();

	let sending = $state(false);

	const used = (): string[] => {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		} catch {
			return [];
		}
	};

	async function onsubmit(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		// A real redirect-form submit goes to Netlify and on to `action`. Locally nothing receives it.
		if (!feedback) {
			if (dev) {
				event.preventDefault();
				goto(action);
			}
			return;
		}

		event.preventDefault();

		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		if (used().includes(email)) {
			alerts.show({
				type: 'warning',
				title: 'Already submitted',
				message: duplicateMessage,
				autoClose: 8000,
				timer: true
			});
			return;
		}

		sending = true;
		try {
			// Netlify only receives the form in production, so locally the send is skipped.
			if (!dev) {
				const response = await fetch('/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams(data as unknown as Record<string, string>).toString()
				});
				if (!response.ok) throw new Error(String(response.status));
			}

			localStorage.setItem(STORAGE_KEY, JSON.stringify([...used(), email]));
			alerts.show({
				type: 'success',
				title: successTitle,
				message: successMessage,
				autoClose: 8000,
				timer: true
			});
			form.reset();
		} catch {
			alerts.show({
				type: 'error',
				title: errorTitle,
				message: errorMessage,
				autoClose: 8000,
				timer: true
			});
		} finally {
			sending = false;
		}
	}
</script>

<form
	class="form {className ?? ''}"
	{name}
	method="POST"
	action={feedback ? undefined : action}
	data-netlify="true"
	data-netlify-honeypot="bot-field"
	{onsubmit}
>
	<input type="hidden" name="form-name" value={name} />
	<p class="visually-hidden" aria-hidden="true">
		<label>Leave this empty: <input name="bot-field" tabindex="-1" autocomplete="off" /></label>
	</p>

	<FormField {variant} name="name" label="Name" autocomplete="name" />

	<div class="group">
		<FormField {variant} name="email" label="Email" type="email" autocomplete="email" />
		{#if showPhone}
			<FormField
				{variant}
				name="phone"
				label="Phone"
				type="tel"
				inputmode="numeric"
				autocomplete="tel"
			/>
		{/if}
	</div>

	{#if showAddress}
		<FormField {variant} name="city" label="City" autocomplete="address-level2" />
		<div class="group">
			<FormField {variant} name="state" label="State" autocomplete="address-level1" />
			<FormField
				name="zip"
				label="Zip"
				type="number"
				inputmode="numeric"
				autocomplete="postal-code"
			/>
		</div>
	{/if}

	{#if showMessage}
		<FormField {variant} name="message" label="Message" type="textarea" maxLength={250} />
	{/if}

	{#if showDiscovery}
		<FormField
			{variant}
			name="discovery"
			label="How did you hear about us?"
			type="textarea"
			maxLength={maxCountDiscovery}
		/>
	{/if}

	{#if showRecaptcha}<div data-netlify-recaptcha="true" class="recaptcha"></div>{/if}

	<div class="footer">
		<Button
			text={sending ? 'Sending…' : submitText}
			textDescription={submitLabel}
			htmlType="submit"
			disabled={sending}
			{@attach magnet({ x: 0.5, y: 1 })}
		/>
	</div>
</form>

<style lang="scss">
	@use 'base/mixins';

	.form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2em;
		width: 100%;
		margin-inline: auto;
	}

	.group {
		display: flex;
		gap: 12px;
		width: 100%;
	}

	.recaptcha {
		width: 304px;
		height: 78px;

		@include mixins.max-sm {
			scale: 0.8;
		}
	}

	.footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		width: 100%;
	}
</style>
