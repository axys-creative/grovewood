<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import {
		blogArticleBodyProps,
		blogArticleHeroProps,
		carouselSpotlightProps,
		carouselTestimonialsProps,
		carouselTunnelProps,
		circleHighlightProps,
		galleryHorizontalProps,
		headlineProps,
		heroImageCircleProps,
		heroCarouselProps,
		heroImageWaveProps,
		heroSimpleProps,
		planSelectionProps,
		scrollHorizontalProps,
		scrollStackProps,
		scrollTimelineProps,
		tunnelProps,
		workGalleryProps
	} from '$lib/library/component-props';
	import LibrarySection from '$lib/library/library-section.svelte';
	import CircleHighlight from '$lib/sections/circle-highlight.svelte';
	import carouselSpotlight from '$lib/content/page_sections/carousel-spotlight.json';
	import CarouselSpotlight from '$lib/sections/carousel-spotlight.svelte';
	import CarouselTestimonials from '$lib/sections/carousel-testimonials.svelte';
	import CarouselTunnel from '$lib/sections/carousel-tunnel.svelte';
	import GalleryHorizontal from '$lib/sections/gallery-horizontal.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import HeroCarousel from '$lib/sections/hero-carousel.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';
	import HeroImageWave from '$lib/sections/hero-image-wave.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import PlanSelection from '$lib/sections/plan-selection.svelte';
	import ScrollHorizontal from '$lib/sections/scroll-horizontal.svelte';
	import ScrollStack from '$lib/sections/scroll-stack.svelte';
	import ScrollTimeline from '$lib/sections/scroll-timeline.svelte';
	import Tunnel from '$lib/sections/tunnel.svelte';
	import WorkGallery from '$lib/sections/work-gallery.svelte';
	import MouseCursor from '$lib/components/mouse-cursor.svelte';
	import { navEntry } from '$lib/utils/nav';

	const nav = navEntry('/sections');

	const images = Array.from({ length: 12 }, (_, index) => ({
		src: `/images/img-sample-${(index % 6) + 1}.jpg`,
		alt: `Sample image ${index + 1}`
	}));
	const projects = [
		['2025', 'Northline'],
		['2025', 'Aperture'],
		['2024', 'Glasswave'],
		['2024', 'Driftline'],
		['2023', 'Meridian'],
		['2023', 'Fernwood']
	].map(([eyebrow, title], index) => ({
		eyebrow,
		title,
		img: { src: `/images/img-sample-${index + 1}.jpg`, alt: `Sample image ${index + 1}` }
	}));
	const stages = [
		{ title: 'Discover', description: 'Workshops and research to understand the real problem.' },
		{ title: 'Define', description: 'Turning research into a clear, scoped brief.' },
		{ title: 'Design', description: 'Exploring directions and refining the chosen one.' },
		{ title: 'Build', description: 'Engineering the approved design into a real product.' }
	];
	const accentGnomon = { length: 64, depth: 12 };
	const galleryGroups = [
		{
			images: [
				{
					src: '/images/img-sample-1.jpg',
					alt: 'Sample image one',
					caption: 'Sample 01',
					gnomon: accentGnomon
				},
				{ src: '/images/img-sample-2.jpg', alt: 'Sample image two', caption: 'Sample 02' },
				{
					src: '/images/img-sample-3.jpg',
					alt: 'Sample image three',
					caption: 'Sample 03',
					gnomon: accentGnomon
				},
				{ src: '/images/img-sample-4.jpg', alt: 'Sample image four', caption: 'Sample 04' }
			],
			copy: 'A short paragraph of copy describing this piece of work, kept brief so it doesn’t run into the image below it.'
		},
		{
			images: [
				{
					src: '/images/img-sample-5.jpg',
					alt: 'Sample image five',
					caption: 'Sample 05',
					gnomon: accentGnomon
				},
				{ src: '/images/img-sample-6.jpg', alt: 'Sample image six', caption: 'Sample 06' },
				{
					src: '/images/img-sample-7.jpg',
					alt: 'Sample image seven',
					caption: 'Sample 07',
					gnomon: accentGnomon
				},
				{ src: '/images/img-sample-1.jpg', alt: 'Sample image eight', caption: 'Sample 08' }
			],
			copy: 'Each group repeats the same four-image-and-copy structure. Only the content changes, which is what makes the sequence read as varied rather than repetitive.'
		},
		{
			images: [
				{
					src: '/images/img-sample-3.jpg',
					alt: 'Sample image nine',
					caption: 'Sample 09',
					gnomon: accentGnomon
				},
				{ src: '/images/img-sample-1.jpg', alt: 'Sample image ten', caption: 'Sample 10' },
				{
					src: '/images/img-sample-6.jpg',
					alt: 'Sample image eleven',
					caption: 'Sample 11',
					gnomon: accentGnomon
				},
				{ src: '/images/img-sample-2.jpg', alt: 'Sample image twelve', caption: 'Sample 12' }
			],
			copy: 'A third group to make the horizontal scroll distance feel real when previewing the section.'
		}
	];
	const slides = Array.from({ length: 8 }, (_, index) => ({
		src: `/images/img-sample-${(index % 7) + 1}.jpg`,
		alt: `Sample image ${index + 1}`,
		title: `Title ${index + 1}`,
		description: `Description ${index + 1}`
	}));
	const perks = [
		{
			title: 'Unlimited Services',
			icon: 'infinity',
			description:
				'Gain access to endless design and development services. Simply put in a ticket in Trello to get started. Please be aware that each request is worked on and delivered one by one.',
			cta: { text: 'View Plans', url: '/' }
		},
		{
			title: 'Swift Delivery',
			icon: 'bolt',
			description:
				'Get designs or sections of your website generally within 1-2 business days (M-F). Please be aware that some websites can take weeks or even months to complete depending on their size and complexity.',
			cta: { text: 'Visit Components', url: '/components' }
		},
		{
			title: 'Easy Management',
			icon: 'inventory',
			description:
				'Keeping track of progress is made easy with Trello. Simply sign in from your computer or phone to create and manage tasks, then watch as your requests are completed and delivered.',
			cta: { text: 'Return Home', url: '/' }
		},
		{
			title: 'Fixed Pricing',
			icon: 'price-tag',
			description:
				'Don’t worry about inconsistent pricing that fluctuates throughout the year. Once signed up, your prices are locked in, ensuring you always know what to expect month to month.',
			cta: { text: 'View Plans', url: '/' }
		},
		{
			title: 'Pause Anytime',
			icon: 'pause',
			description:
				'No contracts, ever. We understand that your workload may change, so feel free to pause or cancel anytime. “Pausing” stops all charges and allows for quick start up again while keeping your rate locked in.',
			cta: { text: 'View Plans', url: '/' }
		}
	];
	const work = [
		['Project 1', 'Design', 2025, '/'],
		['Project 2', 'Development', 2024, 'https://axyscreative.com'],
		['Project 3', 'Design + Development', 2023, '/'],
		['Project 4', 'Design', 2024, '/'],
		['Project 5', 'Development', 2024, '/'],
		['Project 6', 'Design + Development', 2024, '/'],
		['Project 7', 'Design', 2024, '/'],
		['Project 8', 'Development', 2024, '/']
	].map(([title, type, year, url], index) => ({
		title: String(title),
		type: String(type),
		year,
		url: String(url),
		img: { src: `/images/img-sample-${(index % 7) + 1}.jpg`, alt: '' }
	}));
	const history = [
		[
			'2018',
			'The first sketch',
			'A napkin, a pen and an idea about how a studio could work with its clients.'
		],
		[
			'2019',
			'A studio opens',
			'The first small team, a shared space and a handful of founding clients.'
		],
		[
			'2020',
			'A studio opens',
			'The first small team, a shared space and a handful of founding clients.'
		],
		[
			'2021',
			'A process of our own',
			'Years of projects distilled into a way of working that we could write down.'
		],
		[
			'2022',
			'The product years',
			'Moving from one-off sites to products that grow with the people who use them.'
		],
		[
			'2023',
			'The product years',
			'Moving from one-off sites to products that grow with the people who use them.'
		],
		[
			'2024',
			'A bigger table',
			'More designers, more developers and a library of parts we reuse everywhere.'
		],
		[
			'2026',
			'What comes next',
			'Faster, calmer and more careful, with the same curiosity we started with.'
		]
	].map(([date, title, description], index) => ({
		date,
		title,
		description,
		image: { src: `/images/img-sample-${(index % 7) + 1}.jpg`, alt: title }
	}));
	const plans = [
		{
			title: 'Designer',
			priceMonthly: '1,995',
			priceQuarterly: '1,695',
			totalQuarterly: '5,085',
			savingsQuarterly: '$900',
			features: [
				{ text: 'Unlimited Web Design', strong: true },
				'One request at a time',
				'Unlimited revisions',
				'Same day turnaround',
				'Pause or cancel anytime'
			],
			ctaMonthly: {
				text: 'Subscribe',
				textDescription: 'Subscribe to the monthly designer plan',
				url: '/'
			},
			ctaQuarterly: {
				text: 'Subscribe',
				textDescription: 'Subscribe to the quarterly designer plan',
				url: '/'
			}
		},
		{
			title: 'Developer',
			priceMonthly: '2,995',
			priceQuarterly: '2,545',
			totalQuarterly: '7,635',
			savingsQuarterly: '$1,350',
			features: [
				{ text: 'Unlimited Web Development', strong: true },
				'One request at a time',
				'Unlimited revisions',
				'Same day turnaround',
				'Pause or cancel anytime'
			],
			ctaMonthly: {
				text: 'Subscribe',
				textDescription: 'Subscribe to the monthly developer plan',
				url: '/'
			},
			ctaQuarterly: {
				text: 'Subscribe',
				textDescription: 'Subscribe to the quarterly developer plan',
				url: '/'
			}
		},
		{
			title: 'Premium',
			priceMonthly: '3,995',
			priceQuarterly: '3,395',
			totalQuarterly: '10,185',
			savingsQuarterly: '$1,800',
			featured: true,
			features: [
				{ text: 'Unlimited Design + Development', strong: true },
				{ text: 'Two requests at a time', strong: true },
				'Unlimited revisions',
				'Same day turnaround',
				'Pause or cancel anytime'
			],
			ctaMonthly: {
				text: 'Subscribe',
				textDescription: 'Subscribe to the monthly premium plan',
				url: '/'
			},
			ctaQuarterly: {
				text: 'Subscribe',
				textDescription: 'Subscribe to the quarterly premium plan',
				url: '/'
			}
		}
	];
	const cta = {
		primary: { text: 'Visit Library', url: '/components' },
		secondary: {
			text: 'Get Started',
			url: 'https://axyscreative.com',
			newTab: true,
			iconEnd: 'chevron-right'
		}
	};
