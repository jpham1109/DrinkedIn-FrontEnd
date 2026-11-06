import { Link } from 'react-router-dom'
import { Wordmark } from './Navbar'

// Ported from Design/drinkedin-v0/components/home/join-and-footer.tsx's
// SiteFooter (ai/v1-redesign-plan.md PR9), stripped of the prototype-only
// preview-switcher block (auth-state/geometry preview links — confirmed
// prototype scaffolding, not real product UI, per
// ai/v1-redesign-plan.md's "Confirmed prototype-only scaffolding" list)
// and the `status` prop that only fed that block — v0's actual nav link
// list below has no auth branching of its own, so none is added here.
//
// `/design-system` dropped from the link list — no such route exists in
// the real app (it's a v0-only prototype page). The remaining three
// (`/cocktails`, `/login`, `/signup`) are all real routes.
//
// Rendered once, globally, in App.jsx — not per-page. No props needed:
// once the preview-switcher (the only thing that read `status`) is gone,
// this component has no data dependency at all.
const links = [
	{ to: '/cocktails', label: 'Cocktails' },
	{ to: '/login', label: 'Log in' },
	{ to: '/signup', label: 'Sign up' },
]

export function Footer() {
	return (
		// `<footer>` itself carries no `mx-auto`/width constraint — it's a
		// direct child of App.jsx's flex-column root (`.App`), and a flex
		// item's own cross-axis auto margins (`mx-auto`) take priority over
		// `align-items: stretch`, per the flexbox spec: the browser hands any
		// leftover cross-axis space to those auto margins instead of
		// stretching the box, so the item shrinks to its content's natural
		// width instead of filling the row. Confirmed live via
		// getComputedStyle/getBoundingClientRect: `<footer>` rendered at
		// ~485px instead of stretching to max-w-wide's 1440px cap, even with
		// `align-self: stretch` forced directly, and jumped straight to
		// 1440px the instant the auto margins were removed. NavBar's own
		// <Navbar> component (design-system/Navbar.jsx) already avoids this
		// exact trap the same way — an unconstrained `<header>` as the flex
		// item, with `mx-auto max-w-wide` pushed onto an inner `<nav>` that's
		// laid out in normal block flow, not as a flex item itself. Mirrored
		// here with an inner `<div>`.
		<footer className="mt-16 pb-10 text-left lg:mt-24">
			<div className="mx-auto max-w-wide px-5 md:px-8 lg:px-12">
				<div className="flex flex-col gap-10 border-t border-border pt-10 md:flex-row md:justify-between">
					<div className="flex flex-col gap-3">
						<Wordmark />
						<p className="m-0 text-sm text-muted-foreground">Drink what you like. Please drink responsibly.</p>
					</div>
					<nav aria-label="Footer" className="flex gap-12 text-sm">
						<ul className="m-0 flex list-none flex-col gap-3 p-0">
							{links.map((l) => (
								<li key={l.to}>
									<Link to={l.to} className="text-foreground no-underline hover:underline hover:underline-offset-4">
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>

				{/* border-x-0 border-b-0: `border-dashed` is the CSS shorthand
				    `border-style`, which (unlike `border-t`'s `border-top-width`)
				    sets the style on all four sides at once — combined with the
				    missing-Preflight gap (no `border-width: 0` reset on the other
				    three sides, so the browser's UA-default `medium` width wins
				    on them), that drew a full dashed rectangle around the
				    copyright line instead of v0's intended single top rule.
				    Confirmed live: the box was visible on screen and gone once
				    these were added. Preflight itself still deliberately stays
				    off app-wide (see design-tokens.css) — zeroed explicitly here
				    instead, same pattern as every other missing-Preflight fix in
				    this codebase. */}
				<div className="mt-10 border-x-0 border-t border-b-0 border-dashed border-border pt-6 text-sm text-muted-foreground">
					<p className="m-0">© {new Date().getFullYear()} DrinkedIn</p>
				</div>
			</div>
		</footer>
	)
}
