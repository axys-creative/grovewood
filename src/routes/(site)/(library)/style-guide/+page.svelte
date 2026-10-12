<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import { bgFollow } from '$lib/attachments/bg-follow';
	import { bgSlide } from '$lib/attachments/bg-slide';
	import { buttonJump } from '$lib/attachments/button-jump';
	import { cursorHide } from '$lib/attachments/cursor-hide';
	import { glitchHover } from '$lib/attachments/glitch-hover';
	import { magnet } from '$lib/attachments/magnet';
	import { toggleSlider } from '$lib/attachments/toggle-slider';
	import { textRoll } from '$lib/attachments/text-roll';
	import { underline } from '$lib/attachments/underline';
	import Button from '$lib/components/button.svelte';
	import CtaGroup from '$lib/components/cta-group.svelte';
	import Eyebrow from '$lib/components/eyebrow.svelte';
	import FormChoice from '$lib/components/form-choice.svelte';
	import FormControl from '$lib/components/form-control.svelte';
	import FormField, { type FormFieldProps } from '$lib/components/form-field.svelte';
	import FormGroup from '$lib/components/form-group.svelte';
	import Icon from '$lib/components/icon.svelte';
	import Logo from '$lib/components/logo.svelte';
	import MenuLinks from '$lib/components/menu-links.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import SiteNavButton, { type SiteNavButtonProps } from '$lib/components/site-nav-button.svelte';
	import SocialLinks from '$lib/components/social-links.svelte';
	import Tag from '$lib/components/tag.svelte';
	import social from '$lib/content/global/social-media.json';
	import {
		buttonProps,
		colorTokens,
		ctaGroupProps,
		eyebrowProps,
		formChoiceProps,
		formControlProps,
		formFieldProps,
		formGroupProps,
		iconProps,
		logoProps,
		menuLinksProps,
		sectionCopyProps,
		siteNavButtonProps,
		socialLinksProps,
		tagProps,
		themeSurfaceTokens,
		toggleSliderProps,
		typographyTokens
	} from '$lib/library/component-props';
	import LibrarySection from '$lib/library/library-section.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import { navEntry } from '$lib/utils/nav';

	const nav = navEntry('/style-guide');

	const surfaces = [
		{ name: 'theme-invert', label: 'theme-invert (opposite of the page)' },
		{ name: 'theme-light', label: 'theme-light' },
		{ name: 'theme-dark', label: 'theme-dark' }
	];

	const colors = [
		'bg',
		'surface',
		'text',
		'text-muted',
		'border',
		'accent',
		'accent-text',
		'secondary',
		'tertiary',
		'error'
	];
	const icons = ['check', 'chevron-right', 'arrow-tr', 'new-tab', 'copy', 'x', 'mail', 'social-x'];
	let plan = $state('team');
	let chosen = $state('Monthly');
	let view = $state('grid');
	let notify = $state(true);
	let volume = $state(40);
	let rating = $state(65);

	const fieldTypes: {
		type: FormFieldProps['type'];
		label: string;
		extra?: Partial<FormFieldProps>;
	}[] = [
		{ type: 'text', label: 'Text' },
		{ type: 'email', label: 'Email' },
		{ type: 'password', label: 'Password' },
		{ type: 'search', label: 'Search' },
		{ type: 'url', label: 'URL' },
		{ type: 'tel', label: 'Phone (digits only)' },
		{ type: 'number', label: 'Number' },
		{ type: 'date', label: 'Date' },
		{ type: 'time', label: 'Time' },
		{
			type: 'text',
			label: 'With suggestions',
			extra: { datalist: ['Salt Lake City', 'Denver', 'Portland', 'Phoenix'] }
		},
		{
			type: 'select',
			label: 'Select',
			extra: {
				options: [
					'One',
					'Two',
					{ value: 'three', label: 'Three (disabled)', disabled: true },
					{ group: 'More', options: ['Four', 'Five'] }
				]
			}
		}
	];

	const sizes = ['sm', 'md', 'lg'] as const;
	const symbols: NonNullable<SiteNavButtonProps['symbol']>[] = [
		'burger',
		'oreo',
		'stairs',
		'chocolate',
		'kebab'
	];
	const shapes: NonNullable<SiteNavButtonProps['shape']>[] = ['square', 'round'];
	let navOpen = $state(false);
	let show = $state({ eyebrow: true, title: true, description: true, cta: true });

	const sampleCopy = {
		eyebrowText: 'Eyebrow',
		eyebrowIcon: 'bolt',
		title: 'A title for the section',
		description:
			'A short description that supports the title and tells the visitor what to expect next.',
		cta: { primary: { text: 'Primary', url: '/' }, secondary: { text: 'Secondary', url: '/' } }
	};

	const sampleLinks = [
		{ text: 'Home', url: '/' },
		{
			text: 'Resources',
			links: [
				{ text: 'Style Guide', url: '/style-guide', iconStart: 'palette' },
				{ text: 'Attachments', url: '/attachments', iconStart: 'bolt' }
			]
		},
		{ text: 'Website', url: 'https://axyscreative.com', newTab: true }
	];
