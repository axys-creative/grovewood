/** Rules the booking popover and its server endpoints share, so the two can never disagree. */

const hourLabel = (value: number) => {
	const hour = value % 24;
	return `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
};

/** The labels of the day's time slots, e.g. `8 AM – 10 AM`. */
export const slotLabels = (start: number, length: number, count: number) =>
	Array.from({ length: count }, (_, index) => {
		const from = start + index * length;
		return `${hourLabel(from)} – ${hourLabel(from + length)}`;
	});

/** A local calendar day as `YYYY-MM-DD`. */
export const isoDate = (day: Date) =>
	`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;

export const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Sundays are closed. Works from the date string, so the visitor's time zone does not matter. */
export const isClosed = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay() === 0;
