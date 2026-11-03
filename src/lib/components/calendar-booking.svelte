<script module lang="ts">
	export type BookingForm = {
		/** Contact details. */
		step1?: {
			title?: string;
			intro?: string;
			showFirstName?: boolean;
			showLastName?: boolean;
			showEmail?: boolean;
			showPhone?: boolean;
		};
		/** A few questions about what they need. */
		step2?: {
			title?: string;
			interestLabel?: string;
			/** The choices of the "what are you interested in" dropdown. */
			interests?: string[];
			contactLabel?: string;
			messageLabel?: string;
			privacyNote?: string;
			submitText?: string;
			sendingText?: string;
			showInterest?: boolean;
			showContactMethod?: boolean;
			showMessage?: boolean;
		};
		/** The screen shown once the request is sent. */
		step3?: { title?: string; heading?: string; message?: string };
	};

	const defaultStep1 = {
		title: 'Request a consultation',
		intro: 'Tell us a little about you and we’ll reach out to set up your initial consultation.',
		showFirstName: true,
		showLastName: true,
		showEmail: true,
		showPhone: true
	};

	const defaultStep2 = {
		title: 'A little more about you',
		interestLabel: 'What are you interested in?',
		interests: [] as string[],
		contactLabel: 'Best way to reach you',
		messageLabel: 'Anything you’d like us to know?',
		privacyNote: '',
		submitText: 'Send request',
		sendingText: 'Sending…',
		showInterest: true,
		showContactMethod: true,
		showMessage: true
	};

	const defaultStep3 = {
		title: 'Request sent',
		heading: 'Thank you',
		message: 'We received your request and will be in touch soon.'
	};

	const contactMethods = ['Phone call', 'Text message', 'Email'];

	export type CalendarBookingProps = {
		/** Text of the fixed button that opens the popover. */
		triggerText?: string;
		/** Look of the fixed button: `highlight` (green), `primary` (solid black) or `secondary` (outline). */
		triggerStyle?: 'highlight' | 'primary' | 'secondary';
		/** An SVG path starting with `/`, shown before the button text. Empty shows no icon. */
		triggerIcon?: string;
		/** The copy and fields of the form. Anything left out falls back to the default. */
		form?: BookingForm;
		/** The Netlify form name. */
		formName?: string;
		/** Distance from the bottom and right edges, as a CSS length. */
		offset?: string;
		/** Sends nothing and shows the confirmation, for the admin preview. */
		demo?: boolean;
		/** Renders the panel in place, always open, with no fixed button. */
		inline?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { magnet } from '$lib/attachments/magnet';
	import { recaptcha } from '$lib/attachments/recaptcha';
	import { textRoll } from '$lib/attachments/text-roll';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { alerts } from '$lib/utils/alerts.svelte';
	import Button from './button.svelte';
	import Icon from './icon.svelte';
	import FormField from './form-field.svelte';

	let {
		triggerText = 'Book a session',
		triggerStyle = 'highlight',
		triggerIcon,
		form: formCopy,
		formName = 'booking',
		offset = '24px',
		inline = false,
		demo = false,
		class: className
	}: CalendarBookingProps = $props();

	const pull = () =>
		magnet({
			x: 0.24,
			y: 0.64,
			returnDuration: 350,
			returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
		});

	const id = $props.id();

	let open = $state(false);
	let step = $state(1);
	let sent = $state(false);
	let sending = $state(false);
	let token = $state('');
	let ticket = $state('');
	let email = $state('');
	let emailed = $state(false);
	let form = $state<HTMLFormElement>();
	let trigger = $state<HTMLElement>();
	let panel = $state<HTMLElement>();
	let lift = $state(0);
	let navOpen = $state(false);

	const siteKey = env.PUBLIC_RECAPTCHA_SITE_KEY;
	const shown = $derived(inline || open);
	// An emptied field falls back to the default text.
	const fill = <T extends object>(base: T, over?: Partial<T>): T => ({
		...base,
		...Object.fromEntries(
			Object.entries(over ?? {}).filter(([, value]) => value !== '' && value != null)
		)
	});
	const one = $derived(fill(defaultStep1, formCopy?.step1));
	const two = $derived(fill(defaultStep2, formCopy?.step2));
	const done = $derived(fill(defaultStep3, formCopy?.step3));
	// Without an email the phone number is the only way to reach the visitor.
	const phoneRequired = $derived(!one.showEmail);
	const ready = $derived(step === 1 || demo || !siteKey || token !== '');
	const title = $derived(sent ? done.title : step === 1 ? one.title : two.title);
	const shownEmail = $derived(email || (demo ? '[email]' : ''));
	const current = $derived(sent ? 3 : step);
	// A transition is skipped for visitors who prefer less motion.
	const ms = (value: number) =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
			? 0
			: value;

	async function loadTicket() {
		if (demo) return;
		try {
			const response = await fetch('/api/book', { cache: 'no-store' });
			if (response.ok) ticket = ((await response.json()) as { ticket: string }).ticket;
		} catch {
			// Without it the server decides.
		}
	}

	function close() {
		open = false;
		step = 1;
		sent = false;
		email = token = '';
		emailed = false;
		trigger?.focus();
	}

	// The admin preview jumps straight to any step.
	function goTo(target: number) {
		if (target === 3) {
			email = String(new FormData(form).get('email') ?? '').trim();
			emailed = false;
			sent = true;
			return;
		}
		sent = false;
		step = target;
	}

	function back() {
		token = '';
		step = 1;
	}

	function next() {
		const fields = form?.querySelectorAll<HTMLInputElement>('.step-one input');
		for (const field of fields ?? []) if (!field.reportValidity()) return;
		step = 2;
	}

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		if (step === 1) return next();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		const text = (key: string) => String(data.get(key) ?? '').trim();

		sending = true;
		try {
			if (!demo) {
				const response = await fetch('/api/book', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						firstName: text('firstName'),
						lastName: text('lastName'),
						email: text('email'),
						phone: text('phone'),
						interest: text('interest'),
						contactMethod: text('contactMethod'),
						message: text('message'),
						botField: text('bot-field'),
						captcha: text('g-recaptcha-response'),
						ticket
					})
				});

				if (!response.ok) {
					const { error } = (await response.json().catch(() => ({}))) as { error?: string };
					throw new Error(error ?? String(response.status));
				}

				emailed =
					((await response.json().catch(() => ({}))) as { emailed?: boolean }).emailed === true;
			}
			email = text('email');
			sent = true;
		} catch (error) {
			const code = error instanceof Error ? error.message : '';
			token = '';
			(window as unknown as { grecaptcha?: { reset: () => void } }).grecaptcha?.reset();

			if (code === 'expired') loadTicket();

			const messages: Record<string, [string, string]> = {
				'rate-limit': ['Too many attempts', 'Please wait a while and try again.'],
				'too-fast': ['That was quick', 'Please check your details and try again.'],
				expired: ['This took a while', 'Please try again.'],
				captcha: ['Please verify you’re human', 'The check did not pass. Try it again.'],
				invalid: ['Please check your details', 'Something in the form needs another look.']
			};
			const [title, message] = messages[code] ?? [
				'Something went wrong',
				'Your request was not sent. Please try again.'
			];
			alerts.show({ type: 'error', title, message, autoClose: 8000, timer: true });
		} finally {
			sending = false;
		}
	}

	// Stops the button at the bottom of the footer's top block, so it never covers the legal links below it.
	const footerSink = 24;
	let frame = 0;
	function updateLift() {
		if (inline || frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			const footer = document.querySelector('.site > footer');
			if (!footer || getComputedStyle(footer).position === 'fixed') {
				lift = 0;
				return;
			}
			const stop = footer.querySelector('.top') ?? footer;
			const edge =
				stop === footer ? stop.getBoundingClientRect().top : stop.getBoundingClientRect().bottom;
			lift = Math.max(0, Math.round(window.innerHeight - edge) - footerSink);
		});
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !inline && open) close();
	}

	onMount(() => {
		updateLift();

		// The header marks itself while its navigation is open; this only reads that mark.
		const sync = () => {
			const next = document.querySelector('[data-nav-open]') !== null;
			if (next === navOpen) return;
			navOpen = next;
		};
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(document.body, {
			subtree: true,
			attributes: true,
			attributeFilter: ['data-nav-open']
		});
		return () => observer.disconnect();
	});

	$effect(() => {
		if (shown) loadTicket();
	});

	$effect(() => {
		if (open && !inline) panel?.focus();
	});
