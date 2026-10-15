import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merges conditional class lists and resolves conflicting Tailwind
// utilities (e.g. `px-2 px-4` -> `px-4`). Ported from
// Design/drinkedin-v0/lib/utils.ts — every design-system primitive in
// src/components/design-system/ depends on this. ai/v1-redesign-plan.md PR2.
export function cn(...inputs) {
	return twMerge(clsx(inputs))
}
