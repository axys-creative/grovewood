<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import CalendarBooking, {
		type CalendarBookingProps
	} from '$lib/components/calendar-booking.svelte';

	let { triggerText, ...rest }: CalendarBookingProps = $props();
</script>

<div class="booking-preview">
	<Button text={triggerText} iconStart="icon-calendar" />
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
</style>
