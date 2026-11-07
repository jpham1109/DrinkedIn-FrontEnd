import { cn } from '../../util/cn'

// Ported from Design/drinked-in-ui-redesign/components/home/section-header.tsx,
// stripped of TypeScript. ai/v1-redesign-plan.md PR9 — used by 3 of
// Home's 5 kept sections; placed in the shared design system rather than
// duplicated inline, same precedent as every other piece v0 reused across
// multiple consumers.
export function SectionHeader({ id, eyebrow, title, description, action, onDark, className }) {
	return (
		<div className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
			<div className="flex max-w-2xl flex-col gap-3">
				{eyebrow && (
					<p className={cn('type-eyebrow m-0', onDark ? 'text-surface-dark-muted' : 'text-muted-foreground')}>
						{eyebrow}
					</p>
				)}
				{/* m-0: native h2/p margins, same missing-Preflight gap as every
				    other heading/paragraph across the design system (see
				    Button.jsx's border-0 comment for the general pattern). */}
				<h2 id={id} className="type-h2 m-0 text-balance">
					{title}
				</h2>
				{description && (
					<p
						className={cn(
							'm-0 text-pretty leading-relaxed',
							onDark ? 'text-surface-dark-muted' : 'text-muted-foreground'
						)}
					>
						{description}
					</p>
				)}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	)
}
