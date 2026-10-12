<script lang="ts">
	import 'lenis/dist/lenis.css';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import type Lenis from 'lenis';

	let lenis: Lenis | undefined;

	// Lenis keeps its own scroll target and would glide back to the old position after SvelteKit resets it.
	afterNavigate(({ type, to }) => {
		if (!lenis || to?.url.hash) return;
		lenis.scrollTo(type === 'popstate' ? window.scrollY : 0, { immediate: true, force: true });
	});

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let destroyed = false;

		import('lenis').then(({ default: LenisClass }) => {
			if (destroyed) return;
			lenis = new LenisClass({ autoRaf: true, lerp: 0.06, anchors: true });
		});

		// Lenis ignores a bare "#" link, so route it to the top.
		const onClick = (event: MouseEvent) => {
			if (!lenis || !(event.target as Element).closest('a[href="#"]')) return;
			event.preventDefault();
			lenis.scrollTo(0);
		};
		document.addEventListener('click', onClick);

		return () => {
			destroyed = true;
			document.removeEventListener('click', onClick);
			lenis?.destroy();
		};
	});
</script>
