import type { Attachment } from 'svelte/attachments';

export type WatchScrollOptions = {
	/** Scroll distance (px) before `data-scroll-away` is set. */
	awayFromTop?: number;
	/** Distance (px) from the page bottom that sets `data-scroll-bottom`. */
	nearBottom?: number;
	/** Milliseconds without scrolling before `data-scroll-idle` is set. */
	idle?: number;
	/** Distance (px) to scroll against the current direction before it flips. `0` flips at once. */
	threshold?: number;
};

type Watcher = {
	el: HTMLElement;
	options: Required<WatchScrollOptions>;
	timer?: ReturnType<typeof setTimeout>;
};

const watchers = new Set<Watcher>();
let lastY = 0;
let down = false;
let pivot = 0;
let ticking = false;

function update() {
	ticking = false;
	const y = Math.max(0, window.scrollY);

	for (const watcher of watchers) {
		const { el, options } = watcher;

		if (y !== lastY) {
			const direction = y > lastY;
			if (direction === down) pivot = y;
			else if (Math.abs(y - pivot) >= options.threshold) {
				down = direction;
				pivot = y;
			}
		}
		const away = y > options.awayFromTop;

		el.toggleAttribute('data-scroll-away', away);
		el.toggleAttribute('data-scroll-down', down && away);
		el.toggleAttribute(
			'data-scroll-bottom',
			y + window.innerHeight >= document.documentElement.scrollHeight - options.nearBottom
		);
		el.removeAttribute('data-scroll-idle');

		clearTimeout(watcher.timer);
		watcher.timer = setTimeout(() => el.setAttribute('data-scroll-idle', ''), options.idle);
	}

	lastY = y;
}

function onScroll() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(update);
}

export function watchScroll(options: WatchScrollOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const watcher: Watcher = {
			el,
			options: { awayFromTop: 96, nearBottom: 296, idle: 150, threshold: 0, ...options }
		};

		if (!watchers.size) {
			lastY = pivot = Math.max(0, window.scrollY);
			window.addEventListener('scroll', onScroll, { passive: true });
		}
		watchers.add(watcher);
		update();

		return () => {
			clearTimeout(watcher.timer);
			watchers.delete(watcher);
			if (!watchers.size) window.removeEventListener('scroll', onScroll);
			for (const name of ['away', 'down', 'bottom', 'idle'])
				el.removeAttribute(`data-scroll-${name}`);
		};
	};
}
