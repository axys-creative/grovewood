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

<main>
	<header>
		<h1>Google reviews</h1>
		<p>
			Only reviews switched on here appear on the home page, and only those with a message. Changes
			show within a minute or two.
		</p>
		{#if data}
			<p class="meta">
				{#if data.source === 'mock'}Showing sample reviews. Nothing has synced from Google yet.
				{:else if data.source === 'none'}Nothing has synced from Google yet.
				{:else}Last synced {new Date(data.syncedAt).toLocaleString('en-US')}.{/if}
				{approved.length} switched on.
			</p>
		{/if}
		<div class="actions">
			<button type="button" onclick={sync} disabled={syncing || !ready}>
				{syncing ? 'Syncing…' : 'Sync now'}
			</button>
			<a href="/admin/">Back to the editor</a>
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
	main {
		max-width: 56rem;
		margin-inline: auto;
		padding: 2rem 1rem 4rem;
	}

	h1 {
		margin: 0 0 0.5rem;
	}

	p {
		margin: 0.5rem 0;
	}

	.meta,
	.count,
	time,
	.empty {
		font-size: 0.875rem;
		opacity: 0.75;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
	}

	.message {
		min-height: 1.5rem;
	}

	button,
	input,
	select {
		font: inherit;
	}

	.actions button {
		padding: 0.5rem 1rem;
		border: 1px solid currentColor;
		border-radius: 0.5rem;
		background: none;
		color: inherit;
		cursor: pointer;

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

		label {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			font-size: 0.875rem;
		}

		input,
		select {
			min-width: 10rem;
			padding: 0.5rem;
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
		border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
		border-radius: 0.75rem;

		&.on {
			border-color: currentColor;
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
		background: color-mix(in srgb, currentColor 25%, transparent);
		cursor: pointer;

		&::after {
			content: '';
			position: absolute;
			top: 0.25rem;
			left: 0.25rem;
			width: 1.25rem;
			height: 1.25rem;
			border-radius: 50%;
			background: Canvas;
			transition: translate 0.15s;

			@media (prefers-reduced-motion: reduce) {
				transition: none;
			}
		}

		&[aria-checked='true'] {
			background: currentColor;

			&::after {
				translate: 1.25rem 0;
			}
		}

		&:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}

		&:focus-visible {
			outline: 2px solid currentColor;
			outline-offset: 3px;
		}
	}
</style>
