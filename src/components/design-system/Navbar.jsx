import * as React from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import { cn } from '../../util/cn'
import { Button, ButtonLink, IconButton } from './Button'
import { Avatar } from './Identity'
import { Overlay } from './Overlay'
import { Skeleton } from './States'

// Ported from Design/drinkedin-v0/components/drinkedin/navbar.tsx, stripped
// of TypeScript, <a>s swapped for React Router's <Link>. ai/v1-redesign-plan.md
// PR4.
//
// v0 gets `list-style: none`/zeroed ul margin-padding and `a { text-decoration:
// inherit }` for free from Tailwind's Preflight (its globals.css does
// `@import 'tailwindcss'`, the full bundle). This app deliberately excludes
// Preflight (design-tokens.css, PR1) to avoid a global visual regression
// across every not-yet-migrated page, so those two browser UA defaults
// (list bullets/indent, link underline/color) leak through here unless
// replicated explicitly. Fixed narrowly with `list-none m-0 p-0` on both
// <ul>s and `no-underline` on every <a>/<Link> below, rather than enabling
// Preflight globally.
//
// v0's nav links were ["Cocktails" -> /cocktails, "Popular" ->
// /cocktails?sort=popular] — the second doesn't exist as a route here
// (sorting is client-side dropdown state on CocktailsContainer, not a URL
// param). Kept the real app's actual two top-level routes/labels instead
// (Categories, Featured).
//
// v0's logged-in avatar linked to /users/${username} (a public bartender
// profile route the real backend doesn't have — decision #5). Linked to
// /profile instead: this is the CURRENT user's own profile link, which
// does exist and is exactly what that icon means here.
//
// v0's search box links to /cocktails#search for a focus/scroll target
// that doesn't exist on CocktailsContainer yet. Linked to plain /cocktails
// for now rather than inventing that cross-page focus behavior — revisit
// when PR6 redoes that page.
const links = [
	{ to: '/categories', label: 'Categories' },
	{ to: '/cocktails', label: 'Featured' },
]

export function Wordmark({ className }) {
	return (
		<Link
			to="/"
			className={cn('font-serif text-2xl leading-none tracking-tight text-foreground no-underline', className)}
			style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 100" }}
		>
			Drinked<span className="italic text-accent">In</span>
		</Link>
	)
}

function NavLink({ to, label, current, onClick }) {
	return (
		<Link
			to={to}
			onClick={onClick}
			aria-current={current ? 'page' : undefined}
			className={cn(
				'relative inline-flex h-11 items-center text-[0.9375rem] font-medium no-underline transition-colors',
				current
					? 'text-foreground after:absolute after:inset-x-0 after:bottom-2 after:h-px after:bg-foreground'
					: 'text-muted-foreground hover:text-foreground'
			)}
		>
			{label}
		</Link>
	)
}

