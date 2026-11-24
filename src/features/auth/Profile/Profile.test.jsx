import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../../api/apiSlice'
import authReducer, { setCredentials } from '../authSlice'
import csrfReducer from '../../csrf/csrfSlice'
import Profile from './Profile'

// ai/v1-redesign-plan.md's privacy-first-user-discovery workstream
// (2026-11-23), Step 2 — the first test file for Profile.jsx (none
// existed before this). Scope: the Following/Followers tabs' migration
// off the now-deleted public `/users` list cache onto the nested
// followee/follower identity AccountSerializer's `/me` response already
// embeds (Step 1, merged), plus the legacy-data and tab-count
// consequences that migration has.

// jsdom implements <dialog>'s `open` attribute reflection but not its
// imperative showModal()/close() methods — the Remove Follower flow
// below is this app's first test to actually open a real confirm
// Overlay (Overlay.jsx calls dialog.showModal() directly), so this is
// the first place that gap surfaces. Toggling `.open` is enough: that's
// the only state Overlay.jsx's own effects and MutationObserver
// actually read.
if (!HTMLDialogElement.prototype.showModal) {
	HTMLDialogElement.prototype.showModal = function showModal() {
		this.open = true
	}
}
if (!HTMLDialogElement.prototype.close) {
	HTMLDialogElement.prototype.close = function close() {
		this.open = false
	}
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

function renderProfile(currentUser) {
	const store = createTestStore(currentUser)
	const view = render(
		<Provider store={store}>
			<MemoryRouter>
				<Profile />
			</MemoryRouter>
		</Provider>
	)
	return { store, ...view }
}

// Same duck-typed Response/mockFetch shape established in
// Signup.test.jsx/useFollowBartender.test.js.
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

function mockFetch(routes = {}) {
	const calls = []
	global.fetch = jest.fn(async (request) => {
		const url = request.url
		const bodyText = await request.clone().text()
		calls.push({ url, body: bodyText ? JSON.parse(bodyText) : undefined })

		const key = Object.keys(routes).find((k) => url.includes(k))
		const entry = routes[key]
		if (!entry) return jsonResponse(200, { data: {} })
		return jsonResponse(entry.status, entry.body)
	})
	global.fetch.calls = calls
	return global.fetch
}

function baseUser(overrides = {}) {
	return {
		id: 1,
		username: 'jamie',
		full_name: 'Jamie Pham',
		location: 'Seattle',
		bartender: false,
		avatar: null,
		cocktails: [],
		likes: [],
		followed_users: [],
		following_users: [],
		...overrides,
	}
}

const bartenderIdentity = {
	id: 2,
	full_name: 'Alex Rivera',
	username: 'alexr',
	location: 'Portland',
	avatar: null,
}

const followerIdentity = {
	id: 3,
	full_name: 'Sam Okafor',
	username: 'samo',
	location: 'Austin',
	avatar: null,
}

async function openTab(name) {
	await userEvent.click(screen.getByRole('tab', { name: new RegExp(name, 'i') }))
}

describe('Profile — Following/Followers tabs', () => {
	it('renders the Following tab from the nested followee identity, with no network request made', async () => {
		mockFetch()
		const user = baseUser({
			followed_users: [{ id: 10, follower_id: 1, followee_id: 2, followee: bartenderIdentity }],
		})
		renderProfile(user)

		await openTab('following')

		expect(await screen.findByText('Alex Rivera')).toBeInTheDocument()
		expect(global.fetch).not.toHaveBeenCalled()
	})

	it('renders the Followers tab from the nested follower identity', async () => {
		mockFetch()
		const user = baseUser({
			following_users: [{ id: 11, follower_id: 3, followee_id: 1, follower: followerIdentity }],
		})
		renderProfile(user)

		await openTab('followers')

		expect(await screen.findByText('Sam Okafor')).toBeInTheDocument()
		expect(global.fetch).not.toHaveBeenCalled()
	})

	it('excludes a legacy followed_users entry with no nested followee, and the tab count matches only the visible row', async () => {
		mockFetch()
		const user = baseUser({
			followed_users: [
				{ id: 10, follower_id: 1, followee_id: 2, followee: bartenderIdentity },
				// No `followee` key at all — the AccountSerializer shape for a
				// followee that fails User.followable (today, only a
				// pre-existing/legacy row). Must render nothing for this entry,
				// not a broken/blank row.
				{ id: 12, follower_id: 1, followee_id: 99 },
			],
		})
		renderProfile(user)

		const followingTab = screen.getByRole('tab', { name: /following/i })
		expect(within(followingTab).getByText('1')).toBeInTheDocument()

		await openTab('following')

		expect(await screen.findByText('Alex Rivera')).toBeInTheDocument()
		const peopleList = screen.getByRole('tabpanel', { name: /following/i }).querySelector('ul')
		expect(within(peopleList).getAllByRole('listitem')).toHaveLength(1)
	})

	it('still unfollows via the existing DELETE /follows mutation, and the row disappears', async () => {
		const fetchMock = mockFetch({ '/follows': { status: 204, body: null } })
		const user = baseUser({
			followed_users: [{ id: 10, follower_id: 1, followee_id: 2, followee: bartenderIdentity }],
		})
		const { store } = renderProfile(user)

		await openTab('following')
		await screen.findByText('Alex Rivera')

		// FollowButton's aria-label is always "Follow {name}" regardless of
		// the current following state (Toggles.jsx) — not "Unfollow ...".
		await userEvent.click(screen.getByRole('button', { name: /^follow alex rivera$/i }))

		await waitFor(() => expect(screen.queryByText('Alex Rivera')).not.toBeInTheDocument())
		expect(fetchMock.calls.some((c) => c.url.includes('/follows/10'))).toBe(true)
		expect(store.getState().auth.user.followed_users).toEqual([])
	})

	it('still removes a follower via the existing DELETE /follows mutation, after confirming', async () => {
		const fetchMock = mockFetch({ '/follows': { status: 204, body: null } })
		const user = baseUser({
			following_users: [{ id: 11, follower_id: 3, followee_id: 1, follower: followerIdentity }],
		})
		const { store } = renderProfile(user)

		await openTab('followers')
		await screen.findByText('Sam Okafor')

		await userEvent.click(screen.getByRole('button', { name: /remove sam okafor from your followers/i }))

		// Overlay.jsx's showModal() runs in a useEffect keyed on its `open`
		// prop — getByRole treats a <dialog> without the open attribute as
		// hidden regardless of its content, so this has to wait for the
		// real dialog.open flag, not just for the confirm text to exist.
		await waitFor(() => {
			const dialog = screen.getByText(/won.t be notified/i).closest('dialog')
			expect(dialog.open).toBe(true)
		})
		await userEvent.click(screen.getByRole('button', { name: /^remove follower$/i }))

		await waitFor(() => expect(screen.queryByText('Sam Okafor')).not.toBeInTheDocument())
		expect(fetchMock.calls.some((c) => c.url.includes('/follows/11'))).toBe(true)
		expect(store.getState().auth.user.following_users).toEqual([])
	})

	it('shows no trace of a previous account’s following identity after a fresh mount for a different account', async () => {
		mockFetch()
		const accountA = baseUser({
			followed_users: [{ id: 10, follower_id: 1, followee_id: 2, followee: bartenderIdentity }],
		})
		const { unmount } = renderProfile(accountA)
		await openTab('following')
		expect(await screen.findByText('Alex Rivera')).toBeInTheDocument()
		unmount()

		const accountB = baseUser({ id: 5, username: 'riley', full_name: 'Riley Chen', followed_users: [] })
		renderProfile(accountB)
		await openTab('following')

		expect(screen.queryByText('Alex Rivera')).not.toBeInTheDocument()
		expect(await screen.findByText(/not following anyone yet/i)).toBeInTheDocument()
	})
})
