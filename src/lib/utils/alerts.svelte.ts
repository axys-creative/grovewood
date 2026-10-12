import type { ButtonProps } from '$lib/components/button.svelte';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

export type AlertOptions = {
	type?: AlertType;
	title: string;
	message?: string;
	/** Up to two links under the message. */
	links?: ButtonProps[];
	/** Milliseconds before it closes itself. `0` keeps it until it is closed. */
	autoClose?: number;
	/** Shows a line that runs out as the alert closes. Needs `autoClose`. */
	timer?: boolean;
	/** A thick border in the alert's color down the left edge. */
	leftBorder?: boolean;
};

export type StackedAlert = AlertOptions & { id: number };

let items = $state<StackedAlert[]>([]);
let counter = 0;

/** The alerts on screen, shared by `<AlertStack />` and anything that calls `alerts.show`. */
export const alerts = {
	get list() {
		return items;
	},
	/** Adds an alert to the bottom of the stack and returns its id. */
	show(options: AlertOptions) {
		const id = ++counter;
		items.push({ type: 'info', autoClose: 0, ...options, id });
		return id;
	},
	dismiss(id: number) {
		items = items.filter((item) => item.id !== id);
	},
	clear() {
		items = [];
	}
};
