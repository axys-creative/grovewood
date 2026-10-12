import type { Component } from 'svelte';
import globalCss from '../../styles/styles.scss?inline';
import CarouselSpotlight from '$lib/sections/carousel-spotlight.svelte';
import HeroSimple from '$lib/sections/hero-simple.svelte';
import { mountPreview, type PreviewHost } from './preview-host.svelte';

type Data = Record<string, unknown>;
type Section = Component<Data>;
type Preview = { component: Section; props?: (data: Data) => Data };

type Cms = { registerPreviewTemplate: (name: string, template: unknown) => void };
type Entry = { getIn: (path: string[]) => { toJS: () => Data } };
type Instance = {
	props: { entry: Entry };
	host?: PreviewHost;
	observer?: MutationObserver;
	root?: HTMLElement | null;
};
type CreateClass = (spec: Record<string, unknown>) => unknown;
type H = (tag: string, props?: Record<string, unknown>) => unknown;

// Keyed by the file's `name` in config.json; `props` mirrors what the real page passes.
const previews: Record<string, Preview> = {
	carousel_spotlight: {
		component: CarouselSpotlight as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as { primary?: unknown; secondary?: { text?: string } };
			return {
				...data,
				cta: { ...cta, secondary: cta.secondary?.text ? cta.secondary : undefined },
				slides: data.slides ?? [],
				autoplay: false
			};
		}
	},
	hero_simple: {
		component: HeroSimple as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as { primary?: unknown; secondary?: { text?: string } };
			return {
				...data,
				cta: { ...cta, secondary: cta.secondary?.text ? cta.secondary : undefined }
			};
		}
	}
};

const componentStyles =
	'style[data-vite-dev-id]:not([data-vite-dev-id*="/admin/"]), link[href*="/_app/"][rel="stylesheet"]';

function syncStyles(doc: Document) {
	const upsert = (key: string, build: () => HTMLElement, update?: (el: HTMLElement) => void) => {
		let el = doc.head.querySelector<HTMLElement>(`[data-preview-key="${CSS.escape(key)}"]`);
		if (!el) {
			el = build();
			el.dataset.previewKey = key;
			doc.head.append(el);
		}
		update?.(el);
	};

	upsert(
		'global',
		() => doc.createElement('style'),
		(el) => {
			if (el.textContent !== globalCss) el.textContent = globalCss;
		}
	);

	document.head.querySelectorAll<HTMLElement>(componentStyles).forEach((source, index) => {
		const key = source.dataset.viteDevId ?? (source as HTMLLinkElement).href ?? String(index);
		if (source instanceof HTMLLinkElement) {
			upsert(key, () => {
				const link = doc.createElement('link');
				link.rel = 'stylesheet';
				link.href = source.href;
				return link;
			});
			return;
		}
		upsert(
			key,
			() => doc.createElement('style'),
			(el) => {
				if (el.textContent !== source.textContent) el.textContent = source.textContent;
			}
		);
	});
}

function dataOf(instance: Instance, preview: Preview): Data {
	const data = instance.props.entry.getIn(['data']).toJS();
	return preview.props ? preview.props(data) : data;
}

function template(preview: Preview) {
	const { createClass, h } = window as unknown as { createClass: CreateClass; h: H };

	return createClass({
		componentDidMount(this: Instance) {
			const root = this.root;
			if (!root) return;
			const doc = root.ownerDocument;
			doc.documentElement.dataset.theme = document.documentElement.dataset.theme ?? '';
			syncStyles(doc);
			this.observer = new MutationObserver(() => syncStyles(doc));
			this.observer.observe(document.head, { childList: true, subtree: true, characterData: true });
			this.host = mountPreview(root, preview.component, dataOf(this, preview));
		},
		componentDidUpdate(this: Instance) {
			this.host?.update(dataOf(this, preview));
		},
		componentWillUnmount(this: Instance) {
			this.observer?.disconnect();
			this.host?.destroy();
		},
		render(this: Instance) {
			return h('div', {
				style: {
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center'
				},
				ref: (el: HTMLElement | null) => {
					this.root = el;
				}
			});
		}
	});
}

export function registerPreviews(cms: Cms) {
	for (const [name, preview] of Object.entries(previews)) {
		cms.registerPreviewTemplate(name, template(preview));
	}
}
