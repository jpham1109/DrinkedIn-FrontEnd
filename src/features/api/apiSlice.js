import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const rawBaseQuery = fetchBaseQuery({
	baseUrl: `${process.env.REACT_APP_BACKEND_URL}`,
	// credentials: 'include' applies to every request through this base
	// query, including GET /csrf_token itself — required so the browser
	// actually stores the Set-Cookie session that endpoint establishes
	// (ai/auth-migration-plan.md PR 2, item 7). fetch's default credentials
	// mode is 'same-origin', which would silently drop cookies on a
	// cross-origin dev/prod split without this.
	credentials: 'include',
	prepareHeaders: (headers, { getState }) => {
		// Authorization: Bearer removed here (PR 3) — every mutating
		// request has carried both a session cookie (where one exists)
		// and a valid CSRF token since PR 2, so current_user resolution
		// has already been resolving via session, not bearer, for any
		// authenticated request the whole time this header was still
		// being sent. Removing it doesn't change which credential path
		// wins; it just stops sending a header nothing needs anymore.
		// Bearer auth itself is NOT removed from the backend — it remains
		// the reserved path for the future mobile client
		// (ai/auth-migration-plan.md, ai/auth-design.md).

		// Attached globally (not scoped to login/signup) so this holds
		// regardless of eventual production frontend/API topology — see
		// ai/auth-migration-plan.md PR 2's "Sequencing correction" for why
		// narrower scoping was rejected. Harmless on safe GETs too; Rails
		// only checks this header on non-safe HTTP methods.
		const csrfToken = getState().csrf.token
		if (csrfToken) {
			headers.set('X-CSRF-Token', csrfToken)
		}

		return headers
	},
})

// Unwraps the { data: ... } envelope produced by the Rails ApiResponses concern.
// Uses hasOwnProperty so that a falsey data payload (null, 0, false) still unwraps correctly.
// Preserves the envelope's meta field as result.meta.apiMeta for future pagination consumers.
// Endpoints backed by controllers not yet migrated pass through unchanged.
const envelopeBaseQuery = async (args, api, extraOptions) => {
	const result = await rawBaseQuery(args, api, extraOptions)

	if (result.error) return result

	if (result.data !== null && typeof result.data === 'object' && Object.prototype.hasOwnProperty.call(result.data, 'data')) {
		return {
			...result,
			data: result.data.data,
			meta: {
				...result.meta,
				apiMeta: result.data.meta ?? null,
			},
		}
	}

	return result
}

export const apiSlice = createApi({
	baseQuery: envelopeBaseQuery,
	tagTypes: ['Cocktail', 'Like', 'User', 'Follow', 'Category'],
	endpoints: () => ({}),
})
