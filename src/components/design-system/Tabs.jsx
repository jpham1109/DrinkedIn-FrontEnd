import * as React from 'react'
import { cn } from '../../util/cn'
import { useStableId } from '../../util/useStableId'

// Ported from Design/drinkedin-v0/components/drinkedin/tabs.tsx, stripped
// of TypeScript and the 'use client' directive (meaningless outside
// Next.js). ai/v1-redesign-plan.md PR2. Real WAI-ARIA tabs with roving
// tabindex: Arrow keys, Home and End move between tabs — replaces the
// current Profile.jsx's <div onClick> tabs, which have no keyboard
// support at all.
export function Tabs({ items, label, className }) {
	const [active, setActive] = React.useState(items[0]?.id)
	const baseId = useStableId('tabs') // v0 used React.useId() — React 18-only, not available in this app's React 17
	const tabRefs = React.useRef([])

	function onKeyDown(e, index) {
		const last = items.length - 1
		const next =
			e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
			: e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
			: e.key === 'Home' ? 0
			: e.key === 'End' ? last
			: null
		if (next === null) return
		e.preventDefault()
		setActive(items[next].id)
		tabRefs.current[next]?.focus()
	}

	return (
		<div className={cn('flex flex-col gap-6', className)}>
			<div role="tablist" aria-label={label} className="flex gap-6 overflow-x-auto border-b border-border">
				{items.map((item, i) => {
					const selected = item.id === active
					return (
						<button
							key={item.id}
							ref={(el) => {
								tabRefs.current[i] = el
							}}
							role="tab"
							type="button"
							id={`${baseId}-tab-${item.id}`}
							aria-selected={selected}
							aria-controls={`${baseId}-panel-${item.id}`}
							tabIndex={selected ? 0 : -1}
							onClick={() => setActive(item.id)}
							onKeyDown={(e) => onKeyDown(e, i)}
							className={cn(
								'-mb-px flex h-12 shrink-0 items-center gap-2 border-b-2 text-[0.9375rem] font-medium transition-colors',
								selected
									? 'border-foreground text-foreground'
									: 'border-transparent text-muted-foreground hover:text-foreground'
							)}
						>
							{item.label}
							{item.count !== undefined && (
								<span className="text-sm tabular-nums text-muted-foreground">{item.count}</span>
							)}
						</button>
					)
				})}
			</div>
			{items.map((item) => (
				<div
					key={item.id}
					role="tabpanel"
					id={`${baseId}-panel-${item.id}`}
					aria-labelledby={`${baseId}-tab-${item.id}`}
					hidden={item.id !== active}
					tabIndex={0}
					className="focus-visible:outline-offset-4"
				>
					{item.content}
				</div>
			))}
		</div>
	)
}
