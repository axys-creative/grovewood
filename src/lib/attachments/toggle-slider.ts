import type { Attachment } from 'svelte/attachments';
import './toggle-slider.scss';

export type ToggleSliderOptions = {
	/** `solid` is a block behind the selected option; `underline` is a line under it. */
	variant?: 'solid' | 'underline';
	/** `click` moves the slider to the option that is selected. `hover` also follows the pointer and keyboard focus, and returns to the selected option when it leaves. */
	trigger?: 'click' | 'hover';
	/** A selector for the options inside the element. Defaults to its direct children, except a `<legend>`. */
	options?: string;
};

const SELECTED =
	'[aria-selected="true"], [aria-current]:not([aria-current="false"]), [aria-checked="true"]';

/**
 * Slides a block (or a line) behind the selected one of a row of options: tabs, links, buttons or radio labels.
 * It adds the slider element itself, follows whichever option is selected (by `aria-selected`, `aria-current`,
 * a checked radio, or a click), and keeps up when the layout changes.
 */
export function toggleSlider({
	variant = 'solid',
	trigger = 'click',
	options: selector
}: ToggleSliderOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const slider = document.createElement('div');
		slider.className = 'toggle-slider__slider';
		slider.setAttribute('aria-hidden', 'true');
		el.prepend(slider);
		el.classList.add('toggle-slider', `toggle-slider--${variant}`);
		el.dataset.toggleTrigger = trigger;

		const options = () =>
			(selector
				? Array.from(el.querySelectorAll<HTMLElement>(selector))
				: (Array.from(el.children) as HTMLElement[]).filter(
						(child) => child !== slider && child.tagName !== 'LEGEND'
					)
			).filter((option) => !option.hidden);

		// The option that is selected, whichever way the markup says so.
		let selected: HTMLElement | undefined;
		const findSelected = (): HTMLElement | undefined => {
			const all = options();
			return (
				all.find((option) => option.matches(SELECTED)) ??
				all.find((option) => option.querySelector<HTMLInputElement>('input:checked')) ??
				// With no state in the markup, a click is what chose it, so keep that.
				all.find((option) => option === selected) ??
				all[0]
			);
		};

		selected = findSelected();
		let ready = false;

		const place = (option?: HTMLElement) => {
			if (!option) return;
			slider.style.left = `${option.offsetLeft}px`;
			slider.style.width = `${option.offsetWidth}px`;
			if (variant === 'solid') {
				slider.style.top = `${option.offsetTop}px`;
				slider.style.height = `${option.offsetHeight}px`;
			}
		};

		const mark = () => {
			options().forEach((option) => {
				if (option === selected) option.setAttribute('data-active', '');
				else option.removeAttribute('data-active');
			});
		};

		const settle = () => {
			selected = findSelected();
			mark();
			place(selected);
		};

		// The first placement is instant; after that the slider glides.
		settle();
		requestAnimationFrame(() => {
			settle();
			ready = true;
			el.dataset.toggleReady = '';
		});

		const onClick = (event: Event) => {
			const found = options().find((candidate) => candidate.contains(event.target as Node));
			if (!found) return;
			selected = found;
			mark();
			place(found);
		};

		// Other code may change the selection (the tabs attachment, a radio, a router), so look again after it does.
		const observer = new MutationObserver(() => ready && settle());
		observer.observe(el, {
			subtree: true,
			attributes: true,
			attributeFilter: ['aria-selected', 'aria-current', 'aria-checked', 'hidden']
		});
		const onChange = () => ready && settle();

		const over = (event: Event) => {
			const found = options().find((candidate) => candidate.contains(event.target as Node));
			if (found) place(found);
		};
		const away = () => place(selected);

		el.addEventListener('click', onClick);
		el.addEventListener('change', onChange);
		if (trigger === 'hover') {
			el.addEventListener('pointerover', over);
			el.addEventListener('focusin', over);
			el.addEventListener('pointerleave', away);
			el.addEventListener('focusout', away);
		}

		const resize = new ResizeObserver(() => place(selected));
		resize.observe(el);
		options().forEach((option) => resize.observe(option));
		document.fonts?.ready.then(() => place(selected));

		return () => {
			observer.disconnect();
			resize.disconnect();
			el.removeEventListener('click', onClick);
			el.removeEventListener('change', onChange);
			el.removeEventListener('pointerover', over);
			el.removeEventListener('focusin', over);
			el.removeEventListener('pointerleave', away);
			el.removeEventListener('focusout', away);
			slider.remove();
			el.classList.remove('toggle-slider', `toggle-slider--${variant}`);
			delete el.dataset.toggleTrigger;
			delete el.dataset.toggleReady;
			options().forEach((option) => option.removeAttribute('data-active'));
		};
	};
}
