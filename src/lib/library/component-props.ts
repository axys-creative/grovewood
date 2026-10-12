// LIBRARY: DELETE ME. Documentation text for the component and section docs; remove with the rest of the library.
import type { LibraryProp } from './library-section.svelte';

const props = (...pairs: [string, string][]): LibraryProp[] =>
	pairs.map(([name, description]) => ({ name, description }));

const tilt =
	'A boolean or tilt options (`max`, `reverse`, `velocityMax`, `inSpeed`, `outSpeed`, `idleMs`).';

export const buttonProps = props(
	['text', 'A string. Leave it out for an icon-only button and give it a `textDescription`.'],
	['textDescription', 'A string, the accessible name for screen readers.'],
	[
		'url',
		'A string. With a url the button is a link (`/page`, `#id`, `mailto:` or a full URL); without one it is a `<button>`.'
	],
	['newTab', 'A boolean. Opens in a new tab and tells screen readers it does.'],
	['type', '`solid | outline | underline | text`. Defaults to `solid`.'],
	['htmlType', '`button | submit | reset`. For the `<button>` version. Defaults to `button`.'],
	['size', '`sm | md | lg`. Defaults to `md`.'],
	['disabled', 'A boolean.'],
	['current', 'A boolean. Marks the link as the current page (`aria-current`).'],
	[
		'expanded',
		'A boolean, for buttons that open something (`aria-expanded`). The end icon flips when true.'
	],
	['controls', 'A string, the id of what the button opens (`aria-controls`).'],
	['iconStart', 'An icon name from `static/icons`, shown before the text.'],
	['iconEnd', 'An icon name from `static/icons`, shown after the text.'],
	['iconCircle', 'A boolean. Draws a ring around the end icon on hover. Defaults to `false`.'],
	[
		'iconEndAttach',
		'An attachment for the end icon alone, such as `magnet({ x: 1, y: 1 })`, so only the icon follows the mouse.'
	],
	['class', 'A string of extra classes.'],
	['onclick', 'A click handler for the `<button>` version.'],
	['...rest', 'Any other attribute, including attachments: `<Button {@attach magnet()} />`.']
);

export const ctaGroupProps = props(
	['primary', 'An object of Button props (without `type`). Shown as a solid button. Required.'],
	['secondary', 'An object of Button props (without `type`). Shown as an outline button.'],
	['justify', '`start | center`. Defaults to `start`.']
);

export const eyebrowProps = props(
	['text', 'A string. The small label above a title.'],
	['icon', 'An icon name from `static/icons`, shown before the text.'],
	['direction', '`row | column`. How the icon and text sit together. Defaults to `row`.'],
	[
		'dot',
		'`false | true | pulse | sonar`. A green status dot before the text, for something like "available for freelance". `pulse` (and `true`) softly fades in and out; `sonar` sends two rings outward like a signal. Uses `--color-success`. Defaults to `false`.'
	]
);

export const iconProps = props(
	[
		'name',
		'A string, the icon file name in `static/icons` without `.svg`, or a path starting with `/` to any single-color image (e.g. a CMS upload). Required.'
	],
	[
		'label',
		'A string. Gives the icon an accessible name. Without it the icon is hidden from screen readers.'
	],
	['size', '`sm | md | lg`. The icon is `1em` by default (`md`), so it scales with its text.'],
	['class', 'A string of extra classes.'],
	['...rest', 'Any other attribute for the `<span>`, such as `style`.']
);

export const logoProps = props(
	['src', 'A string, the path to one image used in both themes.'],
	[
		'srcLight',
		'A string, the image for the light theme. Use with `srcDark`; the right one shows for the theme, and a wide logo keeps its shape (set `--logo-height`).'
	],
	['srcDark', 'A string, the image for the dark theme.'],
	['text', 'A string shown beside the image.'],
	['alt', 'A string. The accessible name when there is no `text`.'],
	['url', 'A string. Wraps the logo in a link.'],
	[
		'tint',
		'A boolean. For single-color SVGs: draws the image in the text color so it follows light and dark themes.'
	]
);

export const menuLinksProps = props(
	[
		'links',
		'An array of Button props. Add a `links` array (also Button props) to an item to make it a dropdown. Required.'
	],
	['label', 'A string, the accessible name of the navigation. Required.'],
	['type', 'A Button `type` for every link. Defaults to `underline`.'],
	[
		'direction',
		'`row | column`. In a column, dropdowns open as accordions instead of popovers. Defaults to `row`.'
	],
	[
		'landmark',
		'A boolean. Render a `<nav>`. Turn off inside something that is already a `<nav>`. Defaults to `true`.'
	],
	['class', 'A string of extra classes.']
);

export const mouseCursorProps = props(
	['elastic', 'A boolean. Stretches and rotates the shape in the direction of movement.'],
	['tilt', tilt],
	[
		'variants',
		'An object of named looks, e.g. `{ menu: { size: 64 } }`. A look can set `size`, `opacity`, `background`, `border`, `color`, `transition` and `elastic`.'
	],
	[
		'defaultIcon',
		'An icon name used when an element asks for an icon without naming one. Defaults to `bolt`.'
	],
	[
		'duration',
		'A number, milliseconds the cursor takes to catch up with the mouse. Defaults to `333`.'
	],
	[
		'ease',
		'A function from catch-up progress (0 to 1) to distance travelled. Defaults to a front-loaded curve.'
	]
);

export const sectionCopyProps = props(
	['eyebrowText', 'A string for the eyebrow.'],
	['eyebrowIcon', 'An icon name for the eyebrow.'],
	['eyebrowDirection', '`row | column`. Defaults to `row`.'],
	[
		'eyebrowDot',
		'`false | true | pulse | sonar`. A green status dot before the eyebrow. Defaults to `false`.'
	],
	['title', 'A string.'],
	[
		'level',
		'`1 | 2 | 3 | 4 | 5 | 6`. The heading level of the title. A page hero is `1`, other sections `2`. Defaults to `2`.'
	],
	[
		'titleStyle',
		'`h1 | h2 | h3 | h4 | h5 | h6`. Looks like another heading size without changing the level.'
	],
	['description', 'A string, or a snippet for rich content such as links.'],
	['cta', 'An object with a `primary` and optional `secondary` Button (see CTA Group).'],
	[
		'layout',
		'`column | row`. `row` puts the description beside the eyebrow and title and stacks below the md breakpoint. Defaults to `column`.'
	],
	['align', '`start | center`. Defaults to `start`.'],
	[
		'rowAlign',
		'`start | center | end`. How the two sides line up in a row layout. Defaults to `start`.'
	],
	['showEyebrow', 'A boolean. Defaults to `true`.'],
	['showTitle', 'A boolean. Defaults to `true`.'],
	['showDescription', 'A boolean. Defaults to `true`.'],
	['showCta', 'A boolean. Defaults to `true`.']
);

export const siteNavButtonProps = props(
	[
		'symbol',
		'`burger | oreo | stairs | chocolate | kebab`. Two lines, two lines with rounded outer corners that twirl into the X, three stepped lines (short, long, short) that form the X, nine dots or three vertical dots. Defaults to `burger`.'
	],
	['shape', '`square | round`. Defaults to `square`.'],
	['type', '`icon | button`. `button` puts the symbol in a bordered box. Defaults to `icon`.'],
	['text', 'A string shown beside the symbol, e.g. `menu`.'],
	['expanded', 'A boolean. The open state; the burger turns into an X.'],
	['controls', 'A string, the id of the navigation it opens (`aria-controls`).'],
	['...rest', 'Any other button attribute, such as `onclick`.']
);

export const socialLinksProps = props(
	[
		'links',
		'An array of `{ title, url, icon }`. The icon is a name from `static/icons` or an image path such as `/uploads/social-x.svg`. Required.'
	],
	['label', 'A string, the accessible name of the list. Defaults to `Social media`.'],
	[
		'solid',
		'A boolean. Puts each icon in a box in the solid Button style: the accent color with the on-accent icon, emptying to an outline on hover. Defaults to `false`.'
	]
);

