/** Class names an admin can use in `[text]{.name}`. Anything else is dropped and the text stays. */
export const richTextClasses = [
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'italic',
	'primary',
	'scribble',
	'scribble-circle',
	'scribble-circle-tight',
	'scribble-circle-wide',
	'secondary',
	'stroke',
	'strong'
] as const;

const TOKEN = /\[([^[\]]*)\]\{((?:\.[\w-]+\s*)+)\}/g;
const BREAK = /\{\.br\}/g;

const escapeHtml = (value: string) =>
	value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** The HTML for one token: `inner` is already safe HTML, `names` is the text between the braces, such as `.primary .scribble`. */
export function richTextToken(inner: string, names: string) {
	const used = new Set(
		names.match(/[\w-]+/g)?.filter((name) => richTextClasses.includes(name as never))
	);
	if (!used.size) return inner;

	const classes = [...used]
		.filter((name) => /^(h[1-6]|italic|primary|secondary|stroke)$/.test(name))
		.map((name) => `rich-text--${name}`);
	const drawn = [...used].find((name) => name.startsWith('scribble'));
	const behaviors = drawn ? ` data-rich-text="${drawn}"` : '';
	const tag = used.has('strong') ? 'strong' : 'span';
	const attributes = `${classes.length ? ` class="${classes.join(' ')}"` : ''}${behaviors}`;

	if (tag === 'span' && !attributes) return inner;
	return `<${tag}${attributes}>${inner}</${tag}>`;
}

/**
 * Plain text from the CMS to safe HTML. `[words]{.primary .scribble}` wraps words, `{.br}` is a line break, and
 * everything else is escaped, so a stray `<` or an unclosed tag cannot break the page. Works on the server too.
 */
export function richText(text: string) {
	let html = escapeHtml(text).replace(BREAK, '<br aria-hidden="true">');

	// Inside out, so a token can sit inside another.
	for (let pass = 0; pass < 4; pass++) {
		const next = html.replace(TOKEN, (_, inner: string, names: string) =>
			richTextToken(inner, names)
		);
		if (next === html) break;
		html = next;
	}
	return html;
}

export { escapeHtml };