</script>

<MouseCursor
	elastic
	variants={{ 'content-1': { size: 64, opacity: 1, background: 'var(--color-accent)' } }}
/>

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Sections"
	description="Full-width blocks of a page. Each opens with the same eyebrow, title, description and buttons."
/>

<div class="sections page-grid">
	<LibrarySection
		title="Blog Article Body"
		type="Section"
		description="The text of a post: Markdown rendered to HTML, in a readable column with styled headings, lists, quotes and code. See the Blog page for it in use."
		props={blogArticleBodyProps}
	/>

	<LibrarySection
		title="Blog Article Hero"
		type="Section"
		description="The top of a post: tag, date and author, the title, a short description and a wide cover image."
		props={blogArticleHeroProps}
	/>

	<LibrarySection
		title="Carousel Spotlight"
		type="Section"
		description="Section copy above a row of large slides. The active slide is centered at three quarters of the screen, with the slides before and after it cut off by the edges of the screen at partial opacity. The title and description float in a blurred glass panel over the picture, and its offset from the corner is one variable. Dots below show the position, with the active one stretched into a pill. It drags with the mouse, finger or a trackpad swipe, and the arrow keys move between slides."
		props={carouselSpotlightProps}
	>
		<CarouselSpotlight
			id="carousel-spotlight"
			class="full"
			{...carouselSpotlight}
			cta={{
				primary: carouselSpotlight.cta.primary,
				secondary: carouselSpotlight.cta.secondary.text
					? carouselSpotlight.cta.secondary
					: undefined
			}}
		/>
	</LibrarySection>

	<LibrarySection
		title="Carousel Testimonials"
		type="Section"
		description="Section copy with the previous and next arrows on the right, and a row of testimonial cards below. The first card lines up with the copy and the row runs on past the right edge of the screen. It scrolls natively, so touch and trackpad work, the cards snap into place, and the row is focusable for the arrow keys. The arrows hide when every card already fits."
		props={carouselTestimonialsProps}
	>
		<CarouselTestimonials
			class="full"
			eyebrowText="Testimonials"
			title="Trusted by customers nationwide"
			testimonials={[
				{
					quote: 'They took a vague idea and turned it into a site we are proud to send people to.',
					name: 'Ada Lovelace',
					role: 'Founder, Northline',
					image: { src: '/images/img-sample-1.jpg', alt: '' }
				},
				{
					quote:
						'The whole process was calm and clear. We always knew what was next, and the launch was the quietest we have had.',
					name: 'Grace Hopper',
					role: 'Operations, Aperture',
					image: { src: '/images/img-sample-2.jpg', alt: '' }
				},
				{
					quote: 'Fast, careful and a pleasure to work with.',
					name: 'Linus Torvalds',
					role: 'Director, Glasswave',
					image: { src: '/images/img-sample-3.jpg', alt: '' }
				},
				{
					quote:
						'Our traffic moved up within the first month, and the team can finally edit pages without calling anyone.',
					name: 'Margaret Hamilton',
					role: 'Marketing, Meridian',
					image: { src: '/images/img-sample-4.jpg', alt: '' }
				},
				{
					quote: 'Exactly what we asked for, and a few things we did not know to ask for.',
					name: 'Alan Turing',
					role: 'Owner, Fernwood',
					image: { src: '/images/img-sample-5.jpg', alt: '' }
				}
			]}
		/>
	</LibrarySection>

	<LibrarySection
		title="Carousel Tunnel"
		type="Section"
		description="Scroll to zoom out of a full-screen image into a carousel with the next slides peeking in. Nothing is cropped on the way down. Once the zoom ends the copy, captions and arrows fade in and the carousel starts to autoplay. It loops forever, can be dragged, and holds while hovered or focused. With reduced motion it is a plain carousel that does not move on its own."
		props={carouselTunnelProps}
	>
		<CarouselTunnel
			class="full"
			eyebrowText="Featured Work"
			title="Every Project Tells a Story"
			description="Scroll to zoom out of the tunnel and reveal the full carousel."
			slides={projects}
			autoplay={{ interval: 4500, quickStart: true }}
			titleEffect="scale"
		/>
	</LibrarySection>

	<LibrarySection
		title="Circle Highlight"
		type="Section"
		description="A pinned, scroll-driven donut chart. The ring lights one slice at a time, always clockwise, with that slice's caption beside it, and ends on a finish where every slice is lit. The captions can sit around the ring or in its hole, and a logo in the hole stays put. Once the section is pinned the slices are tab stops: focusing, clicking or tapping one scrolls to its step. With reduced motion, or without JavaScript, every slice and caption just shows."
		props={circleHighlightProps}
	>
		<CircleHighlight
			class="full"
			eyebrowText="Our Process"
			title="How We Work"
			description="Scroll to move clockwise through each stage of the process."
			slices={stages}
			holeSize={64}
			radius={3}
			gap={4}
			image={{ srcLight: '/images/logo-black.svg', srcDark: '/images/logo-white.svg', alt: 'axys' }}
		/>
	</LibrarySection>

	<LibrarySection
		title="Gallery Horizontal"
		type="Section"
		description="A collage of Card Gnomon images that slides sideways as you scroll. From the `lg` breakpoint up the section pins to the screen while the track moves, for exactly as far as it overflows, then lets go. Below that, or when motion is reduced, it is a plain column or a row that scrolls on its own. Each group reveals as it comes into view."
		props={galleryHorizontalProps}
	>
		<GalleryHorizontal
			class="full"
			title="Gallery Horizontal"
			accent="Selected Work"
			groups={galleryGroups}
		/>
	</LibrarySection>

	<LibrarySection
		title="Headline"
		type="Section"
		description="A centered statement that flips in word by word with Text Flip, with an optional eyebrow. Give it a quote giver and it is wrapped in quotes and credited beneath. It is a paragraph, not a heading, because it is a statement and not a section title."
		props={headlineProps}
	>
		<Headline
			class="full"
			eyebrowText="Our Philosophy"
			eyebrowIcon="bolt"
			text={"[We believe]{.secondary} good design should feel effortless, the kind you only notice once it's gone."}
		/>
		<Headline
			class="full"
			eyebrowText="Customer Story"
			eyebrowIcon="check-circle"
			text="Working with AXYS felt less like hiring an agency and more like gaining a team."
			quote={{
				name: 'Jamie Rivera',
				role: 'Founder, Example Co.',
				image: { src: '/images/img-sample-3.jpg', alt: 'Portrait of Jamie Rivera' }
			}}
		/>
	</LibrarySection>

	<LibrarySection
		title="Hero Carousel"
		type="Section"
		description="A hero whose background is a full-screen picture. The arrows move through the slides, and each one changes the picture and the copy together. With `float` it sits inset from the screen edges, like the floating header and footer."
		props={heroCarouselProps}
	>
		<HeroCarousel
			class="full"
			slides={[
				{
					image: images[0],
					title: 'Hero Carousel',
					description:
						'A full-screen picture with the copy at the bottom and arrows to move between slides.'
				},
				{
					image: images[1],
					title: 'Second slide',
					description: 'The background and the copy both change with the slide.'
				},
				{
					image: images[2],
					title: 'Third slide',
					description: 'Reaching the end wraps back around to the first.'
				}
			]}
			float
			autoplay={6000}
		/>
	</LibrarySection>

	<LibrarySection
		title="Hero Image Circle"
		type="Section"
		description="A hero with circles of spinning images flanking the copy. They sit mostly off the screen, so only the cards that swing in show, and they bleed past the top and bottom of the section. Below the `lg` breakpoint the copy stacks over the top half of one circle."
		props={heroImageCircleProps}
	>
		<HeroImageCircle
			class="full"
			eyebrowIcon="orbit"
			title="Hero Image Circle"
			description="A hero section with two circular image clusters flanking the content."
			{cta}
			{images}
			scrub={1}
		/>
		<HeroImageCircle
			class="full"
			title="Copy on the left"
			description="One circle on the right edge, with the copy moved to the left."
			{cta}
			{images}
			direction="left"
		/>
	</LibrarySection>

	<LibrarySection
		title="Hero Image Wave"
		type="Section"
		description="A centered hero with an Image Wave of pictures running beneath the copy, and an optional handwritten accent beside it."
		props={heroImageWaveProps}
	>
		<HeroImageWave
			class="full"
			eyebrowText="Hero Variant"
			title="Hero Image Wave"
			description="A centered hero with an accent flourish and a wave of images beneath the content."
			accent="Hand-crafted"
			{cta}
			{images}
			wave={{ speed: 40, duration: 10, amplitude: 48, scrub: 0.5 }}
		/>
	</LibrarySection>

	<LibrarySection
		title="Hero Simple"
		type="Section"
		description="A page's opening section: Section Copy centered in a tall block. Every page in this library opens with one, and so does the home page. For a hero that is not a page title, pass a lower `level`."
		props={heroSimpleProps}
	/>
	<LibrarySection
		title="Plan Selection"
		type="Section"
		description="Pricing cards with an optional Monthly / Quarterly switch. The switch is a radio group with the Toggle Slider attachment, the same way as the Theme Toggle, so it works with the keyboard and screen readers. The featured card stands out with an accent background."
		props={planSelectionProps}
	>
		<PlanSelection
			class="full"
			title="Plan Selection"
			description="Find the right plan for you and eliminate the hassle of inconsistent freelancers and expensive agencies. Let’s get started today."
			{plans}
			priceToggle
			discount="15%"
		/>
	</LibrarySection>
	<LibrarySection
		title="Scroll Horizontal"
		type="Section"
		description="Changes the scroll direction: the section pins to the screen and its content slides sideways as you scroll, then lets go. It shows images with captions, or one long line of text, which is useful for showing many items in a compact space. It uses the Scroll Slide attachment, and at every screen size. With reduced motion it is a row that scrolls on its own."
		props={scrollHorizontalProps}
	>
		<ScrollHorizontal
			class="full"
			title="Scroll Horizontal"
			description="This is a scroll horizontal section that alters the scroll direction along the x axis. You can display text or images, which is useful for showcasing multiple items in a compact space."
			items={slides}
		/>
		<ScrollHorizontal
			class="full"
			message="This is the scroll horizontal section using a <span class='stroke'>message</span> instead of a set of images."
		/>
	</LibrarySection>
	<LibrarySection
		title="Scroll Stack"
		type="Section"
		description="The section pins to the screen and each panel slides up over the one before it, which shrinks a little as it is covered. It is one scrubbed animation on one pinned frame, so it does not disturb the sections around it. Panels can fill the width, or be half as wide on either side with the copy pinned beside them. With reduced motion, or without JavaScript, the panels are an ordinary column of cards."
		props={scrollStackProps}
	>
		<ScrollStack
			class="full"
			title="Scroll Stack"
			description="A great way to show perks and benefits in a unique way. Intended for two or more panels."
			panels={perks.slice(0, 3)}
		/>
		<ScrollStack
			class="full"
			title="Scroll Stack, beside the copy"
			description="Half-width panels on the right with the copy pinned on the left, and a row of links that jump to each one."
			cta={{
				primary: { text: 'View Plans', url: '/' },
				secondary: { text: 'Our Work', url: '/' }
			}}
			panels={perks}
			nav
			size="half"
			placement="right"
		/>
	</LibrarySection>

	<LibrarySection
		title="Scroll Timeline"
		type="Section"
		description="A timeline that advances as you scroll. The timeline pins while the section copy is still leaving the screen: a line from the first circle to the last, with a circle for each event. The active one grows, takes the brand color and slides to the middle. The `details` variant shows the event's title and text beneath. The `circle` variant shows the top of a large ring of the events' images, turned so the active card is at the top, with the event's details taking the place of the section copy. Circles are buttons that scroll to their event, and focusing one with the keyboard does the same, so its date is always in view. The circle variant shows the active card and two on each side, on an open arc rather than a full circle. Without JavaScript, or with reduced motion, it is a plain list of events."
		props={scrollTimelineProps}
	>
		<ScrollTimeline
			class="full"
			eyebrowText="Our story"
			title="How we got here"
			description="Scroll to move through the years."
			cta={{ primary: { text: 'Meet the team', url: '/' } }}
			events={history}
		/>
		<ScrollTimeline
			class="full"
			variant="circle"
			copyLayout="split"
			eyebrowText="Our story"
			title="A timeline on a circle"
			description="Scroll to turn the circle to each year. The event takes the place of this copy."
			events={history}
		/>
	</LibrarySection>

	<LibrarySection
		title="Tunnel"
		type="Section"
		description="A picture or video opens up as you scroll to it, like looking down a tunnel. By default the media widens to the full screen as the section arrives, with a parallax drift. Centered pins it in the middle and grows it to fill the screen, and reversed does either backwards. A message can fill in over the end. There are four ways to use it, below."
		props={tunnelProps}
	>
		<Tunnel
			class="full"
			extended
			img={{ src: '/images/img-sample-7.jpg', alt: '' }}
			message="This is a sample message to include as part of the tunnel section. It will come in as you scroll to the end of the section."
		/>
		<Tunnel
			class="full"
			reversed
			img={{ src: '/images/img-sample-2.jpg', alt: '' }}
			parallax={{ offset: '75%' }}
		/>
		<Tunnel
			class="full"
			centered
			video="https://www.dropbox.com/scl/fi/6sh06eo6b3x84qo823qcq/sample-video-1.mp4?rlkey=0v6dqkra2wk7de0rz849ufm7o&st=0705ulra&raw=1"
		/>
		<Tunnel class="full" centered reversed img={{ src: '/images/img-sample-4.jpg', alt: '' }} />
	</LibrarySection>
	<LibrarySection
		title="Work Gallery"
		type="Section"
		description="A grid of project images with the name, what was done and the year. Hovering an image shows an arrow in the custom cursor, scrambles the type text underneath, and settles the zoom. It uses Cursor Content and Glitch Target, so the cursor needs `<MouseCursor />`, which this page mounts. Items without a `url` are plain images."
		props={workGalleryProps}
	>
		<WorkGallery
			class="full"
			title="Work Gallery"
			description="Optional description here"
			items={work}
		/>
	</LibrarySection>
</div>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	.sections {
		row-gap: 128px;
		padding-block: var(--body-padding);
	}
</style>
