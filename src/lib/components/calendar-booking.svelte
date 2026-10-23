<script module lang="ts">
	export type BookingService = {
		title: string;
		description?: string;
		/** Length of the visit as text, such as "30 min" or "1 hour". */
		duration?: string;
		/** Shown as the total on the confirmation. Free when left out. */
		price?: string;
	};

	export type Booking = {
		service: BookingService;
		date: Date;
		time: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	};

	export type BookingSteps = {
		service?: { title?: string; services?: BookingService[] };
		when?: {
			title?: string;
			dateLabel?: string;
			timeLabel?: string;
			/** How many days are offered, starting tomorrow. */
			days?: number;
			/** Weekdays that are listed but cannot be booked, such as `Sun`. */
			closedDays?: string[];
			/** The hour (0 to 23) the first time slot starts. */
			timeStart?: number;
			/** Length of each time slot, in hours. */
			timeLength?: number;
			/** How many time slots are offered. */
			timeSlots?: number;
		};
		details?: {
			title?: string;
			submitText?: string;
			sendingText?: string;
			showFirstName?: boolean;
			showLastName?: boolean;
			showEmail?: boolean;
			showPhone?: boolean;
		};
		done?: { title?: string; heading?: string; message?: string };
	};

	const defaultSteps = {
		service: { title: 'Pick a service', services: [] as BookingService[] },
		when: {
			title: 'Pick a date and time',
			dateLabel: 'Pick a date',
			timeLabel: 'Pick a time',
			days: 5,
			closedDays: defaultClosedDays,
			timeStart: 8,
			timeLength: 2,
			timeSlots: 5
		},
		details: {
			title: 'Your details',
			submitText: 'Book session',
			sendingText: 'Booking…',
			showFirstName: true,
			showLastName: true,
			showEmail: true,
			showPhone: true
		},
		done: {
			title: 'You’re all set',
			heading: 'Booking confirmed',
			message: 'Your appointment is scheduled.'
		}
	};

	export type CalendarBookingProps = {
		/** Text of the fixed button that opens the popover. */
		triggerText?: string;
		/** Look of the fixed button: `highlight` (green), `primary` (solid black) or `secondary` (outline). */
		triggerStyle?: 'highlight' | 'primary' | 'secondary';
		/** The copy of each step. Anything left out falls back to the default. */
		steps?: BookingSteps;
		/** The Netlify form name. */
		formName?: string;
		/** Called with the whole booking once the form has been sent. */
		onbook?: (booking: Booking) => void;
		/** Distance from the bottom and right edges, as a CSS length. */
		offset?: string;
		/** Walks through every step without sending anything, for the admin preview. */
		demo?: boolean;
		/** Renders the booking panel in place, always open, with no fixed button. */
		inline?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { magnet } from '$lib/attachments/magnet';
	import { recaptcha } from '$lib/attachments/recaptcha';
	import { textRoll } from '$lib/attachments/text-roll';
	import { onMount, untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { alerts } from '$lib/utils/alerts.svelte';
	import { defaultClosedDays, isoDate, slotLabels, weekdays } from '$lib/utils/booking-rules';
	import Button from './button.svelte';
	import Icon from './icon.svelte';
	import FormField from './form-field.svelte';

	let {
		triggerText = 'Book a session',
		triggerStyle = 'highlight',
		steps: stepCopy,
		formName = 'booking',
		onbook,
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
	const steps = 4;

	let open = $state(false);
	let step = $state(1);
	let service = $state<number | null>(null);
	let date = $state<number | null>(null);
	let time = $state<number | null>(null);
	let dates = $state<Date[]>([]);
	let sending = $state(false);
	let token = $state('');
	let taken = $state<Record<string, number[]>>({});
	let ticket = $state('');
	let email = $state('');
	let emailed = $state(false);
	let booked = $state<{ service?: BookingService; day?: Date; time?: string }>({});
	let name = $state('');
	let form = $state<HTMLFormElement>();
	let trigger = $state<HTMLElement>();
	let panel = $state<HTMLElement>();
	let body = $state<HTMLElement>();
	let lift = $state(0);
	let navOpen = $state(false);

	const siteKey = env.PUBLIC_RECAPTCHA_SITE_KEY;
	const shown = $derived(inline || open);
	const view = $derived(step <= 2 ? 'choose' : step === 3 ? 'details' : 'done');
	// An emptied field falls back to the default text.
	const fill = <T extends object>(base: T, over?: Partial<T>): T => ({
		...base,
		...Object.fromEntries(
			Object.entries(over ?? {}).filter(([, value]) => value !== '' && value != null)
		)
	});
	const copy = $derived({
		service: fill(defaultSteps.service, stepCopy?.service),
		when: fill(defaultSteps.when, stepCopy?.when),
		details: fill(defaultSteps.details, stepCopy?.details),
		done: fill(defaultSteps.done, stepCopy?.done)
	});
	const title = $derived(
		[copy.service.title, copy.when.title, copy.details.title, copy.done.title][step - 1] ?? ''
	);
	const services = $derived(copy.service.services);
	const days = $derived(copy.when.days);
	const closedDays = $derived(copy.when.closedDays);
	const times = $derived(
		slotLabels(copy.when.timeStart, copy.when.timeLength, copy.when.timeSlots)
	);
	const ready = $derived(
		step === 1
			? service !== null
			: step === 2
				? date !== null && time !== null
				: step === 3
					? demo || !siteKey || token !== ''
					: true
	);
	const timeOpen = $derived(view === 'choose' && step >= 2 && date !== null);
	const picked = $derived({
		service: service === null ? undefined : services[service],
		day: date === null ? undefined : dates[date],
		time: time === null ? undefined : times[time]
	});

	$effect(() => {
		const today = new Date();
		const list: Date[] = [];
		// Closed days are listed but not bookable, so they do not count toward the days offered.
		for (
			let ahead = 1;
			ahead <= 366 && list.filter((day) => !closed(day)).length < days;
			ahead += 1
		) {
			list.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() + ahead));
		}
		dates = list;
		untrack(() => {
			if (date !== null && date >= list.length) {
				date = null;
				time = null;
			}
		});
	});

	const closed = (day: Date) => closedDays.includes(weekdays[day.getDay()]);
	const slotTaken = (day: Date, index: number) => taken[isoDate(day)]?.includes(index) ?? false;
	const dayFull = (day: Date) => times.every((_, index) => slotTaken(day, index));
	const weekday = (day: Date) => day.toLocaleDateString(undefined, { weekday: 'short' });
	const month = (day: Date) => day.toLocaleDateString(undefined, { month: 'short' });
	const full = (day: Date) =>
		day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
	// A transition is skipped for visitors who prefer less motion.
	const ms = (value: number) =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
			? 0
			: value;

	// Picking on the current step moves on; picking on an earlier one (after Back) keeps the step.
	function pick(from: number) {
		if (step === from) step = from + 1;
	}

	async function loadAvailability() {
		if (demo) return;
		try {
			const response = await fetch('/api/availability', { cache: 'no-store' });
			if (!response.ok) return;
			const data = (await response.json()) as { taken: typeof taken; ticket: string };
			taken = data.taken;
			ticket = data.ticket;
			// A pick that was taken by someone else in the meantime is dropped.
			if (date !== null && time !== null && dates[date] && slotTaken(dates[date], time))
				time = null;
		} catch {
			// Without it every slot simply shows as open, and the server still decides.
		}
	}

	// Follows the bottom while the time group grows open, so the next step is in view.
	function followBottom() {
		const until = performance.now() + 500;
		const tick = () => {
			if (!body) return;
			body.scrollTop = body.scrollHeight;
			if (performance.now() < until) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}

	function back() {
		token = '';
		step = Math.max(1, step - 1);
	}

	function next() {
		if (!ready) return;
		if (step === 3) form?.requestSubmit();
		else step += 1;
	}

	function close() {
		open = false;
		step = 1;
		service = date = time = null;
		email = name = token = '';
		emailed = false;
		booked = {};
		trigger?.focus();
	}

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);

		sending = true;
		try {
			const text = (key: string) => String(data.get(key) ?? '').trim();
			if (demo) {
				email = text('email');
				name = `${text('firstName')} ${text('lastName')}`.trim();
				booked = { ...picked };
				emailed = false;
				step = 4;
				return;
			}
			const response = await fetch('/api/book', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					service: picked.service?.title,
					date: picked.day ? isoDate(picked.day) : '',
					slot: time,
					firstName: text('firstName'),
					lastName: text('lastName'),
					email: text('email'),
					phone: text('phone'),
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
			email = text('email');
			name = `${text('firstName')} ${text('lastName')}`.trim();
			onbook?.({
				service: picked.service!,
				date: picked.day!,
				time: picked.time!,
				firstName: text('firstName'),
				lastName: text('lastName'),
				email,
				phone: text('phone')
			});
			// Kept apart from the picks, which are cleared once the slot shows as taken.
			booked = { ...picked };
			step = 4;
			loadAvailability();
		} catch (error) {
			const code = error instanceof Error ? error.message : '';
			token = '';
			(window as unknown as { grecaptcha?: { reset: () => void } }).grecaptcha?.reset();

			// A slot someone else just took sends the visitor back to pick another.
			if (code === 'taken') {
				time = null;
				step = 2;
				loadAvailability();
			} else if (code === 'expired') {
				loadAvailability();
			}

			const messages: Record<string, [string, string]> = {
				taken: ['That time was just taken', 'Please pick another time.'],
				'rate-limit': ['Too many attempts', 'Please wait a while and try again.'],
				'too-fast': ['That was quick', 'Please check your details and try again.'],
				captcha: ['Please verify you’re human', 'The check did not pass. Try it again.'],
				expired: ['This took a while', 'Please try again.']
			};
			const [title, message] = messages[code] ?? [
				'Something went wrong',
				'Your booking was not sent. Please try again.'
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

	$effect(() => {
		if (timeOpen) followBottom();
	});

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
		if (shown) loadAvailability();
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
			aria-label="Book a session"
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
							textDescription="Close booking"
							onclick={close}
						/>
					{/if}
				</div>
				<div
					class="progress"
					role="progressbar"
					aria-label="Booking progress"
					aria-valuemin={1}
					aria-valuemax={steps}
					aria-valuenow={step}
					aria-valuetext="Step {step} of {steps}"
				>
					{#each [1, 2, 3, 4] as bar (bar)}
						<span class="bar" class:filled={bar <= step}><span class="fill"></span></span>
					{/each}
				</div>
			</header>

			<div class="body" bind:this={body} data-lenis-prevent>
				<div class="views">
					{#key view}
						<div
							class="view"
							class:choose={view === 'choose'}
							in:fade={{ duration: ms(220), delay: ms(140) }}
							out:fade={{ duration: ms(140) }}
						>
							{#if view === 'choose'}
								<fieldset class="services">
									<legend class="visually-hidden">Service</legend>
									{#each services as item, index (item.title)}
										<label class="card" class:selected={service === index}>
											<input
												class="visually-hidden"
												type="radio"
												name="{id}-service"
												value={index}
												bind:group={service}
												onchange={() => {
													pick(1);
													if (timeOpen) followBottom();
												}}
											/>
											<span class="card-top">
												<strong>{item.title}</strong>
												{#if item.duration}<span class="duration">{item.duration}</span>{/if}
											</span>
											{#if item.description}
												<span class="description">{item.description}</span>
											{/if}
										</label>
									{/each}
								</fieldset>

								<div class="reveal" class:open={step >= 2}>
									<div class="reveal-inner" inert={step < 2}>
										<fieldset>
											<legend>{copy.when.dateLabel}</legend>
											<div class="date-row">
												{#each dates as day, index (day.getTime())}
													<label
														class="date"
														class:selected={date === index}
														class:disabled={closed(day) || dayFull(day)}
													>
														<input
															class="visually-hidden"
															type="radio"
															name="{id}-date"
															value={index}
															bind:group={date}
															disabled={closed(day) || dayFull(day)}
															aria-label={full(day)}
														/>
														<span class="weekday">{weekday(day)}</span>
														<span class="day">{day.getDate()}</span>
														<span class="month">{month(day)}</span>
													</label>
												{/each}
											</div>
										</fieldset>
									</div>
								</div>

								<div class="reveal" class:open={step >= 2 && date !== null}>
									<div class="reveal-inner" inert={step < 2 || date === null}>
										<fieldset>
											<legend>{copy.when.timeLabel}</legend>
											<div class="time-row">
												{#each times as label, index (label)}
													{@const unavailable = date !== null && slotTaken(dates[date], index)}
													<label
														class="time"
														class:selected={time === index}
														class:disabled={unavailable}
													>
														<input
															class="visually-hidden"
															type="radio"
															name="{id}-time"
															value={index}
															bind:group={time}
															disabled={unavailable}
														/>
														{label}
													</label>
												{/each}
											</div>
										</fieldset>
									</div>
								</div>
							{:else if view === 'details'}
								<form bind:this={form} class="details" {onsubmit} name={formName} method="POST">
									<input type="hidden" name="form-name" value={formName} />
									<p class="visually-hidden" aria-hidden="true">
										<label>
											Leave this empty:
											<input name="bot-field" tabindex="-1" autocomplete="off" />
										</label>
									</p>
									<input type="hidden" name="service" value={picked.service?.title ?? ''} />
									<input type="hidden" name="date" value={picked.day ? isoDate(picked.day) : ''} />
									<input type="hidden" name="time" value={picked.time ?? ''} />

									<dl class="table">
										<div class="row">
											<dt>Service</dt>
											<dd>{picked.service?.title}</dd>
										</div>
										<div class="row">
											<dt>Date</dt>
											<dd>{picked.day ? full(picked.day) : ''}</dd>
										</div>
										<div class="row">
											<dt>Time</dt>
											<dd>{picked.time}</dd>
										</div>
									</dl>

									{#if copy.details.showFirstName || copy.details.showLastName}
										<div class="group">
											{#if copy.details.showFirstName}
												<FormField
													variant="outline"
													name="firstName"
													label="First name"
													autocomplete="given-name"
												/>
											{/if}
											{#if copy.details.showLastName}
												<FormField
													variant="outline"
													name="lastName"
													label="Last name"
													autocomplete="family-name"
												/>
											{/if}
										</div>
									{/if}
									{#if copy.details.showEmail}
										<FormField
											variant="outline"
											name="email"
											label="Email"
											type="email"
											autocomplete="email"
										/>
									{/if}
									{#if copy.details.showPhone}
										<FormField
											variant="outline"
											name="phone"
											label="Phone"
											type="tel"
											inputmode="numeric"
											autocomplete="tel"
										/>
									{/if}
									{#if siteKey && !demo}
										<div
											class="captcha"
											{@attach recaptcha({
												siteKey,
												onverify: (value) => (token = value),
												onexpire: () => (token = '')
											})}
										></div>
									{/if}
								</form>
							{:else}
								<div class="confirmation">
									<Icon name="check-circle" class="done-icon" />
									<div class="done-copy">
										<h3>{copy.done.heading}</h3>
										<p class="muted">{copy.done.message}</p>
									</div>

									<dl class="table">
										<div class="row">
											<dt>Service</dt>
											<dd>{booked.service?.title}</dd>
										</div>
										<div class="row">
											<dt>Date</dt>
											<dd>{booked.day ? full(booked.day) : ''}</dd>
										</div>
										<div class="row">
											<dt>Time</dt>
											<dd>{booked.time}</dd>
										</div>
										<div class="row">
											<dt>Total</dt>
											<dd>{booked.service?.price ?? 'Free'}</dd>
										</div>
									</dl>

									{#if name || email}
										<dl class="table">
											{#if name}
												<div class="row">
													<dt>Name</dt>
													<dd>{name}</dd>
												</div>
											{/if}
											{#if email}
												<div class="row">
													<dt>Email</dt>
													<dd>{email}</dd>
												</div>
											{/if}
										</dl>
									{/if}

									{#if email}
										<p class="muted">
											{#if emailed}
												A confirmation email has been sent to {email}.
											{:else}
												We’ll be in touch at {email} to confirm.
											{/if}
										</p>
									{/if}
								</div>
							{/if}
						</div>
					{/key}
				</div>
			</div>

			<footer>
				{#if step === 4}
					{#if !inline}<Button text="Close" onclick={close} />{/if}
				{:else}
					<span class="action" class:disabled={step === 1 || sending}>
						<Button text="Back" type="outline" disabled={step === 1 || sending} onclick={back} />
					</span>
					<span class="action" class:disabled={!ready || sending}>
						<Button
							text={step === 3
								? sending
									? copy.details.sendingText
									: copy.details.submitText
								: 'Continue'}
							disabled={!ready || sending}
							onclick={next}
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
				iconStart="icon-calendar"
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

	.bar {
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

	.body {
		padding: 4px 20px 20px;
		overflow-y: auto;
	}

	// Both views share one cell while one fades out and the other in.
	.views {
		display: grid;
	}

	.view {
		display: flex;
		flex-direction: column;
		gap: 16px;
		grid-area: 1 / 1;
		min-width: 0;
	}

	// The gap before a revealed group lives inside it, so a closed one leaves no empty space.
	.view.choose {
		gap: 0;
	}

	fieldset {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.services {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 14px 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				border-color 0.2s,
				background-color 0.2s;
		}

		&:hover {
			border-color: var(--color-text-muted);
		}

		&:has(:focus-visible) {
			outline: 2px solid var(--color-accent);
			outline-offset: 2px;
		}

		&.selected {
			border-color: var(--color-accent);
			background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		}
	}

	.card-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.duration {
		flex: none;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.description {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
	}

	.reveal {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;

		@include mixins.mq-motion-allow {
			transition:
				grid-template-rows 0.35s ease,
				opacity 0.35s ease;
		}

		&.open {
			grid-template-rows: 1fr;
			opacity: 1;
		}
	}

	.reveal-inner {
		min-height: 0;
		overflow: hidden;
		// Room for the focus ring, which the clipped row would otherwise cut off.
		margin-inline: -4px;
		margin-block-end: -4px;
		padding: 32px 4px 4px;
	}

	legend {
		margin-block-end: 10px;
		font-weight: 600;
	}

	.date-row {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
	}

	.time-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.time,
	.date {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 10px 4px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		cursor: pointer;

		@include mixins.mq-motion-allow {
			transition:
				border-color 0.2s,
				background-color 0.2s;
		}

		&:hover {
			border-color: var(--color-text-muted);
		}

		&.disabled {
			opacity: 0.4;
			cursor: not-allowed;

			&:hover {
				border-color: var(--color-border);
			}
		}

		&:has(:focus-visible) {
			outline: 2px solid var(--color-accent);
			outline-offset: 2px;
		}

		&.selected {
			border-color: var(--color-accent);
			background: var(--color-accent);
			color: var(--color-on-accent);
		}
	}

	.time {
		font-size: 0.9375rem;
		font-weight: 500;
		text-align: center;
		white-space: nowrap;
	}

	.weekday,
	.month {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.day {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.details {
		display: flex;
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

	.muted {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
	}

	// A disabled button ignores the pointer, so the cursor comes from this wrapper.
	.action {
		display: inline-flex;

		&.disabled {
			cursor: not-allowed;
		}
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

	.table {
		width: 100%;
		margin: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		text-align: start;
	}

	.details .table {
		margin-block: 16px;
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 16px;
		font-size: 16px;

		& + & {
			border-block-start: 1px solid var(--color-border);
		}

		dt {
			flex: none;
			color: var(--color-text-muted);
		}

		dd {
			margin: 0;
			min-width: 0;
			font-weight: 600;
			text-align: end;
			overflow-wrap: anywhere;
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
