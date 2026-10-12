import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// Pictures go through Netlify's Image CDN on Netlify builds only, so local dev and `vite preview` keep showing the
// files themselves. Set `IMAGE_CDN=off` in the Netlify build environment to switch the CDN off for a site.
const imageCdn = process.env.IMAGE_CDN ? process.env.IMAGE_CDN !== 'off' : !!process.env.NETLIFY;

export default defineConfig({
	define: { __IMAGE_CDN__: JSON.stringify(imageCdn) },
	css: {
		preprocessorOptions: {
			scss: { loadPaths: ['src/styles'] }
		}
	},
	plugins: [
		sveltekit({
			preprocess: [vitePreprocess()],
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			// Footer legal links may point at pages a site has not added yet; warn instead of failing the build.
			prerender: { handleHttpError: 'warn' }
		})
	]
});
