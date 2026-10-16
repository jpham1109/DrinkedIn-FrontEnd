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
			className={cn('font-serif text-2xl leading-none tracking-tight text-foreground', className)}
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
				'relative inline-flex h-11 items-center text-[0.9375rem] font-medium transition-colors',
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
				<Button
					variant="ghost"
					size="sm"
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
					className="flex items-center gap-2 rounded-full"
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
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
			>
				Skip to content
			</a>
			<nav
				aria-label="Main"
				className="mx-auto flex h-16 max-w-wide items-center justify-between gap-6 px-5 md:px-8 lg:px-12"
			>
				<div className="flex items-center gap-10">
					<Wordmark />
					<ul className="hidden items-center gap-7 md:flex">
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
						className="hidden h-9 items-center gap-2 rounded-control border border-input px-3 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground lg:inline-flex lg:w-64"
					>
						<Search className="size-4" aria-hidden="true" />
						Search cocktails, ingredients…
					</Link>
					<div className="hidden md:block">
						<AccountArea status={status} user={user} onLogout={onLogout} />
					</div>
					<Link
						to="/cocktails"
						aria-label="Search cocktails"
						className="inline-flex size-11 items-center justify-center rounded-control hover:bg-secondary md:hidden"
					>
						<Search className="size-5" aria-hidden="true" />
					</Link>
					<IconButton label="Open menu" className="md:hidden" onClick={() => setMenuOpen(true)}>
						<Menu aria-hidden="true" />
					</IconButton>
				</div>
			</nav>

			<Overlay open={menuOpen} onClose={closeMenu} title="Menu" variant="drawer" hideTitle>
				<ul className="flex flex-col border-t border-border">
					{[{ to: '/', label: 'Home' }, ...links].map((l) => (
						<li key={l.to} className="border-b border-border">
							<Link
								to={l.to}
								onClick={closeMenu}
								aria-current={currentPath === l.to ? 'page' : undefined}
								className="flex h-14 items-center font-serif text-2xl aria-[current=page]:text-accent"
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
