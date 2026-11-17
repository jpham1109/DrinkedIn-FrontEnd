import { cn } from '../../util/cn'

// Ported from Design/drinked-in-ui-redesign/components/drinkedin/identity.tsx,
// stripped of TypeScript. ai/v1-redesign-plan.md PR2.
const avatarSizes = {
	xs: 'size-6 text-[0.625rem]',
	sm: 'size-8 text-xs',
	md: 'size-11 text-sm',
	lg: 'size-16 text-lg',
	xl: 'size-24 text-2xl',
}

function initials(name) {
	return name
		.split(' ')
		.map((p) => p[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()
}

export function Avatar({ name, src, size = 'md', className, labelled = false }) {
	return (
		<span
			className={cn(
				'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-sans font-semibold text-muted-foreground ring-1 ring-border',
				avatarSizes[size],
				className
			)}
			role={labelled ? 'img' : undefined}
			aria-label={labelled ? name : undefined}
			aria-hidden={labelled ? undefined : true}
		>
			{src ? (
				// eslint-disable-next-line jsx-a11y/alt-text
				<img src={src} alt="" className="size-full object-cover" loading="lazy" />
			) : (
				initials(name)
			)}
		</span>
	)
}

/** Quiet metadata labels. Rectangular, never pill-shaped. */
export function Tag({ children, tone = 'neutral', className }) {
	return (
		<span
			className={cn(
				'inline-flex h-6 items-center px-2 text-xs font-semibold uppercase tracking-[0.06em]',
				tone === 'neutral' && 'bg-secondary text-muted-foreground',
				tone === 'accent' && 'bg-accent/10 text-accent',
				tone === 'onDark' && 'bg-surface-dark-border text-surface-dark-foreground',
				className
			)}
		>
			{children}
		</span>
	)
}

// byline-variant prefix by role. No entry for a given role (or role
// omitted) falls back to the original generic "by" — this keeps every
// current call site's rendered text byte-for-byte unchanged until the
// backend actually ships a real creator/submitter distinction
// (ai/v1-redesign-plan.md's B1/B2/B3) for them to pass a role with.
const rolePrefix = {
	creator: 'Created by',
	submitter: 'Added by',
}

/**
 * Person attribution, styled like an author byline. Concept-neutral:
 * takes whoever is being identified (a creator, a submitter, or just a
 * person — e.g. Profile's Following/Followers rows) rather than assuming
 * the one role this component used to be named after.
 *
 * Renamed from `CreatorIdentity` (`bartender` prop) 2026-11-16, per
 * ai/v1-redesign-plan.md's creator/submitter attribution workstream (F1):
 * a component/prop named after one concept can't cleanly represent the
 * concept now being split into creator vs. submitter vs. bartender vs.
 * editorial authorization. `role` is optional and purely cosmetic (which
 * byline prefix to show) — it carries no authorization or attribution
 * logic itself.
 *
 * Deliberately renders the name as plain text, not a link — v0's source
 * defaults to `href={/users/${username}}`, but no public bartender-profile
 * route exists in the real app and this redesign isn't adding one
 * (ai/v1-redesign-plan.md decision #5). Don't reintroduce a `href`/`<a>`
 * here without that route actually existing.
 */
export function PersonIdentity({ person, role, variant = 'byline', onDark, className }) {
	const meta = [person.bar, person.location].filter(Boolean).join(' · ')
	const nameClass = cn('font-medium', onDark ? 'text-surface-dark-foreground' : 'text-foreground')
	const mutedClass = onDark ? 'text-surface-dark-muted' : 'text-muted-foreground'

	if (variant === 'byline') {
		const prefix = rolePrefix[role] ?? 'by'
		return (
			// m-0: native <p> margin, same missing-Preflight gap as elsewhere
			// (see Button.jsx's border-0 comment for the general pattern).
			<p className={cn('m-0 flex min-w-0 items-center gap-2 text-sm', mutedClass, className)}>
				<Avatar name={person.name} src={person.avatarUrl} size="xs" />
				<span className="truncate">
					{prefix} <span className={nameClass}>{person.name}</span>
				</span>
			</p>
		)
	}

	return (
		<div className={cn('flex min-w-0 items-center gap-3', className)}>
			<Avatar name={person.name} src={person.avatarUrl} size="md" />
			<div className="flex min-w-0 flex-col">
				<span className={cn(nameClass, 'truncate text-base')}>{person.name}</span>
				{meta && <span className={cn('truncate text-sm', mutedClass)}>{meta}</span>}
			</div>
		</div>
	)
}
