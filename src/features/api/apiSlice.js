import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const rawBaseQuery = fetchBaseQuery({
	baseUrl: `${process.env.REACT_APP_BACKEND_URL}`,
	prepareHeaders: (headers, { getState }) => {
		const token = getState().auth.token
		if (token) {
			headers.set('Authorization', `Bearer ${token}`)
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
	endpoints: () => ({}),
})
