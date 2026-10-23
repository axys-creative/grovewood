<script lang="ts">
	import { magnet } from '$lib/attachments/magnet';
	import { textRoll } from '$lib/attachments/text-roll';
	import Button from '$lib/components/button.svelte';
	import CalendarBooking, {
		type CalendarBookingProps
	} from '$lib/components/calendar-booking.svelte';

	let { triggerText, triggerStyle = 'highlight', ...rest }: CalendarBookingProps = $props();

	const pull = () =>
		magnet({
			x: 0.24,
			y: 0.64,
			returnDuration: 350,
			returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
		});
</script>

<div class="booking-preview">
	<div class="trigger {triggerStyle}">
		<Button
			text={triggerText}
			type={triggerStyle === 'secondary' ? 'outline' : 'solid'}
			iconStart="icon-calendar"
			{@attach textRoll()}
			{@attach pull()}
		/>
	</div>
	<CalendarBooking {...rest} inline demo />
</div>

<style lang="scss">
	.booking-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		padding: 32px var(--body-padding);
	}

	.highlight {
		--btn-bg: var(--color-accent);
		--btn-text: var(--color-on-accent);

		:global(.button:hover) {
			border-color: var(--color-on-accent);
		}
	}
</style>
