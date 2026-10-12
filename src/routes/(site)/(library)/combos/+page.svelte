<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import Alert from '$lib/components/alert.svelte';
	import CopyButton from '$lib/components/copy-button.svelte';
	import Tabs from '$lib/components/tabs.svelte';
	import Button from '$lib/components/button.svelte';
	import Icon from '$lib/components/icon.svelte';
	import CtaGroup from '$lib/components/cta-group.svelte';
	import Tooltip from '$lib/components/tooltip.svelte';
	import VideoBg from '$lib/components/video-bg.svelte';
	import { cursorHide } from '$lib/attachments/cursor-hide';
	import { glitchScroll } from '$lib/attachments/glitch-scroll';
	import { gradientBorder } from '$lib/attachments/gradient-border';
	import { magnet } from '$lib/attachments/magnet';
	import { textFill } from '$lib/attachments/text-fill';
	import { tilt } from '$lib/attachments/tilt';
	import { typingScroll } from '$lib/attachments/typing-scroll';
	import { copy } from '$lib/attachments/copy';
	import { tabs } from '$lib/attachments/tabs';
	import { toggleSlider } from '$lib/attachments/toggle-slider';
	import { mouseTooltip } from '$lib/attachments/mouse-tooltip';
	import {
		alertProps,
		copyButtonProps,
		copyProps,
		mouseTooltipProps,
		tabsAttachmentProps,
		tabsProps,
		tooltipProps,
		videoBgProps
	} from '$lib/library/component-props';
	import LibrarySection from '$lib/library/library-section.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import { alerts } from '$lib/utils/alerts.svelte';
	import { navEntry } from '$lib/utils/nav';

	const nav = navEntry('/combos');

	const videos = {
		one: 'https://www.dropbox.com/scl/fi/6sh06eo6b3x84qo823qcq/sample-video-1.mp4?rlkey=0v6dqkra2wk7de0rz849ufm7o&st=0705ulra&raw=1',
		two: 'https://www.dropbox.com/scl/fi/lqhy0y29fdlv28f81stg2/sample-video-2.mp4?rlkey=nl7r3h0nj61dhqk2yjp30gase&st=sh670ugo&raw=1',
		three:
			'https://www.dropbox.com/scl/fi/x64lje5a8nm7fezjdallt/sample-video-3.mp4?rlkey=wsn6jcpn1t3f6qxpqn3n5zywx&st=43kgpnu2&raw=1',
		poster:
			'https://www.dropbox.com/scl/fi/lqjw3dqkhiwn10gu42ber/sample-video-poster.png?rlkey=598hx6qc7hdfsq67wz59gab19&st=whjv4kl3&raw=1'
	};

	const magnetOptions = { x: 1, y: 1 };
</script>

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Combos"
	description="One feature that comes in more than one form: a ready-made component, an attachment for any element, or both working together."
/>

