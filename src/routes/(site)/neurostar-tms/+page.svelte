<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import CarouselSpotlight from '$lib/sections/carousel-spotlight.svelte';
	import CarouselTestimonials from '$lib/sections/carousel-testimonials.svelte';
	import CommonQuestions from '$lib/sections/common-questions.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import Stats from '$lib/sections/stats.svelte';
	import TextStack from '$lib/sections/text-stack.svelte';
	import hero from '$lib/content/page_neurostar_tms/hero-simple.json';
	import textStack from '$lib/content/page_neurostar_tms/text-stack.json';
	import spotlight from '$lib/content/page_neurostar_tms/carousel-spotlight.json';
	import testimonials from '$lib/content/page_neurostar_tms/carousel-testimonials.json';
	import stats from '$lib/content/page_neurostar_tms/stats.json';
	import questions from '$lib/content/page_neurostar_tms/common-questions.json';
	import invite from '$lib/content/page_neurostar_tms/text-stack-invite.json';
</script>

<HeroSimple id="hero" {...hero as ComponentProps<typeof HeroSimple>} />
<TextStack id="text-stack" {...textStack} />
<CarouselSpotlight
	id="carousel-spotlight"
	{...spotlight as ComponentProps<typeof CarouselSpotlight>}
/>
<CarouselTestimonials id="testimonials" {...testimonials} />
<Stats id="stats" {...stats} />
<CommonQuestions id="common-questions" {...questions as ComponentProps<typeof CommonQuestions>} />
<TextStack id="text-invite" {...invite as ComponentProps<typeof TextStack>} />
