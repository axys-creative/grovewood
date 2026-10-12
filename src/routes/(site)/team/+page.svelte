<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import CarouselTestimonials from '$lib/sections/carousel-testimonials.svelte';
	import ImageGrid from '$lib/sections/image-grid.svelte';
	import TextStack from '$lib/sections/text-stack.svelte';
	import clinicians from '$lib/content/page_team/clinicians-image-grid.json';
	import staff from '$lib/content/page_team/staff-image-grid.json';
	import testimonials from '$lib/content/page_team/carousel-testimonials.json';
	import invite from '$lib/content/page_team/text-stack-invite.json';
</script>

<ImageGrid id="clinicians" {...clinicians} />
<ImageGrid id="staff" {...staff} />
<CarouselTestimonials id="testimonials" {...testimonials} />
<TextStack id="text-invite" {...invite as ComponentProps<typeof TextStack>} />
