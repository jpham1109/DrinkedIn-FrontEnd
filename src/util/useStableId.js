import { useRef } from 'react'

let counter = 0

// React 17 has no React.useId() (added in React 18) — v0's Tabs/Overlay
// both called it directly, which would throw at runtime under React 17.
// This is the standard pre-useId pattern: a module-level counter captured
// once into a ref, giving each component instance a stable, globally
// unique id across its lifetime without a new dependency.
// ai/v1-redesign-plan.md PR2.
export function useStableId(prefix = 'id') {
	const ref = useRef(null)
	if (ref.current === null) {
		counter += 1
		ref.current = `${prefix}-${counter}`
	}
	return ref.current
}
