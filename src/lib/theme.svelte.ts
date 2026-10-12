export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';
const query = () => matchMedia('(prefers-color-scheme: dark)');

export const theme = $state<{ preference: ThemePreference }>({ preference: 'system' });

function apply(preference: ThemePreference) {
	const resolved = preference === 'system' ? (query().matches ? 'dark' : 'light') : preference;
	document.documentElement.dataset.theme = resolved;
}

export function setTheme(preference: ThemePreference) {
	theme.preference = preference;
	try {
		localStorage.setItem(STORAGE_KEY, preference);
	} catch {
		// Storage can be blocked; the choice still applies for this visit.
	}
	apply(preference);
}

// Call once from onMount; returns a cleanup function.
export function initTheme() {
	try {
		theme.preference = (localStorage.getItem(STORAGE_KEY) as ThemePreference) || 'system';
	} catch {
		theme.preference = 'system';
	}

	apply(theme.preference);

	const mq = query();
	const onChange = () => theme.preference === 'system' && apply('system');
	mq.addEventListener('change', onChange);
	return () => mq.removeEventListener('change', onChange);
}
