// Screenshots each CMS section into static/admin-thumbs/<collection>/<entry>.jpg for the admin's grid cards.
// Run after `bun run build`: `bun scripts/thumbnails.ts --all` or `--since <git sha>` (only sections whose content changed).
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import config from '../src/routes/admin/config.json' with { type: 'json' };

type Entry = { name: string; file: string; preview_path?: string };
type Collection = { name: string; files?: Entry[] };

const port = 4173;
const base = `http://localhost:${port}`;
const args = process.argv.slice(2);
const since = args.includes('--since') ? args[args.indexOf('--since') + 1] : '';

const changed = new Set(
	since && !/^0+$/.test(since)
		? execFileSync('git', ['diff', '--name-only', since, 'HEAD'], { encoding: 'utf8' })
				.split('\n')
				.filter(Boolean)
		: []
);
const everything = args.includes('--all') || changed.size === 0;

const route = (collection: string) => {
	const slug = collection.replace(/^page_/, '').replace(/_/g, '-');
	return slug === 'home' ? '/' : `/${slug}`;
};

const targets = (config.collections as Collection[])
	.filter((collection) => collection.name.startsWith('page_') && collection.files)
	.flatMap((collection) =>
		collection
			.files!.filter((entry) => entry.preview_path && (everything || changed.has(entry.file)))
			.map((entry) => ({
				collection: collection.name,
				name: entry.name,
				id: entry.preview_path!.split('#').pop()!
			}))
	);

if (!targets.length) {
	console.log('No section thumbnails to update.');
	process.exit(0);
}

const server = spawn('bunx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
	stdio: 'ignore'
});
const stop = () => server.kill();
process.on('exit', stop);

for (let i = 0; i < 60; i++) {
	if (
		await fetch(base).then(
			(r) => r.ok,
			() => false
		)
	)
		break;
	await new Promise((resolve) => setTimeout(resolve, 500));
}

const browser = await chromium.launch();
const context = await browser.newContext({
	viewport: { width: 1280, height: 800 },
	reducedMotion: 'reduce'
});
const page = await context.newPage();

let current = '';
for (const target of targets) {
	const url = base + route(target.collection);
	if (url !== current) {
		await page.goto(url, { waitUntil: 'networkidle' });
		await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' });
		current = url;
	}
	const section = page.locator(`[id="${target.id}"]`).first();
	if (!(await section.count())) {
		console.log(`skip ${target.collection}/${target.name}: no #${target.id} on ${url}`);
		continue;
	}
	await section.scrollIntoViewIfNeeded();
	await section.evaluate((root) => {
		for (const el of document.querySelectorAll<HTMLElement>('body *')) {
			const { position } = getComputedStyle(el);
			if ((position === 'fixed' || position === 'sticky') && !root.contains(el)) {
				el.style.visibility = 'hidden';
			}
		}
	});
	await page.waitForTimeout(600);
	const dir = `static/admin-thumbs/${target.collection}`;
	mkdirSync(dir, { recursive: true });
	await section.screenshot({ path: `${dir}/${target.name}.jpg`, type: 'jpeg', quality: 80 });
	console.log(`ok   ${target.collection}/${target.name}`);
}

await browser.close();
stop();
