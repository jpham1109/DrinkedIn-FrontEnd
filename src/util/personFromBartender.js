// Adapts the real, embedded `{ id, full_name, username }` shape
// (BartenderSerializer) to PersonIdentity's shape
// (`{ name, bar, location, avatarUrl }`). Extracted 2026-11-16 — three
// call sites (CocktailCard, CocktailDetail, Hero) previously duplicated
// this exact object literal. bar/location/avatarUrl stay undefined on
// purpose: none of those fields exist on BartenderSerializer today, and
// PersonIdentity already renders fine without them (its meta line and
// Avatar fall back cleanly).
//
// Named after `bartender` (the current API field), not `creator` — this
// is still ownership/submission data, not verified authorship
// (ai/v1-redesign-plan.md's creator/submitter attribution workstream).
// Don't rename this to imply authorship until the backend actually ships
// a real creator field for it to adapt instead.
export function personFromBartender(bartender) {
	return (
		bartender && {
			name: bartender.full_name || bartender.username,
			bar: undefined,
			location: undefined,
			avatarUrl: undefined,
		}
	)
}
