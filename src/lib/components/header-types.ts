import type { ButtonProps } from './button.svelte';
import type { LogoProps } from './logo.svelte';
import type { NavLink } from './menu-links.svelte';
import type { SiteNavButtonProps } from './site-nav-button.svelte';
import type { SocialLink } from './social-links.svelte';

/**
 * What every header template takes: the content, which lives in `global/navigation.json`. The style of each template
 * (floating, glass, link placement) is its own props. Keeping this shared is what lets the layout swap one header for
 * another without anyone retyping the links.
 */
export type HeaderNavProps = {
	logo?: LogoProps;
	links?: NavLink[];
	ctas?: ButtonProps[];
	socialLinks?: SocialLink[];
	/** Small links at the bottom of the mobile navigation. */
	navFooterLinks?: ButtonProps[];
	/** Adds an "Admin Log In" link to the bottom of the mobile navigation. */
	adminLogin?: boolean;
	showSkipLink?: boolean;
	/** The button that opens the mobile navigation. */
	navButton?: Omit<SiteNavButtonProps, 'expanded' | 'controls'>;
};
