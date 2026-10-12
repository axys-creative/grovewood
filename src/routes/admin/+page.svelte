<script lang="ts">
	import './admin.scss';
	import { onMount } from 'svelte';
	import config from './config.json';
	import site from '$lib/content/meta/site.json';
	import { loadIdentity } from '$lib/utils/identity';

	type Cms = {
		init: (options: { config: unknown }) => void;
		registerPreviewTemplate: (name: string, template: unknown) => void;
	};
	type Node = { widget?: string; media_library?: { config?: { max_file_size?: number } } };

	const maxFileSize = 8_000_000;

	// Decap's built-in library reads its size cap only from a field's own media_library.config.
	function capUploads(node: unknown): unknown {
		if (Array.isArray(node)) return node.map(capUploads);
		if (!node || typeof node !== 'object') return node;
		const copy = Object.fromEntries(
			Object.entries(node).map(([key, value]) => [key, capUploads(value)])
		) as Node;
		if (copy.widget === 'image' || copy.widget === 'file') {
			const library = copy.media_library ?? {};
			copy.media_library = {
				...library,
				config: { max_file_size: maxFileSize, ...library.config }
			};
		}
		return copy;
	}

	onMount(() => {
		let script: HTMLScriptElement | undefined;

		loadIdentity().then((identity) => {
			// Decap's fallback re-init would create a second widget iframe.
			identity.init = () => {};

			script = document.createElement('script');
			script.src = 'https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js';
			script.onload = async () => {
				const cms = (window as { CMS?: Cms }).CMS;
				if (!cms) return;
				const { registerPreviews } = await import('./previews');
				registerPreviews(cms);
				cms.init({ config: capUploads(config) });
			};
			(window as { CMS_MANUAL_INIT?: boolean }).CMS_MANUAL_INIT = true;
			document.head.append(script);
		});

		return () => script?.remove();
	});
</script>

<svelte:head>
	<title>Admin | {site.siteName}</title>
	<meta name="robots" content="noindex" />
</svelte:head>
