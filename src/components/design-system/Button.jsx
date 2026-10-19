import * as React from 'react'
import { Link } from 'react-router-dom'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../../util/cn'

// Ported from Design/drinkedin-v0/components/drinkedin/button.tsx, stripped
// of TypeScript. ai/v1-redesign-plan.md PR2 — inert until a later PR
// imports these. ButtonLink renders React Router's <Link> (prop `to`),
// not a plain <a>, per the v0 source's own comment: "Swap <a> for React
// Router's <Link> in the app."
// `no-underline` isn't in v0's source — v0 gets it for free from Preflight's
// `a { text-decoration: inherit }`, which this app deliberately excludes
// (see design-tokens.css). Only affects ButtonLink (an <a>/<Link>); Button
// itself renders a <button>, unaffected either way. Scoped here rather than
// per call site since every ButtonLink consumer needs it identically.
export const buttonVariants = cva(
	// border-0: v0 gets a borderless native <button> for free from Preflight's
	// universal `*, ::before, ::after { border-width: 0 }` reset (full
	// `@import 'tailwindcss'`), which this app deliberately excludes (see
	// design-tokens.css). Without it, Chrome's UA stylesheet paints every
	// <button> with its own `2px outset` bevel regardless of variant —
	// confirmed via computed style on the Navbar's "Log out" button
	// (variant="ghost"), which otherwise reads `border: 2px outset black`
	// despite no border utility ever being applied. Scoped to the base so
	// every variant gets it; `outline`'s own `border border-border-strong`
	// below still wins (cn() -> tailwind-merge resolves the border-width
	// conflict by source order, and the variant's classes are concatenated
	// after base).
	'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control border-0 font-sans font-medium no-underline transition-colors select-none disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				primary: 'bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75',
				accent: 'bg-accent text-accent-foreground hover:bg-accent-pressed active:bg-accent-pressed',
				outline:
					'border border-border-strong bg-transparent text-foreground hover:bg-secondary active:bg-border',
				ghost: 'bg-transparent text-foreground hover:bg-secondary active:bg-border',
				onDark:
					'bg-surface-dark-foreground text-surface-dark hover:bg-surface-dark-foreground/85 active:bg-surface-dark-foreground/75',
				link: 'h-auto px-0 text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground',
			},
			size: {
				sm: 'h-9 px-3 text-sm',
				md: 'h-11 px-5 text-[0.9375rem]',
				lg: 'h-13 px-7 text-base',
			},
		},
		compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
		defaultVariants: { variant: 'primary', size: 'md' },
	}
)

export const Button = React.forwardRef(function Button(
	{ className, variant, size, loading, loadingLabel, disabled, children, type = 'button', ...props },
	ref
) {
	return (
		<button
			ref={ref}
			type={type}
			className={cn(buttonVariants({ variant, size }), loading && 'cursor-progress', className)}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			{loading ? (
				<>
					<Loader2 className="animate-spin" aria-hidden="true" />
					<span>{loadingLabel ?? children}</span>
				</>
			) : (
				children
			)}
		</button>
	)
})

/** Visually a button, semantically a React Router Link. */
export function ButtonLink({ className, variant, size, to, ...props }) {
	return <Link to={to} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export const IconButton = React.forwardRef(function IconButton(
	{ label, variant = 'ghost', size = 'md', className, type = 'button', children, ...props },
	ref
) {
	return (
		<button
			ref={ref}
			type={type}
			aria-label={label}
			title={label}
			className={cn(
				// border-0: same native <button> UA-border leak as buttonVariants
				// above (see its comment) — IconButton has its own className
				// assembly (not cva), so it needs the identical reset.
				'inline-flex shrink-0 items-center justify-center rounded-control border-0 transition-colors disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-5',
				size === 'md' ? 'size-11' : 'size-9',
				variant === 'ghost' && 'text-foreground hover:bg-secondary active:bg-border',
				variant === 'outline' &&
					'border border-border-strong text-foreground hover:bg-secondary active:bg-border',
				variant === 'onDark' &&
					'text-surface-dark-foreground hover:bg-surface-dark-border active:bg-surface-dark-border',
				className
			)}
			{...props}
		>
			{children}
		</button>
	)
})