<div class="combos page-grid">
	<LibrarySection
		title="Alert"
		type="Combo"
		description="Feedback after something happens. The `Alert` component is one message. `alerts.show()` puts an alert on screen from anywhere (a form, a button) and stacks several in a column, newest at the bottom, each closing on its own. `<AlertStack />` is mounted once in the site layout; to remove alerts, delete it, `alert.svelte` and `utils/alerts.svelte.ts`."
		props={alertProps}
	>
		<LibrarySection
			level={3}
			title="Alert Component"
			tag="Static"
			description="The component on its own, for a message that belongs in the page."
		>
			<div class="alerts">
				<Alert
					type="success"
					title="Message received!"
					message="We will get back to you shortly."
				/>
				<Alert
					type="info"
					title="Heads up"
					message="This is some helpful information."
					leftBorder
				/>
				<Alert type="warning" title="Almost there" message="Check the highlighted fields." />
				<Alert
					type="error"
					title="Something went wrong"
					message="Please try again."
					links={[{ text: 'Contact us', url: '/' }]}
				/>
			</div>
		</LibrarySection>

		<LibrarySection
			level={3}
			title="alerts.show()"
			tag="Stacked"
			description="Press a few of these quickly: the alerts stack in the bottom right instead of covering one another. Hover one to hold its countdown."
		>
			<div class="row">
				<Button
					text="Success"
					type="outline"
					onclick={() =>
						alerts.show({
							type: 'success',
							title: 'Saved',
							message: 'Your changes were saved.',
							autoClose: 6000,
							timer: true
						})}
				/>
				<Button
					text="Info with link"
					type="outline"
					onclick={() =>
						alerts.show({
							type: 'info',
							title: 'New feature',
							message: 'Alerts now stack.',
							links: [{ text: 'Learn more', url: '/combos' }],
							autoClose: 8000,
							leftBorder: true
						})}
				/>
				<Button
					text="Warning"
					type="outline"
					onclick={() =>
						alerts.show({
							type: 'warning',
							title: 'Low storage',
							message: 'You are almost out of room.',
							autoClose: 6000,
							timer: true
						})}
				/>
				<Button
					text="Error that stays"
					type="outline"
					onclick={() =>
						alerts.show({
							type: 'error',
							title: 'Connection lost',
							message: 'Close this one yourself.'
						})}
				/>
				<Button text="Clear all" type="underline" onclick={() => alerts.clear()} />
			</div>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Clipboard Copy"
		type="Combo"
		description="Copy a string to the visitor's clipboard, and tell them it worked. The `copy` attachment does it for any element you click, with a label that briefly changes and a spoken confirmation. The `CopyButton` component is a ready-made button that uses it."
	>
		<LibrarySection
			level={3}
			title="Copy Button"
			tag="Component"
			description="A Button that copies a string, or the text of another element. It says Copied! for a moment, and can show an alert."
			props={copyButtonProps}
		>
			<div class="row">
				<CopyButton text="npm create svelte@latest" />
				<CopyButton
					text="hello@example.com"
					label="Copy email"
					copiedText="Email copied"
					type="solid"
					icon="mail"
					alert={{
						title: 'Copied to clipboard',
						message: 'hello@example.com',
						autoClose: 4000,
						timer: true
					}}
				/>
			</div>
			<p>Or copy the text of another element on the page by pointing `target` at it:</p>
			<div class="row">
				<code id="copy-source">bun add gsap lenis</code>
				<CopyButton target="#copy-source" label="Copy command" type="underline" />
			</div>
		</LibrarySection>

		<LibrarySection
			level={3}
			title="copy"
			tag="Attachment"
			description="Makes any element copy on click. If the element has a `.label` (as Button does) that is what changes; otherwise its own text."
			props={copyProps}
		>
			<div class="row">
				<button class="inline" {@attach copy({ text: 'Any button works', copiedText: 'Copied!' })}>
					Click me to copy a sentence
				</button>
				<span
					class="inline"
					role="button"
					tabindex="0"
					{@attach copy({ text: () => new Date().toISOString() })}
				>
					Copy the time
				</span>
			</div>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Tabs"
		type="Combo"
		description="Show one panel at a time. Two ways to build them, one for ready-made panels and one for your own markup. Both are real tabs: they work with the arrow keys, Home and End, and tell screen readers which tab is selected."
	>
		<LibrarySection
			level={3}
			title="Tabs Component"
			tag="Ready-made panels"
			description="Each panel is a title, a description and an optional image, laid out for you."
			props={tabsProps}
		>
			<Tabs
				tabs={[
					{
						label: 'Design',
						title: 'Design',
						description: 'Layouts that feel simple and look sharp.',
						image: { src: '/images/img-sample-1.jpg', alt: '' }
					},
					{
						label: 'Build',
						title: 'Build',
						description: 'Fast, accessible pages built to last.',
						image: { src: '/images/img-sample-2.jpg', alt: '' }
					},
					{
						label: 'Launch',
						title: 'Launch',
						description: 'A smooth launch and a plan for what comes next.',
						image: { src: '/images/img-sample-3.jpg', alt: '' }
					}
				]}
			/>
			<Tabs
				variant="solid"
				defaultTab={1}
				tabs={[
					{
						label: 'Monthly',
						title: 'Pay monthly',
						description: 'Flexible, with no long commitment.'
					},
					{
						label: 'Yearly',
						title: 'Pay yearly',
						description: 'Two months free when you pay for the year.'
					}
				]}
			/>
		</LibrarySection>

		<LibrarySection
			level={3}
			title="tabs"
			tag="Attachment"
			description="Turns your own markup into tabs. Put a `role=&quot;tablist&quot;` of `role=&quot;tab&quot;` buttons and the same number of `role=&quot;tabpanel&quot;` elements inside the element, and put the attachment on it. The panels can hold anything. It links the ids, shows one panel at a time and handles the keyboard. Style the selected tab with `[aria-selected='true']`, or add the Toggle Slider attachment to the tablist, as here, for a slider behind it."
			props={tabsAttachmentProps}
		>
			<div class="custom-tabs" {@attach tabs({ defaultTab: 0 })}>
				<div class="custom-list" role="tablist" aria-label="Plans" {@attach toggleSlider()}>
					<button type="button" role="tab" aria-selected="false">Solo</button>
					<button type="button" role="tab" aria-selected="false">Team</button>
					<button type="button" role="tab" aria-selected="false">Company</button>
				</div>
				<div class="custom-panel" role="tabpanel">
					<strong>$12</strong> a month. One seat, every feature.
				</div>
				<div class="custom-panel" role="tabpanel">
					<ul class="classic-list">
						<li>Up to ten seats</li>
						<li>Shared workspaces</li>
						<li>Priority support</li>
					</ul>
				</div>
				<div class="custom-panel" role="tabpanel">
					<Button text="Talk to us" url="/" type="outline" />
				</div>
			</div>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Tooltip"
		type="Combo"
		description="A tooltip can be added in two ways, each with different pros and cons."
	>
		<LibrarySection
			level={3}
			title="Tooltip Component"
			tag="Stationary"
			description="`tooltip.svelte` opens on hover or keyboard focus, closes with Escape, and links its message to the trigger for screen readers."
			props={tooltipProps}
		>
			<div class="row">
				<Tooltip
					message="Sample message for tooltip 1. This is using the default props, but uses size sm."
					size="sm"
					place="top-right"
					placeSm="top-right"
				/>
				<Tooltip
					message="Tooltip 2 message. This uses the text prop for the trigger. It also positions the message bubble to the right of the trigger."
					text="Use text to trigger"
					place="right"
					placeSm="bottom-right"
					includePoint
				/>
			</div>
			<p>
				Does this work inline?
				<Tooltip
					message="Sample message for tooltip 3. This is the lengthy text example. Crazy how much text we can have here. Will it still work through? That is the right question to ask in cases like this. Hopefully we can cover all the edge cases to make this component solid and reusable for future projects. This uses size lg and place bottom-right."
					text="Trigger the tooltip here"
					size="lg"
					place="bottom-right"
					placeSm="bottom"
					includePoint
				/>
				then some text afterward.
			</p>
		</LibrarySection>

		<LibrarySection
			level={3}
			title="Tooltip Attachment"
			tag="Follows the mouse"
			description="`mouseTooltip` turns any element into a trigger. The bubble follows the mouse and moves to the other side of it near the edges of the screen. On keyboard focus or click it sits under the element until the mouse moves, and it hides while scrolling. It does not need the custom cursor."
			props={mouseTooltipProps}
			propsLabel="options"
		>
			<p>
				Tooltip attachment
				<button
					type="button"
					class="inline"
					{@attach mouseTooltip({
						message:
							'Recommended to use with keyboard accessible elements, so a button is the right trigger.',
						minWidth: 212,
						tilt: true
					})}
				>
					used with inline text
				</button>
				. The bubble is
				<button
					type="button"
					class="inline"
					{@attach mouseTooltip({
						message: 'This helps make sure the bubble stays in view. Pretty sweet!',
						minWidth: 250
					})}
				>
					edge aware
				</button>
				meaning it moves itself if it is too close to the edge of the screen.
			</p>
			<button
				type="button"
				class="icon-trigger"
				aria-label="More information"
				{@attach mouseTooltip({
					message:
						'What happens when you have a really long description? It wraps inside the bubble and stays readable.',
					minWidth: 250
				})}
			>
				<Icon name="info-circle" size="lg" />
			</button>
		</LibrarySection>
	</LibrarySection>

	<LibrarySection
		title="Video Background"
		type="Combo"
		description="Put a video behind any section, container or element. Give the wrapper the class `video-bg` and place `video-bg.svelte` inside it, after the content. The wrapper becomes its own stacking context that clips the video, and a play / pause button sits in a corner. Videos autoplay muted and looping, but stay still for visitors who prefer reduced motion."
		props={videoBgProps}
	>
		<div
			class="video-bg bento-large"
			{@attach cursorHide()}
			{@attach gradientBorder({ angle: 130 })}
		>
			<h3>Video Background</h3>
			<p>
				Minimal setup, maximum impact. Just add a class and tuck the component at the bottom, then
				watch the magic!
			</p>
			<CtaGroup
				primary={{ text: 'Get started', url: 'https://axyscreative.com', newTab: true }}
				secondary={{ text: 'Visit FAQ', url: 'https://axyscreative.com#faq', newTab: true }}
			/>
			<VideoBg src={videos.one} />
		</div>

		<div class="bento-group">
			<div class="video-bg bento-bordered" {@attach cursorHide()}>
				<h3 {@attach textFill({ start: 'top 92%', end: 'bottom 86%' })}>2.0 Variant</h3>
				<p {@attach textFill({ start: 'top 96%', end: 'bottom 92%' })}>Shadow: top</p>
				<p {@attach textFill({ start: 'top 96%', end: 'bottom 92%' })}>Autoplay: false</p>
				<VideoBg
					src={videos.three}
					poster={videos.poster}
					autoplay={false}
					shadow="top"
					placement="tr"
					toggleAttach={magnet(magnetOptions)}
				/>
			</div>

			<div class="video-bg bento-small" {@attach cursorHide()} {@attach tilt()}>
				<h3 {@attach glitchScroll({ mono: false })}>Space</h3>
				<p {@attach typingScroll({ cursor: 'underscore', delay: 500 })}>Simply remarkable</p>
				<VideoBg
					src={videos.two}
					shadow={null}
					placement="bl"
					toggleAttach={magnet(magnetOptions)}
				/>
			</div>
		</div>
	</LibrarySection>