export const tagProps = props(
	['text', 'A string. Required.'],
	['icon', 'An icon name from `static/icons`, shown before the text.'],
	['type', '`solid | outline | glass`. Defaults to `solid`.'],
	['class', 'A string of extra classes.']
);

export const tooltipProps = props(
	['message', 'A string, the text in the bubble. Required.'],
	['text', 'A string that triggers the tooltip. Without it an icon does.'],
	['icon', 'An icon name for the trigger. Defaults to `info-circle`.'],
	['size', '`xs | sm | md | lg`. The width of the bubble. Defaults to `md`.'],
	[
		'place',
		'`top | top-right | top-left | bottom | bottom-right | bottom-left | left | right`. Where the bubble sits on desktop. Defaults to `top`.'
	],
	[
		'placeSm',
		'The same options without `left` and `right`, used below the lg breakpoint. Defaults to `top`.'
	],
	['includePoint', 'A boolean. Adds a small pointer to the bubble.']
);

export const mouseTooltipProps = props(
	['message', 'A string, the text in the bubble. Required.'],
	['minWidth', 'A number, the minimum width of the bubble in px. Defaults to `280`.'],
	['tilt', tilt]
);

export const videoPlayerProps = props(
	[
		'src',
		'A string, the video: a Mux playback ID (the Playback ID, not the Asset ID, which also gives the poster), an HLS `.m3u8` URL, a Dropbox share link, or a video file URL. Playback pauses when the video scrolls out of view, unless it autoplays. Required.'
	],
	['poster', 'A string, an image shown before the video plays.'],
	['captions', 'A string, the path to a `.vtt` captions file.'],
	['captionsLang', 'A string, the captions language. Defaults to `en`.'],
	['title', "A string, the video's accessible name."],
	[
		'playIcon',
		'A string, the icon on the play button: a name from `static/icons`, or a path to any single-color SVG. Defaults to `play`.'
	],
	['playLabel', "A string, the play button's accessible name. Defaults to `Play video`."],
	['aspect', 'A string, the shape of the frame as a CSS aspect ratio. Defaults to `16 / 9`.'],
	[
		'track',
		'`solid | ticks | glass`. The look of the custom track under the video, between the play/pause button and the timestamp. Defaults to `solid`.'
	],
	[
		'glass',
		'A boolean. Gives the big play button and the side buttons the glass background. Defaults to `true` when `track` is `glass`, otherwise `false`.'
	],
	[
		'followCursor',
		'A boolean, or an object of `cursor-field` options (`ease`, `followSpeed`, `returnSpeed`, `bounce`, `tilt`). The big play button glides toward the mouse while it is over the video. Defaults to `false`.'
	],
	[
		'playButton',
		'A boolean. The big play button resting on the video while it is not playing. Defaults to `true`.'
	],
	[
		'sideControls',
		'An object of buttons (shaped like the Button component) that straddle the video edge and stay in view while it scrolls past: `{ side?: "left" | "right", volume?: boolean, fullscreen?: boolean }`. `volume` is a mute button over a vertical volume slider. `side` defaults to `right`.'
	],
	['pauseIcon', 'A string, the icon on the pause button. Defaults to `pause`.'],
	['pauseLabel', "A string, the pause button's accessible name. Defaults to `Pause video`."],
	[
		'controls',
		"A boolean. Shows the browser's own controls instead of the custom ones. Defaults to `false`."
	],
	[
		'preload',
		'`none | metadata | auto`. How much of the video loads up front. Defaults to `metadata`.'
	],
	[
		'...rest',
		'Any other video attribute, such as `loop`, `muted`, `autoplay` or `onended`, goes straight to the `<video>`.'
	],
	[
		'class',
		'A string of extra classes. Style the button with `--play-size`, `--play-bg` and `--play-color`; the corners follow `--radius`.'
	]
);

export const videoOverlayProps = props(
	['open', 'A boolean, bindable. `bind:open` to show or hide the video. Defaults to `false`.'],
	['src', 'A string, the video file. Self-hosted or CDN files are best. Required.'],
	['title', "A string, the dialog's accessible name. Defaults to `Video`."],
	['poster', 'A string, an image shown before the video plays.'],
	['captions', 'A string, the path to a `.vtt` captions file.'],
	['captionsLang', 'A string, the captions language. Defaults to `en`.']
);

export const alertProps = props(
	['title', 'A string. Required.'],
	['message', 'A string under the title.'],
	['type', '`success | info | warning | error`. Sets the icon and color. Defaults to `info`.'],
	[
		'links',
		'An array of up to two Button props (`{ text, url, newTab }`), shown as underline links under the message.'
	],
	[
		'autoClose',
		'A number, milliseconds before the alert closes itself. `0` keeps it until it is closed. Hovering or focusing an alert holds the countdown. Defaults to `0`.'
	],
	[
		'timer',
		'A boolean. Shows a line that runs out as the alert closes. Needs `autoClose`. Defaults to `false`.'
	],
	[
		'leftBorder',
		'A boolean. A thick border in the alert color down the left edge. Defaults to `false`.'
	]
);

export const formProps = props(
	['variant', '`underline | outline`. The look of every field. Defaults to `underline`.'],
	[
		'feedback',
		'A boolean. Shows alerts on submit instead of going to another page. Defaults to `false`.'
	],
	[
		'name',
		'A string, the Netlify form name. Defaults to `form-feedback` with `feedback`, otherwise `form-redirect`.'
	],
	[
		'action',
		'A string, the page to go to after submitting. Not used with `feedback`. Defaults to `/form-submit`.'
	],
	['showPhone', 'A boolean. Adds a phone field, digits only. Defaults to `false`.'],
	['showAddress', 'A boolean. Adds city, state and zip fields. Defaults to `false`.'],
	[
		'showMessage',
		'A boolean. Adds a message textarea with a 250 character limit. Defaults to `false`.'
	],
	['showDiscovery', 'A boolean. Adds a "how did you hear about us" textarea. Defaults to `false`.'],
	['maxCountDiscovery', 'A number, the character limit of the discovery textarea.'],
	['showRecaptcha', "A boolean. Adds Netlify's reCAPTCHA widget. Defaults to `false`."],
	[
		'submitText',
		'A string, the button label. Defaults to `Send message` with `feedback`, otherwise `Submit`.'
	],
	['submitLabel', "A string, the button's accessible name."],
	['successTitle', 'A string, the success alert title. Only used with `feedback`.'],
	['successMessage', 'A string, the success alert message. Only used with `feedback`.'],
	['errorTitle', 'A string, the error alert title. Only used with `feedback`.'],
	['errorMessage', 'A string, the error alert message. Only used with `feedback`.'],
	[
		'duplicateMessage',
		'A string, the warning shown when an email that was already used submits again. Only used with `feedback`.'
	],
	['class', 'A string of extra classes.']
);

export const formFieldProps = props(
	['name', "A string, the field's name, sent with the form. Required."],
	[
		'label',
		'A string. It rests inside the field and moves above it once the field is used. Required.'
	],
	[
		'type',
		'`text | email | tel | number | password | search | url | date | time | textarea | select`. Defaults to `text`. A `tel` field keeps digits only.'
	],
	[
		'variant',
		'`underline | outline`. A line under the field, or a full border. Defaults to `underline`.'
	],
	['required', 'A boolean. Defaults to `true`; screen readers are told when a field is required.'],
	['disabled', 'A boolean.'],
	['hint', 'A string of helper text under the field.'],
	['error', 'A string of error text under the field. It also marks the field invalid.'],
	['maxLength', 'A number. Limits a textarea and shows how many characters are left.'],
	[
		'options',
		'An array for a `select`: strings, `{ value, label, disabled }`, or `{ group, options }` for an `optgroup`.'
	],
	['datalist', 'An array of strings, native suggestions for a text field.'],
	['autocomplete', 'A string, the browser autofill hint such as `email`.'],
	['inputmode', '`text | numeric | tel | email`. Which keyboard a phone shows.'],
	['value', 'A string, bindable.'],
	['class', 'A string of extra classes. Fields in a flex row share the width.']
);

