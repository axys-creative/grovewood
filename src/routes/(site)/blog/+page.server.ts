import { blog } from '$lib/blog';

export const prerender = true;

export const load = () => ({
	posts: blog.all.map(({ body, ...post }) => post)
});
