import type { VelocityTiltOptions } from './velocity-tilt';

export type CursorVariant = {
	/** Diameter in px. */
	size?: number;
	opacity?: number;
	/** Any CSS background, e.g. a color or gradient. */
	background?: string;
	/** A CSS border shorthand, e.g. `1px dashed var(--color-accent)`. */
	border?: string;
	/** Color of the message text. */
	color?: string;
	/** A CSS transition for the cursor's shape. */
	transition?: string;
	/** Set to false to stop the elastic stretch for this variant. */
	elastic?: boolean;
};

export type CursorContent = {
	message?: string;
	/** An icon name from `static/icons`, or `true` for the cursor's default icon. */
	icon?: string | true;
	iconSize?: 'sm' | 'md' | 'lg';
	iconColor?: string;
	/** A picture shown inside the cursor, e.g. `/images/img-sample-1.jpg`. */
	image?: string;
	/** Whether the picture sits over the cursor's message and icon (`front`) or under them (`behind`, the default). */
	imageLayer?: 'front' | 'behind';
};

export type CursorClaim = {
	variant?: string;
	content?: CursorContent;
	tilt?: VelocityTiltOptions;
	hidden?: boolean;
	/** Where the cursor should sit instead of following the mouse. Read every frame. */
	target?: () => { x: number; y: number } | null;
};

/**
 * What the cursor should currently look like. Attachments register a claim and release it when
 * the pointer leaves, so overlapping elements never overwrite each other. The most recent claim
 * that sets a value wins.
 */
class CursorStore {
	/** True while a `<MouseCursor />` is mounted and running. */
	mounted = $state(false);
	#claims = $state.raw<[symbol, CursorClaim][]>([]);

	claim(owner: symbol, claim: CursorClaim) {
		this.#claims = [...this.#claims.filter(([id]) => id !== owner), [owner, claim]];
	}

	release(owner: symbol) {
		this.#claims = this.#claims.filter(([id]) => id !== owner);
	}

	#latest<K extends keyof CursorClaim>(key: K): CursorClaim[K] {
		for (let i = this.#claims.length - 1; i >= 0; i--) {
			const value = this.#claims[i][1][key];
			if (value !== undefined) return value;
		}
		return undefined;
	}

	get variant() {
		return this.#latest('variant');
	}

	get content() {
		return this.#latest('content');
	}

	get tilt() {
		return this.#latest('tilt');
	}

	get target() {
		return this.#latest('target');
	}

	get hidden() {
		return this.#claims.some(([, claim]) => claim.hidden);
	}
}

export const cursor = new CursorStore();