export const formChoiceProps = props(
	['name', 'A string, sent with the form. Required.'],
	['label', 'A string. Required.'],
	['type', '`checkbox | radio | switch`. Defaults to `checkbox`.'],
	['value', 'A string, what is sent when it is on. A radio needs one. Defaults to `on`.'],
	['checked', 'A boolean, bindable, for a checkbox or switch.'],
	['group', 'A string, bindable. For radios sharing a `name`: the selected `value`.'],
	['disabled', 'A boolean.'],
	['required', 'A boolean.']
);

export const formGroupProps = props(
	['legend', 'A string, the name of the group for screen readers, shown above it. Required.'],
	['direction', '`column | row`. How the choices sit. Defaults to `column`.'],
	['disabled', 'A boolean. Disables everything inside.'],
	['children', 'A snippet with the choices inside. Required.']
);

export const formControlProps = props(
	['type', '`range | color | file | progress | meter`. Required.'],
	['label', 'A string. Required.'],
	['name', 'A string, sent with the form.'],
	[
		'value',
		'A number or string, bindable. For `progress` and `meter` a number from `min` to `max`.'
	],
	['min', 'A number. Defaults to `0`.'],
	['max', 'A number. Defaults to `100`.'],
	['step', 'A number, for a range.'],
	['multiple', 'A boolean, for a file input.'],
	['accept', 'A string of file types, for a file input.'],
	['disabled', 'A boolean.']
);

export const imageCircleProps = props(
	['images', 'An array of `{ src, alt }`, any number of them. Required.'],
	[
		'itemWidth',
		"A number, the card width as a percent of the component's own width (`24` is 24%). Defaults to `24`."
	],
	[
		'gap',
		'A number, the space between cards as a multiple of card width: `1` touches, more spaces them, less overlaps. Defaults to `1.15`.'
	],
	['direction', '`left | right`. Which way the ring spins. Defaults to `left`.'],
	['duration', 'A number, seconds for one full turn. Defaults to `40`.'],
	[
		'bloom',
		'`left | right | top`. Cards turn with the ring like petals instead of staying upright, with the left, right or top card upright. Off by default.'
	],
	[
		'ticks',
		'A boolean. A faint ring of thin surface-colored ticks behind the cards, tracing the path they travel. Set the color with `--tick-color`. Defaults to `true`.'
	],
	['class', 'A string of extra classes.'],
	[
		'clip',
		'A boolean. Crops the cards that swing past the square the component sits in. Turn it off to let them bleed out, as in Hero Image Circle. Defaults to `true`.'
	]
);

export const imageWaveProps = props(
	['images', 'An array of `{ src, alt }`, any number of them. Required.'],
	[
		'repeat',
		'A number, how many times the images repeat inside one set. One set has to be wider than the screen or the loop shows a gap, so raise it for few or narrow images. Defaults to `1`.'
	],
	[
		'speed',
		'A number, seconds for the row to pan one full set. Higher is slower. Defaults to `60`.'
	],
	['duration', 'A number, seconds for one full up-and-down bob. Defaults to `4`.'],
	[
		'amplitude',
		"A number, pixels each card travels up and down from center, the wave's height. `0` is a flat row. Defaults to `32`."
	],
	[
		'waves',
		'A whole number, how many crests the wave has across one set (fractions are rounded, since a partial crest cannot loop without a jump). Higher staggers the cards more tightly; `0` moves them together. Defaults to `1`.'
	],
	[
		'scrub',
		'A number. Ties the wave to scrolling, on top of its own motion: scrolling down pushes the row further left and moves the bob ahead, and scrolling up reverses both. `1` is 1px of pan per 1px scrolled and one full wave per 1000px, so higher is more sensitive. `0` is off. Defaults to `0`.'
	],
	[
		'reverse',
		'A boolean. The row and the bob run backwards after the page scrolls up and forwards again after it scrolls down, turning around smoothly each time. Works with or without `scrub`. Defaults to `false`.'
	],
	['class', 'A string of extra classes.']
);

export const imageColumnsProps = props(
	[
		'images',
		"An array of `{ src, alt, accent, caption, gnomon }`. The slots draw from it in order, looping if there are fewer images than slots. `accent` is a small handwritten note on the corner, `caption` is text on the image, and `gnomon` overrides that card's `gnomon` settings. Required."
	],
	[
		'columns',
		'An array, one number per column: how many images it holds at the widest size. Uneven is fine, e.g. `[4, 5, 4, 5]`. Defaults to an even split in four columns.'
	],
	[
		'columnsMd',
		'An array like `columns`, for tablet widths. Defaults to an even split of the same slots in one fewer column (at least two).'
	],
	[
		'columnsSm',
		'An array like `columns`, for mobile widths. Defaults to two fewer columns (at least two).'
	],
	[
		'start',
		"A string, a GSAP ScrollTrigger start such as `top 95%` (the default, as it enters from below), `top center` or `top top`. The element is the shortest column's first card."
	],
	[
		'startOffset',
		"A number or string, px (`40` or `'40px'`) or a percent of the shortest column's height (`'-10%'`). Moving columns start this far from their resting place, so their tops are staggered; the end, bottoms aligned, is unchanged."
	],
	['markers', 'A boolean. Shows GSAP start and end markers for debugging. Defaults to `false`.'],
	[
		'gnomon',
		'An object `{ depth, length, radius, angle, borderWidth, cutouts }`. When set, every image is drawn as a Card Gnomon with these settings, and a `caption` fills the first notch.'
	],
	['class', 'A string of extra classes.']
);

export const imageFanProps = props(
	['images', 'An array of `{ src, alt }`, any number of them. Required.'],
	[
		'arc',
		'A number, the degrees the fan wraps: `0` is a flat row, `90` a quarter circle, `180` a semicircle, `360` a full ring. Defaults to `90`.'
	],
	[
		'gap',
		'A number, the space between cards as a multiple of card width: `1` touches, more spaces them, less overlaps. Defaults to `1.15`.'
	],
	[
		'chop',
		'A number, the pixels each ring of cards drops below the one inside it, outward from the middle: `12` drops the 2nd and 4th cards 12px, the 1st and 5th 24px, for a stepped-down fan. Defaults to `0`.'
	],
	[
		'closed',
		'A boolean. Spreads the cards evenly around a full ring and ignores `arc`. Defaults to `false`.'
	],
	[
		'direction',
		'`up | down`. A rainbow with the middle card highest, or a valley. Defaults to `up`.'
	],
	[
		'stack',
		'`sequence | pyramid`. Stack in array order, or put the middle card on top and step down to the ends. Defaults to `sequence`.'
	],
	[
		'itemWidth',
		"A number, the card width as a percent of the component's own width. Defaults to `22`."
	],
	[
		'animateIn',
		'A boolean. Reveals the fan when it scrolls into view and again each time it returns: `sequence` rises the cards in with a staggered fade, `pyramid` starts them collapsed on the middle card then opens the fan out along the arc. Defaults to `false`.'
	],
	[
		'class',
		'A string of extra classes. Hover feel, reveal timing and easing are the `--push`, `--splay`, `--ripple`, `--in-*` and `--open-*` properties at the top of the component.'
	]
);

