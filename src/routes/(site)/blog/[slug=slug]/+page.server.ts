import { error } from '@sveltejs/kit';
import { blog } from '$lib/blog';
import { renderMarkdown } from '$lib/utils/collection';

export const prerender = true;

export const entries = () => blog.slugs.map((slug) => ({ slug }));

export const load = ({ params }) => {
	const post = blog.get(params.slug);
	if (!post) error(404, 'Post not found');

	const { body, ...meta } = post;
	return {
		post: meta,
		html: renderMarkdown(body),
		seo: {
			title: post.title,
			description: post.description,
			ogImage: post.coverImage,
			type: 'article',
			published: post.date,
			author: post.author
		}
	};
};
