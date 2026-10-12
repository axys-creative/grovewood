import { mount, unmount, type Component } from 'svelte';

export type PreviewHost = {
	update: (data: Record<string, unknown>) => void;
	destroy: () => void;
};

export function mountPreview(
	target: HTMLElement,
	component: Component<Record<string, unknown>>,
	data: Record<string, unknown>
): PreviewHost {
	const props = $state({ ...data });
	const instance = mount(component, { target, props });

	return {
		update(next) {
			for (const key of Object.keys(props)) if (!(key in next)) delete props[key];
			Object.assign(props, next);
		},
		destroy: () => unmount(instance)
	};
}
