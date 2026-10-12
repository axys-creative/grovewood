<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import ImageColumns from '$lib/components/image-columns.svelte';
	import MarqueeCurve from '$lib/components/marquee-curve.svelte';
	import Marquee from '$lib/components/marquee.svelte';
	import ImageShuffle from '$lib/components/image-shuffle.svelte';
	import ImageFan from '$lib/components/image-fan.svelte';
	import ImageCircle from '$lib/components/image-circle.svelte';
	import ImageWave from '$lib/components/image-wave.svelte';
	import ImageComparison from '$lib/components/image-comparison.svelte';
	import social from '$lib/content/global/social-media.json';
	import SocialLinks from '$lib/components/social-links.svelte';
	import Strap from '$lib/components/strap.svelte';
	import SolarSystem from '$lib/components/solar-system.svelte';
	import ScrollProgress from '$lib/components/scroll-progress.svelte';
	import SideShadows from '$lib/components/side-shadows.svelte';
	import Form from '$lib/components/form.svelte';
	import Counter from '$lib/components/counter.svelte';
	import CarouselAccordion from '$lib/components/carousel-accordion.svelte';
	import Carousel from '$lib/components/carousel.svelte';
	import CardGnomon from '$lib/components/card-gnomon.svelte';
	import AvatarCycle from '$lib/components/avatar-cycle.svelte';
	import Accordion from '$lib/components/accordion.svelte';
	import AccordionTable from '$lib/components/accordion-table.svelte';
	import { watchScroll } from '$lib/attachments/watch-scroll';
	import BackToTop from '$lib/components/back-to-top.svelte';
	import Button from '$lib/components/button.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import PostCard from '$lib/components/post-card.svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import VideoPlayer from '$lib/components/video-player.svelte';
	import VideoOverlay from '$lib/components/video-overlay.svelte';
	import {
		accordionProps,
		accordionTableProps,
		avatarCycleProps,
		backToTopProps,
		cardGnomonProps,
		carouselAccordionProps,
		carouselProps,
		counterProps,
		formProps,
		imageCircleProps,
		imageColumnsProps,
		imageFanProps,
		imageShuffleProps,
		marqueeCurveProps,
		marqueeProps,
		imageComparisonProps,
		imageWaveProps,
		mouseCursorProps,
		postCardProps,
		richTextProps,
		scrollProgressProps,
		sideShadowsProps,
		solarSystemProps,
		strapProps,
		videoOverlayProps,
		videoPlayerProps
	} from '$lib/library/component-props';
	import LibrarySection from '$lib/library/library-section.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import { navEntry } from '$lib/utils/nav';

	const richTextSample =
		'Every project tells a [story]{.scribble}, in the [brand color]{.primary}, with [outlined]{.stroke} and [italic]{.italic} words,{.br}[bold]{.strong} ones and [all of them at once]{.primary .italic .scribble}.';

	const nav = navEntry('/components');
	let videoOpen = $state(false);
	let progress = $state<'bottom' | 'right' | 'left' | null>(null);
	let shadows = $state(false);

	const long =
		'Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima numquam officiis ipsa obcaecati illo molestias aliquam molestiae praesentium provident eos? Excepturi veniam assumenda non corrupti similique aperiam rem enim dolores repellat.';
	const images = [
		'img-sample-1',
		'img-sample-2',
		'img-sample-3',
		'img-sample-4',
		'img-sample-5',
		'img-sample-6',
		'img-sample-7'
	];
	const photoSlides = (total: number) =>
		Array.from({ length: total }, (_, index) => ({
			title: `Title ${index + 1}`,
			desc: `Description ${index + 1}`,
			img: `/images/${images[index % images.length]}.jpg`
		}));
	const cardSlides = Array.from({ length: 4 }, (_, index) => ({
		title: `Title ${index + 1}`,
		desc: `Description ${index + 1}`
	}));
	const gallery = [
		'img-sample-1',
		'img-sample-2',
		'img-sample-3',
		'img-sample-4',
		'img-sample-5',
		'img-sample-6',
		'img-sample-7'
	];
	const galleryImages = (total: number) =>
		Array.from({ length: total }, (_, index) => ({
			src: `/images/${gallery[index % gallery.length]}.jpg`,
			alt: `Sample image ${index + 1}`
		}));
	const partners = [
		'Logoipsum',
		'Logoipsum signature',
		'Logoipsum Academy',
		'Logoipsum Network',
		'Logoipsum Ipsum',
		'Logoipsum 标识',
		'Logoipsum colorful'
	].map((alt, index) => ({ src: `/images/logo-sample-${index + 1}.svg`, alt }));
	const people = [
		[
			'Ada',
			'Founder',
			'Started the studio to make the web feel simple, quick and a little bit playful.'
		],
		[
			'Grace',
			'Engineering',
			'Keeps the build fast and the pages light, and loves a good accessibility audit.'
		],
		[
			'Linus',
			'Design',
			'Turns rough ideas into clean layouts, then sweats the spacing until it feels right.'
		],
		[
			'Margaret',
			'Strategy',
			'Finds the real goal behind a project and keeps every decision pointed at it.'
		],
		[
			'Alan',
			'Support',
			'The first to answer, and the last to stop until the problem is actually solved.'
		]
	].map(([title, role, caption], index) => ({
		src: `/images/img-sample-${index + 1}.jpg`,
		alt: `${title}, ${role}`,
		title: `${title}, ${role}`,
		caption
	}));
	const faq = [
		{
			title:
				'What happens if you have really long content? Does this still work with lengthy titles or does it just work with short ones?',
			content: `Content can hold <a href="https://axyscreative.com" target="_blank" rel="noopener noreferrer">a link</a>. ${long}`
		},
		{ title: 'What about long inner content?', content: `${long} ${long} ${long}` },
		{
			title: 'What features does this accordion have?',
			content:
				'It is accessible, works with any content length, and has a few options such as single open and an icon or plus sign.'
		}
	];
	const tableColumns = [
		{ key: 'photo', label: 'Photo', type: 'image' as const, width: '96px' },
		{ key: 'year', label: 'Year', width: '112px' },
		{ key: 'location', label: 'Location', width: '2fr' }
	];
	const places = [
		['img-sample-1', '2024', 'Salt Lake City, UT', long],
		[
			'img-sample-2',
			'2022',
			'Denver, CO',
			'A shorter description that sits directly beneath the year.'
		],
		['img-sample-3', '2019', 'Portland, OR', `${long} ${long}`],
		['img-sample-4', '2018', 'Phoenix, AZ', 'Lorem ipsum dolor sit amet.'],
		['img-sample-5', '2017', 'Las Vegas, NV', 'Lorem ipsum dolor sit amet.'],
		['img-sample-6', '2015', 'Santa Fe, NM', 'Lorem ipsum dolor sit amet.']
	].map(([image, year, location, content], index) => ({
		photo: { src: `/images/${image}.jpg`, alt: '' },
		year,
		location,
		content,
		...(index === 0 && {
			images: ['img-sample-7', 'img-sample-5', 'img-sample-6', 'img-sample-4'].map((name) => ({
				src: `/images/${name}.jpg`,
				alt: ''
			})),
			slidesPerView: 3,
			cta: { text: 'View gallery', url: '/', type: 'outline' as const }
		})
	}));