</script>

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Style guide"
	description="Colors, type and the base components every site starts from."
/>

<div class="style-guide page-grid">
	<LibrarySection
		title="Colors"
		type="Tokens"
		description="CSS custom properties set on the root. The light theme overrides them with `data-theme` on `html`, so use the variable and never a fixed color."
		props={colorTokens}
		propsLabel="props"
	>
		<ul class="swatches">
			{#each colors as name (name)}
				<li>
					<span class="swatch" style="background: var(--color-{name})"></span>
					<code>--color-{name}</code>
				</li>
			{/each}
		</ul>
	</LibrarySection>

	<LibrarySection
		title="Theme Surfaces"
		type="Tokens"
		description="Add one class to a section or any wrapper and everything inside follows its own theme: the background, text, borders and buttons all flip together. Use `theme-invert` for a band that is always the opposite of the page, so it is light while you work in dark and dark when a visitor switches to light."
		props={themeSurfaceTokens}
		propsLabel="props"
	>
		<div class="surfaces full">
			{#each surfaces as surface (surface.name)}
				<div class="surface page-grid {surface.name}">
					<p class="h4">{surface.label}</p>
					<p>Text, muted text and borders come from the same tokens.</p>
					<div class="row">
						<Button text="Solid" />
						<Button text="Outline" type="outline" />
						<Tag text="Tag" type="outline" />
					</div>
					<div class="card">A raised surface</div>
				</div>
			{/each}
		</div>
		<pre class="usage"><code
				>&lt;section class="theme-invert"&gt;…&lt;/section&gt;

.promo &#123;
	@use 'base/variables';
	@include variables.light-tokens;
	background: var(--color-bg);
&#125;</code
			></pre>
		<p>
			Canvas backgrounds that read <code>data-theme</code> follow the page theme, not the surface.
		</p>
	</LibrarySection>

	<LibrarySection
		title="Typography"
		type="Tokens"
		description="Headings take their styles from the element, or from a `.h1` to `.h6` class on any element, so size and heading level can differ."
		props={typographyTokens}
		propsLabel="props"
	>
		<p class="h1">Heading 1</p>
		<p class="h2">Heading 2</p>
		<p class="h3">Heading 3</p>
		<p class="h4">Heading 4</p>
		<p class="h5">Heading 5</p>
		<p class="h6">Heading 6</p>
		<p class="body-large">Body large. The quick brown fox jumps over the lazy dog.</p>
		<p class="body">Body. The quick brown fox jumps over the lazy dog.</p>
		<p class="body-small">Body small. The quick brown fox jumps over the lazy dog.</p>
		<p><a href="#typography">A text link</a></p>
	</LibrarySection>

	<LibrarySection
		title="Button"
		type="Component"
		description="A link or a button, depending on whether it has a `url`. Accepts attachments directly."
		props={buttonProps}
	>
		<div class="row">
			{#each sizes as size (size)}
				<Button text="Solid {size}" {size} />
				<Button text="Outline {size}" {size} type="outline" />
			{/each}
		</div>
		<div class="row">
			<Button text="Underline" type="underline" />
			<Button text="Text" type="text" />
			<Button text="Link" url="/" />
			<Button text="New tab" url="https://example.com" newTab type="outline" />
			<Button text="Disabled" disabled />
		</div>
		<div class="row">
			<Button text="Icon end" iconEnd="chevron-right" />
			<Button text="Icon start" iconStart="copy" type="outline" />
			<Button textDescription="Close" iconStart="x" type="outline" />
		</div>
		<h3 class="plain">Mixed with attachments</h3>
		<div class="row">
			<Button text="Solid custom 1" size="sm" iconStart="orbit" {@attach bgSlide()} />
			<Button
				text="Solid custom 2"
				url="/"
				iconEnd="new-tab"
				{@attach magnet({ x: 0.25, y: 0.75 })}
				{@attach glitchHover({ newText: 'Let’s do this!' })}
				{@attach underline()}
				{@attach cursorHide()}
			/>
		</div>
		<div class="row">
			<Button
				text="Outline custom"
				url="/"
				type="outline"
				iconEnd="chevron-right"
				{@attach textRoll()}
			/>
			<Button
				text="Icon end circle"
				type="text"
				iconEnd="chevron-right"
				iconCircle
				iconEndAttach={magnet({ x: 1, y: 1 })}
				{@attach cursorHide()}
			/>
			<Button
				text="Outline slide"
				type="outline"
				{@attach bgSlide({ direction: 'up' })}
				{@attach cursorHide()}
			/>
		</div>
		<div class="row">
			<Button text="Jump" {@attach buttonJump()} />
			<Button text="Jump outline" type="outline" {@attach buttonJump({ scale: 1.2 })} />
			<Button text="Follow solid" {@attach bgFollow()} />
			<Button text="Follow outline" type="outline" {@attach bgFollow()} />
		</div>
		<ul class="classic-list">
			<li>
				<code>buttonJump({'{ scale, duration }'})</code> pops the button up and back once when the
				mouse enters or the keyboard focuses it. <code>scale</code> is the peak size as a multiple
				(default <code>1.1</code>), <code>duration</code> is milliseconds (default
				<code>300</code>).
			</li>
			<li>
				<code>bgFollow()</code> fills the button with color from the pointer outward on hover and
				back in to where it leaves. Set <code>--bg-follow-color</code> to change the color.
			</li>
		</ul>
	</LibrarySection>

	<LibrarySection
		title="CTA Group"
		type="Component"
		description="A primary and an optional secondary button side by side."
		props={ctaGroupProps}
	>
		<CtaGroup primary={{ text: 'Primary', url: '/' }} secondary={{ text: 'Secondary', url: '/' }} />
	</LibrarySection>

	<LibrarySection
		title="Eyebrow"
		type="Component"
		description="The small label above a title, with an optional icon."
		props={eyebrowProps}
	>
		<div class="row">
			<Eyebrow text="Text only" />
			<Eyebrow text="With icon" icon="check" />
			<Eyebrow text="Available for freelance" dot="pulse" />
			<Eyebrow text="Available for freelance" dot="sonar" />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Form Components"
		type="Component"
		description="The pieces a form is built from. Fields come in two looks, an underline and a full border, set with `variant` on each field or once on a whole `Form`. Checkboxes, radios and switches look the same everywhere. All of them work with the keyboard and screen readers."
	>
		<LibrarySection
			level={3}
			title="Form Field"
			description="One label and one control, covering every text-like input, a textarea and a select."
			props={formFieldProps}
		>
			<div class="fields">
				<div>
					<h4 class="plain">Underline</h4>
					<div class="field-grid">
						{#each fieldTypes as { type, label, extra } (label)}
							<FormField name="underline-{label}" {label} {type} required={false} {...extra} />
						{/each}
						<FormField
							name="underline-message"
							label="Message"
							type="textarea"
							maxLength={250}
							required={false}
						/>
						<FormField
							name="underline-hint"
							label="With a hint"
							hint="We never share your email."
							required={false}
						/>
						<FormField
							name="underline-error"
							label="With an error"
							error="Enter a valid email address."
							value="nope"
							required={false}
						/>
						<FormField name="underline-disabled" label="Disabled" disabled required={false} />
					</div>
				</div>
				<div>
					<h4 class="plain">Outline</h4>
					<div class="field-grid">
						{#each fieldTypes as { type, label, extra } (label)}
							<FormField
								variant="outline"
								name="outline-{label}"
								{label}
								{type}
								required={false}
								{...extra}
							/>
						{/each}
						<FormField
							variant="outline"
							name="outline-message"
							label="Message"
							type="textarea"
							maxLength={250}
							required={false}
						/>
						<FormField
							variant="outline"
							name="outline-hint"
							label="With a hint"
							hint="We never share your email."
							required={false}
						/>
						<FormField
							variant="outline"
							name="outline-error"
							label="With an error"
							error="Enter a valid email address."
							value="nope"
							required={false}
						/>
						<FormField
							variant="outline"
							name="outline-disabled"
							label="Disabled"
							disabled
							required={false}
						/>
					</div>
				</div>
			</div>
		</LibrarySection>

		<LibrarySection
			level={3}
			title="Form Choice"
			description="A checkbox, a radio or a switch with its label. Clicking the label toggles it."
			props={formChoiceProps}
		>
			<div class="choices">
				<FormGroup legend="Checkboxes">
					<FormChoice name="topics" value="news" label="News" checked />
					<FormChoice name="topics" value="offers" label="Offers" />
					<FormChoice name="topics" value="events" label="Events (disabled)" disabled />
				</FormGroup>
				<FormGroup legend="Radios">
					<FormChoice type="radio" name="plan" value="solo" label="Solo" bind:group={plan} />
					<FormChoice type="radio" name="plan" value="team" label="Team" bind:group={plan} />
					<FormChoice
						type="radio"
						name="plan"
						value="company"
						label="Company (disabled)"
						disabled
						bind:group={plan}
					/>
				</FormGroup>
				<FormGroup legend="Switches">
					<FormChoice type="switch" name="notify" label="Notifications" bind:checked={notify} />
					<FormChoice type="switch" name="marketing" label="Marketing emails" />
				</FormGroup>
			</div>
		</LibrarySection>

		<LibrarySection
			level={3}
			title="Form Group"
			description="A `fieldset` and `legend` around related choices, so a screen reader announces what the options belong to. It is the heading above each group of choices here."
			props={formGroupProps}
		>
			<FormGroup legend="Contact me by" direction="row">
				<FormChoice type="radio" name="contact" value="email" label="Email" />
				<FormChoice type="radio" name="contact" value="phone" label="Phone" />
				<FormChoice type="radio" name="contact" value="text" label="Text" />
			</FormGroup>
		</LibrarySection>

		<LibrarySection
			level={3}
			title="Form Control"
			description="The controls that are not text: a range, a color picker, a file input, a progress bar and a meter."
			props={formControlProps}
		>
			<div class="controls">
				<FormControl type="range" name="volume" label="Volume" bind:value={volume} />
				<FormControl type="range" label="Disabled range" disabled />
				<FormControl type="color" name="color" label="Color" />
				<FormControl type="file" name="upload" label="File" />
				<FormControl type="progress" label="Progress" value={70} />
				<FormControl type="meter" label="Meter" bind:value={rating} />
			</div>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Icon"
		type="Component"
		description="Draws an SVG from `static/icons` in the current text color, so it follows themes and hover states."
		props={iconProps}
	>
		<ul class="row icons">
			{#each icons as name (name)}
				<li>
					<Icon {name} size="lg" />
					<code>{name}</code>
				</li>
			{/each}
		</ul>
	</LibrarySection>

	<LibrarySection
		title="Logo"
		type="Component"
		description="An image, text, or both, optionally linked."
		props={logoProps}
	>
		<div class="row">
			<Logo srcLight="/images/logo-black.svg" srcDark="/images/logo-white.svg" alt="axys" />
			<Logo src="/images/logo-axys-icon-white.svg" text="Tinted with text" tint />
			<Logo text="Text only" />
			<Logo src="/images/logo-axys-icon-white.svg" alt="axys" tint />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Menu Links"
		type="Component"
		description="A list of links with dropdowns: popovers in a row, accordions in a column. The header and footer use it."
		props={menuLinksProps}
	>
		<h3 class="plain">Row</h3>
		<MenuLinks links={sampleLinks} label="Sample row" />
		<h3 class="plain">Column</h3>
		<MenuLinks links={sampleLinks} label="Sample column" direction="column" />
	</LibrarySection>

	<LibrarySection
		title="Section Copy"
		type="Component"
		description="The eyebrow, title, description and buttons that open most sections. Spacing comes from `--space-eyebrow-title`, `--space-title-paragraph` and `--space-paragraph-cta-group`."
		props={sectionCopyProps}
	>
		<h3 class="plain">Show and hide</h3>
		<div class="row">
			<label><input type="checkbox" bind:checked={show.eyebrow} /> Eyebrow</label>
			<label><input type="checkbox" bind:checked={show.title} /> Title</label>
			<label><input type="checkbox" bind:checked={show.description} /> Description</label>
			<label><input type="checkbox" bind:checked={show.cta} /> Buttons</label>
		</div>
		<div class="copy-demo">
			<SectionCopy
				{...sampleCopy}
				level={3}
				showEyebrow={show.eyebrow}
				showTitle={show.title}
				showDescription={show.description}
				showCta={show.cta}
			/>
		</div>

		<h3 class="plain">Centered</h3>
		<div class="copy-demo">
			<SectionCopy {...sampleCopy} level={3} align="center" />
		</div>

		<h3 class="plain">Row: description beside the title</h3>
		<div class="copy-demo">
			<SectionCopy {...sampleCopy} level={3} layout="row" />
		</div>

		<h3 class="plain">Row, lined up at the bottom</h3>
		<div class="copy-demo">
			<SectionCopy {...sampleCopy} level={3} layout="row" rowAlign="end" />
		</div>
	</LibrarySection>

	<LibrarySection
		title="Site Nav Button"
		type="Component"
		description="The button that opens the mobile navigation. Click the toggle to see the open state."
		props={siteNavButtonProps}
	>
		<div class="row">
			<Button
				text={navOpen ? 'Reset to closed' : 'Set all open'}
				type="outline"
				onclick={() => (navOpen = !navOpen)}
			/>
		</div>
		<div class="nav-buttons">
			{#each symbols as symbol (symbol)}
				{#each shapes as shape (shape)}
					<div class="nav-button-sample">
						<SiteNavButton {symbol} {shape} expanded={navOpen} />
						<code>{symbol} / {shape}</code>
					</div>
				{/each}
			{/each}
			<div class="nav-button-sample">
				<SiteNavButton symbol="burger" text="menu" expanded={navOpen} />
				<code>with text</code>
			</div>
			<div class="nav-button-sample">
				<SiteNavButton symbol="burger" type="button" expanded={navOpen} />
				<code>button style</code>
			</div>
		</div>
	</LibrarySection>

	<LibrarySection
		title="Smooth Scroll"
		type="Component"
		description="Smooth scrolling with Lenis. It takes no props: mount it once in the site layout. Add `data-lenis-prevent` to anything that must scroll natively, such as a modal. To remove it, delete the component, its tag in the layout, and run `bun remove lenis`."
	/>

	<LibrarySection
		title="Social Links"
		type="Component"
		description="A row of icon links to social profiles, each opening in a new tab."
		props={socialLinksProps}
	>
		<SocialLinks links={social.links} />
		<SocialLinks links={social.links} solid />
	</LibrarySection>

	<LibrarySection
		title="Tag"
		type="Component"
		description="A small pill for labels and status."
		props={tagProps}
	>
		<div class="row">
			<Tag text="Solid" />
			<Tag text="Outline" type="outline" />
			<Tag text="Glass" type="glass" />
			<Tag text="With icon" icon="bolt" type="outline" />
		</div>
	</LibrarySection>
	<LibrarySection
		title="Toggle Slider"
		type="Attachment"
		description="A slider that glides behind the selected one of a row of options: tabs, links, buttons or radio labels. The attachment adds the slider itself and follows whichever option is selected, by `aria-selected`, `aria-current`, a checked radio or a click. The Theme Toggle and the Tabs combo use it, so it mixes with other concepts. With `trigger: 'hover'` the slider also follows the pointer and returns when it leaves."
		props={toggleSliderProps}
	>
		<h3 class="plain">Solid, moves on click</h3>
		<div class="row">
			<div {@attach toggleSlider()}>
				{#each ['Monthly', 'Quarterly', 'Yearly'] as option (option)}
					<button type="button" onclick={() => (chosen = option)} aria-current={chosen === option}>
						{option}
					</button>
				{/each}
			</div>
		</div>
		<h3 class="plain">Underline, with links</h3>
		<div class="row">
			<nav aria-label="Sample sections" {@attach toggleSlider({ variant: 'underline' })}>
				<a href="#overview" aria-current="true">Overview</a>
				<a href="#features">Features</a>
				<a href="#pricing">Pricing</a>
			</nav>
		</div>
		<h3 class="plain">Solid, following the pointer</h3>
		<div class="row">
			<div {@attach toggleSlider({ trigger: 'hover' })}>
				{#each ['grid', 'list', 'map'] as option (option)}
					<button type="button" onclick={() => (view = option)} aria-current={view === option}>
						{option}
					</button>
				{/each}
			</div>
		</div>
		<h3 class="plain">Radio labels</h3>
		<div class="row">
			<fieldset class="slider-radios" {@attach toggleSlider({ options: 'label' })}>
				<legend class="visually-hidden">Size</legend>
				{#each ['Small', 'Medium', 'Large'] as option (option)}
					<label
						><input
							type="radio"
							name="slider-size"
							value={option}
							checked={option === 'Medium'}
						/>{option}</label
					>
				{/each}
			</fieldset>
		</div>
	</LibrarySection>
</div>

<style lang="scss">
	@use 'base/mixins';
	/* LIBRARY: DELETE ME */
	.style-guide {
		row-gap: 128px;
		padding-block: var(--body-padding);
	}

	.surfaces {
		display: grid;
	}

	.surface {
		row-gap: 16px;
		padding-block: 48px;

		p {
			color: var(--color-text);
		}
	}

	.card {
		padding: 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.usage {
		max-width: 100%;
		margin: 0;
		overflow-x: auto;
		padding: 16px;
		border-radius: var(--radius);
		background: var(--color-surface);
		font-family: var(--font-mono);
		font-size: 14px;
	}

	.fields {
		display: grid;
		gap: 64px;
		width: 100%;
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
		gap: 20px 32px;

		@include mixins.max-md {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.choices {
		display: flex;
		flex-wrap: wrap;
		gap: 48px;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 32px;
		width: 100%;

		@include mixins.max-md {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.slider-radios {
		margin: 0;
		padding: 4px;

		label {
			cursor: pointer;
		}

		input {
			position: absolute;
			opacity: 0;
		}
	}

	.plain {
		margin: 16px 0 0;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
		padding: 0;
		list-style: none;
	}

	.swatches {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 16px;
		width: 100%;
		padding: 0;
		list-style: none;
	}

	.swatch {
		display: block;
		height: 56px;
		margin-bottom: 8px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.nav-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 24px;
		width: 100%;
	}

	.nav-button-sample {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	label {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.copy-demo {
		width: 100%;
		padding: 32px;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius);
	}

	.icons li {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
</style>
