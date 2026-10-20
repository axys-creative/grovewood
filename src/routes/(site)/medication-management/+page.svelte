<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import CarouselSpotlight from '$lib/sections/carousel-spotlight.svelte';
	import CarouselTestimonials from '$lib/sections/carousel-testimonials.svelte';
	import CommonQuestions from '$lib/sections/common-questions.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import Stats from '$lib/sections/stats.svelte';
	import TextStack from '$lib/sections/text-stack.svelte';
	import hero from '$lib/content/page_medication_management/hero-simple.json';
	import textStack from '$lib/content/page_medication_management/text-stack.json';
	import spotlight from '$lib/content/page_medication_management/carousel-spotlight.json';
	import invite from '$lib/content/page_medication_management/text-stack-invite.json';
	import questions from '$lib/content/page_medication_management/common-questions.json';
	import testimonials from '$lib/content/page_medication_management/carousel-testimonials.json';
	import stats from '$lib/content/page_medication_management/stats.json';
</script>

<HeroSimple id="hero" {...hero as ComponentProps<typeof HeroSimple>} />
<TextStack id="text-stack" {...textStack} />
<CarouselSpotlight
	id="carousel-spotlight"
	{...spotlight as ComponentProps<typeof CarouselSpotlight>}
/>
<TextStack id="text-invite" {...invite as ComponentProps<typeof TextStack>} />
<CommonQuestions id="common-questions" {...questions as ComponentProps<typeof CommonQuestions>} />
<CarouselTestimonials id="testimonials" {...testimonials} />
<Stats id="stats" {...stats} />
