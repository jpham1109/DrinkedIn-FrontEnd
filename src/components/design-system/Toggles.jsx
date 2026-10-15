import { Heart, Check, Plus, Loader2 } from 'lucide-react'
import { cn } from '../../util/cn'

// Ported from Design/drinkedin-v0/components/drinkedin/toggles.tsx,
// stripped of TypeScript, no other changes. ai/v1-redesign-plan.md PR2.
// Pure presentational: `onToggle` is a bare callback, no mutation/dispatch
// logic here — the eventual container (useLikeCocktail/useFollowBartender
// hooks, per the original frontend audit's §8) owns that.
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function LikeButton({ liked, count, cocktailName, onToggle, pending, size = 'sm', className }) {
	return (
		<button
			type="button"
			aria-pressed={liked}
			aria-label={`Like ${cocktailName}, ${count} ${count === 1 ? 'like' : 'likes'}`}
			onClick={onToggle}
			disabled={pending}
			className={cn(
				'group relative z-10 inline-flex items-center gap-1.5 rounded-control font-sans font-medium tabular-nums transition-colors disabled:cursor-progress',
				size === 'sm' ? 'h-9 px-2 text-sm' : 'h-11 border border-border-strong px-4 text-[0.9375rem]',
				liked ? 'text-accent' : 'text-foreground hover:bg-secondary',
				className
			)}
		>
			{pending ? (
				<Loader2 className="size-4 animate-spin" aria-hidden="true" />
			) : (
				<Heart
					className={cn('size-[1.125rem] transition-transform group-active:scale-90', liked && 'fill-current')}
					aria-hidden="true"
				/>
			)}
			<span aria-hidden="true">{compact.format(count)}</span>
			{size === 'md' && <span aria-hidden="true">{liked ? 'Liked' : 'Like'}</span>}
		</button>
	)
}

export function FollowButton({ following, name, onToggle, pending, onDark, variant = 'solid', className }) {
	return (
		<button
			type="button"
			aria-pressed={following}
			aria-label={`Follow ${name}`}
			onClick={onToggle}
			disabled={pending}
			className={cn(
				'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control border px-3 text-sm font-medium transition-colors disabled:cursor-progress disabled:opacity-60 [&_svg]:size-4',
				variant === 'quiet'
					? following
						? 'border-transparent px-2 text-foreground hover:bg-secondary'
						: 'border-transparent px-2 text-muted-foreground hover:bg-secondary hover:text-foreground'
					: following
						? onDark
							? 'border-surface-dark-border text-surface-dark-foreground hover:bg-surface-dark-border'
							: 'border-border-strong text-foreground hover:bg-secondary'
						: onDark
							? 'border-surface-dark-foreground bg-surface-dark-foreground text-surface-dark hover:bg-surface-dark-foreground/85'
							: 'border-primary bg-primary text-primary-foreground hover:bg-primary/85',
				className
			)}
		>
			{pending ? (
				<Loader2 className="animate-spin" aria-hidden="true" />
			) : following ? (
				<Check aria-hidden="true" />
			) : (
				<Plus aria-hidden="true" />
			)}
			<span aria-hidden="true">{following ? 'Following' : 'Follow'}</span>
		</button>
	)
}
