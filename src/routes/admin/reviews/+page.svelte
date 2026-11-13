<script lang="ts">
	import { onMount } from 'svelte';
	import site from '$lib/content/meta/site.json';
	import StarRating from '$lib/components/star-rating.svelte';
	import type { AdminReviews } from '$lib/google-reviews/types';
	import { loadIdentity } from '$lib/utils/identity';

	let data = $state<AdminReviews>();
	let approved = $state<string[]>([]);
	let ready = $state(false);
	let message = $state('');
	let syncing = $state(false);
	let rating = $state('all');
	let status = $state('all');
	let query = $state('');

	let getToken: () => Promise<string | null> = async () => null;

	async function request(path: string, init: RequestInit = {}) {
		const token = await getToken();
		const response = await fetch(path, {
			...init,
			headers: {
				...(init.body ? { 'Content-Type': 'application/json' } : {}),
				...(token ? { Authorization: `Bearer ${token}` } : {})
			}
		});
		const body = await response.json().catch(() => ({}));
		if (!response.ok)
			throw new Error(body.message ?? body.error ?? `Request failed (${response.status})`);
		return body;
	}

	async function load() {
		try {
			data = (await request('/api/reviews')) as AdminReviews;
			approved = data.approvedIds;
			ready = true;
		} catch (error) {
			message = error instanceof Error ? error.message : 'Could not load reviews';
		}
	}

	async function toggle(reviewId: string) {
		const next = !approved.includes(reviewId);
		const before = approved;
		approved = next ? [...approved, reviewId] : approved.filter((id) => id !== reviewId);
		try {
			const result = await request('/api/reviews', {
				method: 'POST',
				body: JSON.stringify({ reviewId, approved: next })
			});
			approved = result.approvedIds as string[];
			message = '';
		} catch (error) {
			approved = before;
			message = error instanceof Error ? error.message : 'Could not save';
		}
	}

	async function sync() {
		syncing = true;
		message = '';
		try {
			const result = await request('/api/reviews/sync', { method: 'POST' });
			message = result.message;
			await load();
		} catch (error) {
			message = error instanceof Error ? error.message : 'Sync failed';
		} finally {
			syncing = false;
		}
	}

	const shown = $derived(
		(data?.reviews ?? [])
			.filter((review) => rating === 'all' || review.rating === Number(rating))
			.filter((review) => {
				if (status === 'approved') return approved.includes(review.reviewId);
				if (status === 'hidden') return !approved.includes(review.reviewId);
				return true;
			})
			.filter((review) =>
				`${review.displayName} ${review.comment}`.toLowerCase().includes(query.trim().toLowerCase())
			)
			.sort((a, b) => b.createTime.localeCompare(a.createTime))
	);

	const fullDate = (value: string) =>
		value ? new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '';

	onMount(() => {
		if (import.meta.env.DEV) {
			load();
			return;
		}
		loadIdentity().then((identity) => {
			const start = () => {
				const user = identity.currentUser();
				if (!user) return false;
				getToken = () => user.jwt();
				load();
				return true;
			};
			identity.init();
			identity.on('login', () => {
				start();
				identity.close?.();
			});
			if (!start()) identity.open('login');
		});
	});
</script>

<svelte:head>
	<title>Google reviews | Admin | {site.siteName}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="bar">
	<a class="back" href="/admin/">← Back to the editor</a>
	<a class="brand" href="/admin/" aria-label="Back to the editor">
		<img src="/images/admin/admin-logo-black.svg" alt="" />
	</a>
</div>

