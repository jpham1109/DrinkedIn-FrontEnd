// Escapes regex metacharacters so user-entered search text is matched
// literally. Without this, CocktailsContainer's `new RegExp(searchText, 'i')`
// treats characters like ( ) * + ? [ ] as regex syntax — an unbalanced
// paren throws (crashing the search), and something like "o.d fashioned"
// silently matches more than the user typed (`.` means "any character").
// Scoped to this one fix per ai/v1-redesign-plan.md PR6's requirement: keep
// the existing search fields/behavior, just make arbitrary input safe.
export function escapeRegExp(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
