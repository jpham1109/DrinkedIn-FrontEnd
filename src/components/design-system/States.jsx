import { AlertCircle } from 'lucide-react'
import { cn } from '../../util/cn'

// Ported from Design/drinkedin-v0/components/drinkedin/states.tsx,
// stripped of TypeScript, no other changes. ai/v1-redesign-plan.md PR2.
export function Skeleton({ className }) {
	return <div aria-hidden="true" className={cn('animate-pulse bg-secondary', className)} />
}

export function CocktailCardSkeleton() {
	return (
		<div className="flex flex-col gap-4" aria-hidden="true">
			<Skeleton className="aspect-[4/5] w-full" />
			<div className="flex flex-col gap-2.5">
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<div className="mt-1 flex items-center gap-2">
					<Skeleton className="size-6 rounded-full" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
		</div>
	)
}

export function EmptyState({ icon, title, description, action, className }) {
	return (
		<div
			className={cn(
				'flex flex-col items-center gap-4 border border-dashed border-border-strong px-6 py-14 text-center',
				className
			)}
		>
			{icon && <div className="text-muted-foreground [&_svg]:size-7">{icon}</div>}
			{/* m-0: native h3/p margins stack on top of the parent's gap-2,
			    same missing-Preflight gap as elsewhere (see Button.jsx's
			    border-0 comment for the general pattern). */}
			<div className="flex max-w-sm flex-col gap-2">
				<h3 className="type-h3 m-0 text-balance">{title}</h3>
				{description && <p className="m-0 text-pretty leading-relaxed text-muted-foreground">{description}</p>}
			</div>
			{action}
		</div>
	)
}

export function ErrorState({
	title = 'We couldn’t pour that one',
	description = 'Something went wrong loading this page. Check your connection and try again.',
	action,
	className,
}) {
	return (
		<div role="alert" className={cn('flex items-start gap-4 border-l-0 bg-accent/[0.07] px-5 py-5', className)}>
			<AlertCircle className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
			<div className="flex flex-col gap-3">
				{/* m-0: same missing-Preflight margin gap as EmptyState above. */}
				<div className="flex flex-col gap-1">
					<p className="m-0 font-semibold text-foreground">{title}</p>
					<p className="m-0 text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
				</div>
				{action}
			</div>
		</div>
	)
}