</script>

<svelte:window {onkeydown} onscroll={updateLift} onresize={updateLift} />

<div
	class="calendar-booking {className ?? ''}"
	class:inline
	style="--offset: {offset}; --lift: {lift}px"
>
	{#if shown}
		<div
			bind:this={panel}
			class="panel"
			id="{id}-panel"
			role={inline ? 'group' : 'dialog'}
			aria-label={one.title}
			tabindex="-1"
			in:fly={{ y: 12, duration: inline ? 0 : ms(250) }}
			out:fly={{ y: 12, duration: inline ? 0 : ms(200) }}
		>
			<header>
				<div class="head">
					<h2 class="title" aria-live="polite">{title}</h2>
					{#if !inline}
						<Button
							class="close"
							type="text"
							iconStart="x-lg"
							textDescription="Close"
							onclick={close}
						/>
					{/if}
				</div>
				<div
					class="progress"
					role="progressbar"
					aria-label="Progress"
					aria-valuemin={1}
					aria-valuemax={3}
					aria-valuenow={current}
					aria-valuetext="Step {current} of 3"
				>
					{#snippet bar(index: number)}
						<span class="bar" class:filled={index <= current}><span class="fill"></span></span>
					{/snippet}
					{#each [1, 2, 3] as index (index)}
						{#if demo}
							<button
								type="button"
								class="hit"
								aria-label="Show step {index}"
								aria-current={index === current ? 'step' : undefined}
								onclick={() => goTo(index)}
							>
								{@render bar(index)}
							</button>
						{:else}
							{@render bar(index)}
						{/if}
					{/each}
				</div>
			</header>

			<div class="body" data-lenis-prevent>
				<form
					bind:this={form}
					class="details"
					hidden={sent}
					{onsubmit}
					name={formName}
					method="POST"
				>
					<input type="hidden" name="form-name" value={formName} />
					<p class="visually-hidden" aria-hidden="true">
						<label>
							Leave this empty:
							<input name="bot-field" tabindex="-1" autocomplete="off" />
						</label>
					</p>

					<div class="step step-one" hidden={step !== 1}>
						{#if one.intro}<p class="intro">{one.intro}</p>{/if}

						{#if one.showFirstName || one.showLastName}
							<div class="group">
								{#if one.showFirstName}
									<FormField
										variant="outline"
										name="firstName"
										label="First name"
										autocomplete="given-name"
									/>
								{/if}
								{#if one.showLastName}
									<FormField
										variant="outline"
										name="lastName"
										label="Last name"
										autocomplete="family-name"
										required={false}
									/>
								{/if}
							</div>
						{/if}
						{#if one.showEmail}
							<FormField
								variant="outline"
								name="email"
								label="Email"
								type="email"
								autocomplete="email"
							/>
						{/if}
						{#if one.showPhone}
							<FormField
								variant="outline"
								name="phone"
								label="Phone"
								type="tel"
								inputmode="numeric"
								autocomplete="tel"
								required={phoneRequired}
							/>
						{/if}
					</div>
					<div class="step" hidden={step !== 2}>
						{#if two.showInterest && two.interests.length}
							<FormField
								variant="outline"
								name="interest"
								label={two.interestLabel}
								type="select"
								options={two.interests}
								required={false}
							/>
						{/if}
						{#if two.showContactMethod}
							<FormField
								variant="outline"
								name="contactMethod"
								label={two.contactLabel}
								type="select"
								options={contactMethods}
								required={false}
							/>
						{/if}
						{#if two.showMessage}
							<FormField
								variant="outline"
								name="message"
								label={two.messageLabel}
								type="textarea"
								maxLength={1000}
								required={false}
							/>
						{/if}
						{#if two.privacyNote}
							<p class="note">
								<Icon name="info-circle" />
								<span>{two.privacyNote}</span>
							</p>
						{/if}
						{#if siteKey && !demo && step === 2}
							<div
								class="captcha"
								{@attach recaptcha({
									siteKey,
									onverify: (value) => (token = value),
									onexpire: () => (token = '')
								})}
							></div>
						{/if}
					</div>
				</form>
				{#if sent}
					<div class="confirmation" in:fade={{ duration: ms(220) }}>
						<Icon name="check-circle" class="done-icon" />
						<div class="done-copy">
							<h3>{done.heading}</h3>
							<p class="muted">{done.message}</p>
						</div>
						{#if shownEmail}
							<p class="muted">
								{#if emailed}
									A confirmation email has been sent to {shownEmail}.
								{:else}
									We’ll be in touch at {shownEmail}.
								{/if}
							</p>
						{/if}
					</div>
				{/if}
			</div>

			<footer>
				{#if sent}
					{#if !inline}<Button text="Close" onclick={close} />{/if}
				{:else}
					{#if step === 2}
						<span class="action" class:disabled={sending}>
							<Button text="Back" type="outline" disabled={sending} onclick={back} />
						</span>
					{/if}
					<span class="action" class:disabled={!ready || sending}>
						<Button
							text={step === 1 ? 'Continue' : sending ? two.sendingText : two.submitText}
							disabled={!ready || sending}
							onclick={() => (step === 1 ? next() : form?.requestSubmit())}
						/>
					</span>
				{/if}
			</footer>
		</div>
	{/if}

	{#if !inline}
		<div
			class="trigger {triggerStyle}"
			class:nudged={navOpen}
			class:parked={lift > 0}
			bind:this={trigger}
		>
			<Button
				text={triggerText}
				type={triggerStyle === 'secondary' ? 'outline' : 'solid'}
				iconStart={triggerIcon || undefined}
				controls="{id}-panel"
				expanded={open}
				onclick={() => (open = !open)}
				{@attach textRoll()}
				{@attach pull()}
			/>
		</div>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.calendar-booking:not(.inline) {
		position: fixed;
		bottom: calc(var(--offset) + var(--lift, 0px));
		// The content's edge, not the screen's, so it stays lined up on an ultra-wide monitor.
		@include mixins.right-spacing;
		z-index: var(--z-booking, 5);
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 12px;
		max-width: calc(100vw - var(--body-padding) * 2);
	}

	.trigger {
		--btn-gap: 12px;

		&.highlight {
			--btn-bg: var(--color-accent);
			--btn-text: var(--color-on-accent);

			:global(.button) {
				@include mixins.desktop-hover {
					border-color: var(--color-on-accent);
				}
			}
		}

		@include mixins.mq-motion-allow {
			transition: translate 0.6s var(--ease);
		}

		// Below 768px, at the footer the button tucks over to the page's left edge, inside the footer's top block.
		&.parked {
			@include mixins.max-md {
				translate: calc(-100vw + var(--body-padding) * 2 + 100%) 0;
			}
		}

		// While the navigation is open the button drops back to its own corner (cancelling the footer lift), and
		// below 768px it also slides across to line up with the navigation's left content (its social links and
		// buttons). It returns once the navigation has closed, to the footer if the page is scrolled there.
		&.nudged {
			translate: 0 var(--lift, 0px);

			@include mixins.max-md {
				// The panel is 88vw wide (to 640px) and keeps 24px of its own side padding, which is wider than
				// the page's on small screens.
				translate: calc(-1 * min(88vw, 640px) + 24px + var(--body-padding) + 100%) var(--lift, 0px);
			}

			@include mixins.mq-motion-allow {
				transition-delay: 0.15s;
			}
		}
	}

	.panel {
		display: flex;
		flex-direction: column;
		width: min(380px, calc(100vw - var(--body-padding) * 2));
		max-height: min(640px, calc(100svh - var(--offset) * 2 - var(--lift, 0px) - 72px));
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
		box-shadow: var(--box-shadow);

		&:focus {
			outline: none;
		}
	}

	.inline .panel {
		width: 100%;
		max-height: none;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px 16px 12px 20px;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.5px;
	}

	.panel :global(.close) {
		--btn-padding-icon: 4px;

		color: var(--color-text);
	}

	.progress {
		display: flex;
		gap: 6px;
		padding-inline-end: 4px;
	}

	.hit {
		flex: 1;
		margin-block: -8px;
		padding-block: 8px;
		border: 0;
		background: none;
		cursor: pointer;

		&:focus-visible {
			outline: 2px solid var(--color-accent);
			outline-offset: 2px;
		}
	}

	.bar {
		display: block;
		flex: 1;
		height: 4px;
		overflow: hidden;
		border-radius: 2px;
		background: var(--color-border);
	}

	.fill {
		display: block;
		width: 0;
		height: 100%;
		background: var(--color-on-accent);

		@include mixins.mq-motion-allow {
			transition: width 0.8s var(--ease);
		}

		.filled > & {
			width: 100%;
		}
	}

	.step {
		display: flex;
		flex-direction: column;
		gap: 16px;

		&[hidden] {
			display: none;
		}
	}

	.body {
		padding: 8px 20px 20px;
		overflow-y: auto;
	}

	.details {
		display: flex;

		&[hidden] {
			display: none;
		}

		flex-direction: column;
		gap: 16px;
		// The floated label cuts the border with the popover's own background.
		--field-label-bg: var(--color-surface);

		font-size: 16px;
	}

	.captcha {
		display: flex;
		justify-content: center;
		min-height: 78px;
	}

	.group {
		display: flex;
		gap: 12px;
	}

	.intro {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
	}

	.note {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.note :global(.icon) {
		margin-block-start: 0.2em;
	}

	.muted {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
	}

	.confirmation {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding-block: 24px 8px;
		text-align: center;
	}

	.confirmation :global(.done-icon) {
		--icon-size: 56px;

		background: var(--color-accent);
	}

	.done-copy {
		display: flex;
		flex-direction: column;
		gap: 6px;

		h3 {
			font-size: 1.375rem;
			font-weight: 600;
			letter-spacing: -0.5px;
		}
	}

	// A disabled button ignores the pointer, so the cursor comes from this wrapper.
	.action {
		display: inline-flex;

		&:only-child {
			margin-inline-start: auto;
		}

		&.disabled {
			cursor: not-allowed;
		}
	}

	footer {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 20px;
		border-block-start: 1px solid var(--color-border);
	}
</style>