// `onLinkClick` is only passed when AccountArea renders inside the mobile
// drawer (closeMenu) — desktop's instance omits it since there's no menu
// to close. Preserves the previous NavBar's existing behavior of closing
// the mobile menu on every link, not just logout.
function AccountArea({ status, user, onLogout, onLinkClick }) {
	if (status === 'checking') {
		return (
			<div className="flex items-center gap-3" aria-live="polite">
				<span className="sr-only">Checking your account</span>
				<Skeleton className="h-9 w-16" />
				<Skeleton className="h-9 w-20" />
			</div>
		)
	}

	if (status === 'loggedIn' && user) {
		const name = user.full_name ?? user.username
		return (
			<div className="flex items-center gap-2">
				{/* text-muted-foreground/hover:text-foreground: approved visual
				    refinement specific to this instance, not the shared ghost
				    variant — confirmed via manual browser comparison and a
				    WCAG AA contrast check. Keyboard focus-visible (native
				    outline) and the ghost hover background are unaffected. */}
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground hover:text-foreground"
					onClick={() => {
						onLogout?.()
						onLinkClick?.()
					}}
				>
					Log out
				</Button>
				<Link
					to="/profile"
					onClick={onLinkClick}
					className="flex items-center gap-2 rounded-full no-underline"
					aria-label={`Your profile, ${name}`}
				>
					<Avatar name={name} src={user.avatar} size="sm" />
				</Link>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<ButtonLink to="/login" variant="ghost" size="sm" onClick={onLinkClick}>
				Log in
			</ButtonLink>
			<ButtonLink to="/signup" size="sm" onClick={onLinkClick}>
				Sign up
			</ButtonLink>
		</div>
	)
}

export function Navbar({ status, user, currentPath = '/', onLogout }) {
	const [menuOpen, setMenuOpen] = React.useState(false)
	const closeMenu = () => setMenuOpen(false)

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
			<a
				href="#main"
				className="sr-only no-underline focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
			>
				Skip to content
			</a>
			<nav
				aria-label="Main"
				className="mx-auto flex h-16 max-w-wide items-center justify-between gap-6 px-5 md:px-8 lg:px-12"
			>
				<div className="flex items-center gap-10">
					<Wordmark />
					<ul className="m-0 hidden list-none items-center gap-7 p-0 md:flex">
						{links.map((l) => (
							<li key={l.to}>
								<NavLink {...l} current={currentPath === l.to} />
							</li>
						))}
					</ul>
				</div>

				<div className="flex items-center gap-2">
					<Link
						to="/cocktails"
						className="hidden h-9 items-center gap-2 rounded-control border border-input px-3 text-sm text-muted-foreground no-underline transition-colors hover:border-border-strong hover:text-foreground lg:inline-flex lg:w-64"
					>
						<Search className="size-4" aria-hidden="true" />
						Search cocktails, ingredients…
					</Link>
					<div className="hidden md:block">
						<AccountArea status={status} user={user} onLogout={onLogout} />
					</div>
					{/* text-foreground: v0 has no explicit color here either — it
					    relies on Preflight's `a { color: inherit }`, which this app
					    deliberately excludes. Without it this link (and the
					    currentColor-stroked Search icon inside it) rendered as
					    rgb(0, 0, 238), the browser's own unvisited-link blue —
					    confirmed live via getComputedStyle, not assumed. Matches
					    IconButton's own ghost-variant text-foreground right next to
					    it. */}
					<Link
						to="/cocktails"
						aria-label="Search cocktails"
						className="inline-flex size-11 items-center justify-center rounded-control text-foreground no-underline hover:bg-secondary md:hidden"
					>
						<Search className="size-5" aria-hidden="true" />
					</Link>
					<IconButton label="Open menu" className="md:hidden" onClick={() => setMenuOpen(true)}>
						<Menu aria-hidden="true" />
					</IconButton>
				</div>
			</nav>

			<Overlay open={menuOpen} onClose={closeMenu} title="Menu" variant="drawer" hideTitle>
				<ul className="m-0 flex list-none flex-col border-t border-border p-0">
					{[{ to: '/', label: 'Home' }, ...links].map((l) => (
						<li key={l.to} className="border-b border-border">
							{/* text-foreground: same missing-Preflight gap as the mobile
							    search icon above — v0's own drawer links have no base
							    color either, relying on Preflight's `a { color: inherit }`
							    to inherit the ambient foreground. Without it, every
							    non-current link showed the browser's own default
							    unvisited/visited link color (blue/purple, varying per
							    link by the browser's own history) instead of one
							    consistent color — confirmed live via getComputedStyle.
							    aria-[current=page]:text-accent (already present, already
							    working — verified it still correctly overrides this on
							    the active page) keeps its own highlight. */}
							<Link
								to={l.to}
								onClick={closeMenu}
								aria-current={currentPath === l.to ? 'page' : undefined}
								className="flex h-14 items-center font-serif text-2xl text-foreground no-underline aria-[current=page]:text-accent"
							>
								{l.label}
							</Link>
						</li>
					))}
				</ul>
				<div className="mt-auto">
					<AccountArea status={status} user={user} onLogout={onLogout} onLinkClick={closeMenu} />
				</div>
			</Overlay>
		</header>
	)
}
