import { error } from '@sveltejs/kit';

// A URL that matches no page ends up here, so the 404 renders inside the site layout.
export const load = () => error(404, 'Page not found');
