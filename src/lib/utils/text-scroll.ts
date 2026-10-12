import type { gsap as Gsap } from 'gsap';
import type { SplitText } from 'gsap/SplitText';
import { loadGsap } from './gsap';

export type TextScrollOptions = {
	/** Replay each time it scrolls into view (default) or only the first time. Ignored with `scrub`. */
	once?: boolean;
	/** Tie the animation to the scroll position instead of playing it. */
	scrub?: boolean;
	/** ScrollTrigger-style start, e.g. `top 98%` (element point, viewport point). */
	start?: string;
	/** ScrollTrigger-style end, e.g. `bottom 2%`. */
	end?: string;
	/** Show GSAP's start and end markers for debugging. */
	markers?: boolean;
	/** A selector or element to watch for scrolling instead of this element, e.g. a pinned section. */
	trigger?: string | Element;
};

export type TextSplit = 'chars' | 'words' | 'lines';

type Build = (context: {
	gsap: typeof Gsap;
	targets: HTMLElement[];
	scrollTrigger: ScrollTrigger.Vars;
	split?: SplitText;
}) => gsap.core.Animation | void;

/**
 * Runs a scroll-driven text animation. Loads GSAP on demand, splits the text when `split` is set
 * (and splits again when the layout or fonts change), and removes everything on cleanup.
 * `build` returns the animation; it receives the ScrollTrigger settings to pass to it. `mask` clips each piece so it can slide in.
 */
export function textScroll(
	el: HTMLElement,
	split: TextSplit | undefined,
	{
		once = false,
		scrub = false,
		start = 'top 98%',
		end = 'bottom 2%',
		markers = false,
		trigger
	}: TextScrollOptions,
	build: Build,
	mask = false
) {
	let cancelled = false;
	let revert: (() => void) | undefined;

	const watched = (typeof trigger === 'string' ? document.querySelector(trigger) : trigger) ?? el;
	const scrollTrigger: ScrollTrigger.Vars = {
		trigger: watched,
		start,
		end,
		scrub,
		markers,
		...(scrub
			? {}
			: { toggleActions: once ? 'play none none none' : 'play reset play reset', once })
	};

	(async () => {
		const gsap = await loadGsap('scrollTrigger', ...(split ? (['splitText'] as const) : []));
		const { SplitText } = split ? await import('gsap/SplitText') : { SplitText: undefined };
		if (cancelled) return;

		const context = gsap.context(() => {}, el);
		context.add(() => {
			if (!split || !SplitText) {
				build({ gsap, targets: [el], scrollTrigger });
				return;
			}

			SplitText.create(el, {
				type: split,
				[`${split}Class`]: `text-split__${split}`,
				aria: 'auto',
				...(mask ? { mask: split } : {}),
				autoSplit: true,
				onSplit(self) {
					let animation: gsap.core.Animation | void = undefined;
					context.add(() => {
						animation = build({
							gsap,
							targets: self[split] as HTMLElement[],
							scrollTrigger,
							split: self
						});
					});
					return animation;
				}
			});
		});
		revert = () => context.revert();
	})();

	return () => {
		cancelled = true;
		revert?.();
	};
}