export const marqueeCurveProps = props(
	['text', 'A string that runs along the curve, repeated to fill it. Required.'],
	[
		'curve',
		"A string pasted straight from the curve tool, `cubic-bezier(x1, y1, x2, y2)`, or the four numbers. The curve starts and ends at the frame's vertical middle; `x` runs across the width (0 to 1), and `y` is a control point's height, where `1` is the top edge, `0` the bottom and `0.5` the middle, so values past 0 or 1 swing outside the frame. To look like the tool's canvas, the frame must be the same shape (see `aspect`). Defaults to a flat line."
	],
	[
		'aspect',
		"A number, the shape of the box the curve is drawn in, as width ÷ height. `1` is a square, the shape of the curve tool's canvas, so the curve looks just as it did there. A bigger number gives a flatter frame, and a flatter curve. Defaults to `1`."
	],
	[
		'height',
		'A number, a fixed height in px, instead of `aspect`. The curve is stretched to fit it, so it will no longer match the tool.'
	],
	[
		'band',
		'A number, the thickness in px of a colored band the text runs along. It follows the curve with the same thickness all the way, edge lines included. `0` is no band. Defaults to `0`.'
	],
	['bandColor', 'A string, any CSS color. Defaults to the accent color.'],
	[
		'borderColor',
		'A string, any CSS color, for the two lines along the edges of the band. Defaults to the text color.'
	],
	['borderWidth', 'A number, the width in px of each edge line. `0` is none. Defaults to `2`.'],
	[
		'spacing',
		"A number, the space between letters as a multiple of each letter's own width. Letter widths come from the font, so any font works, though mono-spaced looks tidiest. Defaults to `1`."
	],
	[
		'speed',
		'A number, pixels per second the text moves along the curve. `0` turns the automatic motion off. Defaults to `60`.'
	],
	['backwards', 'A boolean. Runs the text the other way. Defaults to `false`.'],
	[
		'reverse',
		'A boolean. The text runs backwards after the page scrolls up and forwards again after it scrolls down, turning around smoothly. Defaults to `false`.'
	],
	[
		'scrub',
		'A number. Ties the text to scrolling, on top of its own motion: `1` is 1px along the curve per 1px scrolled. Defaults to `0`.'
	],
	[
		'uppercase',
		'A boolean. Shows the text in capitals, and centers on the capitals. Defaults to `true`.'
	],
	[
		'class',
		'A string of extra classes. Set `font-size` and `color` on it; the text is `--font-mono` at 44px by default.'
	]
);

export const marqueeProps = props(
	['text', 'A string repeated across the row. For links or styled words, use `children` instead.'],
	['children', 'A snippet repeated across the row, for rich text.'],
	[
		'images',
		'An array of `{ src, alt }` repeated across the row, at a set height (`--image-height`).'
	],
	[
		'label',
		'A string, the accessible name. Defaults to `text`. Only one copy of the content is exposed to screen readers.'
	],
	['rows', 'A number, how many rows are stacked. Defaults to `1`.'],
	[
		'speed',
		'A number, pixels per second the rows move, the same at every screen size. `0` turns the automatic motion off, for a row that only moves as the page scrolls. Defaults to `60`.'
	],
	['alternate', 'A boolean. Every other row moves the opposite way. Defaults to `true`.'],
	[
		'reverse',
		'A boolean. The rows move backwards after the page scrolls up and forwards again after it scrolls down, turning around smoothly. Anything inside the content with the class `marquee-flip` (an arrow, say) turns around with it, and in rows that run the other way. Defaults to `false`.'
	],
	[
		'scrub',
		'A number. Ties the rows to scrolling, on top of their own motion: scrolling down pushes them along. `1` is 1px per 1px scrolled, so higher is more sensitive. Defaults to `0`.'
	],
	[
		'pauseOnHover',
		'A boolean. Holds the motion while the pointer or keyboard focus is on the marquee. Defaults to `false`.'
	],
	[
		'class',
		'A string of extra classes. The text size follows the h2 style; `--gap` and `--image-height` adjust the spacing and the image size.'
	]
);

export const imageShuffleProps = props(
	[
		'images',
		'An array of `{ src, alt, url }`. `alt` is required, since these are usually logos; `url` makes one a link. Give it more images than cells so every cell can show a different one. Required.'
	],
	[
		'type',
		'`roll | fade`. `roll` slides the new image up from below as the old one leaves upward, like Text Roll; `fade` crossfades. Defaults to `roll`.'
	],
	[
		'interval',
		'A number, milliseconds between swaps. One cell changes each time. Defaults to `3000`.'
	],
	['columns', 'A number. Below `md` the grid is always two columns wide. Defaults to `4`.'],
	['rows', 'A number. Defaults to `2`.'],
	[
		'pauseOnHover',
		'A boolean. Holds the shuffling while the pointer is over the grid; by default it keeps playing. A focused cell always holds it. Defaults to `false`.'
	],
	[
		'tiles',
		"`surface | light`. `surface` draws the cells in the theme's surface color; `light` draws them on a light tile in both themes, which suits logos made for white backgrounds. Defaults to `surface`."
	],
	['class', 'A string of extra classes.']
);

export const imageComparisonProps = props(
	['before', 'An object `{ src, alt }`, the image on the left of the divider. Required.'],
	['after', 'An object `{ src, alt }`, the image on the right of the divider. Required.'],
	[
		'mode',
		'`drag | hover`. `drag` moves the divider by dragging anywhere on the image; `hover` makes it follow the mouse. Touch screens always drag. Defaults to `drag`.'
	],
	[
		'position',
		'A number from 0 to 100, bindable. Where the divider starts: 0 shows all of the after image, 100 all of the before image. Defaults to `30`.'
	],
	['beforeLabel', 'A string, a Tag in the top left.'],
	['afterLabel', 'A string, a Tag in the top right.'],
	['aspectRatio', 'A string, the CSS aspect ratio of the frame. Defaults to `16 / 9`.'],
	['class', 'A string of extra classes.']
);

export const backToTopProps = props(
	['text', 'A string, the label. Defaults to `Back to top`. An empty string makes it icon only.'],
	['iconEnd', 'An icon name from `static/icons`, after the label. Defaults to `chevron-up`.'],
	['iconStart', 'An icon name from `static/icons`, before the label.'],
	['type', '`solid | outline | underline | text`. A Button type. Defaults to `underline`.'],
	['size', '`sm | md | lg`. Defaults to `md`.'],
	[
		'textDescription',
		"A string, the button's accessible name when it is icon only. Without a label, set it."
	],
	['class', 'A string of extra classes.']
);

export const avatarCycleProps = props(
	[
		'items',
		'An array of three or more `{ src, alt, title, caption }`. Odd counts look the most balanced; with an even count, one side has an extra avatar. Required.'
	],
	['interval', 'A number, milliseconds between turns. Defaults to `4000`.'],
	['autoplay', 'A boolean. Turns by itself. Defaults to `true`.'],
	[
		'pauseOnHover',
		'A boolean. Holds the turning while the pointer or keyboard focus is on the component, so a caption can be read. Defaults to `false`.'
	],
	[
		'size',
		'A number, the most the middle avatar can be across, in px. It shrinks to fit a narrow container. Defaults to `120`.'
	],
	[
		'cardSize',
		'A number, the width in px of the caption card, which is as tall as it is wide. Defaults to `280`.'
	],
	[
		'ringColor',
		'A string, any CSS color for the ring around each avatar. The default matches the page background, so each avatar looks as if it cuts into its neighbors.'
	],
	['class', 'A string of extra classes.']
);

export const solarSystemProps = props(
	['image', 'An object `{ src, alt }`, the picture in the middle, shown as a circle. Required.'],
	[
		'rings',
		'An array of one or two rings. The first orbits close to the image and the second further out; a single ring sits wider and the picture grows to fill it. Each ring is `{ tags, duration, direction }`: `tags` is up to six `{ text, icon, type }` tags, spaced evenly around the ring (the outer ring is offset half a step so the two interleave); `duration` is the seconds for one turn (`40` for the inner ring, `60` for the outer); `direction` is `left` or `right` (the inner ring turns left and the outer right). Required.'
	],
	[
		'tagType',
		'`solid | outline | glass`. The look of every tag; a tag can set its own `type`. Defaults to `glass`.'
	],
	[
		'class',
		'A string of extra classes. The component is square and sized by its container, and its tags scale with it.'
	]
);

export const scrollProgressProps = props(
	[
		'placement',
		'`bottom | right | left`. Where the bar sits: a short bar along the bottom that fills left to right, or a bar down the right or left edge that fills downward. Defaults to `right`.'
	],
	[
		'allowClick',
		'A boolean. Clicking the bar scrolls the page to that point, and the bar grows on hover. It also hides the custom cursor while over it. Defaults to `true`.'
	],
	[
		'hideScrollbar',
		"A boolean. Hides the browser's own scrollbar, since the bar takes its place. Defaults to `true`."
	],
	[
		'class',
		'A string of extra classes. Size and position are set by `placement`; override them with this.'
	]
);

