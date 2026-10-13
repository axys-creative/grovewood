import type { Reroute } from '@sveltejs/kit';
import { isLocked } from '$lib/utils/page-lock';

// A locked page is routed to a path nothing matches, so the catch-all route renders the 404 inside the site layout.
export const reroute: Reroute = ({ url }) => (isLocked(url.pathname) ? '/page-locked' : undefined);
