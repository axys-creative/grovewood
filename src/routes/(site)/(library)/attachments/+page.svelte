<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import CtaGroup from '$lib/components/cta-group.svelte';
	import Icon from '$lib/components/icon.svelte';
	import LibrarySection from '$lib/library/library-section.svelte';
	import Logo from '$lib/components/logo.svelte';
	import logo from '$lib/content/global/logo.json';
	import MouseCursor from '$lib/components/mouse-cursor.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import { navEntry } from '$lib/utils/nav';

	import { animate, type AnimateOptions } from '$lib/attachments/animate';
	import { cursorContent } from '$lib/attachments/cursor-content';
	import { cursorField } from '$lib/attachments/cursor-field';
	import { cursorHide } from '$lib/attachments/cursor-hide';
	import { cursorTarget } from '$lib/attachments/cursor-target';
	import { flip } from '$lib/attachments/flip';
	import { glass } from '$lib/attachments/glass';
	import { glitchCycle } from '$lib/attachments/glitch-cycle';
	import { glitchHover } from '$lib/attachments/glitch-hover';
	import { glitchScroll } from '$lib/attachments/glitch-scroll';
	import { glitchTarget } from '$lib/attachments/glitch-target';
	import { gradientBorder } from '$lib/attachments/gradient-border';
	import { gridFade } from '$lib/attachments/grid-fade';
	import { magnet } from '$lib/attachments/magnet';
	import { paperGrain } from '$lib/attachments/paper-grain';
	import { parallax } from '$lib/attachments/parallax';
	import { bgSlide } from '$lib/attachments/bg-slide';
	import { typingCycle } from '$lib/attachments/typing-cycle';
	import { typingScroll } from '$lib/attachments/typing-scroll';
	import { underline } from '$lib/attachments/underline';
	import { push } from '$lib/attachments/push';
	import { scribble } from '$lib/attachments/scribble';
	import { textCurve } from '$lib/attachments/text-curve';
	import { textFade } from '$lib/attachments/text-fade';
	import { textFill } from '$lib/attachments/text-fill';
	import { textFlip } from '$lib/attachments/text-flip';
	import { textRoll } from '$lib/attachments/text-roll';
	import { textReveal } from '$lib/attachments/text-reveal';
	import { textScale } from '$lib/attachments/text-scale';
	import { themeFollow } from '$lib/attachments/theme-follow';
	import { tilt } from '$lib/attachments/tilt';
	import { watchScroll } from '$lib/attachments/watch-scroll';

	const nav = navEntry('/attachments');
	let glitchParagraph = $state<HTMLElement>();
	let dot = $state<HTMLElement>();
	let star = $state<HTMLElement>();
	let squareOne = $state<HTMLElement>();
	let squareTwo = $state<HTMLElement>();

	const cursorVariants = {
		star: {
			size: 32,
			border: '1px dashed #ada4e3',
			opacity: 1,
			elastic: false,
			transition: '1s ease, opacity 1s 0.12s'
		},
		'content-1': {
			size: 64,
			background: 'linear-gradient(135deg, var(--color-accent), var(--color-text))',
			border: '2px solid var(--color-accent)',
			opacity: 1
		},
		'content-2': { size: 56, opacity: 1 },
		'content-3': {
			size: 80,
			opacity: 1,
			background: 'var(--color-text)',
			color: 'var(--color-bg)'
		}
	};

	let watched = $state<HTMLElement>();
	let watchedAttributes = $state('');

	$effect(() => {
		if (!watched) return;
		const read = () =>
			(watchedAttributes =
				watched!
					.getAttributeNames()
					.filter((name) => name.startsWith('data-scroll'))
					.join(' ') || '(none)');
		read();
		const observer = new MutationObserver(read);
		observer.observe(watched, { attributes: true });
		return () => observer.disconnect();
	});

	const variants: NonNullable<AnimateOptions['variant']>[] = [
		'fade',
		'up',
		'down',
		'left',
		'right',
		'scale'
	];
	const scrollProps = (defaults: { start: string; end: string; scrub?: string }) => [
		{
			name: 'once',
			description:
				'A boolean. Only play the first time it scrolls into view instead of every time. Ignored with `scrub`. Defaults to `false`.'
		},
		{
			name: 'scrub',
			description: `A boolean. Tie the animation to the scroll position instead of playing it. Defaults to \`${defaults.scrub ?? 'false'}\`.`
		},
		{
			name: 'start',
			description: `A string, where the animation starts: an element point and a viewport point, e.g. \`top 80%\`. Defaults to \`${defaults.start}\`.`
		},
		{
			name: 'end',
			description: `A string, where the animation ends, e.g. \`bottom 60%\`. Defaults to \`${defaults.end}\`.`
		},
		{
			name: 'markers',
			description: 'A boolean. Shows GSAP start and end markers for debugging. Defaults to `false`.'
		},
		{
			name: 'trigger',
			description:
				'A selector or element to watch for scrolling instead of this one, e.g. a pinned section.'
		}
	];

	const typeProp = (kinds: string, standard: string) => ({
		name: 'type',
		description: `\`${kinds}\`. What the text is split into. Defaults to \`${standard}\`.`
	});
	const durationProp = (value: string) => ({
		name: 'duration',
		description: `A number, seconds each piece takes. Defaults to \`${value}\`.`
	});
	const staggerProp = (value: string) => ({
		name: 'stagger',
		description: `A number, seconds between each piece starting. Defaults to \`${value}\`.`
	});
	const easeProp = (value: string) => ({
		name: 'ease',
		description: `A string, a GSAP ease such as \`back.out(2)\`. Defaults to \`${value}\`.`
	});
	const styleProp = {
		name: 'style',
		description:
			"`'random' | 'linear'`. Whether the pieces animate in random order or from first to last. Defaults to `random`."
	};
</script>

<MouseCursor elastic variants={cursorVariants} />

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Attachments"
	description="Behavior you add to any element with an attachment. Each one is a single file in src/lib/attachments."
/>

