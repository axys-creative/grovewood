import type { Attachment } from 'svelte/attachments';

export type TabsOptions = {
	/** The tab that starts selected, counting from 0. Defaults to the first panel that is not `hidden`, else the first. */
	defaultTab?: number;
	/** Called with the new tab's number whenever the selection changes. */
	onChange?: (index: number) => void;
};

/**
 * Makes any markup a set of tabs. Put a `role="tablist"` of `role="tab"` buttons, and the same number of
 * `role="tabpanel"` elements, inside the element. The panels can hold anything. The attachment links them up,
 * shows one panel at a time, and adds arrow-key, Home and End navigation.
 */
export function tabs({ defaultTab, onChange }: TabsOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		el.dataset.tabs = '';

		// Tabs inside a panel belong to their own set, so only this element's own tabs and panels count.
		const own = <T extends Element>(selector: string) =>
			Array.from(el.querySelectorAll<T>(selector)).filter(
				(found) => found.closest('[data-tabs]') === el
			);
		const list = own<HTMLElement>('[role="tablist"]')[0];
		const triggers = own<HTMLElement>('[role="tab"]');
		const panels = own<HTMLElement>('[role="tabpanel"]');
		if (!triggers.length || triggers.length !== panels.length) return;

		const uid = Math.random().toString(36).slice(2, 8);
		triggers.forEach((trigger, index) => {
			trigger.id ||= `tab-${uid}-${index}`;
			panels[index].id ||= `panel-${uid}-${index}`;
			trigger.setAttribute('aria-controls', panels[index].id);
			panels[index].setAttribute('aria-labelledby', trigger.id);
			panels[index].tabIndex = 0;
		});

		const vertical = list?.getAttribute('aria-orientation') === 'vertical';
		let selected = -1;

		const select = (index: number, focus = false) => {
			const changed = index !== selected;
			selected = index;
			triggers.forEach((trigger, at) => {
				const active = at === index;
				trigger.setAttribute('aria-selected', String(active));
				trigger.tabIndex = active ? 0 : -1;
				panels[at].hidden = !active;
			});
			if (focus) triggers[index].focus();
			if (changed) onChange?.(index);
		};

		const onKeydown = (event: KeyboardEvent) => {
			const at = triggers.indexOf(event.currentTarget as HTMLElement);
			const next = vertical ? 'ArrowDown' : 'ArrowRight';
			const previous = vertical ? 'ArrowUp' : 'ArrowLeft';
			const last = triggers.length - 1;
			const target =
				event.key === next
					? at === last
						? 0
						: at + 1
					: event.key === previous
						? at === 0
							? last
							: at - 1
						: event.key === 'Home'
							? 0
							: event.key === 'End'
								? last
								: -1;
			if (target < 0) return;
			event.preventDefault();
			select(target, true);
		};

		const clicks = triggers.map((_, index) => () => select(index));
		triggers.forEach((trigger, index) => {
			trigger.addEventListener('click', clicks[index]);
			trigger.addEventListener('keydown', onKeydown);
		});

		const initial = defaultTab ?? panels.findIndex((panel) => !panel.hasAttribute('hidden'));
		select(Math.min(Math.max(initial < 0 ? 0 : initial, 0), triggers.length - 1));

		return () => {
			triggers.forEach((trigger, index) => {
				trigger.removeEventListener('click', clicks[index]);
				trigger.removeEventListener('keydown', onKeydown);
			});
			delete el.dataset.tabs;
		};
	};
}