<main>
	<header>
		<h1>
			<img src="/images/admin/icon-google.svg" alt="" width="28" height="28" />
			Google reviews
		</h1>
		<p class="lead">
			Only reviews switched on here appear on the home page, and only those with a message. Changes
			show within a minute or two.
		</p>
		<div class="actions">
			<button type="button" class="primary" onclick={sync} disabled={syncing || !ready}>
				{syncing ? 'Syncing…' : 'Sync now'}
			</button>
			{#if data}
				<p class="meta">
					{#if data.source === 'mock'}Showing sample reviews. Nothing has synced from Google yet.
					{:else if data.source === 'none'}Nothing has synced from Google yet.
					{:else}Last synced {new Date(data.syncedAt).toLocaleString('en-US')}.{/if}
					<strong>{approved.length} switched on.</strong>
				</p>
			{/if}
		</div>
		<p class="message" role="status">{message}</p>
	</header>

	{#if ready && data}
		<form class="filters" onsubmit={(event) => event.preventDefault()}>
			<label>
				Search
				<input type="search" bind:value={query} placeholder="Name or message" />
			</label>
			<label>
				Rating
				<select bind:value={rating}>
					<option value="all">All</option>
					{#each [5, 4, 3, 2, 1] as value (value)}
						<option value={String(value)}>{value} {value === 1 ? 'star' : 'stars'}</option>
					{/each}
				</select>
			</label>
			<label>
				Status
				<select bind:value={status}>
					<option value="all">All</option>
					<option value="approved">Switched on</option>
					<option value="hidden">Hidden</option>
				</select>
			</label>
		</form>

		<p class="count" role="status">Showing {shown.length} of {data.reviews.length}</p>

		<ul>
			{#each shown as review (review.reviewId)}
				<li class:on={approved.includes(review.reviewId)}>
					<div class="body">
						<div class="top">
							<StarRating rating={review.rating} label="Rated {review.rating} out of 5 stars" />
							<span class="who">{review.displayName}</span>
							<time datetime={review.createTime}>{fullDate(review.createTime)}</time>
						</div>
						{#if review.comment}
							<p>{review.comment}</p>
						{:else}
							<p class="empty">No message, so it can’t be shown.</p>
						{/if}
					</div>
					<button
						type="button"
						role="switch"
						class="switch"
						aria-checked={approved.includes(review.reviewId)}
						aria-label="Show review by {review.displayName} on the site"
						disabled={!review.comment}
						onclick={() => toggle(review.reviewId)}
					></button>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style lang="scss">
	$text: #313d3e;
	$muted: #798291;
	$border: #dfdfe3;
	$blue: #3a69c7;
	$page: #eff0f4;

	:global(body) {
		margin: 0;
		background: $page;
		color: $text;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		line-height: 1.5;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		height: 3.5rem;
		padding-inline: 1.25rem;
		border-bottom: 1px solid $border;
		background: #fff;
	}

	.brand img {
		display: block;
		height: 1.75rem;
		width: auto;
	}

	.back {
		color: $text;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;

		&:hover {
			color: $blue;
		}
	}

	main {
		max-width: 56rem;
		margin-inline: auto;
		padding: 2rem 1.25rem 4rem;
	}

	h1 {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		font-weight: 400;
		letter-spacing: -0.5px;
	}

	p {
		margin: 0.5rem 0;
	}

	.lead {
		max-width: 40rem;
		color: $muted;
	}

	.meta,
	.count,
	time,
	.empty {
		font-size: 0.875rem;
		color: $muted;
	}

	.meta {
		margin: 0;

		strong {
			color: $text;
			font-weight: 600;
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
		margin-top: 1rem;
	}

	.message {
		min-height: 1.5rem;
		font-size: 0.875rem;
	}

	button,
	input,
	select {
		font: inherit;
	}

	.primary {
		height: 2.25rem;
		padding: 0 1rem;
		border: 0;
		border-radius: 5px;
		background: $blue;
		color: #fff;
		font-weight: 500;
		cursor: pointer;

		&:hover:not(:disabled) {
			background: color-mix(in srgb, $blue 85%, #000);
		}

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-block: 1.5rem 0.5rem;
		padding: 1rem 1.25rem;
		border: 1px solid $border;
		border-radius: 5px;
		background: #fff;

		label {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			font-size: 0.75rem;
			font-weight: 500;
			text-transform: uppercase;
			letter-spacing: 0.02em;
			color: $muted;
		}

		input,
		select {
			min-width: 10rem;
			height: 2.25rem;
			padding: 0 0.75rem;
			border: 1px solid $border;
			border-radius: 5px;
			background: #fff;
			color: $text;
			font-size: 0.875rem;
			text-transform: none;
			letter-spacing: 0;

			&:focus-visible {
				outline: 2px solid $blue;
				outline-offset: 1px;
			}
		}

		select {
			appearance: none;
			padding-inline-end: 2.25rem;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23798291' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: right 0.75rem center;
			background-size: 1rem;
		}
	}

	ul {
		display: grid;
		gap: 0.75rem;
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1rem 1.25rem;
		border: 1px solid $border;
		border-left: 4px solid $border;
		border-radius: 5px;
		background: #fff;
		box-shadow:
			0 2px 6px 0 rgba(68, 74, 87, 0.05),
			0 1px 3px 0 rgba(68, 74, 87, 0.1);

		&.on {
			border-left-color: $blue;
		}
	}

	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.75rem;

		:global(.stars) {
			--star-size: 1rem;
		}
	}

	.who {
		font-weight: 600;
	}

	.body p:not(.empty) {
		white-space: pre-line;
	}

	.switch {
		position: relative;
		flex: none;
		width: 3rem;
		height: 1.75rem;
		border: 0;
		border-radius: 1rem;
		background: #c9ccd3;
		cursor: pointer;
		transition: background 0.15s;

		&::after {
			content: '';
			position: absolute;
			top: 0.25rem;
			left: 0.25rem;
			width: 1.25rem;
			height: 1.25rem;
			border-radius: 50%;
			background: #fff;
			transition: translate 0.15s;
		}

		@media (prefers-reduced-motion: reduce) {
			transition: none;

			&::after {
				transition: none;
			}
		}

		&[aria-checked='true'] {
			background: $blue;

			&::after {
				translate: 1.25rem 0;
			}
		}

		&:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}

		&:focus-visible {
			outline: 2px solid $blue;
			outline-offset: 3px;
		}
	}
</style>
