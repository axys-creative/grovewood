const KEYWORDS: Record<string, number> = { top: 0, center: 0.5, bottom: 1 };

/** A spot on an element and a spot on the viewport, as 0-1 fractions, e.g. `top 96%` -> [0, 0.96]. */
export type ScrollPoint = [element: number, viewport: number];

const toFraction = (part: string) =>
	part in KEYWORDS ? KEYWORDS[part] : part.endsWith('%') ? parseFloat(part) / 100 : NaN;

/** Reads a ScrollTrigger-style position like `top 98%` or `center 75%`, falling back if it is invalid. */
export function parseScrollPoint(value: string | undefined, fallback: string): ScrollPoint {
	for (const candidate of [value, fallback]) {
		if (!candidate) continue;
		const [element, viewport] = candidate.trim().split(/\s+/).map(toFraction);
		if (Number.isFinite(element) && Number.isFinite(viewport)) return [element, viewport];
	}
	return [0, 1];
}

/**
 * How far (px) the element's point still has to scroll before it meets the viewport's point.
 * Positive means not reached yet, zero means just met, negative means passed.
 */
export function distanceTo(el: Element, [elementPoint, viewportPoint]: ScrollPoint) {
	const rect = el.getBoundingClientRect();
	return rect.top + rect.height * elementPoint - innerHeight * viewportPoint;
}
