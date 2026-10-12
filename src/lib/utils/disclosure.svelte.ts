/**
 * Which items of an accordion are open. `singleOpen` is read on every toggle, so it can be a prop. `initial`
 * lists the items open at the start; it is read once, and only the first counts with `singleOpen`.
 */
export function createDisclosure(
	count: () => number,
	singleOpen: () => boolean,
	initial: () => number[] = () => []
) {
	const starting = initial().filter((index) => index >= 0 && index < count());
	let open = $state<number[]>(singleOpen() ? starting.slice(0, 1) : starting);

	return {
		isOpen: (index: number) => open.includes(index),
		get allOpen() {
			return count() > 0 && open.length >= count();
		},
		get noneOpen() {
			return open.length === 0;
		},
		toggle(index: number) {
			if (open.includes(index)) open = open.filter((item) => item !== index);
			else open = singleOpen() ? [index] : [...open, index];
		},
		openAll() {
			open = Array.from({ length: count() }, (_, index) => index);
		},
		closeAll() {
			open = [];
		}
	};
}

/** The items that start open, from a `defaultOpen` prop (`true`, an index or a list) and items that flag themselves. */
export function startingOpen(
	items: { defaultOpen?: boolean }[],
	defaultOpen: boolean | number | number[] = false
) {
	const listed =
		defaultOpen === true
			? items.map((_, index) => index)
			: typeof defaultOpen === 'number'
				? [defaultOpen]
				: Array.isArray(defaultOpen)
					? defaultOpen
					: [];
	const flagged = items.flatMap((item, index) => (item.defaultOpen ? [index] : []));
	return [...listed, ...flagged]
		.filter((index, position, all) => all.indexOf(index) === position)
		.sort((a, b) => a - b);
}