export const sideShadowsProps = props(
	['width', 'A CSS length, how wide each shadow is. Defaults to `clamp(24px, 6vw, 120px)`.'],
	[
		'opacity',
		'A number from `0` to `1`, how dark the shadows are at the screen edge. Defaults to `0.3`; the light theme halves it.'
	]
);

export const toggleSliderProps = props(
	[
		'variant',
		'`solid | underline`. A block behind the selected option (with a frame around the row), or a line under it. Defaults to `solid`.'
	],
	[
		'trigger',
		'`click | hover`. `click` moves the slider to the option that becomes selected. `hover` also follows the pointer and keyboard focus, and goes back to the selected option when it leaves. Defaults to `click`.'
	],
	[
		'options',
		'A string, a selector for the options inside the element. Defaults to its direct children, except a `<legend>`.'
	]
);

export const copyProps = props(
	['text', 'A string, or a function that returns one, to copy.'],
	[
		'target',
		"A selector or element to copy from instead of `text`. It copies the element's `data-copy-value` if it has one, otherwise its text."
	],
	[
		'copiedText',
		'A string the label changes to right after copying, such as `Copied!`. Without it the label does not change.'
	],
	['copiedTime', 'A number, milliseconds the copied state lasts. Defaults to `2000`.'],
	[
		'alert',
		'Alert options (`title`, `message`, `autoClose` and so on). When set, an alert from the Alert combo shows on copying.'
	],
	['onCopy', 'A function called with the copied text.']
);

export const copyButtonProps = props(
	['text', 'A string to copy.'],
	['target', 'A selector or element to copy from instead of `text` (see the `copy` options).'],
	['label', 'A string, the button label. Defaults to `Copy`.'],
	['copiedText', 'A string the label changes to after copying. Defaults to `Copied!`.'],
	['copiedTime', 'A number, milliseconds the copied state lasts. Defaults to `2000`.'],
	['icon', 'An icon name from `static/icons`, shown before the label. Defaults to `copy`.'],
	['type', '`solid | outline | underline | text`. A Button type. Defaults to `outline`.'],
	['size', '`sm | md | lg`. Defaults to `sm`.'],
	['alert', 'Alert options, to show an alert on copying (see the `copy` options).'],
	['onCopy', 'A function called with the copied text.'],
	['class', 'A string of extra classes.']
);

export const tabsProps = props(
	[
		'tabs',
		'An array of `{ label, title, description, image }`. `label` is the tab button, and `image` is `{ src, alt }`. Required.'
	],
	['defaultTab', 'A number, the tab that starts selected, counting from `0`. Defaults to `0`.'],
	[
		'variant',
		'`underline | solid`. A line under the selected tab, or a filled tab. Defaults to `underline`.'
	],
	['class', 'A string of extra classes.']
);

export const tabsAttachmentProps = props(
	[
		'defaultTab',
		'A number, the tab that starts selected, counting from `0`. Defaults to the first panel that is not `hidden`, else the first.'
	],
	['onChange', 'A function called with the new tab number whenever the selection changes.']
);

export const accordionProps = props(
	[
		'items',
		'An array of `{ title, content, defaultOpen }`. `content` takes Rich Text tokens, and `defaultOpen` starts that item open. Required.'
	],
	[
		'icon',
		'An icon name from `static/icons`, shown at the end of each title and flipped when open.'
	],
	[
		'plus',
		'A boolean. A plus sign that turns into a minus, instead of an icon. Defaults to `false`.'
	],
	['singleOpen', 'A boolean. Only one item open at a time. Defaults to `false`.'],
	[
		'defaultOpen',
		"Which items start open: `true` for all, an item's number (from `0`), or a list such as `[0, 2]`. With `singleOpen` only the first opens. An item can also set `defaultOpen: true` itself. Defaults to none."
	],
	[
		'toggleAll',
		'A boolean. Shows a button that opens or closes every item; it reads "Close All" once all are open and goes back to "Open All" only when all are closed. Ignored with `singleOpen`. Defaults to `false`.'
	],
	[
		'toggleAllTextOpen',
		'A string, the button label while any item is closed. Defaults to `Open All`.'
	],
	['toggleAllTextClose', 'A string, the button label once all are open. Defaults to `Close All`.']
);

export const accordionTableProps = props(
	[
		'columns',
		'An array of `{ key, label, type, width }`. `key` is the field read off each item, `label` the header text, `type` is `image` to show an `{ src, alt }` image (anything else is text), and `width` is any CSS grid track size (`1fr` by default). Required.'
	],
	[
		'items',
		'An array of objects with a field per column `key`, plus `content`, Rich Text shown when the row is open. A row can also have `images` (an array of `{ src, alt }` shown in a Carousel under the content), its own `slidesPerView`, and a `cta` (Button props) under the carousel. Required.'
	],
	[
		'icon',
		'An icon name from `static/icons`, shown along the right edge of each row and flipped when open.'
	],
	['singleOpen', 'A boolean. Only one row open at a time. Defaults to `false`.'],
	[
		'defaultOpen',
		"Which rows start open: `true` for all, a row's number (from `0`), or a list such as `[0, 2]`. With `singleOpen` only the first opens. A row can also set `defaultOpen: true` itself. Defaults to none."
	],
	[
		'sticky',
		'A boolean. Pins the header row while scrolling through the rows. Defaults to `false`.'
	],
	[
		'contentColumn',
		'A number, the 1-indexed column the opened content lines up with. Defaults to `2`.'
	]
);

export const counterProps = props(
	['digit', 'A number to count to. Required.'],
	['comma', 'A boolean. Separate thousands with commas. Defaults to `false`.'],
	['prefix', 'A string before the number, such as `$`.'],
	['suffix', 'A string after the number, such as `M`.'],
	['label', 'A string describing what the number measures.'],
	[
		'spokenLabel',
		'A string for screen readers. Defaults to the final number and the label, since the counting itself is hidden from them.'
	],
	['duration', 'A number, milliseconds to count. Not used with `ticker`. Defaults to `2400`.'],
	[
		'once',
		'A boolean. Only counts the first time it scrolls into view, instead of every time. Defaults to `false`.'
	],
	['ticker', 'A boolean. Rolls each digit up a column instead of counting. Defaults to `false`.'],
	['class', 'A string of extra classes.']
);

export const carouselProps = props(
	[
		'slides',
		'An array of `{ img, alt, title, desc }`. Every field is optional; `alt` falls back to the title. Required.'
	],
	['label', 'A string, the accessible name of the carousel. Defaults to `Carousel`.'],
	['pagination', '`arrows | dots | none`. Defaults to `arrows`.'],
	[
		'progress',
		'A boolean. Shows a non-interactive line that fills as the carousel advances, beside the pagination or alone with `pagination: none`. Defaults to `false`.'
	],
	[
		'cta',
		'An object of Button props, shown at the left of the footer, with the pagination moved to the right.'
	],
	[
		'loop',
		'A boolean. An endless loop: slides are repeated (hidden from assistive tech) and the position quietly resets once scrolling settles. Defaults to `false`.'
	],
	[
		'slidesPerView',
		'A number, how many slides show at once from the `md` breakpoint up. It is always one below. Defaults to `1`.'
	],
	[
		'autoplay',
		'An object `{ enabled, interval }`, with `interval` in milliseconds (`4000` by default). Pauses on hover and focus, and is off with reduced motion.'
	],
	[
		'class',
		'A string of extra classes. Style it with `--gap`, `--dot-size`, `--progress-width` and `--progress-height`.'
	]
);