<div class="attachments page-grid">
	<LibrarySection
		title="Animate"
		type="Attachment"
		description="Fades or slides an element in as it scrolls into view. Adds the class `animate`, then `animated` once it is in view. Scroll up and down to replay."
		props={[
			{
				name: 'variant',
				description: '`fade | up | down | left | right | scale`. Defaults to `up`.'
			},
			{
				name: 'once',
				description:
					'A boolean. Animate in only the first time (default), or replay each time it re-enters the viewport with `false`.'
			},
			{ name: 'delay', description: 'A number, seconds to wait before animating in.' },
			{ name: 'duration', description: 'A number, seconds the transition lasts.' },
			{
				name: 'stagger',
				description:
					"A number, seconds between each child. When set, the element's children animate in one after another."
			},
			{
				name: 'trigger',
				description: 'A string, a selector for another element that triggers the animation.'
			},
			{
				name: 'offset',
				description:
					'A number, the percent of the viewport height the element must clear from the bottom edge. Defaults to `2`.'
			}
		]}
		propsLabel="options"
	>
		<div class="demo-grid">
			{#each variants as variant (variant)}
				<div class="demo-box" {@attach animate({ variant, once: false })}>{variant}</div>
			{/each}
		</div>
		<p>With <code>stagger</code>, the children animate in sequence.</p>
		<ul class="demo-grid" {@attach animate({ stagger: 0.08, once: false })}>
			{#each Array.from({ length: 8 }, (_, i) => i + 1) as number (number)}
				<li class="demo-box">{number}</li>
			{/each}
		</ul>
	</LibrarySection>

	<LibrarySection
		title="Bg Slide"
		type="Attachment"
		description="Slides a block of color across a button on hover: out of a solid button, into an outline button. Use it on Button. The color is the accent, or `--bg-slide-color`."
		props={[
			{
				name: 'direction',
				description:
					"`'right' | 'left' | 'up' | 'down'`. The way the color slides. Defaults to `right`."
			}
		]}
		propsLabel="options"
	>
		<div class="row">
			{#each ['right', 'left', 'up', 'down'] as const as direction (direction)}
				<Button text="Solid {direction}" {@attach bgSlide({ direction })} />
				<Button text="Outline {direction}" type="outline" {@attach bgSlide({ direction })} />
			{/each}
		</div>
	</LibrarySection>

	<LibrarySection
		title="Cursor Content"
		type="Attachment"
		description="Shows a message or icon inside the custom cursor while the mouse is over an element. Needs `<MouseCursor />`, which this page mounts."
		props={[
			{ name: 'message', description: 'A string shown inside the cursor.' },
			{
				name: 'icon',
				description: "An icon name from `static/icons`, or `true` for the cursor's default icon."
			},
			{ name: 'iconSize', description: '`sm | md | lg`. Defaults to `sm`.' },
			{ name: 'iconColor', description: 'Any CSS color for the icon.' },
			{
				name: 'image',
				description: 'A picture path shown inside the cursor, e.g. `/images/img-sample-1.jpg`.'
			},
			{
				name: 'imageLayer',
				description:
					"`front | behind`. Whether the picture sits over the cursor's message and icon or under them. Defaults to `behind`."
			},
			{
				name: 'iconSwap',
				description:
					'A second icon name the cursor swaps to each time the element is clicked, e.g. play and pause.'
			},
			{
				name: 'variant',
				description: 'A string, the name of a look defined in `<MouseCursor variants>`.'
			},
			{
				name: 'tilt',
				description:
					'A boolean or tilt options (`max`, `reverse`, `velocityMax`, `inSpeed`, `outSpeed`, `idleMs`) to tilt the cursor by how fast the mouse moves. A picture tilts slightly by default; pass `false` to stop it.'
			}
		]}
		propsLabel="options"
	>
		<p class="underlined" {@attach cursorContent({ icon: true })}>Basic example on text.</p>
		<p class="cursor-paragraph">
			Good design rewards a closer look, so hover over
			<span class="underlined" {@attach cursorContent({ image: '/images/img-sample-1.jpg' })}>
				this phrase
			</span>
			and the cursor opens into
			<span class="underlined" {@attach cursorContent({ image: '/images/img-sample-2.jpg' })}
				>a picture that follows the mouse
			</span>
			until it leaves the words.
		</p>
		<div class="cursor-boxes">
			<div
				class="cursor-box"
				{@attach cursorContent({
					icon: 'arrow-tr',
					iconSize: 'sm',
					variant: 'content-1',
					tilt: { max: 50 }
				})}
			>
				"View project"
			</div>
			<div
				class="cursor-box"
				{@attach cursorContent({ icon: 'play', iconSwap: 'pause', variant: 'content-2' })}
			>
				"Play Video"
			</div>
			<div
				class="cursor-box"
				{@attach cursorContent({
					message: 'Visit site',
					variant: 'content-3',
					tilt: { max: 35, reverse: true }
				})}
			>
				Hover me
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Cursor Field"
		type="Attachment"
		description="Declares a boundary a child element leans toward the mouse inside of. It does not need the custom cursor. Commonly used for video play buttons."
		props={[
			{
				name: 'child',
				description: 'A selector inside the field, or an element. Defaults to the first child.'
			},
			{ name: 'ease', description: '`ease | spring | instant`. Defaults to `ease`.' },
			{
				name: 'followSpeed',
				description:
					'A number from 0 to 1, how quickly the child follows the pointer. Defaults to `0.08`.'
			},
			{
				name: 'returnSpeed',
				description:
					'A number from 0 to 1, how quickly the child returns to the center. Defaults to `0.06`.'
			},
			{
				name: 'bounce',
				description: 'A number from 0 to 1, how bouncy a `spring` is. Defaults to `0.6`.'
			},
			{
				name: 'tilt',
				description:
					'A boolean or tilt options (`max`, `reverse`, `velocityMax`, `inSpeed`, `outSpeed`, `idleMs`).'
			}
		]}
		propsLabel="options"
	>
		<div class="cursor-field" {@attach cursorHide()} {@attach cursorField({ tilt: true })}>
			<div class="cursor-field-child"><Icon name="play" size="lg" /></div>
		</div>
		<div
			class="cursor-field narrow"
			{@attach cursorHide()}
			{@attach cursorField({ tilt: { max: 50, reverse: true } })}
		>
			<p class="cursor-field-label">hello</p>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Cursor Hide"
		type="Attachment"
		description="Hides the custom cursor while the mouse is over an element. Needs `<MouseCursor />`."
	>
		<div class="cursor-box" {@attach cursorHide()}>Cursor hidden here</div>
	</LibrarySection>

	<LibrarySection
		title="Cursor Target"
		type="Attachment"
		description="Detaches the cursor from the mouse and sits it on a target element while the pointer is over the trigger. Needs `<MouseCursor />`. Each trigger names its own target, so repeated instances never collide."
		props={[
			{
				name: 'target',
				description:
					'A selector, an element, or a function that returns one. The element the cursor sits on.'
			},
			{
				name: 'variant',
				description:
					'A string, the name of a look defined in `<MouseCursor variants>` while snapped.'
			},
			{
				name: 'event',
				description:
					'`enter | move`. Snap as soon as the pointer enters, or on the first movement over it. Defaults to `move`.'
			}
		]}
		propsLabel="options"
	>
		<p class="trigger" {@attach cursorTarget({ target: () => dot ?? null })}>
			<strong>Hover me</strong> — move cursor to the dot
		</p>
		<div class="target" bind:this={dot}>•</div>

		<p class="trigger" {@attach cursorTarget({ target: () => star ?? null, variant: 'star' })}>
			<strong>Hover me</strong> — move cursor to the star (it moves with a magnet)
			<span class="target star" bind:this={star} {@attach magnet({ x: 1, y: 1 })}>★</span>
		</p>

		<p class="trigger" {@attach cursorTarget({ target: () => squareOne ?? null })}>
			<strong>Hover me</strong> — move cursor to the first square
			<span class="target" bind:this={squareOne}>◼︎</span>
		</p>
		<p class="trigger" {@attach cursorTarget({ target: () => squareTwo ?? null })}>
			<strong>Hover me</strong> — move cursor to the second square
			<span class="target" bind:this={squareTwo}>◼︎</span>
		</p>
	</LibrarySection>

	<LibrarySection
		title="Flip"
		type="Attachment"
		description="Tips an element back and swings it forward as it scrolls into view, or ties the tilt to scroll position with `scrub`. Scrub eases take GSAP-style names."
		props={[
			{
				name: 'from',
				description: '`top | center | bottom`. The edge the element pivots from. Defaults to `top`.'
			},
			{
				name: 'trigger',
				description:
					'A selector or element to watch for scrolling instead of the flipped element itself.'
			},
			{
				name: 'start',
				description:
					'A string, the scroll position the effect starts at (element point, viewport point). Defaults to `top 98%`.'
			},
			{
				name: 'end',
				description: 'A string, the scroll position it ends at. Defaults to `bottom top`.'
			},
			{
				name: 'scrub',
				description:
					'A boolean. Tie the tilt to scroll position instead of playing the swing. Defaults to `false`.'
			},
			{
				name: 'ease',
				description:
					'A GSAP-style name such as `back.out(2)` or `elastic.out(1, 0.4)`, or a function. Only used while scrubbing. Defaults to `none`.'
			},
			{
				name: 'once',
				description:
					'A boolean. Only swing the first time it comes into view. Ignored while scrubbing.'
			}
		]}
		propsLabel="options"
	>
		<div class="flip-boxes">
			<div class="flip-box" {@attach flip()}>Standard flip</div>
			<div class="flip-box" {@attach flip({ from: 'bottom' })}>Flip from bottom</div>
			<div class="flip-box" {@attach flip({ scrub: true, start: 'top 96%', end: 'top 56%' })}>
				Scrubbed flip (tied to scroll)
			</div>
			<div
				class="flip-box"
				{@attach flip({
					scrub: true,
					ease: 'elastic.out(1, 0.4)',
					start: 'top 90%',
					end: 'top 25%'
				})}
			>
				Scrubbed flip with elastic swing
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Glass"
		type="Attachment"
		tag="Limited Availability"
		description="A liquid-glass panel. Chromium refracts what is behind it with an SVG filter that is rebuilt when the element resizes; other browsers get a frosted blur. It uses the element's `::before` for an edge highlight."
		props={[
			{
				name: 'blur',
				description:
					'A number, the blur radius in px. Browsers without refraction only. Defaults to `12`.'
			},
			{
				name: 'saturate',
				description:
					'A number, saturation in percent. Browsers without refraction only. Defaults to `140`.'
			},
			{
				name: 'scale',
				description: 'A number, refraction strength in px. Chromium only. Defaults to `40`.'
			},
			{
				name: 'tint',
				description: '`dark` for a darker tint over light content, or any CSS color.'
			}
		]}
		propsLabel="options"
	>
		<div class="glass-stage">
			<img src="/images/img-sample-1.jpg" alt="" width="1920" height="1080" loading="lazy" />
			<div class="glass-samples">
				<div class="glass-sample" {@attach glass()} {@attach push()}>Default glass (push me)</div>
				<div
					class="glass-sample glass-sample--round"
					{@attach glass({ scale: 80 })}
					{@attach magnet({
						x: 1.5,
						y: 1.5,
						returnDuration: 350,
						returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
					})}
				>
					Stronger scale (magnet)
				</div>
				<div
					class="glass-sample"
					{@attach glass({ tint: 'dark' })}
					{@attach tilt({ max: 30, perspective: 750, speed: 2000 })}
				>
					Dark tint (tilt)
				</div>
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Glitch Cycle"
		type="Attachment"
		description="Swaps text between words with GSAP's text scrambler, only while it is on screen. A mono-spaced font keeps the width from jumping as the letters change."
		props={[
			{
				name: 'words',
				description: 'An array of strings, the words to cycle through in order. Required.'
			},
			{
				name: 'colors',
				description:
					'An array of colors (any CSS color, including variables) to fade to along with each word.'
			},
			{
				name: 'interval',
				description: 'A number, milliseconds between each word. Defaults to `2000`.'
			},
			{
				name: 'chars',
				description:
					'A GSAP preset (`upperCase | lowerCase | upperAndLowerCase`) or your own string of characters to scramble through.'
			},
			{ name: 'mono', description: 'A boolean. Use the mono-spaced font. Defaults to `true`.' }
		]}
		propsLabel="options"
	>
		<h3 class="plain">
			Sample:
			<span
				{@attach glitchCycle({
					words: ['creative', 'responsive', 'accessible', 'innovative', 'engaging'],
					colors: ['#e48c66', '#007bff', 'var(--color-text)', '#c0c0c0', '#007bff'],
					interval: 2000
				})}
			>
				Creative
			</span>
		</h3>
	</LibrarySection>

	<LibrarySection
		title="Glitch Hover"
		type="Attachment"
		description="Scrambles an element's text when it is hovered or focused. Works on a `Button`'s label, or any element."
		props={[
			{
				name: 'newText',
				description:
					'A string. Scramble into this text on hover, and back to the original on leave.'
			},
			{
				name: 'out',
				description:
					'A boolean. Also scramble when the pointer leaves or focus moves away. Always on with `newText`. Defaults to `false`.'
			},
			{
				name: 'target',
				description:
					'A selector inside the element, or an element, whose text scrambles. Defaults to a `.label` (as in Button), else the element itself.'
			},
			{
				name: 'chars',
				description: 'A GSAP preset or your own string of characters to scramble through.'
			},
			{ name: 'duration', description: 'A number, seconds the effect lasts. Defaults to `0.5`.' },
			{
				name: 'revealDelay',
				description: 'A number, seconds between each character settling. Defaults to `0.125`.'
			}
		]}
		propsLabel="options"
	>
		<div class="row">
			<Button text="Hover Me" {@attach glitchHover()} />
			<Button text="Glitch Out" type="outline" {@attach glitchHover({ out: true })} />
			<Button
				text="Change Text"
				type="text"
				iconEnd="chevron-right"
				{@attach glitchHover({ newText: 'Updated Text' })}
			/>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Glitch Scroll"
		type="Attachment"
		description="Scrambles text each time it scrolls into view. Scroll up and down to replay."
		props={[
			{
				name: 'chars',
				description: 'A GSAP preset or your own string of characters to scramble through.'
			},
			{
				name: 'revealDelay',
				description: 'A number, seconds between each character settling. Defaults to `0.05`.'
			},
			{ name: 'duration', description: 'A number, seconds the effect lasts. Defaults to `0.75`.' },
			{
				name: 'once',
				description:
					'A boolean. Only scramble the first time it scrolls into view. Defaults to `false`.'
			},
			{
				name: 'trigger',
				description:
					'A selector or element to watch instead of this element, e.g. a pinned section.'
			},
			{
				name: 'start',
				description: 'A string, the scroll position the effect starts at. Defaults to `top 98%`.'
			},
			{
				name: 'end',
				description: 'A string, the scroll position it ends at. Defaults to `bottom 2%`.'
			},
			{ name: 'mono', description: 'A boolean. Use the mono-spaced font. Defaults to `true`.' }
		]}
		propsLabel="options"
	>
		<p {@attach glitchScroll()}>
			This will glitch out as many times as you scroll into view. Default behavior.
		</p>
		<p {@attach glitchScroll({ once: true })}>This will only glitch out once.</p>
		<p>
			<span {@attach glitchScroll({ trigger: '#glitch-target-heading', end: 'bottom center' })}>
				This will glitch when the "glitch-target" heading below comes into view.
			</span>
			<br />
			<span>Great for pinned sections.</span>
		</p>
	</LibrarySection>

	<LibrarySection
		title="Glitch Target"
		type="Attachment"
		id="glitch-target-heading"
		description="Hovering or focusing one element scrambles another. Give it the target as an element reference, a selector, or a function."
		props={[
			{
				name: 'target',
				description:
					'A selector, an element, or a function that returns one. The element whose text scrambles. Required.'
			},
			{
				name: 'chars',
				description: 'A GSAP preset or your own string of characters to scramble through.'
			},
			{ name: 'duration', description: 'A number, seconds the effect lasts. Defaults to `0.75`.' },
			{
				name: 'revealDelay',
				description: 'A number, seconds between each character settling. Defaults to `0.125`.'
			}
		]}
		propsLabel="options"
	>
		<Button
			text="Hover or focus me"
			{@attach glitchTarget({ target: () => glitchParagraph ?? null })}
		/>
		<p bind:this={glitchParagraph}>This text should now glitch out</p>
	</LibrarySection>

	<LibrarySection
		title="Gradient Border"
		type="Attachment"
		description="A gradient border that can be static, animated, or follow the pointer. It uses the element's `::before`."
		props={[
			{
				name: 'width',
				description: 'A number, the border width in px. Defaults to `1` (`3` when animated).'
			},
			{ name: 'angle', description: 'A number, the gradient angle in degrees. Defaults to `135`.' },
			{ name: 'color', description: 'Any CSS color, including variables.' },
			{
				name: 'length',
				description: '`short | long`. How much of the border the gradient covers.'
			},
			{
				name: 'animate',
				description: "`true` sweeps around the element forever; `'hover'` reveals it on hover."
			},
			{ name: 'duration', description: 'A number, seconds per sweep. Defaults to `2.5`.' },
			{
				name: 'rayTrace',
				description:
					'A boolean. A glow that follows the pointer. Give the element its own background.'
			}
		]}
		propsLabel="options"
	>
		<h3>Static</h3>
		<div class="border-boxes">
			<div class="border-box" {@attach gradientBorder()}>Default<br />gradient border</div>
			<div
				class="border-box"
				{@attach gradientBorder({ angle: 215, color: 'yellow', length: 'short' })}
			>
				Configured<br />gradient border
			</div>
			<div
				class="border-box square"
				{@attach gradientBorder({ angle: 90, color: 'slateblue', width: 3, length: 'long' })}
			>
				Configured<br />gradient border
			</div>
		</div>

		<h3>Animated</h3>
		<div class="border-boxes">
			<div class="border-box" {@attach gradientBorder({ animate: true })}>Passive animation</div>
			<div
				class="border-box square"
				{@attach gradientBorder({
					animate: true,
					length: 'short',
					width: 3,
					color: 'var(--color-accent)',
					duration: 4
				})}
			>
				Configured example
			</div>
			<button
				class="border-box round"
				{@attach gradientBorder({
					animate: 'hover',
					length: 'long',
					width: 3,
					color: '#a4d1a2',
					duration: 2.8
				})}
			>
				Event animation (hover me)
			</button>
		</div>

		<h3>Ray tracing</h3>
		<div class="border-boxes">
			<div class="border-box" {@attach gradientBorder({ rayTrace: true })}>Follow mouse</div>
			<div class="border-box" {@attach gradientBorder({ rayTrace: true })}>
				Somewhat ray tracing
			</div>
			<div class="border-box round" {@attach gradientBorder({ rayTrace: true })}>
				OMG so it's good
			</div>
			<div
				class="border-box square"
				{@attach gradientBorder({ rayTrace: true, color: 'var(--color-accent)' })}
			>
				Pretty cool
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Grid Fade"
		type="Attachment"
		description="A grid of tiles over an element that fades away, or away and back, as it scrolls into view."
		props={[
			{
				name: 'type',
				description: '`in | in-out`. Fade the tiles away, or away and back. Defaults to `in`.'
			},
			{ name: 'size', description: '`sm | md | lg`. The tile size. Defaults to `md`.' },
			{
				name: 'sequence',
				description:
					'`random | linear | circular`. The order tiles fade: shuffled, left to right, or outward from the center. Defaults to `random`.'
			},
			{
				name: 'scrub',
				description:
					'A boolean. Tie the fade to scroll position instead of playing it. Defaults to `true`.'
			},
			{
				name: 'once',
				description: 'A boolean. Only play the first time. Applies when `scrub` is `false`.'
			},
			{
				name: 'duration',
				description:
					'A number, seconds the fade lasts. Applies when `scrub` is `false`. Defaults to `1.5`.'
			},
			{
				name: 'start',
				description:
					'A string, the scroll position the fade starts at. The default depends on `type` and `scrub`.'
			},
			{
				name: 'end',
				description:
					'A string, the scroll position it ends at. The default depends on `type` and `scrub`.'
			}
		]}
		propsLabel="options"
	>
		<div class="fade-boxes">
			<div class="fade-box" {@attach gridFade()}>Scrubbed fade in (default)</div>
			<div class="fade-box" {@attach gridFade({ size: 'sm', duration: 2, scrub: false })}>
				Played once over 2s, non scrub
			</div>
			<div class="fade-box" {@attach gridFade({ type: 'in-out', size: 'md', sequence: 'linear' })}>
				Scrubbed fade in-out, linear
			</div>
		</div>
		<figure class="fade-figure" {@attach gridFade({ sequence: 'circular' })}>
			<img src="/images/img-sample-1.jpg" alt="" width="1920" height="1080" loading="lazy" />
		</figure>
	</LibrarySection>

	<LibrarySection
		title="Magnet"
		type="Attachment"
		description="Pulls an element toward the pointer while it is hovered. Mouse and reduced-motion aware. A CSS transition follows the pointer while a script settles it back, which together give the soft return."
		props={[
			{
				name: 'x',
				description:
					"A number, the horizontal pull as a fraction of the pointer's distance from the center. Defaults to `0.5`."
			},
			{ name: 'y', description: 'A number, the vertical pull. Defaults to `0.5`.' },
			{
				name: 'followDuration',
				description:
					'A number, milliseconds the element takes to catch up to its target. Defaults to `640`.'
			},
			{
				name: 'followEase',
				description: "A CSS easing for catching up. Defaults to the site's easing."
			},
			{
				name: 'returnDuration',
				description: 'A number, milliseconds the target takes to travel back. Defaults to `220`.'
			},
			{
				name: 'returnEase',
				description:
					'`cubic-bezier(...)`, `linear`, `ease`, `ease-out` or `ease-in-out`. Values above 1 overshoot. Try `cubic-bezier(0, 1.64, 0.63, 1.92)` for a bounce.'
			}
		]}
		propsLabel="options"
	>
		<Button
			text="Magnet Button"
			{@attach magnet({
				x: 0.5,
				y: 1.25,
				followDuration: 500,
				returnDuration: 350,
				returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
			})}
		/>
		<div class="magnet-boxes">
			<div class="magnet-box" {@attach magnet()}>Default Magnet</div>
			<div
				class="magnet-box"
				{@attach magnet({
					x: 0.25,
					y: 0.25,
					returnDuration: 500
				})}
			>
				Subtle / Weak Magnet
			</div>
			<div
				class="magnet-box"
				{@attach magnet({
					x: 0.75,
					y: 0.75,
					returnDuration: 350,
					returnEase: 'cubic-bezier(0, 1.64, 0.63, 1.92)'
				})}
			>
				Strong Magnet with return ease
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Paper Grain"
		type="Attachment"
		description="Lays a faint construction-paper texture over an element's background: fine fibers, a few flecks. It is SVG noise used as a mask, so there are no image files, and it sits under the content."
		props={[
			{
				name: 'variant',
				description:
					"`'fibers' | 'flecks' | 'pulp'`. Tiny wisps like the fibers in paper stock; long lines with a few specks; lines crossed over a soft mottle. Defaults to `fibers`."
			},
			{ name: 'opacity', description: 'A number from 0 to 1. Defaults to `0.1`.' },
			{
				name: 'color',
				description: 'Any CSS color. Defaults to the text color, so it follows the theme.'
			},
			{
				name: 'size',
				description: 'A number, pixels before the noise tile repeats. Defaults to `480`.'
			}
		]}
		propsLabel="options"
	>
		<div class="paper-boxes">
			<div
				class="paper-box"
				style:background="#fdfbfa"
				{@attach paperGrain({ variant: 'fibers', color: '#c0708a', opacity: 0.4 })}
			>
				Fibers
			</div>
			<div
				class="paper-box"
				style:background="#c9d8c5"
				{@attach paperGrain({ variant: 'flecks', color: '#3a2a1a', opacity: 0.14 })}
			>
				Flecks
			</div>
			<div
				class="paper-box"
				style:background="#f2c9c0"
				{@attach paperGrain({ variant: 'pulp', color: '#3a2a1a', opacity: 0.14 })}
			>
				Pulp
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Parallax"
		type="Attachment"
		description="Shifts an element as it scrolls through the viewport. Off with reduced motion."
		props={[
			{
				name: 'from',
				description:
					"A number, the starting offset as a percent of the element's height. Defaults to `-5`."
			},
			{ name: 'to', description: 'A number, the ending offset. Defaults to `5`.' }
		]}
		propsLabel="options"
	>
		<div class="parallax-frame">
			<img
				class="parallax-image"
				src="/images/img-sample-1.jpg"
				alt=""
				width="1920"
				height="1080"
				loading="lazy"
				{@attach parallax({ from: -10, to: 10 })}
			/>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Push"
		type="Attachment"
		description="For mouse users: the element is pushed the way the pointer was moving when it entered, spun a little depending on where it was hit, and then eases back. Off with reduced motion and ignores touch. It uses the `translate` and `rotate` properties, so it can share an element with `tilt`."
		props={[
			{
				name: 'strength',
				description:
					'A number, the sensitivity of the push (how far the element moves). Defaults to `10`.'
			},
			{
				name: 'restore',
				description:
					'A number from 0 to 1, how quickly the element settles back. Lower is slower. Defaults to `0.1`.'
			},
			{
				name: 'maxRotate',
				description:
					'A number, the most rotation in degrees the push adds. Use `0` to remove the effect. Defaults to `25`.'
			}
		]}
		propsLabel="options"
	>
		<p class="underlined" {@attach push({ strength: 5, restore: 0.05, maxRotate: 10 })}>
			Basic example on text.
		</p>
		<div class="push-boxes">
			<div class="push-box" {@attach push()}>Mouse over me!</div>
			<div class="push-box" {@attach push()}>Mouse over me!</div>
			<figure class="push-figure" {@attach push({ restore: 0.01 })}>
				<img src="/images/img-sample-1.jpg" alt="" width="1920" height="1080" loading="lazy" />
			</figure>
			<Button text="Hover Me" {@attach push()} />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Scribble"
		type="Attachment"
		description="Draws a hand-drawn scribble on an element, like a line made with a dry brush: an `underline` under it, or a `circle` drawn around it. Shown from the start by default, on a word, a button or a whole paragraph, or drawn in on hover and focus with `hover`, or when it scrolls into view with `scroll`. The underline follows a cubic Bézier from the left edge to the right at mid-height, a blunt start that thickens quickly and tapers into a ragged, broken tail, with rough, chipped edges and optional dry streaks inside, different for every element unless you give it a `seed`. Pick a preset, or paste a curve from the same curve tool the Marquee Curve uses, to get a dip and a rise of your own. On a Button it replaces the underline. The Header Basic menu uses it, with `random`, on its links."
		props={[
			{
				name: 'type',
				description:
					"`'underline'` or `'circle'`. The circle is an uneven oval drawn around the element in one quick pass that overshoots its start and ends in a tail that does not meet the beginning. On hover it is drawn in along its path. Defaults to `'underline'`."
			},
			{
				name: 'padding',
				description:
					'A number, how far the circle sits out from the element, in em. Defaults to `0.4`.'
			},
			{
				name: 'scale',
				description:
					'A number that multiplies `padding` for a circle: `1.2` draws the loop farther out, `0.8` closer in. Defaults to `1`.'
			},
			{
				name: 'curve',
				description:
					"For an underline: a preset, or a `cubic-bezier(x1, y1, x2, y2)`, or the four numbers. The smooth presets are `'swoosh'` (the default), `'wave'`, `'dip'` and `'flat'`. `'zigzag'` (straight, then one or two there-and-backs, then straight) and `'notch'` (a single V dip) are made of straight lines. `'random'` picks one of them for each element, so every one gets a different line. The line runs from the left edge to the right at mid-height; the two points pull it, and a `y` of 1 is the top and 0 the bottom."
			},
			{
				name: 'hover',
				description:
					'A boolean. Draws the scribble in on hover and keyboard focus instead of showing it from the start. Defaults to `false`.'
			},
			{
				name: 'scroll',
				description:
					'A boolean. Draws the scribble in when the element scrolls into view instead of showing it from the start. Loads GSAP ScrollTrigger only when used, and with reduced motion it just shows. Defaults to `false`.'
			},
			{
				name: 'start',
				description:
					"For `scroll`: a ScrollTrigger-style start, the element's point then the viewport's, such as `'top 85%'` (the default) or `'bottom center'`."
			},
			{
				name: 'end',
				description:
					"For `scroll`: a ScrollTrigger-style end. With `once: false` the scribble resets past it. Defaults to `'bottom 2%'`."
			},
			{
				name: 'once',
				description:
					'For `scroll`: `true` draws it the first time only (the default). `false` draws it each time it scrolls into view and resets when it leaves.'
			},
			{
				name: 'trigger',
				description:
					'For `scroll`: a selector or element to watch for scrolling instead of this element, such as a whole section.'
			},
			{
				name: 'markers',
				description:
					"For `scroll`: a boolean that shows GSAP's start and end markers for debugging. Defaults to `false`."
			},
			{
				name: 'thickness',
				description:
					'A number from 0 to 1, the widest point as a share of the box height. Thins or thickens the line without changing its curve. Defaults to `0.35`.'
			},
			{
				name: 'rough',
				description:
					'A number from 0 to 1. How ragged the edges are: they wobble and get chipped in places, like spray paint or a dry brush. `0` is smooth. Defaults to `0.5`.'
			},
			{
				name: 'streaks',
				description:
					'A number, how many thin dry streaks are left bare inside the line, like bristles that ran out of paint. `0` is solid. Defaults to `0`.'
			},
			{
				name: 'seed',
				description:
					'A number. The same seed draws the same line every time. Without one, every line is different.'
			},
			{
				name: 'color',
				description:
					'A string, any CSS color. Defaults to the accent. Also set with `--scribble-color`.'
			},
			{
				name: 'height',
				description:
					'A string, the height of the box the line is drawn in. A shorter box makes the whole line slimmer and flattens its curve too. Defaults to `0.7em`.'
			},
			{
				name: 'offset',
				description: 'A string, how far the box sits below the element. Defaults to `-0.4em`.'
			}
		]}
		propsLabel="options"
	>
		<h3 class="plain">Shown from the start</h3>
		<p>
			A scribble under <span {@attach scribble()}>a few words</span> of a sentence, and another in a
			<span {@attach scribble({ curve: 'zigzag', color: 'var(--color-secondary)' })}>different</span
			>
			color and shape.
		</p>
		<p class="scribble-block" {@attach scribble({ curve: 'random' })}>
			On a whole paragraph the scribble spans the element, under its last line. This one picks a
			random shape, so reloading the page draws it differently.
		</p>
		<p>
			A circle around <span {@attach scribble({ type: 'circle' })}>a few words</span> in the middle
			of a sentence, and
			<span {@attach scribble({ type: 'circle', color: 'var(--color-secondary)' })}>one more</span>.
		</p>
		<h3 class="plain">On hover and focus</h3>
		<div class="row">
			<Button text="Swoosh" type="text" {@attach scribble({ hover: true })} />
			<Button
				text="Zigzag"
				type="text"
				{@attach scribble({ curve: 'zigzag', hover: true, color: 'var(--color-secondary)' })}
			/>
			<Button
				text="Notch"
				type="text"
				{@attach scribble({ curve: 'notch', hover: true, color: 'var(--color-tertiary)' })}
			/>
			<Button text="Random" type="text" {@attach scribble({ curve: 'random', hover: true })} />
			<Button
				text="Custom curve"
				type="text"
				{@attach scribble({ curve: 'cubic-bezier(0.2, 1.1, 0.8, -0.1)', hover: true })}
			/>
			<Button text="Circle" type="text" {@attach scribble({ type: 'circle', hover: true })} />
			<Button
				text="Circle, thicker"
				type="text"
				{@attach scribble({
					type: 'circle',
					hover: true,
					thickness: 0.5,
					color: 'var(--color-tertiary)'
				})}
			/>
		</div>
		<h3 class="plain">Drawn in on scroll</h3>
		<p>
			Scroll these into view and they are drawn in:
			<span {@attach scribble({ scroll: true, curve: 'random' })}>an underline</span>,
			<span {@attach scribble({ scroll: true, type: 'circle', color: 'var(--color-secondary)' })}
				>a circle</span
			>, and a paragraph below that resets and draws again every time it re-enters.
		</p>
		<p
			class="scribble-block"
			{@attach scribble({ scroll: true, once: false, start: 'top 75%', curve: 'zigzag' })}
		>
			This paragraph starts its scribble when its top reaches 75% of the screen, and draws it again
			each time it scrolls back into view.
		</p>
	</LibrarySection>

	<LibrarySection
		title="Scroll Slide"
		type="Attachment"
		description="Pins an element to the center of the screen and slides a row inside it sideways as the page scrolls, for exactly as far as the row overflows, then lets go. Put it on the pinned element, mark the box the row slides across with `data-slide-viewport` and the row with `data-slide-track` (or point at your own with `viewport` and `track`). While it is active the element has `data-sliding`, which is when the viewport should clip. It needs GSAP ScrollTrigger, loaded only when used, and does nothing when motion is reduced, so the row can scroll on its own. Gallery Horizontal and Scroll Horizontal in Sections use it."
		props={[
			{
				name: 'viewport',
				description:
					'A selector inside for the box the row slides across. Defaults to `[data-slide-viewport]`.'
			},
			{
				name: 'track',
				description: 'A selector inside for the row that slides. Defaults to `[data-slide-track]`.'
			},
			{
				name: 'media',
				description:
					'A media query. Outside it nothing is pinned. Defaults to `(min-width: 1024px)`; use `all` for every size.'
			},
			{
				name: 'scrub',
				description: 'A number, seconds the row takes to catch up with the scroll. Defaults to `1`.'
			},
			{
				name: 'parallax',
				description:
					'A selector for elements inside the row that drift sideways as it slides, such as images in frames.'
			},
			{
				name: 'parallaxAmount',
				description:
					'A number, how far they drift as a percent of their own width. Defaults to `25`.'
			}
		]}
		propsLabel="options"
	/>

	<LibrarySection
		title="Text Curve"
		type="Attachment"
		description="Bends an element's text along a circular arc. Screen readers still get the plain text. It sizes the element to fit the arc, and measures again on resize and when fonts load. The spin is off with reduced motion."
		props={[
			{
				name: 'radius',
				description:
					'A number, how strongly the text curves. Positive bends it like a smile, negative like a frown, and larger numbers curve it more. Defaults to `1`.'
			},
			{
				name: 'kerning',
				description: 'A number, extra pixels between characters. Defaults to `0`.'
			},
			{
				name: 'centered',
				description:
					'A boolean. Shifts the text so the arc is centered in the element instead of sitting along its top or bottom. Defaults to `false`.'
			},
			{
				name: 'spin',
				description:
					"`'right' | 'left'`. Rotates the element forever, clockwise or counter-clockwise."
			},
			{
				name: 'spinDuration',
				description: 'A number, seconds per turn. Defaults to `10` for `right` and `12` for `left`.'
			}
		]}
		propsLabel="options"
	>
		<div class="curve-samples">
			<p {@attach textCurve()}>This is the sample of a basic text curve.</p>
			<p {@attach textCurve({ radius: -1 })}>Negative radius swaps the curve.</p>
			<p {@attach textCurve({ radius: 8, kerning: 0, centered: true, spin: 'right' })}>
				HELLO CURVED WORLD. THE OUTSIDE IS WAITING.
			</p>
			<p {@attach textCurve({ radius: -4.25, kerning: 8, centered: true, spin: 'left' })}>
				HELLO CURVED WORLD. THE OUTSIDE IS WAITING.
			</p>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Text Fade"
		type="Attachment"
		titleAttachment={textFade()}
		description="Fades text in word by word or character by character as it scrolls into view. Uses GSAP ScrollTrigger and SplitText. Off with reduced motion."
		props={[
			typeProp('words | chars', 'words'),
			styleProp,
			durationProp('0.25'),
			staggerProp('0.0125'),
			easeProp('linear'),
			...scrollProps({ start: 'top 98%', end: 'bottom 2%' })
		]}
		propsLabel="options"
	>
		<div class="text-demos">
			<p {@attach textFade({ duration: 0.5 })}>
				This fades in word by word in a random order. Lorem ipsum dolor sit amet consectetur
				adipisicing elit. Error iste corrupti tempora aspernatur, consequatur blanditiis, repellat,
				quibusdam perferendis sequi dignissimos dolores? Magni, nisi quae.
			</p>
			<p {@attach textFade({ type: 'chars', style: 'linear', once: true, duration: 2 })}>
				This fades in character by character, only the first time it scrolls into view.
			</p>
			<p {@attach textFade({ style: 'linear', scrub: true, end: 'bottom 60%' })}>
				This one is scrubbed: it fades in as you scroll. Lorem ipsum dolor sit amet consectetur
				adipisicing elit. Error iste corrupti tempora aspernatur, consequatur blanditiis, repellat,
				quibusdam perferendis sequi dignissimos dolores? Magni, nisi quae.
			</p>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Text Fill"
		type="Attachment"
		titleAttachment={textFill()}
		description="Fills text with color as it scrolls into view. It scrubs with the scroll by default. The unfilled color comes from `--text-fill-base`. Put it on an inline element (a `<span>` inside the heading or paragraph) so it fills line by line; as a direct child of a flex or grid container it becomes a block and fills all lines at once. Uses GSAP ScrollTrigger. Off with reduced motion."
		props={[
			durationProp('1'),
			...scrollProps({ start: 'top 90%', end: 'bottom 60%', scrub: 'true' })
		]}
		propsLabel="options"
	>
		<div class="text-demos">
			<h3>
				<span {@attach textFill({ end: 'bottom 40%' })}>This heading fills as you scroll.</span>
			</h3>
			<p>
				<span {@attach textFill({ end: 'bottom 40%' })}>
					A paragraph can fill too, and it follows each wrapped line. Lorem ipsum dolor sit amet
					consectetur adipisicing elit. Error iste corrupti tempora aspernatur, consequatur
					blanditiis, repellat, quibusdam perferendis sequi dignissimos dolores? Magni, nisi quae.
				</span>
			</p>
			<p>
				<span
					{@attach textFill({
						scrub: false,
						once: true,
						start: 'top 80%',
						end: 'bottom 80%',
						duration: 5
					})}
				>
					Not scrubbed: this fills over five seconds, only once, after it passes 80% of the
					viewport.
				</span>
			</p>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Text Flip"
		type="Attachment"
		titleAttachment={textFlip({ ease: 'back.out(2)', scrub: true })}
		description="Tips text forward into place, piece by piece, as it scrolls into view. Uses GSAP ScrollTrigger and SplitText. Off with reduced motion."
		props={[
			typeProp('words | chars | lines', 'words'),
			{
				name: 'from',
				description:
					"`'top' | 'center' | 'bottom'`. The edge the pieces tip forward from. Defaults to `top`."
			},
			durationProp('1'),
			staggerProp('0.05'),
			easeProp('power2.out'),
			...scrollProps({ start: 'top 98%', end: 'bottom 2%' })
		]}
		propsLabel="options"
	>
		<div class="text-demos">
			<p {@attach textFlip({ ease: 'back.out(2)', scrub: true, end: 'bottom 60%' })}>
				Each word tips forward and settles, scrubbed with the scroll. Lorem ipsum dolor sit amet
				consectetur adipisicing elit. Error iste corrupti tempora aspernatur, consequatur
				blanditiis, repellat, quibusdam perferendis sequi dignissimos dolores? Magni, nisi quae.
			</p>
			<p {@attach textFlip({ type: 'lines', duration: 0.6, stagger: 0.1 })}>
				Split by lines, so each line flips in turn no matter how the text wraps. Lorem ipsum dolor
				sit amet consectetur adipisicing elit. Error iste corrupti tempora aspernatur, consequatur
				blanditiis, repellat, quibusdam perferendis sequi dignissimos dolores? Magni, nisi quae.
			</p>
			<p {@attach textFlip({ from: 'bottom', duration: 0.6, once: true })}>
				Flipping up from the bottom edge, only the first time.
			</p>
			<p {@attach textFlip({ duration: 2.5, stagger: 0.1, ease: 'elastic.out(1.5, 0.3)' })}>
				An elastic ease gives it a decaying swing.
			</p>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Text Reveal"
		type="Attachment"
		titleAttachment={textReveal({ type: 'chars', duration: 0.32, ease: 'back.out(2.5)' })}
		description="Slides text up out of a clipped line, piece by piece, as it scrolls into view. Uses GSAP ScrollTrigger and SplitText. Off with reduced motion."
		props={[
			typeProp('words | chars', 'words'),
			{
				name: 'from',
				description: "`'bottom' | 'top'`. The side the pieces slide in from. Defaults to `bottom`."
			},
			durationProp('0.2'),
			staggerProp('0.05'),
			easeProp('linear'),
			...scrollProps({ start: 'top 98%', end: 'bottom 2%' })
		]}
		propsLabel="options"
	>
		<div class="text-demos">
			<p {@attach textReveal()}>This reveals word by word as it scrolls into view.</p>
			<p {@attach textReveal({ duration: 1, ease: 'back.out(3)', scrub: true, end: 'bottom 75%' })}>
				This paragraph scrubs through each word across several lines. Lorem ipsum dolor sit amet
				consectetur adipisicing elit. Error iste corrupti tempora aspernatur, consequatur
				blanditiis, repellat, quibusdam perferendis sequi dignissimos dolores? Magni, nisi quae.
			</p>
			<p
				{@attach textReveal({
					type: 'chars',
					once: true,
					duration: 0.35,
					stagger: 0.0125,
					ease: 'back.out(2)'
				})}
			>
				Split by characters, only the first time it scrolls into view.
			</p>
			<p {@attach textReveal({ from: 'top', scrub: true, end: 'bottom 60%' })}>
				This reveals from the top instead of the bottom.
			</p>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Text Roll"
		type="Attachment"
		description="Each letter rolls up and out on hover or keyboard focus, replaced by a copy rising from below, one after another. Plain CSS and a little script, no GSAP. Screen readers get the original text. Off with reduced motion. Do not combine it with a glitch attachment on the same text."
		props={[
			{
				name: 'stagger',
				description: 'A number, seconds between each letter starting. Defaults to `0.02`.'
			},
			{ name: 'duration', description: 'A number, seconds each letter takes. Defaults to `0.6`.' },
			{
				name: 'target',
				description:
					'A selector or element that holds the text. Defaults to a `.label` (as in Button), else the element itself.'
			}
		]}
		propsLabel="options"
	>
		<div class="row">
			<Button text="Outline roll" type="outline" iconEnd="chevron-right" {@attach textRoll()} />
			<Button text="Underline roll" type="underline" {@attach textRoll({ stagger: 0.04 })} />
			<Button text="Slow roll" {@attach textRoll({ duration: 1.2 })} />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Text Scale"
		type="Attachment"
		titleAttachment={textScale()}
		description="Scales text up from nothing, piece by piece, as it scrolls into view. Each piece grows from its own side, so the text opens up around the middle. Uses GSAP ScrollTrigger and SplitText. Off with reduced motion."
		props={[
			typeProp('words | chars', 'words'),
			styleProp,
			durationProp('0.25'),
			staggerProp('0.0125'),
			easeProp('linear'),
			...scrollProps({ start: 'top 98%', end: 'bottom 2%' })
		]}
		propsLabel="options"
	>
		<div class="text-demos">
			<p {@attach textScale({ duration: 0.5 })}>
				Each word scales in from a point that depends on where it sits in the sentence.
			</p>
			<p {@attach textScale({ duration: 0.15, scrub: true, end: 'bottom 75%' })}>
				This paragraph scrubs word by word as you scroll. Lorem ipsum dolor sit amet consectetur
				adipisicing elit. Error iste corrupti tempora aspernatur, consequatur blanditiis, repellat,
				quibusdam perferendis sequi dignissimos dolores? Magni, nisi quae.
			</p>
			<p {@attach textScale({ type: 'chars', once: true, style: 'linear', duration: 2 })}>
				Characters scale in, only the first time, over two seconds.
			</p>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Theme Follow"
		type="Attachment"
		description="For anything fixed or sticky: a header, a scroll-to-top button, a toast. While the page scrolls it takes the theme of the surface behind its center, so dark text turns light over a dark section and back again. Mark sections with a surface class; sections added later are picked up. The element gets a `data-theme-follow` attribute, which sets the theme tokens only (no background), so a transparent element stays transparent. Attach it to the element that is actually positioned. Scroll the page past the demo below to watch the pill change."
		props={[
			{ name: 'theme-dark', description: 'A surface that is always dark.' },
			{ name: 'theme-light', description: 'A surface that is always light.' },
			{
				name: 'theme-invert',
				description:
					'A surface that is the opposite of the page theme, so it flips with the toggle.'
			},
			{ name: 'no class', description: 'The element keeps the page theme there.' }
		]}
		propsLabel="options"
	>
		<div class="follow-stage">
			<div class="follow-bands">
				<div class="follow-band theme-dark">theme-dark</div>
				<div class="follow-band theme-light">theme-light</div>
				<div class="follow-band theme-invert">theme-invert</div>
				<div class="follow-band">No surface class</div>
			</div>
			<div class="follow-sticky">
				<div class="follow-bar" {@attach themeFollow()}>
					<Logo {...logo} url="/" />
					<Button text="Link" type="text" url="/" />
					<Button text="Button" size="sm" class="follow-button" />
				</div>
			</div>
		</div>
		<pre class="follow-usage"><code
				>&lt;div {'{'}@attach themeFollow()&#125;&gt;…&lt;/div&gt;
&lt;section class="theme-light"&gt;…&lt;/section&gt;</code
			></pre>
	</LibrarySection>

	<LibrarySection
		title="Tilt"
		type="Attachment"
		description="A subtle 3D effect for mouse users: the element tilts toward the pointer. A local version of Vanilla Tilt with no library. It is off with reduced motion and ignores touch."
		props={[
			{
				name: 'reverse',
				description: 'A boolean. Flip the direction of the tilt. Defaults to `false`.'
			},
			{ name: 'max', description: 'A number, the largest tilt in degrees. Defaults to `15`.' },
			{
				name: 'startX',
				description: 'A number, the resting tilt along the x-axis in degrees. Defaults to `0`.'
			},
			{
				name: 'startY',
				description: 'A number, the resting tilt along the y-axis in degrees. Defaults to `0`.'
			},
			{ name: 'perspective', description: 'A number. Lower is more dramatic. Defaults to `1000`.' },
			{
				name: 'scale',
				description: 'A number, the scale while hovered for a subtle pop. Defaults to `1`.'
			},
			{
				name: 'speed',
				description: 'A number, milliseconds for the enter and exit transition. Defaults to `300`.'
			},
			{
				name: 'easing',
				description:
					'A CSS easing for the enter and exit transition. Defaults to `cubic-bezier(.03,.98,.52,.99)`.'
			},
			{
				name: 'transition',
				description:
					'A boolean. Set `false` to follow the pointer with no enter and exit transition. Defaults to `true`.'
			},
			{
				name: 'axis',
				description:
					'`x | y`. `x` tilts only left and right, `y` only up and down. Both axes by default.'
			},
			{
				name: 'reset',
				description:
					'A boolean. Return to the resting tilt when the pointer leaves. Defaults to `true`.'
			},
			{
				name: 'glare',
				description: 'A boolean. A light sheen that follows the pointer. Defaults to `false`.'
			},
			{
				name: 'maxGlare',
				description: 'A number from 0 to 1, the strongest the glare gets. Defaults to `1`.'
			},
			{
				name: 'mouseEventElement',
				description:
					'A selector or element that listens for the pointer instead of the tilted element.'
			}
		]}
		propsLabel="options"
	>
		<div class="tilt-card-group">
			<div class="tilt-card" {@attach tilt()}>
				<h3 class="plain">Default</h3>
				<p>No options at all.</p>
				<div class="card-cta">
					<CtaGroup primary={{ text: 'Learn more', url: '/' }} />
				</div>
			</div>
			<div
				class="tilt-card tilt-card--3d"
				{@attach tilt({
					reverse: true,
					max: 10,
					perspective: 2400,
					speed: 750,
					glare: true,
					maxGlare: 0.125
				})}
			>
				<h3 class="plain">Reversed</h3>
				<p>
					A subtle reversed tilt with a glare and a slower transition. It also sets up the 3D pop:
					give the tilted element <code>transform-style: preserve-3d</code> (always, not only on
					hover, or the lift snaps flat when the pointer leaves), and
					<code>transform: translateZ(20px)</code> to the inner elements that should lift.
				</p>
				<div class="card-cta">
					<CtaGroup
						primary={{ text: 'Get started', url: '/' }}
						secondary={{ text: 'Visit FAQ', url: '/' }}
					/>
				</div>
			</div>
			<div
				class="tilt-card"
				{@attach tilt({ max: 20, perspective: 750, speed: 100, reset: false, glare: true })}
			>
				<h3 class="plain">Dramatic</h3>
				<p>A bit stronger with a glare, and the tilt does not reset when the pointer leaves.</p>
				<div class="card-cta">
					<CtaGroup
						primary={{ text: 'Get started', url: '/' }}
						secondary={{ text: 'Visit FAQ', url: '/' }}
					/>
				</div>
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Typing Cycle"
		type="Attachment"
		description="Types a word, deletes it, and moves to the next, forever, like someone at a keyboard. Screen readers get all the words at once. With reduced motion it shows the first word."
		props={[
			{ name: 'words', description: 'An array of strings to type, in order. Required.' },
			{
				name: 'colors',
				description: 'An array of CSS colors, one switched to with each word. Variables work.'
			},
			{
				name: 'speedIn',
				description: 'A number, milliseconds per character typed. Defaults to `120`.'
			},
			{
				name: 'speedOut',
				description: 'A number, milliseconds per character deleted. Defaults to `50`.'
			},
			{
				name: 'interval',
				description:
					'A number, milliseconds a finished word stays before deleting. Defaults to `2000`.'
			},
			{
				name: 'cursor',
				description: "`'caret' | 'underscore' | 'none'`. Defaults to `caret`."
			},
			{
				name: 'delay',
				description: 'A number, milliseconds before the first word. Defaults to `0`.'
			},
			{
				name: 'onScroll',
				description:
					'A boolean. Starts when the element scrolls into view instead of right away. Defaults to `false`.'
			}
		]}
		propsLabel="options"
	>
		<h4>
			The human senses:
			<span
				{@attach typingCycle({
					words: ['touch', 'sight', 'sound', 'taste', 'smell'],
					colors: ['var(--color-accent)', 'forestgreen', '#c0c0c0', 'crimson', 'slateblue'],
					speedIn: 100,
					speedOut: 25,
					interval: 2000,
					delay: 1500,
					cursor: 'underscore'
				})}
			></span>
		</h4>
		<h4>
			The four seasons:
			<span
				{@attach typingCycle({
					words: ['Spring', 'Summer', 'Autumn', 'Winter'],
					speedIn: 75,
					speedOut: 200,
					interval: 1250,
					cursor: 'none'
				})}
			></span>
		</h4>
	</LibrarySection>

	<LibrarySection
		title="Typing Scroll"
		type="Attachment"
		titleAttachment={typingScroll({ cursor: 'none' })}
		description="Types the element's text out, character by character, when it scrolls into view. Screen readers get the whole text at once. Off with reduced motion."
		props={[
			{
				name: 'speed',
				description: 'A number, milliseconds per character. Defaults to `50`.'
			},
			{
				name: 'once',
				description:
					'A boolean. Only types the first time it scrolls into view, instead of every time. Defaults to `false`.'
			},
			{
				name: 'cursor',
				description: "`'caret' | 'underscore' | 'none'`. Defaults to `caret`."
			},
			{
				name: 'delay',
				description: 'A number, milliseconds before typing starts. Defaults to `0`.'
			}
		]}
		propsLabel="options"
	>
		<p {@attach typingScroll()}>
			This sentence types itself out each time it scrolls into view, with a blinking caret.
		</p>
		<p {@attach typingScroll({ speed: 25, once: true, cursor: 'underscore', delay: 300 })}>
			Faster, only the first time, with an underscore cursor and a short delay.
		</p>
	</LibrarySection>

	<LibrarySection
		title="Underline"
		type="Attachment"
		description="Draws a line under a button's label that slides away on hover, the same effect as the underline Button type, for mixing into other types. It uses the label's text color and takes no options."
	>
		<div class="row">
			<Button text="Solid underline" {@attach underline()} />
			<Button text="Outline underline" type="outline" {@attach underline()} />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Watch Scroll"
		type="Attachment"
		description="Tracks scroll position and direction with data attributes on an element, using one shared listener, so CSS can react. It sets `data-scroll-away`, `data-scroll-down` (scrolling down and away from the top), `data-scroll-bottom` and `data-scroll-idle`. It is what hides the header as you scroll down."
		props={[
			{
				name: 'awayFromTop',
				description:
					'A number, the scroll distance in px before `data-scroll-away` is set. Defaults to `96`.'
			},
			{
				name: 'nearBottom',
				description:
					'A number, the distance in px from the page bottom that sets `data-scroll-bottom`. Defaults to `296`.'
			},
			{
				name: 'idle',
				description:
					'A number, milliseconds without scrolling before `data-scroll-idle` is set. Defaults to `150`.'
			},
			{
				name: 'threshold',
				description:
					'A number, how far in px to scroll against the current direction before it flips. `0` flips at once, so even a slow scroll up reveals a hidden header. Defaults to `0`.'
			}
		]}
		propsLabel="options"
	>
		<div class="watch-readout" bind:this={watched} {@attach watchScroll()}>
			Current attributes: <code>{watchedAttributes}</code>
		</div>
	</LibrarySection>
</div>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	@use 'base/mixins';

	.attachments {
		row-gap: 128px;
		padding-block: var(--body-padding);
	}

	// `overflow: clip` (not `hidden`) keeps the stage from becoming a scroll container, which would stop the sticking.
	// The pill pins at mid-screen and stops when its box reaches the bottom of the stage.
	.follow-stage {
		position: relative;
		width: 100%;
		height: 480px;
		overflow: clip;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.follow-bands {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: repeat(4, 1fr);
	}

	.follow-band {
		display: grid;
		align-items: center;
		justify-items: end;
		padding-inline: 24px;
	}

	.follow-sticky {
		position: sticky;
		top: 50%;
		z-index: 1;
	}

	.follow-bar {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 75%;
		padding: 12px 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);

		:global(.follow-button) {
			margin-inline-start: auto;
		}
	}

	.follow-usage {
		max-width: 100%;
		margin: 0;
		overflow-x: auto;
		padding: 16px;
		border-radius: var(--radius);
		background: var(--color-surface);
		font-family: var(--font-mono);
		font-size: 14px;
	}

	.tilt-card-group {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		width: 100%;
		padding-block: 48px;
	}

	.tilt-card {
		display: flex;
		flex: 1 1 320px;
		flex-direction: column;
		gap: 16px;
		max-width: 450px;
		aspect-ratio: 1 / 1.25;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.card-cta {
		margin-block-start: auto;
	}

	// The 3D context stays on at all times. If it only applied while hovered, leaving would flatten the
	// card in one frame and the lifted content would snap onto it instead of easing back.
	.tilt-card--3d {
		transform-style: preserve-3d;
		perspective: 1000px;

		h3,
		p,
		.card-cta {
			transition: 0.3s ease;
		}

		@include mixins.desktop-hover {
			h3,
			p,
			.card-cta {
				transform: translateZ(20px);
			}
		}
	}

	.push-boxes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 24px;
		width: 100%;
	}

	.push-box {
		display: grid;
		place-items: center;
		flex: 0 1 max(180px, 20%);
		min-width: 0;
		aspect-ratio: 1;
		padding: clamp(8px, 3vw, 24px);
		font-size: clamp(11px, 3.4vw, 16px);
		border-radius: var(--radius);
		background: var(--color-surface);
		text-align: center;
	}

	.push-figure {
		display: flex;
		width: max(180px, 20%);
		aspect-ratio: 1;
		margin: 0;
		overflow: hidden;
		border-radius: 50%;

		img {
			height: 100%;
			object-fit: cover;
		}
	}

	.watch-readout {
		position: sticky;
		bottom: 16px;
		padding: 16px 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.plain {
		margin: 0;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 16px;
		width: 100%;
		padding: 0;
		list-style: none;
	}

	.demo-box {
		display: grid;
		place-items: center;
		min-height: 96px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.border-boxes {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		gap: 24px;
		margin-block-end: 24px;
	}

	.border-box {
		display: grid;
		place-items: center;
		width: max(180px, 20%);
		aspect-ratio: 1;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		text-align: center;
	}

	.border-box.square {
		border-radius: 0;
	}

	.border-box.round {
		border-radius: 50%;
	}

	.underlined {
		text-decoration: underline;
	}

	.cursor-paragraph {
		max-width: 40rem;
	}

	.cursor-boxes {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		width: 100%;
	}

	.cursor-box {
		display: grid;
		place-items: center;
		width: max(180px, 20%);
		aspect-ratio: 1;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--color-surface);
		text-align: center;
		cursor: pointer;
	}

	.cursor-field {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 420px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);

		&.narrow {
			max-width: 350px;
		}
	}

	.cursor-field-child {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border: 1px dashed var(--color-border);
		border-radius: 50%;
		font-size: 24px;
	}

	.cursor-field-label {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.trigger {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding-block: 12px;
	}

	.target.star {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		cursor: pointer;
	}

	.fade-boxes {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		width: 100%;
	}

	.fade-box {
		display: grid;
		place-items: center;
		width: max(180px, 20%);
		aspect-ratio: 1;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--color-surface);
		text-align: center;
	}

	.fade-figure {
		width: 100%;
		margin: 0;
		border-radius: var(--radius);
	}

	.fade-figure img {
		width: 100%;
		max-height: 420px;
		object-fit: cover;
	}

	.flip-boxes {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		width: 100%;
	}

	.flip-box {
		display: grid;
		place-items: center;
		width: max(180px, 20%);
		aspect-ratio: 1;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--color-surface);
		text-align: center;
	}

	// The image is tall, and the three samples stick to the middle of the screen from the top of the image to the bottom.
	// `overflow: clip` (not `hidden`) keeps the stage from becoming a scroll container, which would stop the sticking.
	.glass-stage {
		position: relative;
		width: 100%;
		height: max(50vh, 500px);
		border-radius: var(--radius);
	}

	.glass-stage img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.glass-samples {
		position: sticky;
		top: 25%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24px;
	}

	.glass-sample {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 1 max(180px, 20%);
		min-width: 0;
		aspect-ratio: 1;
		padding: clamp(8px, 3vw, 24px);
		font-size: clamp(11px, 3.4vw, 16px);
		border-radius: var(--radius);
		color: #fff;
		font-weight: 600;
		text-align: center;
		text-shadow: 0 1px 4px rgb(0 0 0 / 0.9);
	}

	.glass-sample--round {
		border-radius: 50%;
	}

	.paper-boxes {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		gap: 24px;
	}

	.paper-box {
		display: grid;
		place-items: center;
		width: max(180px, 30%);
		aspect-ratio: 4 / 3;
		border-radius: var(--radius);
		color: #1a1a1a;
	}

	.magnet-boxes {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		gap: 24px;
		margin-block-start: 32px;
	}

	.magnet-box {
		display: grid;
		place-items: center;
		width: max(180px, 20%);
		aspect-ratio: 1;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--color-surface);
		text-align: center;
		cursor: pointer;
	}

	// The spinning rings' invisible corners would otherwise add sideways scroll on small screens.
	.curve-samples {
		width: 100%;
		overflow-x: clip;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 64px;
		text-align: center;

		p {
			margin: 0;
		}
	}

	.text-demos {
		display: flex;
		flex-direction: column;
		gap: 48px;
		max-width: 750px;

		> * {
			margin: 0;
		}
	}

	.scribble-block {
		max-width: var(--max-width-text);
		padding-block-end: 0.4em;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
	}

	.parallax-frame {
		position: relative;
		width: 100%;
		height: 360px;
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.parallax-image {
		position: absolute;
		inset: -15% 0;
		width: 100%;
		height: 130%;
		max-width: none;
		object-fit: cover;
	}
</style>