</div>

<style lang="scss">
	@use 'base/mixins';

	/* LIBRARY: DELETE ME */
	.combos {
		row-gap: 128px;
		padding-block: var(--body-padding);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 32px;
	}

	.alerts {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: min(480px, 100%);
	}

	.custom-tabs {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.custom-list {
		--slider-color: var(--color-accent);

		align-self: flex-start;

		button {
			border: 0;
			background: none;
			color: inherit;
			font: inherit;
		}

		button:global([data-active]) {
			color: var(--color-text);
		}
	}

	.custom-panel {
		padding: 16px;
		border-radius: var(--radius);
		background: var(--color-surface);
	}

	.inline,
	.icon-trigger {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
	}

	.icon-trigger {
		font-size: 20px;
	}

	.bento-large,
	.bento-bordered,
	.bento-small {
		display: flex;
		flex-direction: column;
		gap: 24px;
		border-radius: 24px;
	}

	.bento-large {
		align-items: center;
		justify-content: flex-end;
		width: 100%;
		padding: 364px 64px 64px;
		text-align: center;

		@include mixins.max-lg {
			padding: 296px 40px 40px;
		}

		@include mixins.max-md {
			align-items: flex-start;
			padding: 148px 24px;
			text-align: start;
		}
	}

	.bento-group {
		display: flex;
		gap: 24px;
		width: 100%;

		@include mixins.max-lg {
			flex-direction: column;
		}
	}

	.bento-bordered {
		flex: 1;
		min-height: 580px;
		padding: 48px;
		border: 1px solid var(--color-border);

		@include mixins.max-lg {
			padding: 24px;
		}

		h3 {
			margin-bottom: auto;
		}
	}

	.bento-small {
		flex: 1 1 auto;
		align-items: center;
		justify-content: flex-start;
		text-align: center;
		min-height: 580px;
		padding: 48px;

		@include mixins.min-lg {
			max-width: 420px;
		}
	}
</style>
