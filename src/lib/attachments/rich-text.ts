import type { Attachment } from 'svelte/attachments';
import './rich-text.scss';

type Behavior = (scroll: boolean) => Promise<Attachment<HTMLElement>>;

const circle =
	(scale: number): Behavior =>
	async (scroll) =>
		(await import('./scribble')).scribble({
			type: 'circle',
			scale,
			thickness: 0.2,
			scroll,
			once: false
		});

// One line per behavior an admin can ask for with a class. Delete a line, and its attachment file, to remove it.
const behaviors: Record<string, Behavior> = {
	scribble: async (scroll) =>
		(await import('./scribble')).scribble({ curve: 'zigzag', thickness: 0.2, scroll, once: false }),
	'scribble-circle': circle(1),
	'scribble-circle-tight': circle(0.8),
	'scribble-circle-wide': circle(1.2)
};

/** Runs the behaviors that `richText` marks with `data-rich-text` on the spans inside this element. Pass the text so it runs again when the text changes. */
export function richTextBehaviors(text?: string): Attachment<HTMLElement> {
	return (element) => {
		void text;
		let cancelled = false;
		const cleanups: (() => void)[] = [];

		element.querySelectorAll<HTMLElement>('[data-rich-text]').forEach(async (target) => {
			const load = behaviors[target.dataset.richText ?? ''];
			if (!load) return;
			// The CMS preview is an iframe the page's scroll does not move, so it shows the scribble from the start.
			const attach = await load(target.ownerDocument === document);
			if (cancelled) return;
			const cleanup = attach(target);
			if (typeof cleanup === 'function') cleanups.push(cleanup);
		});

		return () => {
			cancelled = true;
			cleanups.forEach((cleanup) => cleanup());
		};
	};
}
