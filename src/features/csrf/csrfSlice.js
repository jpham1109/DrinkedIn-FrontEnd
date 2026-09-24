import { createSlice } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'

// In-memory CSRF token store (ai/auth-migration-plan.md PR 2 "CSRF token
// lifecycle"). Deliberately a plain, non-persisted slice — NOT wrapped in
// redux-persist like authSlice is (see app/store.js) — the token must
// never end up in localStorage.
const csrfSlice = createSlice({
	name: 'csrf',
	initialState: { token: null },
	reducers: {
		setCsrfToken: (state, action) => {
			state.token = action.payload
		},
	},
})

export const { setCsrfToken } = csrfSlice.actions
export default csrfSlice.reducer

export const selectCsrfToken = (state) => state.csrf.token

export const csrfApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getCsrfToken: builder.query({
			query: () => ({ url: '/csrf_token', method: 'GET' }),
		}),
	}),
})

export const { useLazyGetCsrfTokenQuery } = csrfApi

// Fetches a fresh CSRF token and stores it. Call before submitting
// login/signup, and again after a successful login/signup/logout — the
// backend rotates the underlying session's CSRF secret on each of those
// (reset_session), invalidating whatever token was fetched before.
//
// envelopeBaseQuery (apiSlice.js) already unwraps the { data: ... }
// envelope, so a successful query result here is { csrf_token: '...' },
// not a bare string — extract the field rather than storing the object.
export const refreshCsrfToken = (dispatch, triggerGetCsrfToken) => {
	return triggerGetCsrfToken()
		.unwrap()
		.then((result) => {
			dispatch(setCsrfToken(result.csrf_token))
			return result.csrf_token
		})
}
