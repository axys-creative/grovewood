import { collection } from '$lib/utils/collection';

export type Post = {
	title: string;
	description: string;
	author: string;
	/** `YYYY-MM-DD`. */
	date: string;
	tag?: string;
	coverImage?: string;
	coverAlt?: string;
	draft?: boolean;
	/** Markdown. */
	body: string;
};

export const blog = collection<Post>(
	import.meta.glob('./content/blog/*.json', { eager: true }) as Record<string, { default: Post }>
);