export const cardGnomonProps = props(
	[
		'cutouts',
		'An array of `{ from, text }`, one per notch. `from` is a corner (`top-left`, `top-right`, `bottom-left`, `bottom-right`) or the middle of a side (`top`, `right`, `bottom`, `left`); `text` is shown inside that notch, sized to fill it. Any number can be combined. Defaults to one `top-right` notch with no text.'
	],
	[
		'depth',
		'A number, 0-100. How far every cutout reaches into the card, as a % of its side. Shared by all cutouts. If two cutouts would overlap on an edge, `depth` and `length` shrink together so they never collide. Defaults to `12`.'
	],
	[
		'length',
		'A number, 0-100, or `auto`. How far every cutout runs along its edge, as a % of the card side. `auto` measures the cutout text and fits the notch to the longest one (up to 90), so a caption never needs a number change. Defaults to `32`.'
	],
	[
		'lengthPadding',
		'A number in px, used only with `length="auto"`. Added to the measured text width, for the room beside the text and the slant of the notch wall. Defaults to `28`.'
	],
	[
		'radius',
		'A number, 0-50. The corner curve as a % of the card side, applied to every corner including each notch. It is clamped so it never exceeds half the shortest edge. Defaults to `8`.'
	],
	[
		'angle',
		'A number, 45-90 degrees. Tilts each notch from a square step (`90`) toward a single diagonal. Keep it around 75-85 for a crisp diagonal with rounded ends; much lower and a large `radius` rounds the notch into one blob. Defaults to `90`.'
	],
	['borderWidth', 'A number in px, the stroke width. Defaults to `2`.'],
	[
		'img',
		'An object `{ src, alt, eager }` for the image that fills the card. `eager` loads it right away instead of lazily.'
	],
	['children', 'A snippet for anything else the card holds, shown over the image.'],
	[
		'class',
		'A string of extra classes. Set `--card-size` to change the width (`25vw`, or `50vw` on small screens).'
	]
);

export const richTextProps = props(
	[
		'text',
		'A string. `[words]{.primary}` styles the words, `[words]{.primary .scribble}` combines classes, and `{.br}` is a line break. Anything else, including `<` and `&`, is shown as typed. Required.'
	],
	['.italic', 'Italic.'],
	['.primary', 'The brand accent color.'],
	[
		'.scribble',
		'A thin hand-drawn zigzag underline, drawn in each time it scrolls into view (see Scribble under Attachments).'
	],
	[
		'.scribble-circle',
		'A thin hand-drawn loop around the words, drawn in on scroll (see Scribble under Attachments).'
	],
	['.scribble-circle-tight', 'The same loop drawn closer to the words (scale 0.8).'],
	['.scribble-circle-wide', 'The same loop drawn farther from the words (scale 1.2).'],
	['.secondary', 'The secondary color.'],
	['.stroke', 'An outline with no fill.'],
	['.strong', 'Bold, as a `<strong>`.'],
	['class', 'A string, a class for the wrapping span.']
);

export const postCardProps = props(
	[
		'post',
		'An object: `slug`, `title`, `description`, `author`, `date` (`YYYY-MM-DD`), `tag`, `coverImage` and `coverAlt`. Links to `/blog/{slug}`. Required.'
	],
	[
		'featured',
		'A boolean. Lays the card out wide with the image beside the text. Defaults to `false`.'
	]
);

export const blogArticleHeroProps = props(
	['title', 'A string, the post title (the page `h1`). Required.'],
	['description', 'A string shown under the title.'],
	['author', 'A string.'],
	['date', 'A string, `YYYY-MM-DD`. Required.'],
	['tag', 'A string shown as a tag before the date.'],
	['coverImage', 'A string, the image path. It drifts slightly as the page scrolls.'],
	['coverAlt', 'A string, the image description. Leave empty if it is decorative.']
);

export const blogArticleBodyProps = props([
	'html',
	'A string of HTML, rendered from the post Markdown by `renderMarkdown`, which escapes raw HTML and supports Rich Text tokens. Required.'
]);

