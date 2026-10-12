import { Marked } from 'marked';
import { escapeHtml, richTextToken } from './rich-text';

type Entry = { draft?: boolean; date: string };

/**
 * Turns a folder of JSON files (from `import.meta.glob`, eager) into a collection. The file name is
 * the slug and drafts are left out, newest first.
 */
export function collection<T extends Entry>(files: Record<string, { default: T }>) {
	const all = Object.entries(files)
		.map(([path, file]) => ({
			...file.default,
			slug: path
				.split('/')
				.pop()!
				.replace(/\.json$/, '')
		}))
		.filter((entry) => !entry.draft)
		.sort((a, b) => b.date.localeCompare(a.date));

	return {
		all,
		slugs: all.map((entry) => entry.slug),
		get: (slug: string) => all.find((entry) => entry.slug === slug)
	};
}

// Raw HTML in a post is shown as text, so a stray tag cannot break the page. `[words]{.primary}` is the Rich Text token.
const marked = new Marked({
	renderer: { html: ({ text }) => escapeHtml(text) },
	extensions: [
		{
			name: 'richToken',
			level: 'inline',
			start: (source: string) => source.indexOf('['),
			tokenizer(source: string) {
				const match = /^\[([^[\]]+)\]\{((?:\.[\w-]+\s*)+)\}/.exec(source);
				if (!match) return;
				return {
					type: 'richToken',
					raw: match[0],
					names: match[2],
					tokens: this.lexer.inlineTokens(match[1])
				};
			},
			renderer(token) {
				return richTextToken(this.parser.parseInline(token.tokens ?? []), token.names);
			}
		}
	]
});

/** Markdown from the CMS to HTML. Raw HTML is escaped, and `[words]{.primary}` tokens work. */
export const renderMarkdown = (markdown: string) => marked.parse(markdown, { async: false });

/** Dates are stored as `YYYY-MM-DD` and always shown as that day, whatever the visitor's timezone. */
export const formatDate = (date: string) =>
	new Date(date).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' });
