import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../util/cn'
import { IconButton } from './Button'
import { useStableId } from '../../util/useStableId'

/**
 * Ported from Design/drinkedin-v0/components/drinkedin/overlay.tsx,
 * stripped of TypeScript and the 'use client' directive.
 * ai/v1-redesign-plan.md PR2.
 *
 * Built on native <dialog>.showModal(). Verified in a real browser, not
 * assumed, exactly what the browser provides vs. what doesn't:
 * - Initial focus on open, Escape-to-close, and backdrop-click blocking
 *   pointer events on background content: genuinely native, confirmed
 *   working. (v0's source comment claimed "focus trapping" came from the
 *   browser too — that part turned out false, see below.)
 * - Its id generation was React 18-only (v0 used React.useId(), not
 *   available in this app's React 17) — replaced with useStableId.
 * - Tab-key focus trapping is NOT reliably native: confirmed by a real
 *   keyboard test that tabbing past the dialog's last focusable element
 *   escaped to <body> instead of wrapping to the first — so this
 *   component implements the wrap-around itself (handleTabTrap below)
 *   rather than relying on the browser.
 * - Escape-to-close does NOT sync back to React state on its own, for two
 *   independent reasons, both confirmed in a real browser rather than
 *   assumed: (1) a JSX `onClose` prop on a plain `<dialog>` element is a
 *   silent no-op in this app's React version — dialog's native
 *   `close`/`cancel` events aren't part of React's synthetic event system
 *   here (only arrived in React 19); (2) even a minimal, non-React,
 *   freshly-`addEventListener`-attached 'close' listener never fired at
 *   all in this environment, for ANY dismissal path (Escape or an
 *   explicit `.close()` call) — this isn't a React or timing bug, the
 *   event genuinely does not fire here. Reproduced the real, user-facing
 *   consequence this caused: pressing Escape closed the dialog natively,
 *   but the component's own `open` state never flipped, so the very next
 *   attempt to reopen it silently did nothing (state was already "open"
 *   as far as the parent knew). Fixed with a `MutationObserver` watching
 *   the `open` attribute directly, instead of depending on any event.
 *
 * variant: 'modal' (centered dialog) or 'drawer' (full-height panel from
 * the right — mobile nav, filters, forms).
 *
 * Deliberately missing v0's fade/zoom/slide-in entrance animation
 * (`open:animate-in open:fade-in-0 open:zoom-in-95` /
 * `open:animate-in open:slide-in-from-right`) — those classes come from
 * the tw-animate-css package, which was tried and dropped: its compiled
 * CSS fails CRA's production build under `CI=true` (confirmed, not
 * assumed — see design-tokens.css). Functionally unaffected: the dialog
 * opens/closes instantly instead of animating, focus trap/Escape/backdrop
 * are untouched.
 */
const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
export function Overlay({ open, onClose, title, description, variant = 'modal', hideTitle, children, className }) {
	const ref = React.useRef(null)
	const titleId = useStableId('overlay-title')
	const descId = useStableId('overlay-desc')

	// Latest onClose in a ref so the native listener below (attached once)
	// always calls the current callback without needing to re-attach it
	// every time the parent passes a new function identity.
	const onCloseRef = React.useRef(onClose)
	onCloseRef.current = onClose

	React.useEffect(() => {
		const dialog = ref.current
		if (!dialog) return
		if (open && !dialog.open) dialog.showModal()
		if (!open && dialog.open) dialog.close()
	}, [open])

	// Syncs React state when the dialog closes by any means other than this
	// component's own `open` prop flipping — Escape, or any future native
	// dismissal path. Deliberately a MutationObserver on the `open`
	// attribute, not a native 'close' event listener: verified in a real
	// browser that this environment's <dialog> does not fire 'close' at
	// all (confirmed with a minimal, non-React, freshly-attached listener
	// — not a React or timing bug, the event genuinely never fires here),
	// so a listener-based approach would silently never call back. The
	// `open` attribute removal itself is directly observable regardless.
	// This can also fire when OUR OWN effect above calls dialog.close()
	// (parent-driven), redundantly calling onClose a second time — harmless,
	// since setting already-false state again is a no-op in React.
	React.useEffect(() => {
		const dialog = ref.current
		if (!dialog) return
		const observer = new MutationObserver(() => {
			if (!dialog.open) onCloseRef.current?.()
		})
		observer.observe(dialog, { attributes: true, attributeFilter: ['open'] })
		return () => observer.disconnect()
	}, [])

	function handleTabTrap(e) {
		if (e.key !== 'Tab') return
		const dialog = ref.current
		if (!dialog) return
		const focusable = [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)]
		if (focusable.length === 0) return
		const first = focusable[0]
		const last = focusable[focusable.length - 1]
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault()
			last.focus()
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault()
			first.focus()
		}
	}

	return (
		<dialog
			ref={ref}
			aria-labelledby={titleId}
			aria-describedby={description ? descId : undefined}
			onKeyDown={handleTabTrap}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose()
			}}
			className={cn(
				// border-0: native <dialog> UA default includes a visible
				// border (confirmed via computed style: 3px solid, resolving
				// to currentColor i.e. the espresso text-card-foreground) —
				// same missing-Preflight gap as Button.jsx (see its comment),
				// just on <dialog> instead of <button>. Margin/padding/max-size
				// were already explicitly reset below; border was the one gap.
				'm-0 max-h-none max-w-none border-0 bg-card p-0 text-card-foreground shadow-overlay backdrop:bg-foreground/40 backdrop:backdrop-blur-[1px]',
				variant === 'modal' &&
					'fixed inset-x-4 top-1/2 mx-auto w-auto max-w-md -translate-y-1/2 rounded-overlay sm:inset-x-0',
				variant === 'drawer' &&
					'fixed inset-y-0 right-0 left-auto h-dvh w-[min(22rem,88vw)] rounded-l-overlay',
				className
			)}
		>
			<div className={cn('flex flex-col gap-5 p-6', variant === 'drawer' && 'h-full')}>
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-2">
						{/* m-0: native h2/p margins (confirmed via computed style: ~22px
						    and ~15px respectively) stack on top of the parent's
						    deliberate gap-2 spacing without Preflight's margin:0 reset
						    — same missing-Preflight gap as Button.jsx's border (see its
						    comment), just margin instead of border. */}
						<h2 id={titleId} className={cn('type-h3 m-0 text-balance', hideTitle && 'sr-only')}>
							{title}
						</h2>
						{description && (
							<p id={descId} className="m-0 text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">
								{description}
							</p>
						)}
					</div>
					<IconButton label="Close" size="sm" onClick={onClose} className="-mr-2 -mt-1">
						<X aria-hidden="true" />
					</IconButton>
				</div>
				{children}
			</div>
		</dialog>
	)
}