export const circleHighlightProps = props(
	[
		'eyebrowText, eyebrowIcon, title, description',
		'The copy beside the ring, from Section Copy (see the Style Guide). Leave them all out and the ring is centered on its own.'
	],
	[
		'slices',
		'An array of `{ title, description }`, one slice of the ring each. The title and description are its caption. Required.'
	],
	[
		'holeSize',
		'A number from 0 to 99, the hole as a percent of the ring’s radius. A bigger hole is a thinner ring, and `0` draws solid pie slices. Defaults to `55`.'
	],
	[
		'radius',
		'A number, the curve on every slice corner, in the ring’s own 0–100 units. `0` keeps them sharp. Defaults to `0`.'
	],
	['gap', 'A number, the space between slices, in the same units. Defaults to `0`.'],
	[
		'captionPlacement',
		'`outside | inside | cards`. `outside` places a caption around the ring for every slice. `inside` shows only the active one, in the hole. `cards` is for a ring with no copy beside it (with copy it falls back to `outside`): from `lg` up each caption is a glass card out to the side, the left or right of the ring by its slice, with a Royal Light line drawn from the card to the middle of its slice and a dot that scales in at the end; below `lg` the cards stack under the ring, the newest in front and up to four deep, and stay on screen after the last step. Defaults to `outside`.'
	],
	[
		'nudge',
		'A number, how far a slice moves straight out from the center of the ring while it is highlighted or hovered with a mouse, in the ring’s own 0–100 units (about 5px on a full-size ring at the default). `0` turns it off. Defaults to `1.6`.'
	],
	[
		'orientation',
		'`default | tilted | tilted-left`. `default` centers the first slice at 12 o’clock. `tilted` puts a division there instead, with the first slice on its right (top right of four). `tilted-left` puts the first slice on its left (top left of four). Defaults to `default`.'
	],
	[
		'image',
		'An image in the hole. It takes Logo props (`src`, `srcLight`, `srcDark`, `alt`), so it can change with the theme.'
	],
	[
		'imageScale',
		'A number that scales the image in the hole, with `1` its normal size. Defaults to `1`.'
	],
	['id', 'The section’s anchor, so a link or the CMS preview can point to `#id`.'],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const carouselAccordionProps = props(
	[
		'items',
		'An array of `{ title, description, image }`, two or more. One is open at a time, and each opens its own picture beside the list (`image` is `{ src, alt }`). Required.'
	],
	[
		'interval',
		'A number, how long each item stays open in milliseconds. The border under the open item fills over that time, and then the next one opens. Defaults to `6000`.'
	],
	[
		'autoplay',
		'A boolean. Moves on by itself when the interval ends, looping back to the first. It stops while the pointer or keyboard focus is in the list, while the section is off screen, and with reduced motion. Defaults to `true`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const carouselSpotlightProps = props(
	[
		'eyebrowText, eyebrowIcon, title, description, cta',
		'The section copy, centered above the carousel, from Section Copy (see the Style Guide).'
	],
	[
		'slides',
		'An array of `{ title, description, image }`, two or more. `image` is `{ src, alt }`. The title and description sit in a blurred glass panel over the picture. Required.'
	],
	['label', 'A string, the accessible name of the carousel. Defaults to `Featured`.'],
	[
		'loop',
		'A boolean. An endless loop, so the last slide sits to the left of the first. Without it the carousel starts and stops at its ends. Defaults to `true`.'
	],
	[
		'autoplay',
		'A boolean. Moves on by itself. It waits while focus is inside the carousel, while it is off screen and with reduced motion, and a touch or key press holds it for one interval. Defaults to `true`.'
	],
	[
		'pauseOnHover',
		'A boolean. Holds autoplay while the mouse is over the carousel. Focus inside it always holds it. Defaults to `false`.'
	],
	['interval', 'A number, the milliseconds between slides when it plays. Defaults to `2400`.'],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, with the content centered. Defaults to `false`.'
	],
	['id', 'A string, the section’s anchor.'],
	[
		'class',
		'A string of extra classes, such as `full` on a Library page. The look is set with CSS variables on the section: `--slide-width`, `--slide-gap`, `--slide-radius`, `--slide-aspect`, `--inactive-opacity`, `--panel-offset`, `--panel-radius` and `--panel-width`.'
	]
);

export const carouselTestimonialsProps = props(
	[
		'eyebrowText, eyebrowIcon, title, description, cta',
		'The section copy, from Section Copy (see the Style Guide). The previous and next arrows sit on the right of the same row.'
	],
	[
		'testimonials',
		'An array of `{ quote, name, role, image }`. `quote` takes the rich text tokens, `role` is shown under the name and `image` is `{ src, alt }`, a small portrait. Required.'
	],
	['label', 'A string, the accessible name of the row of cards. Defaults to `Testimonials`.'],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, with the content centered. Defaults to `false`.'
	],
	['id', 'A string, the section’s anchor.'],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const carouselTunnelProps = props(
	[
		'eyebrowText, eyebrowIcon, title, description',
		'The copy above the carousel, from Section Copy (see the Style Guide). It reveals once the zoom ends.'
	],
	[
		'slides',
		'An array of `{ img, eyebrow, title }`, where `img` is `{ src, alt }`. The eyebrow and title sit in the bottom left corner of the slide. Required.'
	],
	[
		'autoplay',
		'An object of `{ interval, quickStart }`. `interval` is the milliseconds between slides, and `0` turns autoplay off (default `4500`). `quickStart` advances one slide as soon as the copy reveals instead of waiting a full interval. Autoplay holds while the carousel is hovered or focused, and is off when motion is reduced.'
	],
	[
		'titleEffect',
		'`reveal | fade | scale | flip | none`. A word-by-word effect that plays once when the copy reveals. Defaults to `reveal`.'
	],
	['descriptionEffect', 'Same options as `titleEffect`. Defaults to `none`.'],
	[
		'dragThreshold',
		'A number from 0 to 1, the share of a slide’s width a drag must cross to change slides. Lower is more sensitive. Defaults to `0.1`.'
	],
	[
		'pagination',
		'`arrows | dots | both`. Arrows alone scale better with many slides. Defaults to `arrows`.'
	],
	[
		'config',
		'Optional tuning: `sectionHeight` (the total scroll distance, `220svh`), `slideWidth` (the resting slide width, which sets how much of the next ones peek in, `min(25vw, 720px)`), `slideGap` (`24px`), `slideAspect` (`2 / 1.25`), `scaleDuration` (the share of the scroll spent zooming, `0.6`), `revealDuration` (seconds, `0.6`) and `captionOffset` (`12px`). Anything left out keeps its default, including the smaller slide width on mobile.'
	],
	['label', 'A string, the carousel’s accessible name. Defaults to `Featured work`.'],
	[
		'static',
		'A boolean. Skips the scroll-driven zoom and autoplay, so every slide shows and the arrows still work. For previews. Defaults to `false`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const scrollTimelineProps = props(
	[
		'eyebrowText, eyebrowIcon, title, description, cta',
		'The section copy, from Section Copy (see the Style Guide).'
	],
	[
		'events',
		'An array of `{ date, title, description, image }`, two or more, in order. `date` is shown under its circle on the timeline. `image` is the event’s card on the circle, and every event needs one in the `circle` variant. Required.'
	],
	[
		'variant',
		'`details | circle`. `details` shows the active event’s title and text under the timeline. `circle` shows a ring of the events’ images, with the ring turned to the active card (as petals), and the active card and two on each side in view. It is an arc, not a full circle: the cards sit 40° apart, so a few events never wrap round, and the event’s details take the place of the section copy. Defaults to `details`.'
	],
	[
		'copyLayout',
		'`center | split`. `center` stacks the copy in the middle. `split` puts the eyebrow and title on the left and the description on the right. Defaults to `center`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const scrollStackProps = props(
	[
		'eyebrowText, eyebrowIcon, title, description, cta',
		'The copy, from Section Copy (see the Style Guide). Beside the panels it stays pinned next to them; otherwise it sits above.'
	],
	[
		'panels',
		'An array of `{ title, description, icon, cta }`, two or more. `icon` is a name from `static/icons` and `cta` is Button props for a button along the bottom. Required.'
	],
	[
		'nav',
		'A boolean. A row of links above the stack that jump to a panel and show which one is on top. Hidden on small screens. Defaults to `false`.'
	],
	[
		'size',
		'`full | half`. `half` makes the panels half as wide from the `lg` breakpoint up. Defaults to `full`.'
	],
	[
		'placement',
		'`left | center | right`. Which side the panels sit on, with the copy pinned on the other side. `center` puts the copy above. Defaults to `center`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const workGalleryProps = props(
	[
		'title, description, eyebrowText, eyebrowIcon, cta',
		'The opening copy, from Section Copy (see the Style Guide), with the title and description side by side. Leave them out for no header.'
	],
	[
		'items',
		'An array of `{ title, type, year, img, url }`. `type` is shown under the image (`Design`, `Development`) and `year` in a glass tag on its corner. `img` is `{ src, alt }`. `url` makes the image a link, opening in a new tab for a full URL. Required.'
	],
	[
		'grid',
		'`default | alternate`. `default` is two columns. `alternate` is three from the `xl` breakpoint up, where the images take turns being two columns wide. Defaults to `alternate`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const galleryHorizontalProps = props(
	[
		'title, description, eyebrowText, eyebrowIcon, cta',
		'The opening copy above the gallery, from Section Copy (see the Style Guide). Leave them all out for no header.'
	],
	[
		'groups',
		'An array of `{ images, copy }`. `images` is up to four `{ src, alt, caption, gnomon }`, placed in a collage: a tall card top left, a wide one under it, then the same pair again after the copy. `caption` fills the notch on the card’s bottom left, and `gnomon` overrides the shared settings for that card. `copy` is a short paragraph between the two halves. Required.'
	],
	['accent', 'A string, handwritten text before the first group.'],
	[
		'gnomon',
		'`{ depth, length, radius, angle }`, the Card Gnomon settings every card shares (see Card Gnomon in Components). Defaults to `{ depth: 18, length: 48, radius: 4, angle: 85 }`.'
	],
	[
		'static',
		'A boolean. Skips the scroll slide and entrance animations. For previews. Defaults to `false`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const scrollHorizontalProps = props(
	[
		'title, description, eyebrowText, eyebrowIcon, cta',
		'The opening copy, shown beside each other above the track, from Section Copy (see the Style Guide). Leave them all out for none.'
	],
	[
		'items',
		'An array of `{ src, alt, title, description }`, the images that slide, each with an optional caption. Use this or `message`.'
	],
	[
		'message',
		'A string, one long line of large text that slides instead of images. Takes Rich Text tokens, so `[word]{.stroke}` outlines a word.'
	],
	[
		'parallax',
		'A boolean. Images drift a little inside their frames as the row slides, so landscape images in the tall frames show more as you scroll. Defaults to `true`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const tunnelProps = props(
	['img', 'An object of `{ src, alt }`, a picture. Use this or `video`.'],
	['video', 'A string, a video file, played muted and looping. Use this or `img`.'],
	['message', 'A string that fills in with color over the end of the section.'],
	[
		'extended',
		'A boolean. A taller section, so the media is on screen longer. Defaults to `false`.'
	],
	[
		'centered',
		'A boolean. Pins the media in the middle of the screen, then grows it to fill the screen as you scroll. Without it the media is full height and widens as the section arrives. Defaults to `false`.'
	],
	[
		'reversed',
		'A boolean. Plays the change backwards: the media starts full width (full screen when centered) and shrinks. Defaults to `false`.'
	],
	[
		'parallax',
		'An object of `{ offset, scrub }`. `offset` is how far the media starts from rest, as a CSS translate such as `-75%` (the default). `scrub` is the seconds the motion takes to catch up with the scroll, and `0` (the default) plays it once when it is reached.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const headlineProps = props(
	[
		'text',
		'A string, the statement. It flips in word by word as it scrolls into view. Takes Rich Text tokens, such as `[word]{.primary}`. Required.'
	],
	['eyebrowText', 'A string shown above the statement.'],
	['eyebrowIcon', 'An icon name from `static/icons`. Works without `eyebrowText` too.'],
	[
		'quote',
		'An object of `{ name, role, image }`, where `image` is `{ src, alt }`. With a `name` the statement is wrapped in quotes and credited beneath, with the image, name and role. Leave it out for a plain headline.'
	],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, with the statement centered. Taller content still grows past it. Defaults to `false`.'
	],
	['class', 'A string of extra classes.']
);

export const planSelectionProps = props(
	[
		'title, description, eyebrowText, eyebrowIcon',
		'The opening copy, from Section Copy (see the Style Guide).'
	],
	[
		'plans',
		'An array of plans. Each is `{ title, priceMonthly, priceQuarterly, totalQuarterly, savingsQuarterly, features, ctaMonthly, ctaQuarterly, featured }`. `features` are strings, or `{ text, strong }` to make one bold. The two `cta` objects are Button props (`text`, `textDescription`, `url`, `newTab`). `featured` gives the card an accent background. Required.'
	],
	[
		'priceToggle',
		'A boolean. Shows the Monthly / Quarterly switch, built the same way as the Theme Toggle with the Toggle Slider attachment. Picking one scrambles the prices and message into the new ones and swaps each card’s button. The quarterly fields on each plan are only needed with it. Defaults to `false`.'
	],
	[
		'discount',
		'A string, the saving named in the switch’s tooltip and each card’s message, e.g. `15%`. Defaults to `20%`.'
	],
	['defaultBilling', '`monthly | quarterly`. Which one starts selected. Defaults to `monthly`.'],
	['class', 'A string of extra classes.']
);

export const heroCarouselProps = props(
	[
		'...SectionCopy props',
		'Takes the layout props of Section Copy (see the Style Guide): `level`, `titleStyle`, `layout`, `align` and `rowAlign`. The eyebrow and buttons are left off to make room for the arrows, so the copy comes from each slide.'
	],
	[
		'slides',
		'An array of `{ image, title, description }`, where `image` is `{ src, alt }`. The arrows move through them and wrap around; changing the slide fades the background and the copy. Required.'
	],
	[
		'float',
		'A boolean. Drops the full width: the hero is held to the content width, inset from the screen edges, with a border and rounded corners, the way the floating header and footer sit. Defaults to `false`.'
	],
	[
		'autoplay',
		'A number of milliseconds between slides. `0` turns autoplay off, so the visitor changes slides with the arrows. It pauses while the hero is hovered or focused, and stays off when motion is reduced. Defaults to `0`.'
	],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, with the copy at the bottom. Taller content still grows past it. Defaults to `true`; pass `fullScreen={false}` for a shorter hero.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const heroImageWaveProps = props(
	[
		'...SectionCopy props',
		'Takes every prop of Section Copy (see the Style Guide): `eyebrowText`, `eyebrowIcon`, `title`, `description`, `cta` and the rest. `level` defaults to `1`.'
	],
	['images', 'An array of `{ src, alt }` for the wave. Required.'],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, with the copy centered above the wave. Taller content still grows past it. Defaults to `true`; pass `fullScreen={false}` for the natural height.'
	],

	[
		'accent',
		'A string, decorative handwritten text pinned beside the copy. Hidden below the `lg` breakpoint. Leave it out for none.'
	],
	[
		'wave',
		'Image Wave props: `repeat`, `speed`, `duration`, `amplitude`, `waves`, `scrub` and `reverse` (see Image Wave in Components).'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const heroImageCircleProps = props(
	[
		'...SectionCopy props',
		'Takes every prop of Section Copy (see the Style Guide): `eyebrowText`, `eyebrowIcon`, `title`, `description`, `cta` and the rest. `level` defaults to `1`.'
	],
	['images', 'An array of `{ src, alt }` for the first circle. Required.'],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, with the copy centered. Below the `lg` breakpoint the hero is already about a screen tall. Taller content still grows past it. Defaults to `true`; pass `fullScreen={false}` for the natural height.'
	],

	[
		'imagesEnd',
		'An array of `{ src, alt }` for the second circle. Defaults to the same images as the first.'
	],
	[
		'direction',
		'`center | left`. `center` puts a circle on each side of centered copy. `left` keeps one circle, on the right, and left-aligns the copy. Below the `lg` breakpoint both stack the copy over the top half of one circle. Defaults to `center`.'
	],
	[
		'scrub',
		'A number. Spins the circles as the page scrolls, in opposite directions, with `1` about a quarter turn across the section’s pass. `0` is off, and it is skipped when motion is reduced. Defaults to `0`.'
	],
	[
		'offset',
		'A number, how far the circles sit from the copy as a percent of their own width. Higher pushes them further off the screen. Defaults to `30`.'
	],
	[
		'circle',
		'Image Circle props for both circles: `itemWidth`, `gap` and `duration`. The section sets `direction`, `bloom` and `clip` itself.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const heroSimpleProps = props(
	[
		'...SectionCopy props',
		'Takes every prop of Section Copy (see the Style Guide): `eyebrowText`, `eyebrowIcon`, `title`, `description`, `cta`, `layout`, `align`, the `show*` flags and the rest.'
	],
	[
		'compact',
		'A boolean. A shorter hero (40% of the screen), e.g. above a list. Turns off `fullScreen`. Defaults to `false`.'
	],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, so short copy is centered in a full-screen hero. Long copy, or a short screen, still grows past it instead of being cut off. `compact` turns it off. Defaults to `true`.'
	],
	['level', 'Defaults to `1`, since a hero is the page title.'],
	['align', 'Defaults to `center`.']
);

export const strapProps = props(
	[
		'icon',
		'A string, an icon name from `static/icons` (or a path to a single-color SVG), centered in the loop.'
	],
	['children', 'A snippet, what sits beside the loop, such as the social links.'],
	[
		'bleed',
		'A number, px. How far the right end runs past the edge the strap is placed against, so its curve is not seen. The padding on the right grows by the same amount, so the content stays in view. Defaults to `0`.'
	],
	[
		'--strap-color',
		'A CSS variable, the strap’s color, which is also the loop’s shadow. Defaults to `--color-accent`, the brand color.'
	],
	['--strap-height', 'A CSS variable, the strap’s height. Defaults to `80px`.'],
	['class', 'A string of extra classes.']
);

export const colorTokens = props(
	['--color-bg', 'The page background.'],
	['--color-surface', 'Cards, panels and other raised areas.'],
	['--color-text', 'Body text.'],
	['--color-text-muted', 'Supporting text such as descriptions.'],
	['--color-border', 'Borders and dividers.'],
	['--color-accent', 'The brand color for fills and borders.'],
	[
		'--color-accent-text',
		'The brand color when used as text. Darker in the light theme so it stays readable.'
	],
	['--color-secondary', 'A secondary brand color.'],
	['--color-tertiary', 'A tertiary brand color.'],
	['--color-error', 'Error messages.'],
	['--color-glass', 'The translucent tint behind glass surfaces such as the header.']
);

export const themeSurfaceTokens = props(
	['.theme-dark', 'Dark colors inside this element, on any page theme.'],
	['.theme-light', 'Light colors inside this element, on any page theme.'],
	[
		'.theme-invert',
		'The opposite of the page theme: light on a dark page, dark on a light one. Flips with the theme toggle.'
	],
	[
		'dark-tokens, light-tokens',
		'SCSS mixins in `base/variables` that set every themed token. Use them to build a surface of your own.'
	]
);

export const typographyTokens = props(
	['--font-heading', 'The heading font.'],
	['--font-body', 'The body font.'],
	['--font-mono', 'The mono-spaced font.'],
	[
		'.h1 to .h6',
		'Heading styles for any element, so the visual size and the heading level can differ.'
	],
	['.body, .body-large, .body-small', 'Body text sizes.']
);

export const videoBgProps = props(
	['src', 'A string, the video file. Self-hosted or CDN files are best. Required.'],
	[
		'poster',
		'A string, an image shown before the video plays. Best paired with `autoplay: false`.'
	],
	[
		'autoplay',
		'A boolean. Plays on its own, muted and looping, unless the visitor prefers reduced motion. Defaults to `true`. On mobile, a video that is not autoplaying needs a `poster`.'
	],
	[
		'shadow',
		'`top | bottom | null`. A dark gradient over the video to help text stand out. Defaults to `bottom`.'
	],
	['placement', '`br | bl | tr | tl`. The corner of the play / pause button. Defaults to `br`.'],
	['toggleAttach', 'An attachment for the button, such as `magnet()`.'],
	['title', "A string, the video's accessible name. Defaults to `Background video`."]
);
