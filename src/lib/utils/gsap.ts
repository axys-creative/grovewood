import type { gsap as Gsap } from 'gsap';

type PluginName = 'scramble' | 'scrollTrigger' | 'splitText';

const loaders: Record<PluginName, () => Promise<object>> = {
	scramble: () => import('gsap/ScrambleTextPlugin').then((module) => module.ScrambleTextPlugin),
	scrollTrigger: () =>
		import('gsap/ScrollTrigger').then((module) => {
			// Any `refreshPriority` makes every refresh sort triggers by where their element is on the page. Without
			// it they refresh in the order they were made, and a trigger made before the pinned section above it
			// measures itself without that section's spacer.
			module.ScrollTrigger.defaults({ refreshPriority: 0 });
			return module.ScrollTrigger;
		}),
	splitText: () => import('gsap/SplitText').then((module) => module.SplitText)
};

let core: Promise<typeof Gsap> | undefined;
const registering = new Map<PluginName, Promise<void>>();

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Measures every ScrollTrigger again, in page order, once things have gone quiet. Sections build their triggers
 * whenever their own imports finish, which is not page order, so this puts pins and the triggers below them right.
 * `loadGsap('scrollTrigger')` asks for it already; call it again after anything slower than that.
 */
export function refreshScrollTriggers() {
	clearTimeout(refreshTimer);
	refreshTimer = setTimeout(async () => {
		const { ScrollTrigger } = await import('gsap/ScrollTrigger');
		ScrollTrigger.refresh();
	}, 200);
}

/**
 * Loads GSAP and any plugins you name, once. Pages that never call this never download GSAP, so
 * call it from an attachment (not at module scope) and keep plugin lists as short as possible.
 */
export async function loadGsap(...plugins: PluginName[]) {
	core ??= import('gsap').then((module) => module.gsap);
	const gsap = await core;
	if (plugins.includes('scrollTrigger')) refreshScrollTriggers();

	await Promise.all(
		plugins.map((name) => {
			let pending = registering.get(name);
			if (!pending) {
				pending = loaders[name]().then((plugin) => gsap.registerPlugin(plugin));
				registering.set(name, pending);
			}
			return pending;
		})
	);
	return gsap;
}