</script>

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Components"
	description="Larger pieces of UI that bring their own behavior. The smaller building blocks live in the style guide."
/>

<div class="components page-grid">
	<LibrarySection
		title="Accordion"
		type="Component"
		description="Tucks away lengthy info, often an FAQ. Each title is a button that opens its panel, so it works with the keyboard and screen readers. The panel grows to any height with no measuring."
		props={accordionProps}
	>
		<h3 class="plain">Icon, one open at a time</h3>
		<Accordion items={faq} icon="chevron-down" singleOpen />
		<h3 class="plain">Plus sign with open all, the first item open</h3>
		<Accordion items={faq} plus toggleAll defaultOpen={0} />
	</LibrarySection>

	<LibrarySection
		title="Accordion Table"
		type="Component"
		description="A table-style accordion: a header row names the columns, and every row below is an accordion item whose cells line up with those headers. It uses plain elements, not a `<table>`, and collapses to stacked rows on small screens. Style it with `--gap`, `--img-size` and `--sticky-top` (the sticky offset, e.g. a fixed header's height)."
		props={accordionTableProps}
	>
		<AccordionTable
			columns={tableColumns}
			items={places.slice(0, 3)}
			icon="chevron-down"
			singleOpen
			defaultOpen={0}
			contentColumn={3}
		/>
		<h3 class="plain">Sticky header, several rows open at once</h3>
		<AccordionTable
			columns={tableColumns}
			items={places}
			icon="chevron-down"
			sticky
			contentColumn={3}
		/>
	</LibrarySection>

	<LibrarySection
		title="Avatar Cycle"
		type="Component"
		description="A row of round avatars with a caption card below. The one in the middle is the largest and the ones further out are smaller, overlapping a little, with the middle on top. It turns by itself, the middle moving to the left as the next one comes in. The ring around each avatar matches the background, so each looks as if it cuts into its neighbors. The caption cards stack behind the front one, showing their tops, and turn in step. Clicking an avatar brings it to the middle. It can hold while hovered or focused, with `pauseOnHover`."
		props={avatarCycleProps}
	>
		<h3 class="plain">Three avatars</h3>
		<div class="avatar-demo">
			<AvatarCycle items={people.slice(0, 3)} />
		</div>
		<h3 class="plain">Five avatars, same settings</h3>
		<div class="avatar-demo">
			<AvatarCycle items={people} />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Back To Top"
		type="Component"
		description="A Button that glides the page back to the top. It is a link to `#`, so it needs no script of its own: Smooth Scroll turns it into a smooth glide, and without it the browser jumps to the top. The footer's return link is this component. Everything else is a Button prop, so it takes the same types, sizes and attachments."
		props={backToTopProps}
	>
		<div class="back-to-top-demo">
			<BackToTop />
			<BackToTop type="solid" text="Top" />
			<BackToTop type="outline" text="" textDescription="Back to top" />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Card Gnomon"
		type="Component"
		description="A square card with one or more rectangular notches cut from its corners or sides (a gnomon). The border is an SVG stroke, so its color can transition on hover, and the image is clipped to the exact same shape."
		props={cardGnomonProps}
	>
		<h3 class="plain">Default notch with an image and text</h3>
		<CardGnomon
			img={{ src: '/images/img-sample-1.jpg', alt: 'Sample card image' }}
			cutouts={[{ from: 'top-right', text: 'Sample 01' }]}
		/>
		<h3 class="plain">A deeper, longer cut with a tilted angle and content instead of an image</h3>
		<CardGnomon
			cutouts={[{ from: 'bottom-right', text: 'Keep angle near 90' }]}
			depth={12}
			length={48}
			angle={80}
			radius={4}
		>
			<p>This uses an angle of 80.</p>
		</CardGnomon>
		<h3 class="plain">A notch centered on a side</h3>
		<CardGnomon
			cutouts={[{ from: 'bottom', text: 'View more' }]}
			depth={10}
			length={32}
			angle={75}
			radius={2}
			img={{ src: '/images/img-sample-1.jpg', alt: 'Sample card image' }}
		/>
		<h3 class="plain">Two notches on opposite corners</h3>
		<CardGnomon
			cutouts={[
				{ from: 'top-right', text: 'Sample 01' },
				{ from: 'bottom-left', text: 'Sample 02' }
			]}
			depth={10}
			length={32}
			angle={80}
			radius={2}
			img={{ src: '/images/img-sample-1.jpg', alt: 'Sample card image' }}
		/>
	</LibrarySection>

	<LibrarySection
		title="Carousel Accordion"
		type="Component"
		description="A picture on the left and an accordion on the right, on a timer. One item is open at a time, showing its description and its picture. The border under the open item fills over the interval, and then the next item opens. The open title takes the accent color and the others are muted. From the `md` breakpoint up the list is exactly as tall as the picture, with the open item taking the space that is left. Hovering or focusing the list pauses the timer, and clicking an item opens it straight away. With reduced motion nothing moves on its own."
		props={carouselAccordionProps}
	>
		<CarouselAccordion
			items={[
				{
					title: 'Discover',
					description:
						'We start with workshops and interviews to understand the real problem, not just the one in the brief. Along the way we look at your audience, your competitors and what is already working.',
					image: { src: '/images/img-sample-1.jpg', alt: 'Sample image 1' }
				},
				{
					title: 'Define',
					description:
						'Research only helps once it turns into decisions, so this step is about narrowing down. We pull everything we learned into a single brief that names the audience, the goals and the measures of success. We list what is in scope for the first release and what waits for later, with a rough timeline and the trade-offs behind each choice. The brief is reviewed with your team and signed off before any design begins, so everyone is working from the same page and surprises are rare once the build is underway.',
					image: { src: '/images/img-sample-2.jpg', alt: 'Sample image 2' }
				},
				{
					title: 'Design',
					description: 'Exploring directions and refining the chosen one.',
					image: { src: '/images/img-sample-3.jpg', alt: 'Sample image 3' }
				},
				{
					title: 'Build',
					description: 'Engineering the approved design into a real product.',
					image: { src: '/images/img-sample-4.jpg', alt: 'Sample image 4' }
				}
			]}
		/>
	</LibrarySection>

	<LibrarySection
		title="Carousel"
		type="Component"
		description="A dependency-free carousel built on native CSS scroll-snap. Touch and trackpad scroll natively, the mouse can drag, and the arrow keys work when the track is focused."
		props={carouselProps}
	>
		<h3 class="plain">Arrows</h3>
		<Carousel label="Sample carousel with arrows" slides={photoSlides(6)} slidesPerView={3} />
		<h3 class="plain">Arrows, progress and loop</h3>
		<Carousel
			label="Sample looping carousel with progress"
			slides={photoSlides(5)}
			slidesPerView={3}
			progress
			loop
			autoplay={{ enabled: true }}
		/>
		<h3 class="plain">Dots and autoplay</h3>
		<div class="cards">
			<Carousel
				label="Sample carousel with dots"
				slides={cardSlides}
				pagination="dots"
				loop
				autoplay={{ enabled: true, interval: 3200 }}
			/>
		</div>
		<h3 class="plain">With a button</h3>
		<Carousel
			label="Sample carousel with a button"
			slides={photoSlides(4)}
			slidesPerView={2}
			cta={{ text: 'View gallery', url: '/', type: 'outline' }}
		/>
	</LibrarySection>

	<LibrarySection
		title="Counter"
		type="Component"
		description="Reflects a stat by counting up to it when it scrolls into view, then back to zero when it leaves (unless `once`). Screen readers get the final number, not the counting. With reduced motion the final number just shows. It needs no GSAP."
		props={counterProps}
	>
		<div class="counters">
			<Counter
				digit={12500}
				comma
				prefix="$"
				suffix="+"
				label="Donated to the poor"
				spokenLabel="Over 12,500 dollars donated to the poor"
				duration={5000}
			/>
			<Counter
				digit={3.2}
				suffix="M"
				label="Books donated"
				spokenLabel="3.2 million books donated"
			/>
			<Counter
				digit={3200}
				prefix="~"
				label="Hours served"
				spokenLabel="Roughly 3,200 hours served"
				duration={8400}
				once
			/>
			<Counter digit={1529718} comma prefix="$" label="'Ticker' style" ticker />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Form"
		type="Component"
		description="A contact form with two behaviors. Forms need Netlify set up: a page with a form must be prerendered so Netlify can find it, and the form is only sent in production (locally the feedback form shows its alert and the redirect form goes to the next page, without sending). Fields are floating labels, a honeypot catches bots, and `showRecaptcha` adds Netlify's reCAPTCHA."
		props={formProps}
	>
		<LibrarySection
			level={3}
			title="With feedback"
			description="Shows an alert on submit: success, or a warning if the same email is used twice (remembered in this browser). Alerts stack in the bottom right."
		>
			<div class="form-demo">
				<Form feedback showMessage />
			</div>
		</LibrarySection>
		<LibrarySection
			level={3}
			title="With a redirect"
			description="Sends the visitor to another page after submitting, here the Form Submitted page. `showPhone`, `showAddress` and `showDiscovery` add more fields."
		>
			<div class="form-demo">
				<Form showPhone showAddress showDiscovery maxCountDiscovery={250} />
			</div>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Image Circle"
		type="Component"
		description="Cards spaced evenly around an exact circle, spinning slowly while each card turns against the ring to stay upright. It is decorative, so it has no hover response. It scales with its container, and is off with reduced motion."
		props={imageCircleProps}
	>
		<h3 class="plain">Upright cards</h3>
		<div class="circle-demo">
			<ImageCircle images={galleryImages(8)} itemWidth={20} />
		</div>
		<h3 class="plain">Bloom, spinning the other way</h3>
		<div class="circle-demo">
			<ImageCircle images={galleryImages(8)} itemWidth={20} bloom="top" direction="right" />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Image Columns"
		type="Component"
		description="A grid of images with an uneven number per column. As the page scrolls, every column moves up until its bottom lines up with the shortest column, which never moves. It needs GSAP ScrollTrigger, loaded only when the component is used, and is still when motion is reduced."
		props={imageColumnsProps}
	>
		<h3 class="plain">Plain images</h3>
		<ImageColumns
			images={[
				{ ...galleryImages(14)[0], accent: 'New', caption: 'Caption 1' },
				{ ...galleryImages(14)[1], caption: 'Caption 2' },
				...galleryImages(14).slice(2)
			]}
			columns={[3, 4, 3, 4]}
			columnsMd={[5, 4, 5]}
			columnsSm={[8, 6]}
			start="top center"
			startOffset="64px"
		/>
		<h3 class="plain apart">As gnomon cards</h3>
		<ImageColumns
			images={[
				{ ...galleryImages(10)[0], caption: 'One' },
				{ ...galleryImages(10)[1], caption: 'Two' },
				...galleryImages(10).slice(2)
			]}
			columns={[2, 3, 2, 3]}
			columnsMd={[4, 3, 4]}
			columnsSm={[4, 5]}
			gnomon={{ depth: 12, length: 36, radius: 4, angle: 80 }}
		/>
	</LibrarySection>

	<LibrarySection
		title="Image Comparison"
		type="Component"
		description="Two images with a divider between them: the position of the divider decides how much of each shows. It works by dragging, by hovering, and with the keyboard (arrow keys move 5%, Shift with an arrow 1%, Page Up and Page Down 20%), and it announces its position to screen readers."
		props={imageComparisonProps}
	>
		<h3 class="plain">Drag</h3>
		<ImageComparison
			before={{ src: '/images/img-sample-5.jpg', alt: 'The fifth sample image' }}
			after={{ src: '/images/img-sample-6.jpg', alt: 'The sixth sample image' }}
			beforeLabel="Before"
			afterLabel="After"
		/>
		<h3 class="plain">Follows the mouse</h3>
		<ImageComparison
			mode="hover"
			position={30}
			aspectRatio="21 / 9"
			before={{ src: '/images/img-sample-6.jpg', alt: 'The sixth sample image' }}
			after={{ src: '/images/img-sample-5.jpg', alt: 'The fifth sample image' }}
		/>
	</LibrarySection>

	<LibrarySection
		title="Image Fan"
		type="Component"
		description="Images curve along an arc whose radius comes from the spread and the card spacing, so the whole fan scales with its container. Hovering a card parts its neighbours. It is still when motion is reduced."
		props={imageFanProps}
	>
		<h3 class="plain">Pyramid that opens as it scrolls in</h3>
		<ImageFan
			images={galleryImages(5)}
			arc={40}
			gap={0.8}
			chop={16}
			itemWidth={20}
			stack="pyramid"
			animateIn
		/>
		<h3 class="plain">Closed ring that rises in</h3>
		<ImageFan images={galleryImages(8)} closed gap={0.9} itemWidth={16} animateIn />
	</LibrarySection>

	<LibrarySection
		title="Image Shuffle"
		type="Component"
		description="A grid of logos for a credibility section. Cells swap to a different image: the new one rolls up from below, or crossfades, one cell at a time or several together. The choice is random, but not truly: it prefers an image that is not on screen, never puts the same image beside itself, and never makes every cell match. It keeps shuffling under the mouse (`pauseOnHover` holds it), pauses while a cell has focus, and stops while off screen. Below `md` it drops to two columns. Give it more images than cells (eight by default) for the most variety; with fewer, some repeat, but never side by side. Logos made for white backgrounds can use the `light` tiles."
		props={imageShuffleProps}
	>
		<h3 class="plain">Roll, one at a time, on light tiles</h3>
		<ImageShuffle images={partners} interval={2000} tiles="light" />
		<h3 class="plain">Roll, three at a time</h3>
		<ImageShuffle images={partners} interval={2500} shuffle={3} />
		<h3 class="plain">Fade, everything at once, with only five images</h3>
		<ImageShuffle images={partners.slice(0, 5)} type="fade" interval={3000} shuffle={8} />
	</LibrarySection>

	<LibrarySection
		title="Image Wave"
		type="Component"
		description="A row of image cards that pans slowly left and loops without a seam, while each card bobs a little behind the one before it, so the bob reads as a wave travelling along the row. The images repeat enough to fill the screen. It is off with reduced motion."
		props={imageWaveProps}
	>
		<h3 class="plain">Scrolling pushes it along</h3>
		<ImageWave class="full" images={galleryImages(8)} scrub={0.5} />
		<h3 class="plain">Reverses with the scroll direction</h3>
		<ImageWave class="full" images={galleryImages(8)} scrub={0.5} reverse />
	</LibrarySection>

	<LibrarySection
		title="Marquee"
		type="Component"
		description="Text or images that run across the screen, also called a ticker. The content repeats to fill the width on its own, and rows move the same speed at every screen size. It holds still while off screen, and is still when motion is reduced."
		props={marqueeProps}
	>
		<h3 class="plain">Text, the simplest form</h3>
		<Marquee
			class="full"
			text="• Sample marquee • Sometimes known as a ticker • Use the text prop to control the content"
		/>
		<h3 class="plain">Two rows that turn around with the scroll direction</h3>
		<Marquee class="full" label="This one is more configured" rows={2} speed={80} reverse>
			This one is more configured <span class="marquee-flip">→</span>
		</Marquee>
		<h3 class="plain">Images, pushed along by scrolling</h3>
		<Marquee class="full" images={galleryImages(7)} rows={2} speed={40} scrub={0.5} pauseOnHover />
	</LibrarySection>

	<LibrarySection
		title="Marquee Curve"
		type="Component"
		description="Text that runs along a curve you draw. In the curve tool, drag the points until the shape is right, copy the cubic Bézier it gives you, and paste it into `curve` as it is. The text is centered on the curve, and an optional band with edge lines follows the same curve, so the background and both borders stay parallel to the text however much it bends. It repeats to fill the curve, moves the same speed at every screen size, holds still while off screen, and is still when motion is reduced."
		props={marqueeCurveProps}
	>
		<h3 class="plain">The curve as the tool draws it, edge to edge</h3>
		<MarqueeCurve
			class="full"
			text="Marquee with a twist (literally) using the marquee curve component! Recommended to use a mono spaced font!"
			curve="cubic-bezier(0.35, -0.05, 0.48, 1.12)"
			aspect={1.6}
		/>
		<h3 class="plain">Full width, a band with edge lines, and scroll reversing</h3>
		<MarqueeCurve
			class="full"
			text="A second sample of the marquee curve component with different curve and spacing values!"
			curve="cubic-bezier(0.72, 1.01, 0.27, -0.06)"
			spacing={0.8}
			band={120}
			aspect={1.7}
			reverse
		/>
	</LibrarySection>

	<LibrarySection
		title="Mouse Cursor"
		type="Component"
		description="A custom cursor that follows the mouse. Mount it once in a layout; attachments such as `cursorContent` and `cursorTarget` then change how it looks. It is hidden on touch devices and with reduced motion. See the Attachments page for live demos."
		props={mouseCursorProps}
	/>

	<LibrarySection
		title="Post Card"
		type="Component"
		description="A link card for one post in a list, with its cover image, tag, date, author and description. The first card of the Blog page is featured."
		props={postCardProps}
	>
		<PostCard
			post={{
				slug: 'a-short-post',
				title: 'A sample post',
				description: 'Cards are shown in a grid on the Blog page.',
				author: 'Author Here',
				date: '2026-02-02',
				tag: 'Update',
				coverImage: '/images/img-sample-1.jpg'
			}}
		/>
	</LibrarySection>

	<LibrarySection
		title="Rich Text"
		type="Component"
		description="How an admin styles a few words inside a plain text field without writing HTML. Wrap the words in square brackets and follow them with the classes in curly braces. Section Copy titles and descriptions, the Headline, the Scroll Horizontal message and the accordions all use it, and blog posts take the same tokens in their Markdown, where raw HTML is shown as text. Everything is escaped except the tokens, so nothing an admin types can break the page. Classes that are not on the list are ignored and the words stay."
		props={richTextProps}
	>
		<p class="h3">
			<RichText text={richTextSample} />
		</p>
	</LibrarySection>

	<LibrarySection
		title="Scroll Progress"
		type="Component"
		description="A small bar that fills as the page scrolls, down the right edge by default. It fades back after a moment without scrolling and returns on hover, and clicking it can jump the page to that point. It is decorative for screen readers, since the page's own scrollbar and keyboard already do the job. Mount it once in a layout. The buttons below show it on this page."
		props={scrollProgressProps}
	>
		<div class="row">
			<Button
				text="Right bar"
				type="outline"
				expanded={progress === 'right'}
				onclick={() => (progress = progress === 'right' ? null : 'right')}
			/>
			<Button
				text="Left bar"
				type="outline"
				expanded={progress === 'left'}
				onclick={() => (progress = progress === 'left' ? null : 'left')}
			/>
			<Button
				text="Bottom bar"
				type="outline"
				expanded={progress === 'bottom'}
				onclick={() => (progress = progress === 'bottom' ? null : 'bottom')}
			/>
		</div>
		{#if progress}<ScrollProgress placement={progress} hideScrollbar={false} />{/if}
	</LibrarySection>

	<LibrarySection
		title="Side Shadows"
		type="Component"
		description="Soft dark gradients down both edges of the screen, fixed over the page, so content fades in from the sides. They ignore the pointer and are hidden from screen readers. Mount it once in a layout for every page, or in one page for that page only. The button below shows it on this page."
		props={sideShadowsProps}
	>
		<div class="row">
			<Button
				text="Side shadows"
				type="outline"
				expanded={shadows}
				onclick={() => (shadows = !shadows)}
			/>
		</div>
		{#if shadows}<SideShadows />{/if}
	</LibrarySection>

	<LibrarySection
		title="Solar System"
		type="Component"
		description="A picture in a circle with up to two rings of tags orbiting it. Each ring turns slowly and its tags turn against it, so they stay upright and readable. It scales with its container, stops while off screen or hovered, and is still when motion is reduced. Tags are the Tag component, so they can take an icon."
		props={solarSystemProps}
	>
		<h3 class="plain">Two rings</h3>
		<div class="solar-demo">
			<SolarSystem
				image={{ src: '/images/img-sample-1.jpg', alt: 'A sample landscape' }}
				rings={[
					{
						tags: [
							{ text: 'Creative', icon: 'palette' },
							{ text: 'Responsive', icon: 'mobile' },
							{ text: 'Accessible', icon: 'accessible' },
							{ text: 'Engaging', icon: 'target' },
							{ text: 'Speedy', icon: 'bolt' },
							{ text: 'Unlimited', icon: 'infinity' }
						]
					},
					{
						tags: [
							{ text: 'HTML5' },
							{ text: 'CSS3/SCSS' },
							{ text: 'JavaScript' },
							{ text: 'TypeScript' },
							{ text: 'Svelte' }
						]
					}
				]}
			/>
		</div>
		<h3 class="plain">One ring, outline tags</h3>
		<div class="solar-demo">
			<SolarSystem
				image={{ src: '/images/img-sample-2.jpg', alt: 'A second sample landscape' }}
				tagType="outline"
				rings={[
					{
						tags: [{ text: 'Design' }, { text: 'Build' }, { text: 'Launch' }, { text: 'Grow' }],
						duration: 30
					}
				]}
			/>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Strap"
		type="Component"
		description="A pill with a round hole through it, like the loop on a lanyard. The strap has no background of its own: the loop is a transparent circle with an enormous box-shadow, and that shadow is the strap's color everywhere outside the circle. The strap clips it to its rounded shape, so the page shows through the loop. Anything can sit beside the loop, such as social links. Header Absolute uses it in the corner."
		props={strapProps}
	>
		<div class="strap-demo">
			<Strap icon="orbit"><SocialLinks links={social.links} /></Strap>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Theme Toggle"
		type="Component"
		description="Switches between system, light and dark, and remembers the choice. It takes no props; an inline script in `app.html` applies the saved theme before the page paints."
	>
		<ThemeToggle />
	</LibrarySection>

	<LibrarySection
		title="Video Overlay"
		type="Component"
		description="A modal video on the native `<dialog>`, so focus trapping, Escape to close and an inert background come for free. The video only loads once it is opened and is released after it closes. Open it from anything by setting `open`; focus returns to the trigger on close."
		props={videoOverlayProps}
	>
		<Button text="Toggle Video Overlay" onclick={() => (videoOpen = true)} />
		<VideoOverlay
			bind:open={videoOpen}
			title="Sample video"
			src="https://www.dropbox.com/scl/fi/6sh06eo6b3x84qo823qcq/sample-video-1.mp4?rlkey=0v6dqkra2wk7de0rz849ufm7o&st=0705ulra&raw=1"
			poster="/images/img-sample-1.jpg"
		/>
	</LibrarySection>

	<LibrarySection
		title="Video Player"
		type="Component"
		description="A plain `<video>` with custom controls under it (a play/pause button, a seek track and the time) and a play button of your own resting on top while it is not playing. The track comes in three looks: `solid`, `ticks` and `glass`. Pass `controls` to use the browser's own controls instead. The button follows the video's own state, so it fades out however playback starts. It is a simple way to style the video tag: pass the icon, the frame shape and the button's colors and size, and any video attribute goes straight through. For a video in a popup, use the Video Overlay."
		props={videoPlayerProps}
	>
		<div class="video-demo">
			{#each ['solid', 'ticks', 'glass'] as const as track (track)}
				<VideoPlayer
					src="https://www.dropbox.com/scl/fi/6sh06eo6b3x84qo823qcq/sample-video-1.mp4?rlkey=0v6dqkra2wk7de0rz849ufm7o&st=0705ulra&raw=1"
					poster="/images/img-sample-1.jpg"
					title="Sample video"
					{track}
					playButton={track !== 'ticks'}
					followCursor={track === 'glass'}
					sideControls={track === 'glass'
						? { side: 'left', volume: true, fullscreen: true }
						: track === 'solid'
							? { volume: true, fullscreen: true }
							: undefined}
				/>
			{/each}
		</div>
	</LibrarySection>
</div>

<div class="back-to-top-float" {@attach watchScroll({ awayFromTop: 400 })}>
	<BackToTop type="solid" text="" textDescription="Back to top" />
</div>

<style lang="scss">
	@use 'base/mixins';

	/* LIBRARY: DELETE ME */
	.components {
		row-gap: 128px;
		padding-block: var(--body-padding);
	}

	.counters {
		display: flex;
		flex-wrap: wrap;
		gap: 128px;
		align-items: flex-start;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
	}

	.avatar-demo {
		width: min(760px, 100%);
	}

	// Pops in once the page has scrolled a while, and steps aside near the footer.
	.back-to-top-float {
		@include mixins.right-spacing;

		position: fixed;
		bottom: var(--body-padding);
		z-index: var(--z-nav);
		visibility: hidden;
		opacity: 0;
		scale: 0.25;

		@include mixins.mq-motion-allow {
			transition:
				opacity var(--duration) var(--ease),
				scale var(--duration) var(--ease),
				visibility var(--duration);
		}

		&:global([data-scroll-away]:not([data-scroll-bottom])),
		&:focus-within {
			visibility: visible;
			opacity: 1;
			scale: 1;
		}
	}

	// Image Columns start pushed down and slide up as you scroll, spilling about 450px past their box before they
	// settle, so the next demo needs more room than that.
	.apart {
		margin-block-start: max(560px, 44vw);
	}

	.back-to-top-demo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 24px;
	}

	.video-demo {
		width: min(760px, 100%);

		display: flex;
		flex-direction: column;
		gap: 64px;
	}

	.solar-demo {
		width: min(720px, 100%);
	}

	.strap-demo {
		display: flex;
		justify-content: center;
		width: min(560px, 100%);
		padding: 48px 24px;
		border-radius: var(--radius);
		background: url('/images/img-sample-3.jpg') center / cover;
	}

	.circle-demo {
		width: min(560px, 100%);
	}

	.form-demo {
		width: min(640px, 100%);
	}

	.cards {
		width: 100%;
	}

	.cards :global(.slide) {
		align-items: center;
		padding: 48px 24px;
		border-radius: var(--radius);
		background: var(--color-surface);
		text-align: center;
	}

	.plain {
		margin: 16px 0 0;
	}
</style>
