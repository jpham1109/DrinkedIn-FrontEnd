import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'
import authReducer, { setCredentials } from '../auth/authSlice'
import csrfReducer from '../csrf/csrfSlice'
import { AuthGateProvider, useAuthGate } from '../../components/design-system/AuthGate'
import { useFollowBartender } from './useFollowBartender'

// ai/v1-redesign-plan.md's privacy-first-user-discovery workstream
// (2026-11-23), Step 2 — locks in the race-condition fix: a successful
// POST /follows must not inject a bare, identity-less record into
// auth.user.followed_users anymore (the old dispatch(addUserToFollow(...))
// call, now removed). Profile.jsx's Following tab depends on every
// followed_users entry having a resolved `followee` identity already
// nested by the backend; the old dispatch bypassed that, which could
// render a blank/incomplete row for the interval before the
// invalidatesTags-triggered /me refetch resolved. This test proves the
// array is simply left alone by this hook now, not injected into in an
// incomplete shape.

function Harness({ bartender }) {
	const { following, toggle, pending } = useFollowBartender(bartender)
	// Exposes AuthGateProvider's own status so tests can wait for the
	// real app's actual gating condition (requireAuth only runs the
	// action once status is 'loggedIn' — see AuthGate.jsx) instead of
	// racing its bootstrap useGetUserQuery() call.
	const { status } = useAuthGate()
	return (
		<div>
			<span data-testid="status">{status}</span>
			<button onClick={toggle} disabled={pending}>
				{following ? 'Following' : 'Follow'}
			</button>
		</div>
	)
}

function createTestStore(currentUser) {
	const store = configureStore({
		reducer: {
			auth: authReducer,
			csrf: csrfReducer,
			[apiSlice.reducerPath]: apiSlice.reducer,
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
		preloadedState: { csrf: { token: 'test-csrf-token' } },
	})
	store.dispatch(setCredentials({ user: currentUser }))
	return store
}

function renderHarness(bartender, currentUser) {
	const store = createTestStore(currentUser)
	const view = render(
		<Provider store={store}>
			<MemoryRouter>
				<AuthGateProvider>
					<Harness bartender={bartender} />
				</AuthGateProvider>
			</MemoryRouter>
		</Provider>
	)
	return { store, ...view }
}

// Same duck-typed Response/mockFetch shape established in
// Signup.test.jsx — fetchBaseQuery calls fetch with a single Request
// object and .clone()s the response internally.
function jsonResponse(status, body) {
	const response = {
		ok: status >= 200 && status < 300,
		status,
		headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null) },
		json: async () => body,
		text: async () => JSON.stringify(body),
	}
	response.clone = () => jsonResponse(status, body)
	return response
}

function mockFetch(routes) {
	const cursors = {}
	const calls = []
	global.fetch = jest.fn(async (request) => {
		const url = request.url
		const bodyText = await request.clone().text()
		const parsedBody = bodyText ? JSON.parse(bodyText) : undefined
		calls.push({ url, body: parsedBody })

		const key = Object.keys(routes).find((k) => url.includes(k))
		const queue = routes[key] ?? []
		const index = cursors[key] ?? 0
		cursors[key] = index + 1
		const entry = queue[Math.min(index, queue.length - 1)]

		if (!entry) return jsonResponse(200, { data: {} })
		return jsonResponse(entry.status, entry.body)
	})
	global.fetch.calls = calls
	return global.fetch
}

const currentUser = { id: 1, username: 'jamie', full_name: 'Jamie Pham', followed_users: [], following_users: [] }
const bartender = { id: 2, full_name: 'Alex Rivera', username: 'alexr' }

describe('useFollowBartender', () => {
	it("does not inject a bare record into auth.user.followed_users on a successful follow — no incomplete row ever appears", async () => {
		mockFetch({
			'/me': [{ status: 200, body: { data: currentUser } }],
			'/follows': [{ status: 200, body: { id: 99, follower_id: 1, followee_id: 2 } }],
		})
		const { store } = renderHarness(bartender, currentUser)
		// AuthGateProvider's own bootstrap useGetUserQuery() must settle to
		// 'loggedIn' before a click can actually reach requireAuth's action
		// branch — clicking while it's still 'checking' is a correctly-
		// designed no-op (AuthGate.jsx), not a bug, so this wait is required
		// for the test to exercise the real follow flow at all.
		await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('loggedIn'))

		await userEvent.click(screen.getByRole('button', { name: /^follow$/i }))

		expect(await screen.findByRole('button', { name: /^following$/i })).toBeInTheDocument()
		// The fix: followed_users in the plain auth slice is untouched by
		// this hook — it's left exactly as it was before the click, not
		// mutated with the bare { id, follower_id, followee_id } response
		// POST /follows returned. Any update to it now only ever comes from
		// the backend's own enriched /me payload, via App.jsx's existing
		// setCredentials sync — a separate, already-tested mechanism this
		// hook no longer races against.
		expect(store.getState().auth.user.followed_users).toEqual([])
	})

	it('still drives its own immediate following/pending UI state independent of the (now-unmutated) followed_users array', async () => {
		mockFetch({
			'/me': [{ status: 200, body: { data: currentUser } }],
			'/follows': [{ status: 200, body: { id: 99, follower_id: 1, followee_id: 2 } }],
		})
		renderHarness(bartender, currentUser)

		expect(screen.getByRole('button', { name: /^follow$/i })).toBeInTheDocument()
		await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('loggedIn'))

		await userEvent.click(screen.getByRole('button', { name: /^follow$/i }))
		expect(await screen.findByRole('button', { name: /^following$/i })).toBeInTheDocument()
	})
})
