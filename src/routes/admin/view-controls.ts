// Decap pins its view controls (preview and scroll-sync toggles) to the top right, over the preview's own top right
// corner, where the page's menu button sits. This adds a third button that moves them to the preview's left edge and
// back, only while the preview pane is showing. Decap's classes are hashed, so elements are found by their stable
// emotion label.
const storageKey = 'admin-view-controls-left';
const mark = 'data-side-toggle';
const paths = { left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7' };

const find = (selector: string, label: string) =>
	[...document.querySelectorAll<HTMLElement>(selector)].find((el) =>
		new RegExp(`-${label}(\\s|$)`).test(el.className)
	);

const read = () => {
	try {
		return localStorage.getItem(storageKey) === '1';
	} catch {
		return false;
	}
};

const write = (left: boolean) => {
	try {
		localStorage.setItem(storageKey, left ? '1' : '0');
	} catch {
		// Not remembered; the toggle still works for this visit.
	}
};

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function sideToggleControls() {
	let left = read();

	// Slides with `translate` from the controls' own place, so the move can animate.
	const place = (controls: HTMLElement) => {
		controls.style.transition = reducedMotion()
			? 'none'
			: 'translate 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
		const frame = find('iframe[class*="-PreviewPaneFrame"]', 'PreviewPaneFrame');
		const parent = controls.offsetParent;
		if (left && frame && parent) {
			const target = frame.getBoundingClientRect().left - parent.getBoundingClientRect().left + 10;
			controls.style.translate = `${target - controls.offsetLeft}px 0`;
		} else {
			controls.style.removeProperty('translate');
		}
	};

	const label = (button: HTMLElement) => {
		const text = left ? 'Move view controls to the right' : 'Move view controls to the left';
		button.setAttribute('aria-label', text);
		button.title = text;
		button.querySelector('path')?.setAttribute('d', left ? paths.right : paths.left);
	};

	const create = (controls: HTMLElement) => {
		const sample = controls.querySelector('button');
		const button = document.createElement('button');
		button.type = 'button';
		button.setAttribute(mark, '');
		if (sample) button.className = sample.className;
		button.style.color = '#b3b9c4';
		button.innerHTML =
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=""/></svg>';
		label(button);
		button.addEventListener('click', () => {
			left = !left;
			write(left);
			label(button);
			place(controls);
		});
		controls.append(button);
	};

	// Decap re-creates the controls when the editor changes, so they are checked on a timer; the frame also moves when
	// the pane divider is dragged.
	const sync = () => {
		const controls = find('[class*="-ViewControls"]', 'ViewControls');
		if (!controls) return;
		const existing = controls.querySelector(`[${mark}]`);
		const hasPreview = !!find('iframe[class*="-PreviewPaneFrame"]', 'PreviewPaneFrame');
		if (hasPreview && !existing) create(controls);
		if (!hasPreview) existing?.remove();
		place(controls);
	};

	// Decap removes the other buttons the instant the preview closes, so the press is held back while they fade out
	// (CSS keyed on the attributes below), then replayed.
	let replaying = false;
	const onClick = (event: MouseEvent) => {
		if (replaying || reducedMotion()) return;
		const button = (event.target as Element).closest?.('button');
		const controls = find('[class*="-ViewControls"]', 'ViewControls');
		if (!button || !controls?.contains(button) || button.hasAttribute(mark)) return;
		if (!find('iframe[class*="-PreviewPaneFrame"]', 'PreviewPaneFrame')) return;
		const native = [...controls.querySelectorAll('button')].filter((el) => !el.hasAttribute(mark));
		const isScroll =
			/scroll/i.test(button.title) || (native.length > 1 && button === native[native.length - 1]);
		if (isScroll) return;

		event.preventDefault();
		event.stopPropagation();
		button.setAttribute('data-keep', '');
		controls.setAttribute('data-leaving', '');
		setTimeout(() => {
			replaying = true;
			button.click();
			replaying = false;
			setTimeout(() => {
				button.removeAttribute('data-keep');
				controls.removeAttribute('data-leaving');
			}, 300);
		}, 260);
	};

	document.addEventListener('click', onClick, true);
	const timer = setInterval(sync, 300);
	return () => {
		document.removeEventListener('click', onClick, true);
		clearInterval(timer);
	};
}
