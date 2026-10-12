<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import { bgDust } from '$lib/attachments/bg-dust';
	import { bgGrid } from '$lib/attachments/bg-grid';
	import { bgWaves } from '$lib/attachments/bg-waves';
	import { dotsFill } from '$lib/attachments/dots-fill';
	import { gridFlowImg } from '$lib/attachments/grid-flow-img';
	import BackgroundFrame from '$lib/library/background-frame.svelte';
	import LibrarySection from '$lib/library/library-section.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import { navEntry } from '$lib/utils/nav';

	const nav = navEntry('/advanced');
</script>

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Advanced"
	description="More complex behavior: canvas, SVG and anything heavier than the everyday attachments and components."
/>

<div class="advanced page-grid">
	<LibrarySection
		title="Bg Dust"
		type="Attachment"
		description="A moving, grainy light field behind an element, drawn on the GPU. Soft glows drift, form and dissolve, a fine sparkle flows through them, and the pointer pushes them along and lights the field under it. It follows the site's light and dark theme, and it can also change theme as the page scrolls. It only runs while the element is on screen, and with reduced motion it draws one still frame. A site uses one instance: on a section, or on `<body>` with `fixed`, where sections should have no background of their own. Every option is optional, and the groups (`lobes`, `ripple`, `turbulence`, `mouse`, `crease`, `vignette`) take only the values you set."
		props={[
			{
				name: 'fixed',
				description:
					'A boolean. Covers the whole screen and follows it, instead of covering the element. Meant for `<body>`. Defaults to `false`.'
			},
			{
				name: 'colors',
				description:
					'`{ dark, light }`, each `{ base, highlight }`: the field and the glow that drifts across it, as any CSS color. Defaults to navy for dark and white with a blue glow for light.'
			},
			{
				name: 'theme',
				description:
					"`follow | dark | light`. `follow` matches the site's theme (the `data-theme` on `<html>`), or pin it to one. Defaults to `follow`."
			},
			{
				name: 'sections',
				description:
					'A boolean. With `follow`, changes theme as the page scrolls, to match each element with `data-bg-theme="light"` or `"dark"`. `data-bg-theme-start` (0-1, default `0.5`) sets how far up the screen the element must be. Defaults to `false`.'
			},
			{
				name: 'motionSpeed',
				description:
					'A number, the pace of everything that moves. `0` freezes it. Defaults to `3.5`.'
			},
			{
				name: 'fadeIn',
				description: 'A number, seconds the glow takes to fade in on load. Defaults to `3`.'
			},
			{
				name: 'lobes',
				description:
					'`{ count, drift, radius, radiusVariance, formMin }`. How many glows (1-4, default `3`), how far each wanders (`0.46`), their average size (`0.3`), how much that varies (`0.14`), and the lowest brightness one dips to (`0.12`, and `0` lets it vanish).'
			},
			{
				name: 'ripple',
				description:
					'`{ enabled, centerX, centerY, spacing, shift, cycles }`. Stationary rings, centered above the top edge, that cut the glow into bands. Defaults are `true`, `0`, `1.4`, `0.18`, `0.85` and `1`.'
			},
			{
				name: 'turbulence',
				description:
					'`{ speed, scale, intensity, curl, curlScale }`. The fine sparkle: how fast it drifts (`0.0075`), how fine it is (`520`, higher is finer), how bright (`0.08`), and how much it wobbles (`0.5`, scale `3.5`).'
			},
			{
				name: 'mouse',
				description:
					'`{ radius, glowRadius, push, glowBoost, positionSmoothing, influenceSmoothing, velocityReference, velocityAttack, velocityRelease, sparkle, sparkleRadius, sparklePush, sparkleTrail, sparkleTrailLength, sparkleEdgeNoise, sparkleSwap, sparkleDirectionSmoothing }`. How the pointer pushes the glows and lights the field. `sparkle: true` lets it push the sparkle as well, with a trail. The defaults are the tuned ones, so start from `push`, `glowBoost` and `sparkle`.'
			},
			{
				name: 'crease',
				description:
					'`{ angle, offset, width, strength }`. A soft diagonal shadow. Defaults are `-20`, `0.08`, `0.24` and `0.12`.'
			},
			{
				name: 'vignette',
				description:
					'`{ start, end, strength }`. Darkens the edges. Defaults are `0.15`, `0.95` and `0.55`.'
			},
			{
				name: 'grain',
				description: 'A number, the film grain from `0` up. Defaults to `0.035`.'
			}
		]}
		propsLabel="options"
	>
		<LibrarySection
			level={3}
			title="Defaults"
			description="Follows the site theme: switch the theme in the footer to see both palettes."
		>
			<BackgroundFrame effect={bgDust()} />
		</LibrarySection>
		<LibrarySection
			level={3}
			title="Accent colors, with sparkle"
			description="Custom `colors` in the accent, no `ripple`, and `mouse.sparkle` so the pointer pushes the fine grain too."
		>
			<BackgroundFrame
				effect={bgDust({
					colors: {
						dark: { base: '#140a05', highlight: '#e98a63' },
						light: { base: '#fff8f4', highlight: '#e98a63' }
					},
					ripple: { enabled: false },
					lobes: { count: 4, formMin: 0.3 },
					mouse: { sparkle: true }
				})}
			/>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Bg Grid"
		type="Attachment"
		description="Draws a grid of lines behind an element. Squares near the pointer light up and fade away, and every so often the grid lights up by itself so a visitor without a mouse still sees it. It is a transparent canvas behind the element's content, so the element's own background shows through, and it only runs while something is animating and the element is on screen. It does nothing when motion is reduced. Put it on a section to give just that section a grid, or on `<body>` with `fixed` for the whole site, where sections should have no background of their own."
		props={[
			{
				name: 'cellSize',
				description: 'A number, the width and height of each square in px. Defaults to `48`.'
			},
			{
				name: 'color',
				description:
					'A string, any CSS color for the lines, including `var(--color-border)`. Defaults to `var(--color-border)`.'
			},
			{ name: 'lineWidth', description: 'A number, the line width in px. Defaults to `1`.' },
			{
				name: 'fade',
				description: 'A number, seconds a square takes to fade away. Defaults to `0.85`.'
			},
			{
				name: 'spread',
				description:
					'A number from 0 to 1, the chance that each square touching the one under the pointer lights up too. Defaults to `0.5`.'
			},
			{
				name: 'ambient',
				description:
					'A number, milliseconds between the grid lighting up by itself. `0` turns it off. Defaults to `7500`.'
			},
			{
				name: 'fixed',
				description:
					'A boolean. Covers the whole screen and follows it, instead of covering the element. Meant for `<body>`. Defaults to `false`.'
			},
			{
				name: 'show',
				description:
					'A boolean, or `{ enter, exit, stagger }`. Holds the whole grid on while the element is mostly on screen, then fades it out. `enter` and `exit` are how it sweeps: `stack-top`, `stack-bottom`, `stack-left`, `stack-right`, `ripple-out`, `ripple-in`, `random`, `diag-tl`, `diag-tr`, `diag-br` or `diag-bl` (default `stack-top`), and `stagger` is milliseconds between squares (default `50`).'
			},
			{
				name: 'disableOn',
				description:
					'A selector for elements inside that stop the pointer from lighting squares while it is over them, such as buttons.'
			},
			{
				name: 'hideOn',
				description:
					'A selector for elements inside that hide the grid completely while the pointer is over them.'
			}
		]}
		propsLabel="options"
	>
		<LibrarySection
			level={3}
			title="Follows the pointer"
			description="The defaults, with `disableOn: '.demo-button'` so the button's own area stays dark."
		>
			<BackgroundFrame effect={bgGrid({ disableOn: '.demo-button' })} />
		</LibrarySection>
		<LibrarySection
			level={3}
			title="Shown while in view"
			description="`show` with `ripple-out` in and out, `cellSize: 32`. The whole grid ripples in from the center when the frame is on screen and out again as it leaves."
		>
			<BackgroundFrame
				effect={bgGrid({
					show: { enter: 'ripple-out', exit: 'ripple-out', stagger: 50 },
					cellSize: 32,
					color: 'var(--color-accent)'
				})}
			/>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Bg Waves"
		type="Attachment"
		description="A field of particles that ripples like water, seen from above and behind, drawn on the GPU. With `follow`, particles near the pointer light up to full strength. The color follows the site's theme when it is a CSS variable. It only runs while the element is on screen, and with reduced motion it draws one still frame. Sizes are in the field's own units, not px: `width` and `depth` set how far it spreads and `gap` how tightly it is filled, so a smaller gap draws many more particles."
		props={[
			{
				name: 'fixed',
				description:
					'A boolean. Covers the whole screen and follows it, instead of covering the element. Meant for `<body>`. Defaults to `false`.'
			},
			{
				name: 'width',
				description:
					"A number, how far the field spreads from side to side, in the field's own units. Defaults to `40`."
			},
			{
				name: 'depth',
				description:
					'A number, how far it spreads front to back, in the same units. Defaults to `25`.'
			},
			{
				name: 'gap',
				description:
					'A number, the space between particles in the same units. Smaller draws more of them. Defaults to `0.5`.'
			},
			{
				name: 'color',
				description:
					'A string, any CSS color, including `var(--color-accent)`. Defaults to `var(--color-text)`.'
			},
			{
				name: 'opacity',
				description:
					'A number from 0 to 1, how solid the particles are. Below `1`, `follow` can light them up. Defaults to `1`.'
			},
			{ name: 'speed', description: 'A number, how fast the waves move. Defaults to `0.01`.' },
			{
				name: 'follow',
				description:
					"A number, how far from the pointer particles light up to full strength, in the field's own units. `0` turns it off, and it needs an `opacity` below `1` to show. Defaults to `0`."
			},
			{
				name: 'fadeTop',
				description:
					'A number, how much of the top edge fades out, as a percent of the height. `0` leaves it hard. Defaults to `0`.'
			},
			{
				name: 'camera',
				description:
					'`{ height, distance, fov }`, where the camera looks down from and how wide it sees. Defaults are `6`, `5` and `75`.'
			}
		]}
		propsLabel="options"
	>
		<LibrarySection
			level={3}
			title="Defaults"
			description="The theme's text color, with a faded top edge."
		>
			<BackgroundFrame effect={bgWaves({ fadeTop: 20 })} />
		</LibrarySection>
		<LibrarySection
			level={3}
			title="Follows the pointer"
			description="Accent color, `opacity: 0.5` and `follow: 25`, so particles near the pointer light up. A smaller `gap` makes it denser."
		>
			<BackgroundFrame
				effect={bgWaves({
					color: 'var(--color-accent)',
					opacity: 0.5,
					follow: 25,
					speed: 0.0025,
					gap: 0.4,
					fadeTop: 20
				})}
			/>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Dots Fill"
		type="Attachment"
		description="Goes on an `<svg>`, or on an `<img>`. On an `<svg>` it turns the fill of every shape inside into a grid of dots that the pointer pushes around: a dot is drawn wherever a grid point lands inside a shape, and the shapes are hidden until the attachment is removed. Use `rect`, `circle`, `ellipse`, `path` and `polygon` without a `transform`. An `<img>` keeps its shapes out of reach, so it is drawn to a canvas instead and every grid point on a solid pixel gets a dot. That works for an SVG file and for any picture with transparency, such as a PNG or WebP cut-out, as long as it comes from your own site or allows cross-origin reads. On an `<img>` the sizes are in px and the dots are redone when it resizes. The dots only move while it is on screen, and stay still when motion is reduced."
		props={[
			{
				name: 'size',
				description: "A number, the radius of each dot in the SVG's own units. Defaults to `1`."
			},
			{
				name: 'gap',
				description: 'A number, the space between dot centers in the same units. Defaults to `16`.'
			},
			{
				name: 'restore',
				description:
					"A number from 0 to 1, how quickly the pointer's speed fades once it stops. Higher stops the push sooner. Defaults to `0.15`."
			},
			{
				name: 'sensitivity',
				description:
					'A number from 0 to 1, how long dots keep moving after a push. Closer to `1` springs back more slowly. Defaults to `0.95`.'
			},
			{
				name: 'distance',
				description:
					"A number, how far from the pointer dots react, in the SVG's own units. Defaults to `50`."
			},
			{
				name: 'strength',
				description: 'A number, how hard the pointer pushes dots away. Defaults to `10`.'
			},
			{
				name: 'color',
				description:
					"A string, any CSS color, including `var(--color-accent)`. Defaults to the SVG's own text color."
			},
			{
				name: 'illuminate',
				description:
					'A boolean. Dots dim away from the pointer, so the ones near it light up. Defaults to `false`.'
			},
			{
				name: 'grow',
				description:
					'A number, how much dots swell near the pointer as a multiple of their size. `0` keeps them the same size. Defaults to `0`.'
			}
		]}
		propsLabel="options"
	>
		<svg
			class="square"
			viewBox="0 0 250 250"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{@attach dotsFill({
				size: 2,
				gap: 32,
				restore: 1,
				sensitivity: 1,
				distance: 120,
				strength: 50
			})}
		>
			<rect width="250" height="250" />
		</svg>

		<svg
			class="glyph"
			viewBox="0 0 80 80"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{@attach dotsFill({
				size: 0.5,
				gap: 4,
				restore: 0.5,
				sensitivity: 0.9,
				distance: 25,
				strength: 20,
				color: 'var(--color-accent)'
			})}
		>
			<path d="M79 1V43.5449H43.5459V79H1V36.4551H36.4541V1H79Z" />
		</svg>

		<svg
			class="infinity"
			viewBox="0 -960 960 960"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{@attach dotsFill({
				size: 2,
				gap: 16,
				restore: 0.1,
				sensitivity: 0.9,
				distance: 250,
				strength: 520,
				color: 'var(--color-accent)',
				illuminate: true,
				grow: 3
			})}
		>
			<path
				d="M220-260q-92 0-156-64T0-480q0-92 64-156t156-64q37 0 71 13t61 37l68 62-60 54-62-56q-16-14-36-22t-42-8q-58 0-99 41t-41 99q0 58 41 99t99 41q22 0 42-8t36-22l310-280q27-24 61-37t71-13q92 0 156 64t64 156q0 92-64 156t-156 64q-37 0-71-13t-61-37l-68-62 60-54 62 56q16 14 36 22t42 8q58 0 99-41t41-99q0-58-41-99t-99-41q-22 0-42 8t-36 22L352-310q-27 24-61 37t-71 13Z"
			/>
		</svg>

		<img
			class="image-logo"
			src="/images/logo-white.svg"
			alt="axys"
			width="717"
			height="86"
			{@attach dotsFill({
				size: 0.75,
				gap: 4,
				distance: 25,
				strength: 250,
				restore: 0.9,
				sensitivity: 0.98,
				color: 'var(--color-accent)'
			})}
		/>
	</LibrarySection>
	<LibrarySection
		title="Grid Flow Img"
		type="Attachment"
		description="Goes on an `<img>`. The picture is cut into blocks that the mouse drags along as it moves, with a color split that follows the speed of the move and fades once it stops. A canvas is laid over the image and draws the same picture with a small WebGL shader, so no library is loaded. Size and shape come from your own CSS on the image, and the canvas takes its position and rounded corners. It does nothing without a mouse or with reduced motion, and the image is left as it is. The picture must be from your own site or allow cross-origin reads."
		props={[
			{
				name: 'ease',
				description:
					'A number from 0 to 1, how quickly the effect follows the pointer. Lower trails further behind. Defaults to `0.05`.'
			},
			{
				name: 'range',
				description:
					'A number from 0 to 1, how far from the pointer the effect reaches, as a share of the image. Defaults to `0.3`.'
			},
			{
				name: 'grid',
				description:
					'A number, how many blocks the image is cut into along each side. Fewer is chunkier. Defaults to `32`.'
			},
			{
				name: 'intensity',
				description:
					'A number, how strong the color split is while the pointer moves. Defaults to `1`.'
			},
			{
				name: 'fit',
				description:
					"`cover | contain | stretch`. How the picture sits in the image's box, like `object-fit`. Defaults to `cover`."
			},
			{
				name: 'greyscale',
				description:
					'A boolean. Draws in black and white until the pointer is over it. Defaults to `true`.'
			}
		]}
		propsLabel="options"
	>
		<img
			class="flow wide"
			src="/images/img-sample-6.jpg"
			alt="A mountain range under clouds"
			width="1200"
			height="686"
			{@attach gridFlowImg()}
		/>
		<div class="flow-row">
			<img
				class="flow tall"
				src="/images/img-sample-7.jpg"
				alt="A ridge above a river valley"
				width="350"
				height="600"
				{@attach gridFlowImg({ grid: 4, ease: 0.04, range: 0.36, intensity: 1 })}
			/>
			<img
				class="flow tall"
				src="/images/img-sample-3.jpg"
				alt="Smoke rising from a canyon"
				width="350"
				height="600"
				{@attach gridFlowImg({ range: 0.6, intensity: 1.5, greyscale: false })}
			/>
		</div>
	</LibrarySection>
</div>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	.advanced {
		row-gap: 128px;
		padding-block: var(--body-padding);
	}

	svg {
		display: block;
		max-width: 100%;
		margin-inline: auto;
	}

	.square {
		width: 250px;
		height: 250px;
	}

	.glyph {
		width: min(30vw, 360px);
		height: min(30vw, 360px);
	}

	.infinity {
		width: min(36vw, 420px);
		height: min(36vw, 420px);
	}

	.image-logo {
		display: block;
		width: min(100%, 560px);
		height: auto;
		margin-inline: auto;
	}

	.flow {
		display: block;
		object-fit: cover;
	}

	.wide {
		width: 100%;
		aspect-ratio: 1.75 / 1;
	}

	.flow-row {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		justify-content: center;
		gap: 24px;
	}

	.tall {
		width: min(100%, 350px);
		aspect-ratio: 1 / 1.25;
		border-radius: var(--radius);
	}
</style>
